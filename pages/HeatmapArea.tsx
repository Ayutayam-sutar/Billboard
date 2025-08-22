import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Define types for our data
interface FlaggedBillboard {
  id: string;
  latitude: number;
  longitude: number;
  violationType: 'severe' | 'moderate' | 'minor';
  violationCount: number;
  description: string;
  timestamp: string;
}

// --- Helper Function to Generate Dynamic Mock Data ---
const generateMockData = (center: [number, number], count: number): FlaggedBillboard[] => {
  const [lat, lng] = center;
  const types: ('severe' | 'moderate' | 'minor')[] = ['severe', 'moderate', 'minor'];
  const descriptions = [
    'Size violation, unauthorized placement', 'Missing permits', 'Blocking traffic signs',
    'Faded content', 'Multiple violations', 'Height violation', 'Content issue',
    'Safety hazard', 'Zoning violation', 'Environmental impact'
  ];

  return Array.from({ length: count }, (_, i) => {
    const violationType = types[Math.floor(Math.random() * types.length)];
    return {
      id: (i + 1).toString(),
      latitude: lat + (Math.random() - 0.5) * 0.1,
      longitude: lng + (Math.random() - 0.5) * 0.1,
      violationType,
      violationCount: Math.floor(Math.random() * 7) + 1,
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      timestamp: `2025-08-${String(Math.floor(Math.random() * 14) + 1).padStart(2, '0')}`,
    };
  });
};

type SeverityFilter = 'all' | 'severe' | 'moderate' | 'minor';

interface BillboardHeatmapProps {
  onClose?: () => void;
  zoom?: number;
}

