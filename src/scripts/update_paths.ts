import { pool } from '../database/db';

async function main() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT id, file_name, storage_path FROM photos');
    for (const row of res.rows) {
      const cleanName = row.file_name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_');
      const cleanPath = `/uploads/photos/${cleanName}`;
      await client.query('UPDATE photos SET storage_path = $1 WHERE id = $2', [cleanPath, row.id]);
      console.log(`✓ Updated: ${row.file_name} -> ${cleanPath}`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main();
