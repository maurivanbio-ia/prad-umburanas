import proj4 from 'proj4';

proj4.defs('EPSG:31984', '+proj=utm +zone=24 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs');
proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs +type=crs');

function testCoordinateConversion() {
  console.log('🧪 Testing UTM 24S (EPSG:31984) -> WGS84 (EPSG:4326) conversion...');
  const testCoords = [
    { easting: 229273.0, northing: 8828407.0, name: 'Canteiro Central' },
    { easting: 218766.0, northing: 8820281.0, name: 'Jazida Santo Anjo' },
    { easting: 218871.0, northing: 8818397.0, name: 'Jazida do Alegre' },
  ];

  for (const c of testCoords) {
    const [lng, lat] = proj4('EPSG:31984', 'EPSG:4326', [c.easting, c.northing]);
    console.log(`  ✓ ${c.name}: UTM (${c.easting}, ${c.northing}) -> Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`);
    if (lat < -11 || lat > -10 || lng < -42 || lng > -41) {
      throw new Error(`Out of expected bounds for Umburanas: Lat=${lat}, Lng=${lng}`);
    }
  }
  console.log('✅ Coordinate conversion test passed successfully!');
}

testCoordinateConversion();
