'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, HeatmapLayer, TrafficLayer, Polyline } from '@react-google-maps/api';
import { Box, CircularProgress, Alert, Chip, Typography, Paper } from '@mui/material';

const libraries: ("visualization" | "places" | "drawing")[] = ["visualization"];

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

// Raipur center coordinates
const defaultCenter = {
  lat: 21.2514,
  lng: 81.6296,
};

interface TrafficMapComponentProps {
  showTrafficLayer?: boolean;
  showHeatmap?: boolean;
  showIncidents?: boolean;
  showRoadClosures?: boolean;
}

interface RoadClosure {
  id: number;
  road_name: string;
  lat: number;
  lng: number;
  reason: string;
  severity: string;
}

interface TrafficPoint {
  lat: number;
  lng: number;
  weight: number;
}

export default function TrafficMapComponent({
  showTrafficLayer = true,
  showHeatmap = false,
  showIncidents = true,
  showRoadClosures = true,
}: TrafficMapComponentProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<RoadClosure | null>(null);
  const [roadClosures, setRoadClosures] = useState<RoadClosure[]>([]);
  const [trafficData, setTrafficData] = useState<TrafficPoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  // Fetch road closures from database
  useEffect(() => {
    const fetchRoadClosures = async () => {
      try {
        const response = await fetch('/api/road-closures');
        if (!response.ok) throw new Error('Failed to fetch road closures');
        const data = await response.json();
        
        // Transform data to include coordinates
        const closuresWithCoords = data.map((closure: any) => ({
          id: closure.id,
          road_name: closure.road_segment_id || closure.reason,
          lat: closure.lat || 21.2514 + (Math.random() - 0.5) * 0.1,
          lng: closure.lng || 81.6296 + (Math.random() - 0.5) * 0.1,
          reason: closure.reason,
          severity: closure.severity || 'medium',
        }));
        
        setRoadClosures(closuresWithCoords);
      } catch (err) {
        console.error('Error fetching road closures:', err);
      }
    };

    fetchRoadClosures();
  }, []);

  // Fetch traffic data for heatmap
  useEffect(() => {
    const fetchTrafficData = async () => {
      try {
        const response = await fetch('/api/traffic/heatmap');
        if (!response.ok) throw new Error('Failed to fetch traffic data');
        const data = await response.json();
        
        // Transform traffic data to heatmap points
        const heatmapData = data.map((point: any) => ({
          lat: point.lat || 21.2514 + (Math.random() - 0.5) * 0.1,
          lng: point.lng || 81.6296 + (Math.random() - 0.5) * 0.1,
          weight: point.congestion_level === 'high' ? 3 : 
                  point.congestion_level === 'medium' ? 2 : 1,
        }));
        
        setTrafficData(heatmapData);
      } catch (err) {
        console.error('Error fetching traffic data:', err);
      }
    };

    if (showHeatmap) {
      fetchTrafficData();
    }
  }, [showHeatmap]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const heatmapData = useMemo(() => {
    if (!isLoaded || !showHeatmap || trafficData.length === 0) return null;

    return trafficData.map(point => ({
      location: new google.maps.LatLng(point.lat, point.lng),
      weight: point.weight,
    }));
  }, [isLoaded, showHeatmap, trafficData]);

  const getSeverityColor = (severity: string): string => {
    switch (severity?.toLowerCase()) {
      case 'critical':
      case 'high':
        return '#d32f2f';
      case 'medium':
        return '#f57c00';
      case 'low':
        return '#fbc02d';
      default:
        return '#757575';
    }
  };

  const getMarkerIcon = (severity: string) => {
    const color = getSeverityColor(severity);
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: 0.8,
      strokeColor: '#fff',
      strokeWeight: 2,
      scale: 10,
    };
  };

  if (loadError) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error loading Google Maps. Please check your API key in environment variables.
        <br />
        <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
          Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local
        </Typography>
      </Alert>
    );
  }

  if (!isLoaded) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Loading Google Maps...
        </Typography>
      </Box>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={defaultCenter}
      zoom={13}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        zoomControl: true,
        streetViewControl: true,
        mapTypeControl: true,
        fullscreenControl: false,
      }}
    >
      {/* Google Traffic Layer */}
      {showTrafficLayer && <TrafficLayer />}

      {/* Heatmap Layer for custom traffic data */}
      {showHeatmap && heatmapData && (
        <HeatmapLayer
          data={heatmapData}
          options={{
            radius: 50,
            opacity: 0.6,
            gradient: [
              'rgba(0, 255, 255, 0)',
              'rgba(0, 255, 255, 1)',
              'rgba(0, 191, 255, 1)',
              'rgba(0, 127, 255, 1)',
              'rgba(0, 63, 255, 1)',
              'rgba(0, 0, 255, 1)',
              'rgba(0, 0, 223, 1)',
              'rgba(0, 0, 191, 1)',
              'rgba(0, 0, 159, 1)',
              'rgba(0, 0, 127, 1)',
              'rgba(63, 0, 91, 1)',
              'rgba(127, 0, 63, 1)',
              'rgba(191, 0, 31, 1)',
              'rgba(255, 0, 0, 1)'
            ],
          }}
        />
      )}

      {/* Road Closure Markers */}
      {showRoadClosures && roadClosures.map((closure) => (
        <Marker
          key={closure.id}
          position={{ lat: closure.lat, lng: closure.lng }}
          icon={getMarkerIcon(closure.severity)}
          onClick={() => setSelectedMarker(closure)}
          title={closure.road_name}
        />
      ))}

      {/* Info Window for selected marker */}
      {selectedMarker && (
        <InfoWindow
          position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
          onCloseClick={() => setSelectedMarker(null)}
        >
          <Paper elevation={0} sx={{ p: 1, minWidth: 200 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              🚧 {selectedMarker.road_name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {selectedMarker.reason}
            </Typography>
            <Chip 
              label={selectedMarker.severity.toUpperCase()} 
              size="small"
              sx={{
                backgroundColor: getSeverityColor(selectedMarker.severity),
                color: 'white',
                fontWeight: 600,
              }}
            />
          </Paper>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
