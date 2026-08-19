import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const layerId = searchParams.get('layer');

  const layersDir = path.join(process.cwd(), 'public/data/layers');

  if (!layerId) {
    const manifestPath = path.join(layersDir, 'manifest.json');
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      return NextResponse.json({ success: true, manifest });
    }
    return NextResponse.json({ success: false, error: 'Manifest not found' }, { status: 404 });
  }

  const filePath = path.join(layersDir, `${layerId}.geojson`);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ success: false, error: `Layer ${layerId} not found` }, { status: 404 });
  }

  const geojson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return NextResponse.json(geojson);
}
