'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
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
  Stack,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  Visibility,
  Edit,
  Delete,
  FilterList,
  Download,
  PersonAdd,
  CheckCircle,
  Warning,
  Schedule,
} from '@mui/icons-material';

interface Incident {
  id: string;
  title: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  reporter: string;
  location: string;
  createdAt: string;
  assignedTo?: string;
}

// Mock data
const mockIncidents: Incident[] = [
  {
    id: 'INC-001',
    title: 'Pothole on Main Street near Park',
    category: 'Infrastructure',
    priority: 'high',
    status: 'open',
    reporter: 'Ramesh Kumar',
    location: '21.2514° N, 81.6296° E',
    createdAt: '2025-11-06 10:30 AM',
  },
  {
    id: 'INC-002',
    title: 'Street light not working',
    category: 'Electricity',
    priority: 'medium',
    status: 'in-progress',
    reporter: 'Priya Singh',
    location: '21.2447° N, 81.6382° E',
    createdAt: '2025-11-06 09:15 AM',
    assignedTo: 'Team A',
  },
  {
    id: 'INC-003',
    title: 'Garbage not collected for 3 days',
    category: 'Sanitation',
    priority: 'high',
    status: 'open',
    reporter: 'Amit Sharma',
    location: '21.2589° N, 81.6421° E',
    createdAt: '2025-11-06 08:45 AM',
  },
  {
    id: 'INC-004',
    title: 'Water leakage from pipeline',
    category: 'Water Supply',
    priority: 'critical',
    status: 'in-progress',
    reporter: 'Sunita Verma',
    location: '21.2501° N, 81.6355° E',
    createdAt: '2025-11-05 04:20 PM',
    assignedTo: 'Team B',
  },
  {
    id: 'INC-005',
    title: 'Illegal parking blocking road',
    category: 'Traffic',
    priority: 'low',
    status: 'resolved',
    reporter: 'Vijay Patel',
    location: '21.2478° N, 81.6298° E',
    createdAt: '2025-11-05 02:10 PM',
    assignedTo: 'Traffic Police',
  },
];

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignTeam, setAssignTeam] = useState('');

  // Filter incidents
  const filteredIncidents = incidents.filter((incident) => {
    const matchesStatus = filterStatus === 'all' || incident.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || incident.priority === filterPriority;
    const matchesCategory = filterCategory === 'all' || incident.category === filterCategory;
    const matchesSearch = 
      incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.reporter.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesCategory && matchesSearch;
  });

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'error';
      case 'in-progress': return 'warning';
      case 'resolved': return 'success';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  // Handle assign team
  const handleAssign = (incident: Incident) => {
    setSelectedIncident(incident);
    setAssignTeam(incident.assignedTo || '');
    setAssignDialogOpen(true);
  };

  // Save assignment
  const saveAssignment = () => {
    if (selectedIncident) {
      setIncidents(incidents.map(inc => 
        inc.id === selectedIncident.id 
          ? { ...inc, assignedTo: assignTeam, status: 'in-progress' as const }
          : inc
      ));
      setAssignDialogOpen(false);
      setSelectedIncident(null);
      setAssignTeam('');
    }
  };

  // Change status
  const changeStatus = (incidentId: string, newStatus: Incident['status']) => {
    setIncidents(incidents.map(inc => 
      inc.id === incidentId ? { ...inc, status: newStatus } : inc
    ));
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['ID', 'Title', 'Category', 'Priority', 'Status', 'Reporter', 'Location', 'Created At', 'Assigned To'];
    const csvData = filteredIncidents.map(inc => [
      inc.id,
      inc.title,
      inc.category,
      inc.priority,
      inc.status,
      inc.reporter,
      inc.location,
      inc.createdAt,
      inc.assignedTo || 'Unassigned',
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incidents-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <div>
            <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
              🚨 Incident Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage and track all reported civic issues
            </Typography>
          </div>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={exportToCSV}
            sx={{ height: 'fit-content' }}
          >
            Export CSV
          </Button>
        </Box>

        {/* Filters */}
        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              placeholder="Search by ID, title, or reporter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              sx={{ flexGrow: 1 }}
            />
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={filterPriority}
                label="Priority"
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <MenuItem value="all">All Priority</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={filterCategory}
                label="Category"
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="Infrastructure">Infrastructure</MenuItem>
                <MenuItem value="Electricity">Electricity</MenuItem>
                <MenuItem value="Sanitation">Sanitation</MenuItem>
                <MenuItem value="Water Supply">Water Supply</MenuItem>
                <MenuItem value="Traffic">Traffic</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Paper>

        {/* Stats Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#fff3e0' }}>
            <Warning color="warning" sx={{ fontSize: 40 }} />
            <Typography variant="h4" fontWeight={700}>
              {incidents.filter(i => i.status === 'open').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">Open Issues</Typography>
          </Paper>
          
          <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#e3f2fd' }}>
            <Schedule color="info" sx={{ fontSize: 40 }} />
            <Typography variant="h4" fontWeight={700}>
              {incidents.filter(i => i.status === 'in-progress').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">In Progress</Typography>
          </Paper>
          
          <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#e8f5e9' }}>
            <CheckCircle color="success" sx={{ fontSize: 40 }} />
            <Typography variant="h4" fontWeight={700}>
              {incidents.filter(i => i.status === 'resolved').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">Resolved</Typography>
          </Paper>
        </Box>

        {/* Incidents Table */}
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Title</strong></TableCell>
                <TableCell><strong>Category</strong></TableCell>
                <TableCell><strong>Priority</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Reporter</strong></TableCell>
                <TableCell><strong>Created At</strong></TableCell>
                <TableCell><strong>Assigned To</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredIncidents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No incidents found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredIncidents.map((incident) => (
                  <TableRow key={incident.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {incident.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 250 }}>
                        {incident.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={incident.category} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={incident.priority.toUpperCase()} 
                        size="small" 
                        color={getPriorityColor(incident.priority) as any}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={incident.status.replace('-', ' ').toUpperCase()} 
                        size="small" 
                        color={getStatusColor(incident.status) as any}
                      />
                    </TableCell>
                    <TableCell>{incident.reporter}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {incident.createdAt}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {incident.assignedTo ? (
                        <Chip 
                          label={incident.assignedTo} 
                          size="small" 
                          color="primary"
                          avatar={<Avatar>{incident.assignedTo.charAt(0)}</Avatar>}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Unassigned
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="View Details">
                          <IconButton size="small" color="primary">
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Assign Team">
                          <IconButton 
                            size="small" 
                            color="secondary"
                            onClick={() => handleAssign(incident)}
                          >
                            <PersonAdd fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {incident.status !== 'resolved' && (
                          <Tooltip title="Mark Resolved">
                            <IconButton 
                              size="small" 
                              color="success"
                              onClick={() => changeStatus(incident.id, 'resolved')}
                            >
                              <CheckCircle fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Assign Team Dialog */}
        <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Assign Team</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Incident: {selectedIncident?.id} - {selectedIncident?.title}
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Select Team</InputLabel>
              <Select
                value={assignTeam}
                label="Select Team"
                onChange={(e) => setAssignTeam(e.target.value)}
              >
                <MenuItem value="Team A">Team A - Infrastructure</MenuItem>
                <MenuItem value="Team B">Team B - Water & Sanitation</MenuItem>
                <MenuItem value="Team C">Team C - Electricity</MenuItem>
                <MenuItem value="Traffic Police">Traffic Police</MenuItem>
                <MenuItem value="Health Department">Health Department</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={saveAssignment}
              disabled={!assignTeam}
            >
              Assign
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}
