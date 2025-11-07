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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Download,
  PictureAsPdf,
  TableChart,
  TrendingUp,
  TrendingDown,
  Schedule,
  CheckCircle,
  Warning,
  Assessment,
} from '@mui/icons-material';

interface AnalyticsData {
  totalReports: number;
  openReports: number;
  inProgress: number;
  resolved: number;
  avgResponseTime: string;
  satisfactionRate: number;
  topCategory: string;
  worstArea: string;
}

interface CategoryStats {
  category: string;
  count: number;
  avgResolutionDays: number;
  trend: 'up' | 'down';
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('30');
  const [reportType, setReportType] = useState('summary');

  // Mock analytics data
  const analytics: AnalyticsData = {
    totalReports: 247,
    openReports: 45,
    inProgress: 82,
    resolved: 120,
    avgResponseTime: '4.2 hours',
    satisfactionRate: 87,
    topCategory: 'Infrastructure',
    worstArea: 'Main Street Area',
  };

  const categoryStats: CategoryStats[] = [
    { category: 'Infrastructure', count: 89, avgResolutionDays: 3.5, trend: 'up' },
    { category: 'Sanitation', count: 67, avgResolutionDays: 2.1, trend: 'down' },
    { category: 'Electricity', count: 45, avgResolutionDays: 1.8, trend: 'down' },
    { category: 'Water Supply', count: 32, avgResolutionDays: 2.9, trend: 'up' },
    { category: 'Traffic', count: 14, avgResolutionDays: 0.5, trend: 'down' },
  ];

  const performanceData = [
    { team: 'Team A - Infrastructure', assigned: 45, completed: 38, avgTime: '3.2 days', rating: 4.5 },
    { team: 'Team B - Sanitation', assigned: 52, completed: 48, avgTime: '2.1 days', rating: 4.8 },
    { team: 'Team C - Electricity', assigned: 31, completed: 29, avgTime: '1.8 days', rating: 4.6 },
    { team: 'Traffic Police', assigned: 12, completed: 12, avgTime: '0.3 days', rating: 4.9 },
  ];

  const handleExport = (format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      // Mock CSV export
      const csvContent = 'Category,Count,Avg Resolution Days\n' +
        categoryStats.map(s => `${s.category},${s.count},${s.avgResolutionDays}`).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `civic-reports-${dateRange}days.csv`;
      a.click();
    } else {
      alert('PDF export will be implemented with a library like jsPDF or similar');
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <div>
            <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
              📊 Reports & Analytics
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Performance metrics, insights, and data exports
            </Typography>
          </div>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<TableChart />}
              onClick={() => handleExport('csv')}
            >
              Export CSV
            </Button>
            <Button
              variant="outlined"
              startIcon={<PictureAsPdf />}
              onClick={() => handleExport('pdf')}
            >
              Export PDF
            </Button>
          </Box>
        </Box>

