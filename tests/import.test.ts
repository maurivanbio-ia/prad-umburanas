import { pool } from '../src/database/db';
import * as fs from 'fs';
import * as path from 'path';

async function testDataIntegrity() {
  console.log('🧪 Testing database data integrity and static mídias...');
  const client = await pool.connect();
  try {
    const areasRes = await client.query('SELECT count(*) FROM prad_areas');
    const photosRes = await client.query('SELECT count(*) FROM photos');
    const geoPhotosRes = await client.query('SELECT count(*) FROM photos WHERE is_georeferenced = true');
    const nonGeoPhotosRes = await client.query('SELECT count(*) FROM photos WHERE is_georeferenced = false');

    const areaCount = parseInt(areasRes.rows[0].count, 10);
    const photoCount = parseInt(photosRes.rows[0].count, 10);
    const geoPhotoCount = parseInt(geoPhotosRes.rows[0].count, 10);
    const nonGeoPhotoCount = parseInt(nonGeoPhotosRes.rows[0].count, 10);

    console.log(`  ✓ PRAD Areas in DB: ${areaCount} (Expected: 38)`);
    console.log(`  ✓ Total Photos in DB: ${photoCount} (Expected: 18)`);
    console.log(`  ✓ Georeferenced Photos: ${geoPhotoCount} (Expected: 16)`);
    console.log(`  ✓ Non-Georeferenced Photos: ${nonGeoPhotoCount} (Expected: 2)`);

    if (areaCount !== 38 || photoCount !== 18 || geoPhotoCount !== 16 || nonGeoPhotoCount !== 2) {
      throw new Error('Database record count mismatch!');
    }

    // Test static files in public/uploads/photos/
    const uploadDir = path.join(process.cwd(), 'public/uploads/photos');
    const files = fs.readdirSync(uploadDir).filter((f) => !f.startsWith('.'));
    console.log(`  ✓ Files in public/uploads/photos/: ${files.length} (Expected: 18)`);
    if (files.length !== 18) {
      throw new Error('Static photo files count mismatch!');
    }

    console.log('✅ Data integrity test passed successfully!');
  } finally {
    client.release();
    await pool.end();
  }
}

testDataIntegrity();
