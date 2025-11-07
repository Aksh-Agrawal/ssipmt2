'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Divider,
  Chip,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  IconButton,
} from '@mui/material';
import {
  Notifications,
  NotificationsActive,
  Sms,
  WhatsApp,
  Email,
  CheckCircle,
  Schedule,
  Warning,
  Delete,
  Settings,
} from '@mui/icons-material';

interface Notification {
  id: string;
  type: 'status_update' | 'assigned' | 'resolved' | 'comment';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  reportId?: string;
}

export default function NotificationsPage() {
  // Notification preferences
  const [pushEnabled, setPushEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  
  // Notification types
  const [statusUpdates, setStatusUpdates] = useState(true);
  const [assignments, setAssignments] = useState(true);
  const [resolutions, setResolutions] = useState(true);
  const [comments, setComments] = useState(true);

  const [saveSuccess, setSaveSuccess] = useState(false);

  // Mock notifications
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'N1',
      type: 'status_update',
      title: 'Status Updated',
      message: 'Your report RPT-2025-001 status changed to "In Progress"',
      timestamp: '10 mins ago',
      read: false,
      reportId: 'RPT-2025-001',
    },
    {
      id: 'N2',
      type: 'assigned',
      title: 'Team Assigned',
      message: 'Team A has been assigned to your pothole report',
      timestamp: '2 hours ago',
      read: false,
      reportId: 'RPT-2025-001',
    },
    {
      id: 'N3',
      type: 'resolved',
      title: 'Issue Resolved',
      message: 'Your garbage collection report has been marked as resolved',
      timestamp: '1 day ago',
      read: true,
      reportId: 'RPT-2025-003',
    },
    {
      id: 'N4',
      type: 'comment',
      title: 'New Comment',
      message: 'Team supervisor added a comment on your report',
      timestamp: '2 days ago',
      read: true,
      reportId: 'RPT-2025-002',
    },
  ]);

  const handleSavePreferences = () => {
    // TODO: API call to save preferences
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const markAsRead = (notifId: string) => {
    setNotifications(notifications.map(n => 
      n.id === notifId ? { ...n, read: true } : n
    ));
  };

  const deleteNotification = (notifId: string) => {
    setNotifications(notifications.filter(n => n.id !== notifId));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'status_update': return <Schedule color="info" />;
      case 'assigned': return <NotificationsActive color="primary" />;
      case 'resolved': return <CheckCircle color="success" />;
      case 'comment': return <Warning color="warning" />;
      default: return <Notifications />;
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
          🔔 Notifications
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Manage your notification preferences and view updates
        </Typography>

        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            ✅ Notification preferences saved successfully!
          </Alert>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {/* Left Column - Preferences */}
          <Box>
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                📲 Notification Channels
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Choose how you want to receive notifications
              </Typography>

              <Card variant="outlined" sx={{ mb: 2, p: 1 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Notifications color="primary" />
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          Push Notifications
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Instant alerts on your device
                        </Typography>
                      </Box>
                    </Box>
                    <Switch 
                      checked={pushEnabled} 
                      onChange={(e) => setPushEnabled(e.target.checked)}
                    />
                  </Box>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ mb: 2, p: 1 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Sms color="primary" />
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          SMS Messages
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Text messages to +91 98765 43210
                        </Typography>
                      </Box>
                    </Box>
                    <Switch 
                      checked={smsEnabled} 
                      onChange={(e) => setSmsEnabled(e.target.checked)}
                    />
                  </Box>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ mb: 2, p: 1 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <WhatsApp sx={{ color: '#25D366' }} />
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          WhatsApp Messages
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Updates with photos and status
                        </Typography>
                      </Box>
                    </Box>
                    <Switch 
                      checked={whatsappEnabled} 
                      onChange={(e) => setWhatsappEnabled(e.target.checked)}
                    />
                  </Box>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ p: 1 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Email color="primary" />
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          Email Notifications
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Weekly digest of all updates
                        </Typography>
                      </Box>
                    </Box>
                    <Switch 
                      checked={emailEnabled} 
                      onChange={(e) => setEmailEnabled(e.target.checked)}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Paper>

            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                🎯 Notification Types
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Choose what updates you want to receive
              </Typography>

              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Schedule />
                  </ListItemIcon>
                  <ListItemText
                    primary="Status Updates"
                    secondary="When your report status changes"
                  />
                  <Switch 
                    checked={statusUpdates} 
                    onChange={(e) => setStatusUpdates(e.target.checked)}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <NotificationsActive />
                  </ListItemIcon>
                  <ListItemText
                    primary="Team Assignments"
                    secondary="When a team is assigned to your report"
                  />
                  <Switch 
                    checked={assignments} 
                    onChange={(e) => setAssignments(e.target.checked)}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle />
                  </ListItemIcon>
                  <ListItemText
                    primary="Issue Resolutions"
                    secondary="When your issue is marked resolved"
                  />
                  <Switch 
                    checked={resolutions} 
                    onChange={(e) => setResolutions(e.target.checked)}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Warning />
                  </ListItemIcon>
                  <ListItemText
                    primary="Comments & Replies"
                    secondary="When officials comment on your reports"
                  />
                  <Switch 
                    checked={comments} 
                    onChange={(e) => setComments(e.target.checked)}
                  />
                </ListItem>
              </List>

              <Button
                variant="contained"
                fullWidth
                startIcon={<Settings />}
                onClick={handleSavePreferences}
                sx={{ mt: 2 }}
              >
                Save Preferences
              </Button>
            </Paper>
          </Box>

          {/* Right Column - Recent Notifications */}
          <Box>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  📬 Recent Notifications
                </Typography>
                <Button size="small" onClick={markAllAsRead}>
                  Mark all as read
                </Button>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {notifications.filter(n => !n.read).length} unread notifications
              </Typography>

              <List>
                {notifications.map((notification) => (
                  <Card 
                    key={notification.id} 
                    variant="outlined" 
                    sx={{ 
                      mb: 2,
                      backgroundColor: notification.read ? 'transparent' : '#e3f2fd',
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box sx={{ flexShrink: 0, mt: 0.5 }}>
                          {getNotificationIcon(notification.type)}
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {notification.title}
                            </Typography>
                            {!notification.read && (
                              <Chip label="NEW" size="small" color="primary" />
                            )}
                          </Box>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {notification.message}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                              {notification.timestamp}
                            </Typography>
                            <Box>
                              {!notification.read && (
                                <Button 
                                  size="small" 
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  Mark read
                                </Button>
                              )}
                              <IconButton 
                                size="small" 
                                onClick={() => deleteNotification(notification.id)}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </List>

              {notifications.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Notifications sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No notifications yet
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
