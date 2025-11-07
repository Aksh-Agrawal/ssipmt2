'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Alert,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  Save,
  Settings,
  Notifications,
  Security,
  Language,
  Timer,
  CheckCircle,
} from '@mui/icons-material';

export default function SettingsPage() {
  const [saveSuccess, setSaveSuccess] = useState(false);

  // System Settings
  const [systemName, setSystemName] = useState('Civic Voice - Raipur');
  const [supportEmail, setSupportEmail] = useState('support@raipur.gov.in');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Notification Settings
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  // SLA Settings
  const [criticalSLA, setCriticalSLA] = useState('2');
  const [highSLA, setHighSLA] = useState('6');
  const [mediumSLA, setMediumSLA] = useState('24');
  const [lowSLA, setLowSLA] = useState('72');

  // Language Settings
  const [defaultLanguage, setDefaultLanguage] = useState('hi');
  const [enabledLanguages, setEnabledLanguages] = useState(['en', 'hi', 'cg']);

  // Auto-assignment
  const [autoAssignment, setAutoAssignment] = useState(true);
  const [aiCategorization, setAiCategorization] = useState(true);

  // Clerk Settings (read-only display)
  const clerkSettings = {
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(0, 20) + '...' || 'Not configured',
    signInUrl: '/login',
    signUpUrl: '/sign-up',
    afterSignInUrl: '/admin/dashboard',
  };

  const handleSave = () => {
    // TODO: API call to save settings
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
          ⚙️ System Settings
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Configure system preferences and integrations
        </Typography>

        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            ✅ Settings saved successfully!
          </Alert>
        )}

        {/* General Settings */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Settings color="primary" />
            <Typography variant="h6" fontWeight={600}>
              General Settings
            </Typography>
          </Box>

          <TextField
            fullWidth
            label="System Name"
            value={systemName}
            onChange={(e) => setSystemName(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Support Email"
            type="email"
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
            helperText="Email address for support and citizen queries"
            sx={{ mb: 2 }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
              />
            }
            label={
              <Box>
                <Typography variant="body1">Maintenance Mode</Typography>
                <Typography variant="caption" color="text.secondary">
                  System will be unavailable to users during maintenance
                </Typography>
              </Box>
            }
          />
        </Paper>

        {/* Clerk Authentication */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Security color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Clerk Authentication
            </Typography>
            <Chip label="Active" color="success" size="small" />
          </Box>

          <Alert severity="info" sx={{ mb: 2 }}>
            <strong>Clerk</strong> handles all authentication. Configure API keys in environment variables.
          </Alert>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <TextField
              fullWidth
              label="Publishable Key"
              value={clerkSettings.publishableKey}
              InputProps={{ readOnly: true }}
              helperText="Set in .env.local"
            />
            <TextField
              fullWidth
              label="Sign In URL"
              value={clerkSettings.signInUrl}
              InputProps={{ readOnly: true }}
            />
            <TextField
              fullWidth
              label="Sign Up URL"
              value={clerkSettings.signUpUrl}
              InputProps={{ readOnly: true }}
            />
            <TextField
              fullWidth
              label="After Sign In URL"
              value={clerkSettings.afterSignInUrl}
              InputProps={{ readOnly: true }}
            />
          </Box>
        </Paper>

        {/* Notification Settings */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Notifications color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Notification Channels
            </Typography>
          </Box>

          <Card variant="outlined" sx={{ mb: 2, p: 1 }}>
            <CardContent>
              <FormControlLabel
                control={
                  <Switch
                    checked={smsEnabled}
                    onChange={(e) => setSmsEnabled(e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      SMS Notifications
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Send SMS updates to citizens and field teams
                    </Typography>
                  </Box>
                }
              />
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ mb: 2, p: 1 }}>
            <CardContent>
              <FormControlLabel
                control={
                  <Switch
                    checked={whatsappEnabled}
                    onChange={(e) => setWhatsappEnabled(e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      WhatsApp Business
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Send rich updates with photos via WhatsApp
                    </Typography>
                  </Box>
                }
              />
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ p: 1 }}>
            <CardContent>
              <FormControlLabel
                control={
                  <Switch
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      Email Notifications
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Send email summaries and reports
                    </Typography>
                  </Box>
                }
              />
            </CardContent>
          </Card>
        </Paper>

        {/* SLA Configuration */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Timer color="primary" />
            <Typography variant="h6" fontWeight={600}>
              SLA Response Times
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Define response time targets (in hours) for different priority levels
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <TextField
              fullWidth
              type="number"
              label="Critical Priority"
              value={criticalSLA}
              onChange={(e) => setCriticalSLA(e.target.value)}
              InputProps={{ endAdornment: 'hours' }}
              helperText="Emergency issues"
            />
            <TextField
              fullWidth
              type="number"
              label="High Priority"
              value={highSLA}
              onChange={(e) => setHighSLA(e.target.value)}
              InputProps={{ endAdornment: 'hours' }}
              helperText="Urgent issues"
            />
            <TextField
              fullWidth
              type="number"
              label="Medium Priority"
              value={mediumSLA}
              onChange={(e) => setMediumSLA(e.target.value)}
              InputProps={{ endAdornment: 'hours' }}
              helperText="Normal issues"
            />
            <TextField
              fullWidth
              type="number"
              label="Low Priority"
              value={lowSLA}
              onChange={(e) => setLowSLA(e.target.value)}
              InputProps={{ endAdornment: 'hours' }}
              helperText="Minor issues"
            />
          </Box>
        </Paper>

        {/* Language Settings */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Language color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Language Configuration
            </Typography>
          </Box>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Default Language</InputLabel>
            <Select
              value={defaultLanguage}
              label="Default Language"
              onChange={(e) => setDefaultLanguage(e.target.value)}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="hi">हिंदी (Hindi)</MenuItem>
              <MenuItem value="cg">छत्तीसगढ़ी (Chhattisgarhi)</MenuItem>
            </Select>
          </FormControl>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Enabled Languages:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip label="English" color="primary" onDelete={() => {}} />
            <Chip label="हिंदी" color="primary" onDelete={() => {}} />
            <Chip label="छत्तीसगढ़ी" color="primary" onDelete={() => {}} />
          </Box>
        </Paper>

        {/* AI Features */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <CheckCircle color="primary" />
            <Typography variant="h6" fontWeight={600}>
              AI Features
            </Typography>
          </Box>

          <Card variant="outlined" sx={{ mb: 2, p: 1 }}>
            <CardContent>
              <FormControlLabel
                control={
                  <Switch
                    checked={aiCategorization}
                    onChange={(e) => setAiCategorization(e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      AI Auto-Categorization
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Use Google Cloud NLP to automatically categorize reports
                    </Typography>
                  </Box>
                }
              />
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ p: 1 }}>
            <CardContent>
              <FormControlLabel
                control={
                  <Switch
                    checked={autoAssignment}
                    onChange={(e) => setAutoAssignment(e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      Auto-Assignment
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Automatically assign incidents to teams based on category and location
                    </Typography>
                  </Box>
                }
              />
            </CardContent>
          </Card>
        </Paper>

        {/* API Configuration Info */}
        <Paper elevation={2} sx={{ p: 3, mb: 3, backgroundColor: '#e3f2fd' }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            🔌 API Integrations
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Configure these API keys in your environment variables:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              • <strong>GROQ_API_KEY</strong> - For AI chatbot (Groq LLM)
            </Typography>
            <Typography variant="caption" color="text.secondary">
              • <strong>DEEPGRAM_API_KEY</strong> - Speech-to-text
            </Typography>
            <Typography variant="caption" color="text.secondary">
              • <strong>SARVAM_API_KEY</strong> - Language detection & TTS
            </Typography>
            <Typography variant="caption" color="text.secondary">
              • <strong>GOOGLE_CLOUD_API_KEY</strong> - NLP for categorization
            </Typography>
            <Typography variant="caption" color="text.secondary">
              • <strong>SUPABASE_URL</strong> - Database connection
            </Typography>
          </Box>
        </Paper>

        {/* Save Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" size="large">
            Reset to Defaults
          </Button>
          <Button
            variant="contained"
            size="large"
            startIcon={<Save />}
            onClick={handleSave}
          >
            Save All Settings
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
