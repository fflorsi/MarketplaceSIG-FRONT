export const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number }> => {
  try {
    const encodedAddress = encodeURIComponent(address);
    
    // Añadir un tiempo de espera para cumplir con las políticas de uso de Nominatim
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Añadir el parámetro countrycodes=ar para limitar la búsqueda a Argentina
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&countrycodes=ar`;
    
    console.log('Buscando dirección:', address);
    
    const response = await fetch(url, {
      headers: {
        // Añadir un User-Agent válido es requerido por Nominatim
        'User-Agent': 'MarketplaceSIG-App/1.0',
      }
    });
    
    if (!response.ok) {
      console.error('Error de respuesta Nominatim:', response.status, await response.text());
      throw new Error('Error en la geocodificación');
    }
    
    const data = await response.json();
    console.log('Respuesta de geocodificación:', data);
    
    if (data.length === 0) {
      // Intentar una búsqueda más amplia sin limitar a Argentina
      console.log('Intentando búsqueda global para:', address);
      const globalUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`;
      const globalResponse = await fetch(globalUrl, {
        headers: {
          'User-Agent': 'MarketplaceSIG-App/1.0',
        }
      });
      
      const globalData = await globalResponse.json();
      console.log('Respuesta de búsqueda global:', globalData);
      
      if (globalData.length === 0) {
        throw new Error('Dirección no encontrada');
      }
      
      return {
        lat: parseFloat(globalData[0].lat),
        lng: parseFloat(globalData[0].lon)
      };
    }
    
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon)
    };
  } catch (error) {
    console.error('Error geocodificando dirección:', error);
    
    // Coordenadas específicas para Reconquista, Santa Fe si la dirección lo contiene
    if (address.toLowerCase().includes('reconquista') && address.toLowerCase().includes('santa fe')) {
      console.log('Usando coordenadas predefinidas para Reconquista, Santa Fe');
      return { lat: -29.1546, lng: -59.6424 };
    }
    
    // Coordenadas para otras ciudades importantes de Argentina
    if (address.toLowerCase().includes('buenos aires')) return { lat: -34.6037, lng: -58.3816 };
    if (address.toLowerCase().includes('córdoba')) return { lat: -31.4201, lng: -64.1888 };
    if (address.toLowerCase().includes('rosario')) return { lat: -32.9442, lng: -60.6505 };
    if (address.toLowerCase().includes('santa fe') && !address.toLowerCase().includes('reconquista')) {
      return { lat: -31.6106, lng: -60.7048 };
    }
    
    // Fallback a coordenadas por defecto (centro de Argentina)
    alert('No se pudo geocodificar la dirección. Se usará una ubicación aproximada.');
    return { lat: -34.6037, lng: -58.3816 };
  }
};


export const coordinatesToWKT = (lat: number, lng: number): string => {
  return `POINT(${lng} ${lat})`;
};

export const wktToCoordinates = (wkt: string): { lat: number; lng: number } => {
  const match = wkt.match(/POINT\(([^)]+)\)/);
  if (match) {
    const [lng, lat] = match[1].split(' ').map(Number);
    return { lat, lng };
  }
  return { lat: 0, lng: 0 };
};


export function wkbHexToCoordinates(hex: string): { lat: number, lng: number } {
  if (!hex || hex.length !== 42) return { lat: 0, lng: 0 };

  // 0101000000 [10] + lng [16] + lat [16]
  const lngHex = hex.slice(10, 26);
  const latHex = hex.slice(26, 42);

  function hexToDouble(hexStr: string) {
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    for (let i = 0; i < 8; i++) {
      view.setUint8(i, parseInt(hexStr.substr(i * 2, 2), 16));
    }
    return view.getFloat64(0, true); // little endian
  }

  const lng = hexToDouble(lngHex);
  const lat = hexToDouble(latHex);
  return { lat, lng };
}


export function parseAnyCoordinates(coord: string): { lat: number, lng: number } {
  if (!coord) return { lat: 0, lng: 0 };
  if (coord.startsWith('POINT(')) {
    return wktToCoordinates(coord);
  }
  if (/^[0-9a-fA-F]{42}$/.test(coord)) {
    return wkbHexToCoordinates(coord);
  }
  return { lat: 0, lng: 0 };
}

// Puedes poner esto en utils/geocoding.ts
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
  const res = await fetch(url);
  if (!res.ok) return '';
  const data = await res.json();
  return data.display_name || '';
}