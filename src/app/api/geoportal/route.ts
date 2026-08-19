import { NextResponse } from 'next/server';
import { pool } from '@/database/db';
import { getPhotosGeoJSONFeatures } from '@/data/photos';
import { getExcelAreaFeatures } from '@/data/excelData';

export const dynamic = 'force-dynamic';

export async function GET() {
  let client;
  try {
    client = await pool.connect();
    const areasRes = await client.query('SELECT * FROM prad_areas ORDER BY number ASC');

    const areaFeatures = areasRes.rows
      .filter((a: any) => a.lat !== null && a.lng !== null)
      .map((a: any) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [a.lng, a.lat],
        },
        properties: {
          id: `area-${a.id || a.number}`,
          number: a.number,
          pradCode: `PRAD-${String(a.number).padStart(2, '0')}`,
          name: a.name,
          windComplex: a.wind_complex,
          spe: a.wind_complex ? a.wind_complex.replace('Umburanas ', 'UM-') : 'UM-08',
          areaHa: `${a.area_ha} ha`,
          actionType: a.action_type,
          soilCollectionStatus: a.soil_collection_status,
          status: a.status || 'Em andamento',
          completionPct: a.completion_pct,
          responsible: a.responsible,
        },
      }));

    const finalAreaFeatures = areaFeatures.length > 0 ? areaFeatures : getExcelAreaFeatures();

    return NextResponse.json({
      success: true,
      photosGeoJSON: {
        type: 'FeatureCollection',
        features: getPhotosGeoJSONFeatures(),
      },
      areasGeoJSON: {
        type: 'FeatureCollection',
        features: finalAreaFeatures,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      photosGeoJSON: { type: 'FeatureCollection', features: getPhotosGeoJSONFeatures() },
      areasGeoJSON: { type: 'FeatureCollection', features: getExcelAreaFeatures() },
    });
  } finally {
    try { if (client) client.release(); } catch (e) {}
  }
}
