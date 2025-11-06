'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Alert,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  CheckCircle,
  Schedule,
  Block,
  Event as EventIcon,
  Traffic,
} from '@mui/icons-material';

interface RoadEvent {
  id: string;
  title: string;
  type: 'construction' | 'event' | 'maintenance' | 'emergency';
  road: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  status: 'draft' | 'scheduled' | 'active' | 'completed';
  affectedLanes: number;
  description: string;
  approvedBy?: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<RoadEvent[]>([
    {
      id: 'E1',
      title: 'Main Street Road Repair',
      type: 'construction',
      road: 'Main Street (Park to Station)',
      startDate: '2025-11-10',
      endDate: '2025-11-15',
      startTime: '08:00',
      endTime: '18:00',
      status: 'scheduled',
      affectedLanes: 2,
      description: 'Pothole repair and road resurfacing',
      approvedBy: 'Admin Officer',
    },
    {
      id: 'E2',
      title: 'Festival Celebration - Road Closure',
      type: 'event',
      road: 'MG Road',
      startDate: '2025-11-12',
      endDate: '2025-11-12',
      startTime: '16:00',
      endTime: '22:00',
      status: 'draft',
      affectedLanes: 4,
      description: 'Annual Diwali celebration procession',
    },
    {
      id: 'E3',
      title: 'Water Pipeline Maintenance',
      type: 'maintenance',
      road: 'Ring Road North',
      startDate: '2025-11-08',
      endDate: '2025-11-08',
      startTime: '22:00',
      endTime: '06:00',
      status: 'completed',
      affectedLanes: 1,
      description: 'Emergency pipeline repair',
      approvedBy: 'City Engineer',
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<RoadEvent | null>(null);
  const [formData, setFormData] = useState<Partial<RoadEvent>>({
    title: '',
    type: 'construction',
    road: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    status: 'draft',
    affectedLanes: 1,
    description: '',
  });

  const handleOpenDialog = (event?: RoadEvent) => {
    if (event) {
      setEditingEvent(event);
      setFormData(event);
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        type: 'construction',
        road: '',
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        status: 'draft',
        affectedLanes: 1,
        description: '',
      });
    }
    setDialogOpen(true);
  };

  const handleSaveEvent = () => {
    if (editingEvent) {
      // Update existing event
      setEvents(events.map(e => e.id === editingEvent.id ? { ...e, ...formData } as RoadEvent : e));
    } else {
      // Create new event
      const newEvent: RoadEvent = {
        ...formData as RoadEvent,
        id: `E${events.length + 1}`,
      };
      setEvents([...events, newEvent]);
    }
    setDialogOpen(false);
  };

  const handleApprove = (eventId: string) => {
    setEvents(events.map(e => 
      e.id === eventId 
        ? { ...e, status: 'scheduled' as const, approvedBy: 'Current Admin' } 
        : e
    ));
  };

  const handleDelete = (eventId: string) => {
    setEvents(events.filter(e => e.id !== eventId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'default';
      case 'scheduled': return 'info';
      case 'active': return 'warning';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'construction': return '🚧';
      case 'event': return '🎉';
      case 'maintenance': return '🔧';
      case 'emergency': return '🚨';
      default: return '📅';
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <div>
            <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
              📅 Planned Events & Closures
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Schedule and manage planned road closures and events
            </Typography>
          </div>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            size="large"
          >
            Create New Event
          </Button>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>Tip:</strong> All scheduled events are automatically published to the citizen app and traffic system. Use the simulator to analyze traffic impact before approval.
        </Alert>

        {/* Stats Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight={700} color="text.secondary">
                {events.filter(e => e.status === 'draft').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">Draft</Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight={700} color="info.main">
                {events.filter(e => e.status === 'scheduled').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">Scheduled</Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight={700} color="warning.main">
                {events.filter(e => e.status === 'active').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">Active Now</Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight={700} color="success.main">
                {events.filter(e => e.status === 'completed').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">Completed</Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Events List */}
        <Stack spacing={2}>
          {events.map((event) => (
            <Card key={event.id} elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography fontSize={28}>{getTypeIcon(event.type)}</Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {event.title}
                      </Typography>
                      <Chip 
                        label={event.status.toUpperCase()} 
                        size="small" 
                        color={getStatusColor(event.status) as any}
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" paragraph>
                      {event.description}
                    </Typography>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 2 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Road Segment
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {event.road}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Duration
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {event.startDate} to {event.endDate}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {event.startTime} - {event.endTime}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Impact
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {event.affectedLanes} lane(s) affected
                        </Typography>
                      </Box>
                    </Box>

                    {event.approvedBy && (
                      <Chip 
                        icon={<CheckCircle />}
                        label={`Approved by ${event.approvedBy}`} 
                        size="small" 
                        color="success"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  <Stack direction="row" spacing={1}>
                    {event.status === 'draft' && (
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleApprove(event.id)}
                        startIcon={<CheckCircle />}
                      >
                        Approve & Publish
                      </Button>
                    )}
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handleOpenDialog(event)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDelete(event.id)}
                    >
                      <Delete />
                    </IconButton>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>

        {/* Create/Edit Event Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingEvent ? 'Edit Event' : 'Create New Event'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Event Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />

              <FormControl fullWidth>
                <InputLabel>Event Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Event Type"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                >
                  <MenuItem value="construction">🚧 Construction</MenuItem>
                  <MenuItem value="event">🎉 Public Event</MenuItem>
                  <MenuItem value="maintenance">🔧 Maintenance</MenuItem>
                  <MenuItem value="emergency">🚨 Emergency</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Road/Location"
                value={formData.road}
                onChange={(e) => setFormData({ ...formData, road: e.target.value })}
                placeholder="e.g., Main Street (Park to Station)"
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  type="date"
                  label="End Date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField
                  fullWidth
                  type="time"
                  label="Start Time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  type="time"
                  label="End Time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>

              <TextField
                fullWidth
                type="number"
                label="Number of Lanes Affected"
                value={formData.affectedLanes}
                onChange={(e) => setFormData({ ...formData, affectedLanes: parseInt(e.target.value) })}
                inputProps={{ min: 1, max: 8 }}
              />

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide details about the event or closure"
              />

              <Alert severity="warning">
                <strong>Note:</strong> Run traffic simulation before approving to understand impact on traffic flow.
              </Alert>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleSaveEvent}
              disabled={!formData.title || !formData.road || !formData.startDate}
            >
              {editingEvent ? 'Update Event' : 'Create Event'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}
