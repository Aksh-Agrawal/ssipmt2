'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Slider,
  TextField,
  Grid,
  Divider,
} from '@mui/material';
import {
  PlayArrow,
  Block,
  TrendingUp,
  Timeline as TimelineIcon,
  Map as MapIcon,
  Warning,
  Info,
} from '@mui/icons-material';

interface RoadSegment {
  id: string;
  name: string;
  from: string;
  to: string;
  normalTraffic: number; // vehicles per hour
  currentStatus: 'open' | 'closed' | 'construction';
}

interface SimulationResult {
  affectedRoads: Array<{
    name: string;
    trafficIncrease: number;
    congestionLevel: 'low' | 'medium' | 'high' | 'critical';
  }>;
  suggestedDetours: string[];
  estimatedDelay: number; // minutes
  affectedAreas: string[];
  trafficDiversionPercentage: number;
}

// Mock road data
const mockRoads: RoadSegment[] = [
  { id: 'R1', name: 'Main Street', from: 'Central Park', to: 'Railway Station', normalTraffic: 500, currentStatus: 'open' },
  { id: 'R2', name: 'MG Road', from: 'City Center', to: 'Airport', normalTraffic: 800, currentStatus: 'open' },
  { id: 'R3', name: 'Station Road', from: 'Railway Station', to: 'Bus Stand', normalTraffic: 600, currentStatus: 'open' },
  { id: 'R4', name: 'Civil Lines', from: 'Court Complex', to: 'Hospital', normalTraffic: 400, currentStatus: 'open' },
  { id: 'R5', name: 'Ring Road', from: 'North Junction', to: 'South Junction', normalTraffic: 1000, currentStatus: 'open' },
];

