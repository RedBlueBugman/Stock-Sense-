import pool, { query } from '../../shared/db';
import { getOrSetCache, invalidateCache } from '../../shared/redis';

const SETTINGS_CACHE_KEY = 'system:settings';

export class SettingsService {
  /**
   * Fetch all system settings from key-value table
   */
  async getSettings() {
    return getOrSetCache(SETTINGS_CACHE_KEY, 3600, async () => {
      try {
        const res = await query(`SELECT key, value FROM settings;`);
        const settingsMap: Record<string, any> = {};
        res.rows.forEach((row) => {
          settingsMap[row.key] = row.value;
        });
        return settingsMap;
      } catch (err: any) {
        if (err.code === '42P01') {
          return {
            default_warehouse: null,
            reservation_timeout_minutes: 60,
            allow_negative_stock: false,
            notification_email: 'notifications@wms.local',
          };
        }
        throw err;
      }
    });
  }

  /**
   * Upsert system settings in a transaction
   */
  async updateSettings(settingsMap: Record<string, any>) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const [key, value] of Object.entries(settingsMap)) {
        const sql = `
          INSERT INTO settings (key, value, updated_at)
          VALUES ($1, $2, NOW())
          ON CONFLICT (key) DO UPDATE
          SET value = EXCLUDED.value, updated_at = NOW();
        `;
        await client.query(sql, [key, JSON.stringify(value)]);
      }

      await client.query('COMMIT');
      await invalidateCache(SETTINGS_CACHE_KEY);
      return this.getSettings();
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

export const settingsService = new SettingsService();
