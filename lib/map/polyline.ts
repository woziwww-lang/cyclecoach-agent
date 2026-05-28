export function decodePolyline(encoded: string): [number, number][] {
  let index = 0;
  let lat = 0;
  let lng = 0;
  const coordinates: [number, number][] = [];

  while (index < encoded.length) {
    const latResult = decodeValue(encoded, index);
    index = latResult.nextIndex;
    lat += latResult.value;

    const lngResult = decodeValue(encoded, index);
    index = lngResult.nextIndex;
    lng += lngResult.value;

    coordinates.push([lat / 1e5, lng / 1e5]);
  }

  return coordinates;
}

function decodeValue(encoded: string, startIndex: number) {
  let result = 0;
  let shift = 0;
  let index = startIndex;
  let byte: number;

  do {
    byte = encoded.charCodeAt(index++) - 63;
    result |= (byte & 0x1f) << shift;
    shift += 5;
  } while (byte >= 0x20);

  const value = result & 1 ? ~(result >> 1) : result >> 1;
  return { value, nextIndex: index };
}
