export async function calculateRouteDistance(
  origin: {lat: number, lng: number}, 
  dest: {lat: number, lng: number}
): Promise<{ distanceKm: number, durationMin: number }> {
  // Mock if google maps API is not loaded
  if (typeof window === 'undefined' || !(window as any).google || !(window as any).google.maps) {
     const mockDist = Math.max(1, Math.abs(origin.lat - dest.lat) * 111 + Math.abs(origin.lng - dest.lng) * 111);
     return { distanceKm: parseFloat(mockDist.toFixed(1)), durationMin: Math.round(mockDist * 1.5) };
  }

  const service = new (window as any).google.maps.DistanceMatrixService();
  return new Promise((resolve) => {
    service.getDistanceMatrix({
      origins: [origin],
      destinations: [dest],
      travelMode: (window as any).google.maps.TravelMode.DRIVING
    }, (response: any, status: string) => {
      if (status === 'OK' && response && response.rows[0].elements[0].status === 'OK') {
        const dist = response.rows[0].elements[0].distance.value / 1000;
        const dur = response.rows[0].elements[0].duration.value / 60;
        resolve({ distanceKm: dist, durationMin: dur });
      } else {
        const mockDist = Math.max(1, Math.abs(origin.lat - dest.lat) * 111 + Math.abs(origin.lng - dest.lng) * 111);
        resolve({ distanceKm: parseFloat(mockDist.toFixed(1)), durationMin: Math.round(mockDist * 1.5) }); 
      }
    });
  });
}

export function scoreTransfer(urgency: number, distanceKm: number) {
  return urgency / (distanceKm * 0.1 + 1);
}