export default function TrafficSimulatorPage() {
  const [selectedRoad, setSelectedRoad] = useState('');
  const [closureDate, setClosureDate] = useState('');
  const [closureStartTime, setClosureStartTime] = useState('');
  const [closureEndTime, setClosureEndTime] = useState('');
  const [closureDuration, setClosureDuration] = useState(2); // hours
  const [isSpecialEvent, setIsSpecialEvent] = useState(false);
  const [eventType, setEventType] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<SimulationResult | null>(null);

  // Special events that affect traffic
  const specialEvents = [
    { id: 'festival', name: 'Festival/Religious Event', trafficMultiplier: 1.5 },
    { id: 'market', name: 'Weekly Market Day', trafficMultiplier: 1.3 },
    { id: 'cricket', name: 'Cricket Match', trafficMultiplier: 1.8 },
    { id: 'election', name: 'Election Day', trafficMultiplier: 1.4 },
    { id: 'school', name: 'School Hours', trafficMultiplier: 1.2 },
  ];

  // Run simulation
  const runSimulation = async () => {
    if (!selectedRoad) {
      alert('Please select a road segment');
      return;
    }

    setIsSimulating(true);

    // Simulate API call with historical data analysis
    await new Promise(resolve => setTimeout(resolve, 2500));

    const selectedRoadData = mockRoads.find(r => r.id === selectedRoad);
    const trafficMultiplier = isSpecialEvent && eventType 
      ? specialEvents.find(e => e.id === eventType)?.trafficMultiplier || 1 
      : 1;

    // Mock simulation results based on road closure
    const results: SimulationResult = {
      affectedRoads: [
        {
          name: 'MG Road',
          trafficIncrease: 45 * trafficMultiplier,
          congestionLevel: 'high',
        },
        {
          name: 'Station Road',
          trafficIncrease: 35 * trafficMultiplier,
          congestionLevel: 'medium',
        },
        {
          name: 'Ring Road',
          trafficIncrease: 25 * trafficMultiplier,
          congestionLevel: 'medium',
        },
      ],
      suggestedDetours: [
        `Use Ring Road → North Junction → ${selectedRoadData?.to}`,
        `Alternative: Civil Lines → Hospital Road → ${selectedRoadData?.to}`,
        'For heavy vehicles: Use outer bypass via Industrial Area',
      ],
      estimatedDelay: Math.round(15 * closureDuration * trafficMultiplier),
      affectedAreas: ['City Center', 'Railway Station Area', 'Bus Stand', 'Hospital Zone'],
      trafficDiversionPercentage: 65,
    };

    setSimulationResults(results);
    setIsSimulating(false);
  };

  const getCongestionColor = (level: string) => {
    switch (level) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
          🚦 Road Closure Simulator
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Predict traffic impact and plan detours before closing roads for construction or events
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>How it works:</strong> This simulator uses historical traffic data, current patterns, and AI to predict how road closures will affect traffic flow. Plan better to minimize citizen inconvenience.
        </Alert>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {/* Left Panel - Input */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              📋 Simulation Parameters
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select Road Segment to Close</InputLabel>
              <Select
                value={selectedRoad}
                label="Select Road Segment to Close"
                onChange={(e) => setSelectedRoad(e.target.value)}
              >
                {mockRoads.map((road) => (
                  <MenuItem key={road.id} value={road.id}>
                    {road.name} ({road.from} → {road.to})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedRoad && (
              <Card variant="outlined" sx={{ mb: 2, backgroundColor: '#f5f5f5' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Normal Traffic:</strong> {mockRoads.find(r => r.id === selectedRoad)?.normalTraffic} vehicles/hour
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Current Status:</strong>{' '}
                    <Chip 
                      label={mockRoads.find(r => r.id === selectedRoad)?.currentStatus.toUpperCase()} 
                      size="small" 
                      color="success"
                    />
                  </Typography>
                </CardContent>
              </Card>
            )}

            <TextField
              fullWidth
              type="date"
              label="Closure Date"
              value={closureDate}
              onChange={(e) => setClosureDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                type="time"
                label="Start Time"
                value={closureStartTime}
                onChange={(e) => setClosureStartTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                type="time"
                label="End Time"
                value={closureEndTime}
                onChange={(e) => setClosureEndTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Closure Duration: <strong>{closureDuration} hours</strong>
              </Typography>
              <Slider
                value={closureDuration}
                onChange={(_, value) => setClosureDuration(value as number)}
                min={1}
                max={12}
                step={0.5}
                marks
                valueLabelDisplay="auto"
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Special Event/Occasion</InputLabel>
              <Select
                value={eventType}
                label="Special Event/Occasion"
                onChange={(e) => {
                  setEventType(e.target.value);
                  setIsSpecialEvent(!!e.target.value);
                }}
              >
                <MenuItem value="">None (Regular Day)</MenuItem>
                {specialEvents.map((event) => (
                  <MenuItem key={event.id} value={event.id}>
                    {event.name} (+{(event.trafficMultiplier - 1) * 100}% traffic)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={isSimulating ? <CircularProgress size={20} /> : <PlayArrow />}
              onClick={runSimulation}
              disabled={isSimulating || !selectedRoad}
              sx={{ py: 1.5 }}
            >
              {isSimulating ? 'Running Simulation...' : 'Run Traffic Simulation'}
            </Button>
          </Paper>

          {/* Right Panel - Results */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              📊 Simulation Results
            </Typography>

            {!simulationResults ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <MapIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  Configure parameters and run simulation to see traffic impact analysis
                </Typography>
              </Box>
            ) : (
              <Box>
                {/* Impact Summary */}
                <Card variant="outlined" sx={{ mb: 2, backgroundColor: '#fff3e0' }}>
                  <CardContent>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      ⚠️ Overall Impact Assessment
                    </Typography>
                    <Typography variant="body2">
                      <strong>{simulationResults.trafficDiversionPercentage}%</strong> of traffic will be diverted to alternate routes
                    </Typography>
                    <Typography variant="body2">
                      Average delay: <strong>{simulationResults.estimatedDelay} minutes</strong>
                    </Typography>
                  </CardContent>
                </Card>

                {/* Affected Roads */}
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  🚗 Affected Roads
                </Typography>
                {simulationResults.affectedRoads.map((road, index) => (
                  <Card key={index} variant="outlined" sx={{ mb: 1 }}>
                    <CardContent sx={{ py: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <Typography variant="body2" fontWeight={600}>
                            {road.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            +{road.trafficIncrease.toFixed(0)}% traffic increase
                          </Typography>
                        </div>
                        <Chip
                          label={road.congestionLevel.toUpperCase()}
                          color={getCongestionColor(road.congestionLevel) as any}
                          size="small"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                ))}

                <Divider sx={{ my: 2 }} />

                {/* Suggested Detours */}
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  🗺️ Suggested Detour Routes
                </Typography>
                {simulationResults.suggestedDetours.map((detour, index) => (
                  <Alert key={index} severity="info" sx={{ mb: 1 }}>
                    <Typography variant="body2">{detour}</Typography>
                  </Alert>
                ))}

                <Divider sx={{ my: 2 }} />

                {/* Affected Areas */}
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  📍 Affected Areas
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {simulationResults.affectedAreas.map((area, index) => (
                    <Chip key={index} label={area} variant="outlined" size="small" />
                  ))}
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  <Button variant="contained" color="success" fullWidth>
                    Approve & Publish
                  </Button>
                  <Button variant="outlined" fullWidth>
                    Export Report
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Box>

        {/* Heatmap Visualization Placeholder */}
        {simulationResults && (
          <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              🗺️ Traffic Heatmap Visualization
            </Typography>
            <Box
              sx={{
                height: 400,
                backgroundColor: '#f5f5f5',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="body1" color="text.secondary">
                🗺️ Interactive map will show traffic density and congestion levels here
                <br />
                <Typography variant="caption" color="text.secondary">
                  (Integration with Google Maps API / Mapbox for live visualization)
                </Typography>
              </Typography>
            </Box>
          </Paper>
        )}
      </Box>
    </Container>
  );
}
