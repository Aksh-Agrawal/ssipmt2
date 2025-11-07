'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent,
  Chip,
  IconButton,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Map as MapIcon,
  Layers,
  Videocam,
  Sensors,
  Warning,
  Traffic,
  Construction,
  Refresh,
  Fullscreen,
  FilterList,
} from '@mui/icons-material';

interface TrafficIncident {
  id: string;
  type: 'accident' | 'construction' | 'congestion' | 'closure';
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  time: string;
}

interface TrafficCamera {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline';
  viewers: number;
}

export default function TrafficMapPage() {
  const [mapView, setMapView] = useState<'traffic' | 'heatmap' | 'satellite'>('traffic');
  const [showIncidents, setShowIncidents] = useState(true);
  const [showCameras, setShowCameras] = useState(true);
  const [showSensors, setShowSensors] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock data
  const incidents: TrafficIncident[] = [
    {
      id: 'I1',
      type: 'congestion',
      location: 'Main Street x Railway Road',
      severity: 'high',
      description: 'Heavy traffic due to signal malfunction',
      time: '10 mins ago',
    },
    {
      id: 'I2',
      type: 'construction',
      location: 'MG Road',
      severity: 'medium',
      description: 'Road repair work in progress',
      time: '2 hours ago',
    },
    {
      id: 'I3',
      type: 'accident',
      location: 'Ring Road Junction',
      severity: 'critical',
      description: 'Vehicle collision blocking 2 lanes',
      time: '5 mins ago',
    },
  ];

  const cameras: TrafficCamera[] = [
    { id: 'C1', name: 'Main Street Cam 1', location: 'Main St x Park Ave', status: 'online', viewers: 45 },
    { id: 'C2', name: 'Railway Junction', location: 'Railway Station', status: 'online', viewers: 82 },
    { id: 'C3', name: 'MG Road Central', location: 'MG Road Center', status: 'offline', viewers: 0 },
    { id: 'C4', name: 'Ring Road North', location: 'Ring Rd North', status: 'online', viewers: 23 },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#d32f2f';
      case 'high': return '#f57c00';
      case 'medium': return '#fbc02d';
      case 'low': return '#388e3c';
      default: return '#757575';
    }
  };

  const getIncidentIcon = (type: string) => {
    switch (type) {
      case 'accident': return '🚗💥';
      case 'construction': return '🚧';
      case 'congestion': return '🚦';
      case 'closure': return '🚫';
      default: return '⚠️';
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <div>
            <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
              🗺️ Live Traffic Map
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Real-time traffic monitoring with camera feeds and sensor data
            </Typography>
          </div>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<Refresh />}>
              Refresh
            </Button>
            <Button variant="outlined" startIcon={<Fullscreen />}>
              Fullscreen
            </Button>
          </Box>
        </Box>

        {/* Auto-refresh toggle */}
        <Paper elevation={1} sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body1" fontWeight={600}>
              Live Updates
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Last updated: Just now
            </Typography>
          </Box>
          <FormControlLabel
            control={<Switch checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />}
            label="Auto-refresh every 30s"
          />
        </Paper>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '3fr 1fr' }, gap: 3 }}>
          {/* Main Map Area */}
          <Box>
            {/* Map Controls */}
            <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <ToggleButtonGroup
                  value={mapView}
                  exclusive
                  onChange={(_, value) => value && setMapView(value)}
                  size="small"
                >
                  <ToggleButton value="traffic">
                    <Traffic sx={{ mr: 1 }} />
                    Traffic
                  </ToggleButton>
                  <ToggleButton value="heatmap">
                    <Layers sx={{ mr: 1 }} />
                    Heatmap
                  </ToggleButton>
                  <ToggleButton value="satellite">
                    <MapIcon sx={{ mr: 1 }} />
                    Satellite
                  </ToggleButton>
                </ToggleButtonGroup>

                <Divider orientation="vertical" flexItem />

                <FormControlLabel
                  control={<Switch checked={showIncidents} onChange={(e) => setShowIncidents(e.target.checked)} size="small" />}
                  label="Incidents"
                />
                <FormControlLabel
                  control={<Switch checked={showCameras} onChange={(e) => setShowCameras(e.target.checked)} size="small" />}
                  label="Cameras"
                />
                <FormControlLabel
                  control={<Switch checked={showSensors} onChange={(e) => setShowSensors(e.target.checked)} size="small" />}
                  label="Sensors"
                />
              </Box>
            </Paper>

            {/* Map Container */}
            <Paper
              elevation={3}
              sx={{
                height: 600,
                backgroundColor: '#e0e0e0',
                backgroundImage: 'linear-gradient(45deg, #f5f5f5 25%, transparent 25%, transparent 75%, #f5f5f5 75%), linear-gradient(45deg, #f5f5f5 25%, transparent 25%, transparent 75%, #f5f5f5 75%)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 10px 10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ textAlign: 'center', p: 4 }}>
                <MapIcon sx={{ fontSize: 80, color: '#9e9e9e', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Interactive Traffic Map
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Integration with Google Maps API / Mapbox for live traffic visualization
                </Typography>
                <Chip label="Current View: Traffic Layer" color="primary" />
              </Box>

              {/* Overlay Legend */}
              <Paper
                sx={{
                  position: 'absolute',
                  bottom: 20,
                  left: 20,
                  p: 2,
                  minWidth: 200,
                }}
              >
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Traffic Density
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 30, height: 10, backgroundColor: '#388e3c', borderRadius: 1 }} />
                    <Typography variant="caption">Low</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 30, height: 10, backgroundColor: '#fbc02d', borderRadius: 1 }} />
                    <Typography variant="caption">Medium</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 30, height: 10, backgroundColor: '#f57c00', borderRadius: 1 }} />
                    <Typography variant="caption">High</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 30, height: 10, backgroundColor: '#d32f2f', borderRadius: 1 }} />
                    <Typography variant="caption">Critical</Typography>
                  </Box>
                </Box>
              </Paper>
            </Paper>

            {/* Traffic Stats */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mt: 2 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight={700} color="success.main">
                    45%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Roads Clear
                  </Typography>
                </CardContent>
              </Card>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight={700} color="warning.main">
                    35%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Moderate Traffic
                  </Typography>
                </CardContent>
              </Card>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight={700} color="error.main">
                    15%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Heavy Traffic
                  </Typography>
                </CardContent>
              </Card>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight={700}>
                    5%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Road Closures
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Right Sidebar */}
          <Box>
            {/* Active Incidents */}
            <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                🚨 Active Incidents ({incidents.length})
              </Typography>
              <List dense>
                {incidents.map((incident) => (
                  <ListItem
                    key={incident.id}
                    sx={{
                      mb: 1,
                      backgroundColor: '#f5f5f5',
                      borderRadius: 1,
                      borderLeft: `4px solid ${getSeverityColor(incident.severity)}`,
                    }}
                  >
                    <ListItemIcon>
                      <Typography fontSize={24}>{getIncidentIcon(incident.type)}</Typography>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={600}>
                          {incident.location}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="caption" display="block">
                            {incident.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {incident.time}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>

            {/* Live Cameras */}
            <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                📹 Traffic Cameras ({cameras.filter(c => c.status === 'online').length}/{cameras.length})
              </Typography>
              <List dense>
                {cameras.map((camera) => (
                  <ListItem
                    key={camera.id}
                    sx={{
                      mb: 1,
                      backgroundColor: camera.status === 'online' ? '#e8f5e9' : '#ffebee',
                      borderRadius: 1,
                    }}
                    secondaryAction={
                      camera.status === 'online' && (
                        <IconButton edge="end" size="small">
                          <Videocam fontSize="small" />
                        </IconButton>
                      )
                    }
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={600}>
                          {camera.name}
                        </Typography>
                      }
                      secondary={
                        <Box component="span" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Typography variant="caption" display="block" component="span">
                            {camera.location}
                          </Typography>
                          {camera.status === 'online' && (
                            <Chip
                              label={`${camera.viewers} watching`}
                              size="small"
                              sx={{ mt: 0.5, height: 20 }}
                            />
                          )}
                          {camera.status === 'offline' && (
                            <Chip
                              label="Offline"
                              size="small"
                              color="error"
                              sx={{ mt: 0.5, height: 20 }}
                            />
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>

            {/* Sensor Data */}
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                📡 Sensor Network
              </Typography>
              <Card variant="outlined" sx={{ mb: 1, p: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      Main Street
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Vehicle Count
                    </Typography>
                  </Box>
                  <Chip label="1,234 veh/hr" color="warning" size="small" />
                </Box>
              </Card>
              <Card variant="outlined" sx={{ mb: 1, p: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      Ring Road
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Average Speed
                    </Typography>
                  </Box>
                  <Chip label="35 km/h" color="error" size="small" />
                </Box>
              </Card>
              <Card variant="outlined" sx={{ p: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      MG Road
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Congestion Level
                    </Typography>
                  </Box>
                  <Chip label="High" color="error" size="small" />
                </Box>
              </Card>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