        {/* Filters */}
        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={dateRange}
                label="Date Range"
                onChange={(e) => setDateRange(e.target.value)}
              >
                <MenuItem value="7">Last 7 Days</MenuItem>
                <MenuItem value="30">Last 30 Days</MenuItem>
                <MenuItem value="90">Last 3 Months</MenuItem>
                <MenuItem value="180">Last 6 Months</MenuItem>
                <MenuItem value="365">Last Year</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportType}
                label="Report Type"
                onChange={(e) => setReportType(e.target.value)}
              >
                <MenuItem value="summary">Summary Overview</MenuItem>
                <MenuItem value="category">By Category</MenuItem>
                <MenuItem value="team">Team Performance</MenuItem>
                <MenuItem value="area">By Area</MenuItem>
                <MenuItem value="sla">SLA Compliance</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Paper>

        {/* Key Metrics */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2, mb: 3 }}>
          <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Total Reports
                  </Typography>
                  <Assessment color="primary" />
                </Box>
                <Typography variant="h3" fontWeight={700}>
                  {analytics.totalReports}
                </Typography>
                <Typography variant="caption" color="success.main">
                  ↑ 12% from last period
                </Typography>
              </CardContent>
            </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Avg Response Time
                </Typography>
                <Schedule color="info" />
              </Box>
              <Typography variant="h3" fontWeight={700}>
                {analytics.avgResponseTime}
              </Typography>
              <Typography variant="caption" color="success.main">
                ↓ 15% faster
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Resolution Rate
                </Typography>
                <CheckCircle color="success" />
              </Box>
              <Typography variant="h3" fontWeight={700}>
                {Math.round((analytics.resolved / analytics.totalReports) * 100)}%
              </Typography>
              <Typography variant="caption" color="success.main">
                ↑ 5% improvement
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Satisfaction Rate
                </Typography>
                <TrendingUp color="success" />
              </Box>
              <Typography variant="h3" fontWeight={700}>
                {analytics.satisfactionRate}%
              </Typography>
              <Typography variant="caption" color="success.main">
                ↑ 3% increase
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Status Breakdown */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            📈 Status Breakdown
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h4" fontWeight={700} color="warning.main">
                  {analytics.openReports}
                </Typography>
                <Typography variant="body2" color="text.secondary">Open</Typography>
                <Typography variant="caption">
                  {Math.round((analytics.openReports / analytics.totalReports) * 100)}% of total
                </Typography>
              </CardContent>
            </Card>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h4" fontWeight={700} color="info.main">
                  {analytics.inProgress}
                </Typography>
                <Typography variant="body2" color="text.secondary">In Progress</Typography>
                <Typography variant="caption">
                  {Math.round((analytics.inProgress / analytics.totalReports) * 100)}% of total
                </Typography>
              </CardContent>
            </Card>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h4" fontWeight={700} color="success.main">
                  {analytics.resolved}
                </Typography>
                <Typography variant="body2" color="text.secondary">Resolved</Typography>
                <Typography variant="caption">
                  {Math.round((analytics.resolved / analytics.totalReports) * 100)}% of total
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Paper>

        {/* Category Performance */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            📊 Category Performance
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell><strong>Category</strong></TableCell>
                  <TableCell align="right"><strong>Reports</strong></TableCell>
                  <TableCell align="right"><strong>Avg Resolution Time</strong></TableCell>
                  <TableCell align="center"><strong>Trend</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categoryStats.map((stat) => (
                  <TableRow key={stat.category} hover>
                    <TableCell>{stat.category}</TableCell>
                    <TableCell align="right">
                      <Chip label={stat.count} size="small" color="primary" />
                    </TableCell>
                    <TableCell align="right">{stat.avgResolutionDays} days</TableCell>
                    <TableCell align="center">
                      {stat.trend === 'up' ? (
                        <TrendingUp color="error" />
                      ) : (
                        <TrendingDown color="success" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Team Performance */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            👥 Team Performance
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell><strong>Team</strong></TableCell>
                  <TableCell align="right"><strong>Assigned</strong></TableCell>
                  <TableCell align="right"><strong>Completed</strong></TableCell>
                  <TableCell align="right"><strong>Completion Rate</strong></TableCell>
                  <TableCell align="right"><strong>Avg Time</strong></TableCell>
                  <TableCell align="right"><strong>Rating</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {performanceData.map((team) => (
                  <TableRow key={team.team} hover>
                    <TableCell>{team.team}</TableCell>
                    <TableCell align="right">{team.assigned}</TableCell>
                    <TableCell align="right">{team.completed}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${Math.round((team.completed / team.assigned) * 100)}%`}
                        size="small"
                        color={team.completed / team.assigned > 0.85 ? 'success' : 'warning'}
                      />
                    </TableCell>
                    <TableCell align="right">{team.avgTime}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                        ⭐ {team.rating}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Insights */}
        <Paper elevation={2} sx={{ p: 3, mt: 3, backgroundColor: '#e3f2fd' }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            💡 Key Insights
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2">
              ✅ <strong>{analytics.topCategory}</strong> has the highest number of reports. Consider allocating more resources.
            </Typography>
            <Typography variant="body2">
              ⚠️ <strong>{analytics.worstArea}</strong> shows recurring issues. Recommend detailed investigation.
            </Typography>
            <Typography variant="body2">
              📈 Overall response time has improved by <strong>15%</strong> compared to last period.
            </Typography>
            <Typography variant="body2">
              🎯 Citizen satisfaction rate is at <strong>{analytics.satisfactionRate}%</strong>, exceeding target of 85%.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
