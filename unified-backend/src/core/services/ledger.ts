import { getClient } from '../../shared/db';
import { AppError } from '../../shared/errorHandler';

export interface LedgerLineItem {
  product_id: string;
  quantity: number;
  unit_of_measure?: string;
  lot_id?: string;
}

export interface CreateOperationInput {
  operation_type: 'receipt' | 'delivery' | 'internal' | 'adjustment';
  source_location_id: string;
  destination_location_id: string;
  partner_id?: string;
  assigned_to?: string;
  notes?: string;
  items: LedgerLineItem[];
}

const PREFIX_MAP: Record<string, string> = {
  receipt: 'REC',
  delivery: 'DEL',
  internal: 'INT',
  adjustment: 'ADJ',
};

async function generateRefCode(client: any, type: string): Promise<string> {
  const prefix = PREFIX_MAP[type] || 'OP';
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const res = await client.query(
    `SELECT COUNT(*)::int AS cnt FROM stock_operations WHERE reference_code LIKE $1`,
    [`${prefix}-${dateStr}-%`]
  );
  const seq = (res.rows[0]?.cnt || 0) + 1;
  return `${prefix}-${dateStr}-${String(seq).padStart(4, '0')}`;
}

export async function createOperation(input: CreateOperationInput, userId?: string) {
  if (!input.items || input.items.length === 0) {
    throw new AppError(400, 'NO_ITEMS', 'Operation must have at least one line item');
  }

  const client = await getClient();
  try {
    await client.query('BEGIN');

    const refCode = await generateRefCode(client, input.operation_type);

    // 1. Create the operation header
    const opRes = await client.query(
      `INSERT INTO stock_operations (
        reference_code, operation_type, status,
        source_location_id, destination_location_id,
        partner_id, assigned_to, notes, scheduled_date, completed_date
      ) VALUES ($1, $2, 'done', $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *`,
      [
        refCode, input.operation_type,
        input.source_location_id, input.destination_location_id,
        input.partner_id || null, input.assigned_to || userId || null,
        input.notes || null,
      ]
    );
    const operation = opRes.rows[0];

    // 2. Create stock moves for each line item
    const moves = [];
    for (const item of input.items) {
      if (item.quantity <= 0) {
        throw new AppError(400, 'INVALID_QTY', `Quantity must be > 0 for product ${item.product_id}`);
      }

      const moveRes = await client.query(
        `INSERT INTO stock_moves (
          operation_id, product_id, lot_id, quantity, unit_of_measure,
          source_location_id, destination_location_id, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'done')
        RETURNING *`,
        [
          operation.id, item.product_id, item.lot_id || null,
          item.quantity, item.unit_of_measure || 'unit',
          input.source_location_id, input.destination_location_id,
        ]
      );
      moves.push(moveRes.rows[0]);
    }

    await client.query('COMMIT');
    return { ...operation, moves };
  } catch (err) {
    await client.query('ROLLBACK');
    if (err instanceof AppError) throw err;
    throw err;
  } finally {
    client.release();
  }
}

export async function getOperationById(id: string) {
  const { query } = await import('../../shared/db');
  const opRes = await query('SELECT * FROM stock_operations WHERE id = $1', [id]);
  if (opRes.rows.length === 0) throw new AppError(404, 'NOT_FOUND', 'Operation not found');
  const movesRes = await query('SELECT * FROM stock_moves WHERE operation_id = $1', [id]);
  return { ...opRes.rows[0], moves: movesRes.rows };
}

export async function listOperations(filters: { type?: string; status?: string; limit?: number }) {
  const { query } = await import('../../shared/db');
  const conditions: string[] = [];
  const params: any[] = [];
  let idx = 1;

  if (filters.type) { conditions.push(`operation_type = $${idx}`); params.push(filters.type); idx++; }
  if (filters.status) { conditions.push(`status = $${idx}`); params.push(filters.status); idx++; }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = filters.limit || 50;
  params.push(limit);

  const res = await query(
    `SELECT o.*, p.name AS partner_name,
            src.name AS source_location_name,
            dest.name AS destination_location_name
     FROM stock_operations o
     LEFT JOIN partners p ON p.id = o.partner_id
     LEFT JOIN locations src ON src.id = o.source_location_id
     LEFT JOIN locations dest ON dest.id = o.destination_location_id
     ${where}
     ORDER BY o.created_at DESC
     LIMIT $${idx}`,
    params
  );
  return res.rows;
}