const HeatmapArea: React.FC<BillboardHeatmapProps> = ({ onClose, zoom = 12 }) => {
  // --- Refs for map and layers ---
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const heatmapLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const iconCacheRef = useRef<Map<string, L.DivIcon>>(new Map());

  // --- State Management ---
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.2961, 85.8245]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [flaggedBillboards, setFlaggedBillboards] = useState<FlaggedBillboard[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [viewMode, setViewMode] = useState<'heatmap' | 'markers'>('heatmap');
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityFilter>('all');
  const [status, setStatus] = useState('Locating...');

  // --- Memoized Calculations ---
  const filteredBillboards = useMemo(() => {
    if (selectedSeverity === 'all') {
      return flaggedBillboards;
    }
    return flaggedBillboards.filter(b => b.violationType === selectedSeverity);
  }, [selectedSeverity, flaggedBillboards]);

  const statistics = useMemo(() => {
    const severeCounts = { severe: 0, moderate: 0, minor: 0 };
    flaggedBillboards.forEach(b => {
      severeCounts[b.violationType]++;
    });
    const filteredViolations = filteredBillboards.reduce((sum, b) => sum + b.violationCount, 0);
    return { severeCounts, filteredViolations, filteredCount: filteredBillboards.length };
  }, [flaggedBillboards, filteredBillboards]);

  // --- Helper Functions ---
  const getViolationColor = useCallback((type: string) => {
    switch (type) {
      case 'severe': return '#dc2626';
      case 'moderate': return '#f59e0b';
      case 'minor': return '#eab308';
      default: return '#6b7280';
    }
  }, []);

  const getMarkerIcon = useCallback((billboard: FlaggedBillboard) => {
    const cacheKey = `${billboard.violationType}-${billboard.violationCount}`;
    if (iconCacheRef.current.has(cacheKey)) {
      return iconCacheRef.current.get(cacheKey)!;
    }
    const icon = L.divIcon({
      html: `<div style="background: ${getViolationColor(billboard.violationType)};" class="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white font-bold text-sm shadow-lg">${billboard.violationCount}</div>`,
      className: 'custom-marker-icon',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
    iconCacheRef.current.set(cacheKey, icon);
    return icon;
  }, [getViolationColor]);

  // --- Effects ---

  // 1. Get user's location and generate data (runs only once)
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const currentLocation: [number, number] = [latitude, longitude];
        setStatus('Location Found');
        setUserLocation(currentLocation);
        setMapCenter(currentLocation);
        setFlaggedBillboards(generateMockData(currentLocation, 100));
      },
      (error) => {
        console.error("Geolocation error:", error);
        setStatus('Using default location.');
        setFlaggedBillboards(generateMockData([20.2961, 85.8245], 100));
      },
      { enableHighAccuracy: true }
    );
  //  Empty dependency array ensures this runs only ONCE on mount.
  }, []); 

  // 2. Initialize the map
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        preferCanvas: true,
        renderer: L.canvas(),
        zoomAnimation: true,
      }).setView(mapCenter, zoom);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      //  Initialize layer groups but don't add them to the map yet.
      
      markersLayerRef.current = L.layerGroup();
      heatmapLayerRef.current = L.layerGroup();
      
      mapRef.current = map;
      setIsMapReady(true);
    }

    return () => {
      iconCacheRef.current.clear();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []); 

  // 3. Update map view when center or zoom changes
  useEffect(() => {
    if (isMapReady && mapRef.current) {
      mapRef.current.setView(mapCenter, zoom, { animate: true, duration: 0.5 });
    }
  }, [mapCenter, zoom, isMapReady]);

  // 4.  Centralized logic to update all layers.
  
  useEffect(() => {
    if (!isMapReady || !mapRef.current || filteredBillboards.length === 0) return;

    const map = mapRef.current;
    const markersGroup = markersLayerRef.current;
    const heatmapGroup = heatmapLayerRef.current;
    if (!markersGroup || !heatmapGroup) return;
    
    // Create user marker once and store it in the ref
    if (userLocation && !userMarkerRef.current) {
      const userIcon = L.divIcon({
        html: `<div class="w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>`,
        className: '',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      userMarkerRef.current = L.marker(userLocation, { 
        icon: userIcon, 
        zIndexOffset: 1000 
      }).bindPopup("<b>Your Location</b>");
    }

    // Always start by clearing previous layers to prevent duplicates
    markersGroup.clearLayers();
    heatmapGroup.clearLayers();
    
    // Use requestAnimationFrame to batch DOM updates for a smoother render
    requestAnimationFrame(() => {
      if (viewMode === 'heatmap') {
        if (map.hasLayer(markersGroup)) map.removeLayer(markersGroup);
        if (!map.hasLayer(heatmapGroup)) map.addLayer(heatmapGroup);

        filteredBillboards.forEach(billboard => {
          const intensity = billboard.violationCount;
          const maxRadius = Math.min(intensity * 80, 400);
          const color = getViolationColor(billboard.violationType);
          
          for (let i = 0; i < 2; i++) { // Create 2 circles for a softer glow effect
            L.circle([billboard.latitude, billboard.longitude], {
              radius: maxRadius - (i * maxRadius / 3),
              fillColor: color,
              color: color,
              weight: 0.5,
              opacity: 0.4 - (i * 0.15),
              fillOpacity: 0.4 - (i * 0.15)
            }).addTo(heatmapGroup);
          }
        });
      } else { // viewMode === 'markers'
        if (map.hasLayer(heatmapGroup)) map.removeLayer(heatmapGroup);
        if (!map.hasLayer(markersGroup)) map.addLayer(markersGroup);

        // Add user marker to the markers group
        if (userMarkerRef.current) {
            markersGroup.addLayer(userMarkerRef.current);
        }

        filteredBillboards.forEach(billboard => {
          L.marker([billboard.latitude, billboard.longitude], { 
            icon: getMarkerIcon(billboard) 
          }).bindPopup(
            `<div class="text-gray-800 font-sans">
              <h3 style="color: ${getViolationColor(billboard.violationType)};" class="text-sm font-bold mb-2 uppercase">${billboard.violationType} Violation</h3>
              <p class="text-xs my-1"><strong>Violations:</strong> ${billboard.violationCount}</p>
              <p class="text-xs my-1"><strong>Issues:</strong> ${billboard.description}</p>
              <p class="text-xs my-1 text-gray-500"><strong>Date:</strong> ${billboard.timestamp}</p>
            </div>`,
            { maxWidth: 250 }
          ).addTo(markersGroup);
        });
      }
    });

  }, [isMapReady, viewMode, filteredBillboards, userLocation, getViolationColor, getMarkerIcon]);

  // --- Render JSX ---
  return (
    <div className="relative h-screen w-full bg-gray-900 text-white font-sans">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-[1001] bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Billboard Violation Heatmap</h1>
          <p className="text-sm text-gray-400">{status}</p>
        </div>
        {onClose && (
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors" 
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Controls Panel */}
      <div className="absolute top-24 left-4 z-[1001] bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-700 p-4 w-72 space-y-4">
        {/* View Mode Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">View Mode</label>
          <div className="flex rounded-lg bg-gray-900 p-1">
            {(['heatmap', 'markers'] as const).map(mode => (
              <button 
                key={mode} 
                onClick={() => setViewMode(mode)} 
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors capitalize ${
                  viewMode === mode ? 'bg-teal-600 text-white' : 'text-gray-400 hover:bg-gray-700'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Severity Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Severity</label>
          <select 
            value={selectedSeverity} 
            onChange={(e) => setSelectedSeverity(e.target.value as SeverityFilter)} 
            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Violations</option>
            <option value="severe">Severe Only</option>
            <option value="moderate">Moderate Only</option>
            <option value="minor">Minor Only</option>
          </select>
        </div>

        {/* Legend */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Violation Severity</label>
          <div className="space-y-2">
            {(['severe', 'moderate', 'minor'] as const).map(type => (
              <div key={type} className="flex items-center space-x-3">
                <div 
                  style={{ backgroundColor: getViolationColor(type) }} 
                  className="w-4 h-4 rounded-full"
                ></div>
                <span className="text-sm text-gray-300 capitalize">
                  {type} ({statistics.severeCounts[type]})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="pt-3 border-t border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-teal-400">{statistics.filteredCount}</div>
              <div className="text-xs text-gray-400">Flagged Billboards</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400">{statistics.filteredViolations}</div>
              <div className="text-xs text-gray-400">Violations Shown</div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapContainerRef} className="h-full w-full" />
    </div>
  );
};

export default HeatmapArea;