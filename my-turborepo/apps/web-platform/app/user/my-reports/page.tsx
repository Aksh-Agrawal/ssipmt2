'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  Chip,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Avatar,
  Divider,
} from '@mui/material';
import {
  CheckCircle,
  Schedule,
  Error,
  Visibility,
  FilterList,
  Search,
} from '@mui/icons-material';
import Link from 'next/link';

interface Report {
  id: string;
  title: string;
  category: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt: string;
  location: string;
  photos: number;
  description: string;
}

// Mock data
const mockReports: Report[] = [
  {
    id: 'RPT-2025-001',
    title: 'Pothole on Main Street near Park',
    category: 'Infrastructure',
    status: 'in-progress',
    priority: 'high',
    createdAt: '2025-11-05 10:30 AM',
    updatedAt: '2025-11-06 09:15 AM',
    location: '21.2514° N, 81.6296° E',
    photos: 2,
    description: 'Large pothole causing traffic issues',
  },
  {
    id: 'RPT-2025-002',
    title: 'Street light not working',
    category: 'Electricity',
    status: 'open',
    priority: 'medium',
    createdAt: '2025-11-04 06:45 PM',
    updatedAt: '2025-11-04 06:45 PM',
    location: '21.2447° N, 81.6382° E',
    photos: 1,
    description: 'Street light pole #45 not functioning',
  },
  {
    id: 'RPT-2025-003',
    title: 'Garbage not collected',
    category: 'Sanitation',
    status: 'resolved',
    priority: 'low',
    createdAt: '2025-11-02 08:20 AM',
    updatedAt: '2025-11-03 02:30 PM',
    location: '21.2589° N, 81.6421° E',
    photos: 3,
    description: 'Garbage pile accumulating for 3 days',
  },
];

export default function MyReportsPage() {
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter reports
  const filteredReports = reports.filter((report) => {
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || report.category === filterCategory;
    const matchesSearch = 
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesCategory && matchesSearch;
  });

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Error color="error" />;
      case 'in-progress': return <Schedule color="warning" />;
      case 'resolved': return <CheckCircle color="success" />;
      case 'closed': return <CheckCircle color="disabled" />;
      default: return <Error />;
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

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
          📋 My Reports
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Track all your submitted civic issue reports
        </Typography>

        {/* Stats Summary */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2, mb: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#fff3e0' }}>
            <Typography variant="h3" fontWeight={700} color="warning.main">
              {reports.filter(r => r.status === 'open').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">Open</Typography>
          </Paper>
          
          <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#e3f2fd' }}>
            <Typography variant="h3" fontWeight={700} color="info.main">
              {reports.filter(r => r.status === 'in-progress').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">In Progress</Typography>
          </Paper>
          
          <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#e8f5e9' }}>
            <Typography variant="h3" fontWeight={700} color="success.main">
              {reports.filter(r => r.status === 'resolved').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">Resolved</Typography>
          </Paper>

          <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
            <Typography variant="h3" fontWeight={700}>
              {reports.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">Total</Typography>
          </Paper>
        </Box>

        {/* Filters */}
        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              placeholder="Search by ID or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
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

        {/* Reports List */}
        {filteredReports.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No reports found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchQuery || filterStatus !== 'all' || filterCategory !== 'all' 
                ? 'Try adjusting your filters'
                : 'You haven\'t submitted any reports yet'}
            </Typography>
            {!searchQuery && filterStatus === 'all' && filterCategory === 'all' && (
              <Button variant="contained" component={Link} href="/user/report">
                Report an Issue
              </Button>
            )}
          </Paper>
        ) : (
          <Stack spacing={2}>
            {filteredReports.map((report) => (
              <Card key={report.id} elevation={2} sx={{ transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="h6" fontWeight={600}>
                          {report.title}
                        </Typography>
                        <Chip 
                          label={report.id} 
                          size="small" 
                          variant="outlined"
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {report.description}
                      </Typography>

                      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                        <Chip 
                          icon={getStatusIcon(report.status)}
                          label={report.status.replace('-', ' ').toUpperCase()} 
                          size="small" 
                          color={getStatusColor(report.status) as any}
                        />
                        <Chip 
                          label={report.priority.toUpperCase()} 
                          size="small" 
                          color={getPriorityColor(report.priority) as any}
                        />
                        <Chip 
                          label={report.category} 
                          size="small" 
                          variant="outlined"
                        />
                        {report.photos > 0 && (
                          <Chip 
                            label={`${report.photos} photo${report.photos > 1 ? 's' : ''}`} 
                            size="small" 
                            variant="outlined"
                          />
                        )}
                      </Stack>

                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Typography variant="caption" color="text.secondary">
                          📍 {report.location}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          🕐 Created: {report.createdAt}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          🔄 Updated: {report.updatedAt}
                        </Typography>
                      </Box>
                    </Box>

                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Visibility />}
                      component={Link}
                      href={`/user/issue/${report.id}`}
                      sx={{ ml: 2 }}
                    >
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>
    </Container>
  );
}
