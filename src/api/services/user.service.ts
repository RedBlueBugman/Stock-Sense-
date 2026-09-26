import bcrypt from 'bcryptjs';
import pool, { query } from '../../shared/db';
import { redis, invalidateCache } from '../../shared/redis';
import { AppError } from '../../shared/errorHandler';

const USER_COLUMNS = `
  id, name, email, phone, role, assigned_warehouse_ids, 
  notification_preferences, is_active, created_at, updated_at
`;

export class UserService {
  /**
   * List users (password_hash is completely excluded)
   */
  async listUsers(filters: any) {
    const { page, limit, role, warehouse_id, is_active, search, sort_by, sort_order } = filters;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (role) {
      conditions.push(`role = $${idx}`);
      params.push(role);
      idx++;
    }

    if (is_active !== undefined) {
      conditions.push(`is_active = $${idx}`);
      params.push(is_active);
      idx++;
    }

    if (warehouse_id) {
      conditions.push(`$${idx}::uuid = ANY(assigned_warehouse_ids)`);
      params.push(warehouse_id);
      idx++;
    }

    if (search) {
      conditions.push(`(name ILIKE $${idx} OR email ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) AS total FROM users ${whereClause};`;
    const dataSql = `
      SELECT ${USER_COLUMNS}
      FROM users
      ${whereClause}
      ORDER BY ${sort_by} ${sort_order.toUpperCase()}
      LIMIT $${idx} OFFSET $${idx + 1};
    `;

    params.push(limit, offset);

    try {
      const [countRes, dataRes] = await Promise.all([
        query(countSql, params.slice(0, idx - 1)),
        query(dataSql, params),
      ]);

      const total = parseInt(countRes.rows[0]?.total || '0', 10);
      return { users: dataRes.rows, total };
    } catch (err: any) {
      if (err.code === '42P01') return { users: [], total: 0 };
      throw err;
    }
  }

  /**
   * Get user detail + assigned warehouse names
   */
  async getUserById(id: string) {
    try {
      const sql = `SELECT ${USER_COLUMNS} FROM users WHERE id = $1;`;
      const res = await query(sql, [id]);

      if (res.rows.length === 0) {
        throw new AppError(404, 'NOT_FOUND', 'User not found');
      }

      const user = res.rows[0];

      // Fetch warehouse names if assigned
      if (user.assigned_warehouse_ids && user.assigned_warehouse_ids.length > 0) {
        const whSql = `SELECT id, name, code FROM warehouses WHERE id = ANY($1::uuid[]);`;
        const whRes = await query(whSql, [user.assigned_warehouse_ids]).catch(() => ({ rows: [] }));
        user.assigned_warehouses = whRes.rows;
      } else {
        user.assigned_warehouses = [];
      }

      return user;
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      if (err.code === '42P01') throw new AppError(404, 'NOT_FOUND', 'User not found');
      throw err;
    }
  }

  /**
   * Update user details (Admin route)
   */
  async updateUser(id: string, currentAdminId: string, input: any) {
    // Prevent self-role modification
    if (id === currentAdminId && input.role !== undefined) {
      throw new AppError(400, 'CANNOT_MODIFY_OWN_ROLE', 'Administrators cannot change their own role');
    }

    // Verify assigned warehouse IDs exist if updated
    if (input.assigned_warehouse_ids && input.assigned_warehouse_ids.length > 0) {
      const checkWh = await query(
        `SELECT COUNT(*)::integer AS count FROM warehouses WHERE id = ANY($1::uuid[]) AND is_active = true`,
        [input.assigned_warehouse_ids]
      );
      if (parseInt(checkWh.rows[0]?.count || '0', 10) !== input.assigned_warehouse_ids.length) {
        throw new AppError(400, 'INVALID_WAREHOUSE_IDS', 'One or more assigned warehouse IDs do not exist');
      }
    }

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    Object.entries(input).forEach(([key, val]) => {
      if (val !== undefined) {
        fields.push(`${key} = $${idx}`);
        values.push(val);
        idx++;
      }
    });

    if (fields.length === 0) return this.getUserById(id);

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const sql = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING ${USER_COLUMNS};
    `;

    const res = await query(sql, values);
    if (res.rows.length === 0) {
      throw new AppError(404, 'NOT_FOUND', 'User not found');
    }

    return res.rows[0];
  }

  /**
   * Deactivate user and purge active Redis sessions
   */
  async deactivateUser(id: string, currentAdminId: string) {
    if (id === currentAdminId) {
      throw new AppError(400, 'CANNOT_DEACTIVATE_SELF', 'You cannot deactivate your own administrative account');
    }

    const res = await query(
      `UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id;`,
      [id]
    );

    if (res.rows.length === 0) {
      throw new AppError(404, 'NOT_FOUND', 'User not found');
    }

    // Invalidate sessions in Redis
    await invalidateCache(`session:${id}:*`);
    await invalidateCache(`auth:${id}`);

    return { message: 'User account deactivated and active sessions revoked' };
  }

  /**
   * Update current user profile
   */
  async updateProfile(userId: string, input: any) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (input.name !== undefined) {
      fields.push(`name = $${idx}`);
      values.push(input.name);
      idx++;
    }

    if (input.phone !== undefined) {
      fields.push(`phone = $${idx}`);
      values.push(input.phone);
      idx++;
    }

    if (input.notification_preferences !== undefined) {
      fields.push(`notification_preferences = $${idx}`);
      values.push(JSON.stringify(input.notification_preferences));
      idx++;
    }

    if (fields.length === 0) return this.getUserById(userId);

    fields.push(`updated_at = NOW()`);
    values.push(userId);

    const sql = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING ${USER_COLUMNS};
    `;

    const res = await query(sql, values);
    if (res.rows.length === 0) {
      throw new AppError(404, 'NOT_FOUND', 'User not found');
    }

    return res.rows[0];
  }

  /**
   * Change user password with bcrypt verification and session invalidation
   */
  async changePassword(userId: string, currentPass: string, newPass: string) {
    const userRes = await query(`SELECT id, password_hash FROM users WHERE id = $1;`, [userId]);
    if (userRes.rows.length === 0) {
      throw new AppError(404, 'NOT_FOUND', 'User not found');
    }

    const user = userRes.rows[0];

    // Verify current password
    if (user.password_hash) {
      const isValid = await bcrypt.compare(currentPass, user.password_hash);
      if (!isValid) {
        throw new AppError(400, 'INVALID_CREDENTIALS', 'Incorrect current password');
      }
    }

    // Hash new password
    const newHash = await bcrypt.hash(newPass, 10);

    await query(
      `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2;`,
      [newHash, userId]
    );

    // Invalidate other active sessions
    await invalidateCache(`session:${userId}:*`);

    return { message: 'Password successfully updated. All other sessions terminated.' };
  }
}

export const userService = new UserService();
