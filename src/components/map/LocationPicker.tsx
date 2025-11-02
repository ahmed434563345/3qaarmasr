import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ 
  onLocationSelect, 
  initialLat = 31.2001, 
  initialLng = 29.9187 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [coordinates, setCoordinates] = useState({ lat: initialLat, lng: initialLng });

  useEffect(() => {
    if (!mapContainer.current) return;

    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!token) {
      console.error('Mapbox token is missing');
      return;
    }

    mapboxgl.accessToken = token;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [initialLng, initialLat],
      zoom: 12,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    // Create initial marker
    marker.current = new mapboxgl.Marker({ draggable: true })
      .setLngLat([initialLng, initialLat])
      .addTo(map.current);

    // Update coordinates when marker is dragged
    marker.current.on('dragend', () => {
      if (marker.current) {
        const lngLat = marker.current.getLngLat();
        setCoordinates({ lat: lngLat.lat, lng: lngLat.lng });
        onLocationSelect(lngLat.lat, lngLat.lng);
      }
    });

    // Add click to move marker
    map.current.on('click', (e) => {
      if (marker.current) {
        marker.current.setLngLat(e.lngLat);
        setCoordinates({ lat: e.lngLat.lat, lng: e.lngLat.lng });
        onLocationSelect(e.lngLat.lat, e.lngLat.lng);
      }
    });

    return () => {
      map.current?.remove();
    };
  }, [initialLat, initialLng, onLocationSelect]);

  return (
    <div className="space-y-2">
      <Card className="overflow-hidden">
        <div ref={mapContainer} className="w-full h-[400px]" />
      </Card>
      <p className="text-sm text-muted-foreground">
        Click on the map or drag the marker to select the property location
      </p>
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>Latitude: {coordinates.lat.toFixed(6)}</span>
        <span>Longitude: {coordinates.lng.toFixed(6)}</span>
      </div>
    </div>
  );
};

export default LocationPicker;
