'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  Button,
  TextField,
  Card,
  CardContent,
  Avatar,
  Divider,
  ImageList,
  ImageListItem,
  Dialog,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import {
  ArrowBack,
  CheckCircle,
  Schedule,
  Error,
  MyLocation,
  Person,
  Assignment,
  Comment as CommentIcon,
  PhotoCamera,
} from '@mui/icons-material';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface TimelineEvent {
  id: string;
  type: 'created' | 'assigned' | 'updated' | 'comment' | 'resolved';
  title: string;
  description: string;
  timestamp: string;
  user: string;
}

interface Photo {
  id: string;
  url: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

interface CommentType {
  id: string;
  user: string;
  message: string;
  timestamp: string;
}

export default function IssueDetailPage() {
  const params = useParams();
  const issueId = params.id as string;
  
  const [newComment, setNewComment] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  // Mock data
  const issue = {
    id: issueId,
    title: 'Pothole on Main Street near Park',
    category: 'Infrastructure',
    status: 'in-progress',
    priority: 'high',
    description: 'There is a large pothole on Main Street near the central park. It is approximately 2 feet wide and 6 inches deep. Multiple vehicles have been damaged. This is causing traffic congestion as drivers are avoiding the area.',
    reporter: 'Ramesh Kumar',
    createdAt: '2025-11-05 10:30 AM',
    location: '21.2514° N, 81.6296° E',
    address: 'Main Street, near Central Park, Raipur',
    assignedTo: 'Team A - Infrastructure',
  };

  const photos: Photo[] = [
    {
      id: 'P1',
      url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400',
      latitude: 21.2514,
      longitude: 81.6296,
      timestamp: '2025-11-05 10:32 AM',
    },
    {
      id: 'P2',
      url: 'https://images.unsplash.com/photo-1590227797994-fb921ae6a3c8?w=400',
      latitude: 21.2514,
      longitude: 81.6296,
      timestamp: '2025-11-05 10:33 AM',
    },
  ];

  const timeline: TimelineEvent[] = [
    {
      id: 'T1',
      type: 'created',
      title: 'Report Created',
      description: `Report submitted by ${issue.reporter}`,
      timestamp: '2025-11-05 10:30 AM',
      user: issue.reporter,
    },
    {
      id: 'T2',
      type: 'assigned',
      title: 'Assigned to Team',
      description: `Assigned to ${issue.assignedTo}`,
      timestamp: '2025-11-05 11:15 AM',
      user: 'System Admin',
    },
    {
      id: 'T3',
      type: 'updated',
      title: 'Status Updated',
      description: 'Status changed from Open to In Progress',
      timestamp: '2025-11-06 09:15 AM',
      user: 'Team A Supervisor',
    },
    {
      id: 'T4',
      type: 'comment',
      title: 'Comment Added',
      description: 'Team is on site. Work will begin tomorrow morning.',
      timestamp: '2025-11-06 02:30 PM',
      user: 'Team A Supervisor',
    },
  ];

  const comments: CommentType[] = [
    {
      id: 'C1',
      user: 'Team A Supervisor',
      message: 'We have inspected the site. Materials are being ordered. Work will commence tomorrow morning at 8 AM.',
      timestamp: '2025-11-06 02:30 PM',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'error';
      case 'in-progress': return 'warning';
      case 'resolved': return 'success';
      default: return 'default';
    }
  };

  const getTimelineDotColor = (type: string) => {
    switch (type) {
      case 'created': return 'primary';
      case 'assigned': return 'info';
      case 'updated': return 'warning';
      case 'comment': return 'secondary';
      case 'resolved': return 'success';
      default: return 'grey';
    }
  };

  const addComment = () => {
    if (!newComment.trim()) return;
    // TODO: API call to add comment
    console.log('Adding comment:', newComment);
    setNewComment('');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Back Button */}
        <Button
          component={Link}
          href="/user/my-reports"
          startIcon={<ArrowBack />}
          sx={{ mb: 3 }}
        >
          Back to My Reports
        </Button>

        {/* Header */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
                {issue.title}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                <Chip label={issue.id} variant="outlined" size="small" />
                <Chip 
                  label={issue.status.replace('-', ' ').toUpperCase()} 
                  color={getStatusColor(issue.status) as any}
                  size="small"
                />
                <Chip label={issue.priority.toUpperCase()} color="warning" size="small" />
                <Chip label={issue.category} variant="outlined" size="small" />
              </Box>
            </Box>
          </Box>

          <Typography variant="body1" paragraph>
            {issue.description}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                📍 <strong>Location:</strong>
              </Typography>
              <Typography variant="body2" sx={{ ml: 3 }}>
                {issue.address}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 3 }}>
                {issue.location}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                👤 <strong>Reporter:</strong> {issue.reporter}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                🕐 <strong>Reported:</strong> {issue.createdAt}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                👷 <strong>Assigned to:</strong> {issue.assignedTo}
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
          {/* Left Column */}
          <Box>
            {/* Geo-tagged Photos */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                📸 Geo-tagged Photos ({photos.length})
              </Typography>
              <ImageList cols={2} gap={8}>
                {photos.map((photo) => (
                  <ImageListItem 
                    key={photo.id} 
                    sx={{ cursor: 'pointer' }}
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <img
                      src={photo.url}
                      alt={`Evidence ${photo.id}`}
                      loading="lazy"
                      style={{ borderRadius: 8, height: 200, objectFit: 'cover' }}
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            </Paper>

            {/* Comments Section */}
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                💬 Comments & Updates
              </Typography>
              
              {comments.map((comment) => (
                <Card key={comment.id} variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <Person />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {comment.user}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {comment.timestamp}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {comment.message}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}

              {/* Add Comment */}
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Add a comment or additional information..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  startIcon={<CommentIcon />}
                  onClick={addComment}
                  disabled={!newComment.trim()}
                >
                  Add Comment
                </Button>
              </Box>
            </Paper>
          </Box>

          {/* Right Column - Timeline */}
          <Box>
            <Paper elevation={2} sx={{ p: 3, position: 'sticky', top: 20 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                📋 Activity Timeline
              </Typography>
              <Timeline sx={{ p: 0 }}>
                {timeline.map((event, index) => (
                  <TimelineItem key={event.id}>
                    <TimelineSeparator>
                      <TimelineDot color={getTimelineDotColor(event.type) as any} />
                      {index < timeline.length - 1 && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {event.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {event.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {event.timestamp}
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            </Paper>
          </Box>
        </Box>

        {/* Photo Detail Dialog */}
        <Dialog
          open={selectedPhoto !== null}
          onClose={() => setSelectedPhoto(null)}
          maxWidth="md"
          fullWidth
        >
          {selectedPhoto && (
            <Box sx={{ p: 2 }}>
              <img
                src={selectedPhoto.url}
                alt="Full size"
                style={{ width: '100%', borderRadius: 8 }}
              />
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">
                  📍 <strong>GPS Coordinates:</strong> {selectedPhoto.latitude}° N, {selectedPhoto.longitude}° E
                </Typography>
                <Typography variant="body2">
                  🕐 <strong>Captured:</strong> {selectedPhoto.timestamp}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ mt: 1 }}
                  href={`https://www.google.com/maps?q=${selectedPhoto.latitude},${selectedPhoto.longitude}`}
                  target="_blank"
                >
                  View on Google Maps
                </Button>
              </Box>
            </Box>
          )}
        </Dialog>
      </Box>
    </Container>
  );
}
