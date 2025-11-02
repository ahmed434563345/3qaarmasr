import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';

interface MapDisplayProps {
  latitude: number;
  longitude: number;
  title?: string;
}

const MapDisplay: React.FC<MapDisplayProps> = ({ latitude, longitude, title }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

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
      center: [longitude, latitude],
      zoom: 14,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    // Add marker at property location
    const marker = new mapboxgl.Marker({ color: '#2563eb' })
      .setLngLat([longitude, latitude])
      .addTo(map.current);

    // Add popup if title provided
    if (title) {
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`<div class="font-medium">${title}</div>`);
      marker.setPopup(popup);
    }

    return () => {
      map.current?.remove();
    };
  }, [latitude, longitude, title]);

  return (
    <Card className="overflow-hidden">
      <div ref={mapContainer} className="w-full h-[400px]" />
    </Card>
  );
};

export default MapDisplay;
