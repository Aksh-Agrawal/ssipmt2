'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  IconButton,
  Card,
  CardContent,
  Divider,
  Switch,
  FormControlLabel,
  Alert,
} from '@mui/material';
import {
  Edit,
  PhotoCamera,
  Save,
  Cancel,
} from '@mui/icons-material';
import { useUser } from '@clerk/nextjs';

type Language = 'en' | 'hi' | 'cg';

export default function ProfilePage() {
  const { user } = useUser();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.fullName || 'Ramesh Kumar');
  const [email, setEmail] = useState(user?.primaryEmailAddress?.emailAddress || 'ramesh.kumar@example.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [language, setLanguage] = useState<Language>('hi');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const languageLabels = {
    en: 'English',
    hi: 'हिंदी (Hindi)',
    cg: 'छत्तीसगढ़ी (Chhattisgarhi)',
  };

  const handleSave = () => {
    // TODO: API call to save profile
    setSaveSuccess(true);
    setIsEditing(false);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCancel = () => {
    // Reset to original values
    setIsEditing(false);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
          👤 My Profile
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Manage your personal information and preferences
        </Typography>

        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            ✅ Profile updated successfully!
          </Alert>
        )}

        {/* Profile Header */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  fontSize: 40,
                  bgcolor: 'primary.main',
                }}
              >
                {name.charAt(0)}
              </Avatar>
              {isEditing && (
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: 'white',
                    '&:hover': { backgroundColor: '#f5f5f5' },
                  }}
                  size="small"
                >
                  <PhotoCamera fontSize="small" />
                </IconButton>
              )}
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h5" fontWeight={600}>
                {name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Member since: November 2025
              </Typography>
            </Box>
            {!isEditing && (
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            )}
          </Box>
        </Paper>

        {/* Personal Information */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            📋 Personal Information
          </Typography>

          <TextField
            fullWidth
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!isEditing}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!isEditing}
            type="email"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={!isEditing}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth disabled={!isEditing}>
            <InputLabel>Preferred Language</InputLabel>
            <Select
              value={language}
              label="Preferred Language"
              onChange={(e) => setLanguage(e.target.value as Language)}
            >
              <MenuItem value="en">{languageLabels.en}</MenuItem>
              <MenuItem value="hi">{languageLabels.hi}</MenuItem>
              <MenuItem value="cg">{languageLabels.cg}</MenuItem>
            </Select>
          </FormControl>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Language selected:</strong> {languageLabels[language]}
              <br />
              This will be your default language for voice reports, chatbot, and notifications.
            </Typography>
          </Alert>
        </Paper>

        {/* Notification Preferences */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            🔔 Notification Preferences
          </Typography>
          
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                    disabled={!isEditing}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      Push Notifications
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Get updates about your reported issues
                    </Typography>
                  </Box>
                }
              />
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <FormControlLabel
                control={
                  <Switch
                    checked={smsEnabled}
                    onChange={(e) => setSmsEnabled(e.target.checked)}
                    disabled={!isEditing}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      SMS Notifications
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Receive text messages for critical updates
                    </Typography>
                  </Box>
                }
              />
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <FormControlLabel
                control={
                  <Switch
                    checked={whatsappEnabled}
                    onChange={(e) => setWhatsappEnabled(e.target.checked)}
                    disabled={!isEditing}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      WhatsApp Notifications
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Get updates via WhatsApp with photos and status
                    </Typography>
                  </Box>
                }
              />
            </CardContent>
          </Card>
        </Paper>

        {/* Statistics Card */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            📊 My Statistics
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
            <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h3" fontWeight={700} color="primary.main">
                5
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Reports
              </Typography>
            </Card>
            
            <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h3" fontWeight={700} color="success.main">
                3
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Resolved
              </Typography>
            </Card>
            
            <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h3" fontWeight={700} color="warning.main">
                2
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In Progress
              </Typography>
            </Card>
          </Box>
        </Paper>

        {/* Action Buttons */}
        {isEditing && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={<Save />}
              onClick={handleSave}
            >
              Save Changes
            </Button>
            <Button
              variant="outlined"
              size="large"
              fullWidth
              startIcon={<Cancel />}
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
}
