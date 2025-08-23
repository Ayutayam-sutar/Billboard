import React, { useEffect, useRef, useCallback, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface OSMapProps {
  center: [number, number];
  zoom: number;
  markerPosition: [number, number];
  onCancel?: () => void;
}

const OSMap: React.FC<OSMapProps> = ({ center, zoom, markerPosition, onCancel }) => {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      preferCanvas: true
    }).setView(center, zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    markerRef.current = L.marker(markerPosition, {
      icon: DefaultIcon
    }).addTo(map)
      .bindPopup(`Your location<br>${markerPosition[0]}, ${markerPosition[1]}`);

    L.control.zoom({ position: 'topright' }).addTo(map);
    
    mapRef.current = map;
    setIsMapReady(true);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  
  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;

    const map = mapRef.current;
    const currentCenter = map.getCenter();
    const currentZoom = map.getZoom();
    
    
    if (currentCenter.lat !== center[0] || currentCenter.lng !== center[1] || currentZoom !== zoom) {
      map.setView(center, zoom, {
        animate: true,
        duration: 0.5
      });
    }
    
    
    if (markerRef.current) {
      const currentMarkerPos = markerRef.current.getLatLng();
      if (currentMarkerPos.lat !== markerPosition[0] || currentMarkerPos.lng !== markerPosition[1]) {
        markerRef.current.setLatLng(markerPosition);
      }
    }
  }, [center, zoom, markerPosition, isMapReady]);

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />
      
      {onCancel && (
        <button
          onClick={onCancel}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 1000,
            padding: '8px 16px',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            fontWeight: 'bold'
          }}
        >
          Cancel
        </button>
      )}
    </div>
  );
};

export default React.memo(OSMap);