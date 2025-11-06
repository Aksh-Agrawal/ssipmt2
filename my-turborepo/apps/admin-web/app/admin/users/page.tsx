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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Avatar,
  Stack,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  PersonAdd,
  Block,
  CheckCircle,
  Email,
  AdminPanelSettings,
  Person,
  Shield,
} from '@mui/icons-material';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'field_worker' | 'viewer';
  department: string;
  status: 'active' | 'inactive' | 'invited';
  lastLogin: string;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([
    {
      id: 'U1',
      name: 'Rajesh Sharma',
      email: 'rajesh.sharma@raipur.gov.in',
      role: 'super_admin',
      department: 'IT Department',
      status: 'active',
      lastLogin: '2 mins ago',
      createdAt: '2024-01-15',
    },
    {
      id: 'U2',
      name: 'Priya Verma',
      email: 'priya.verma@raipur.gov.in',
      role: 'admin',
      department: 'Public Works',
      status: 'active',
      lastLogin: '1 hour ago',
      createdAt: '2024-03-20',
    },
    {
      id: 'U3',
      name: 'Amit Kumar',
      email: 'amit.kumar@raipur.gov.in',
      role: 'field_worker',
      department: 'Team A - Infrastructure',
      status: 'active',
      lastLogin: '3 hours ago',
      createdAt: '2024-06-10',
    },
    {
      id: 'U4',
      name: 'Sunita Patel',
      email: 'sunita.patel@raipur.gov.in',
      role: 'viewer',
      department: 'Analytics',
      status: 'active',
      lastLogin: '1 day ago',
      createdAt: '2024-08-05',
    },
    {
      id: 'U5',
      name: 'Vikram Singh',
      email: 'vikram.singh@raipur.gov.in',
      role: 'admin',
      department: 'Traffic Police',
      status: 'invited',
      lastLogin: 'Never',
      createdAt: '2025-11-05',
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'viewer',
    department: '',
    status: 'invited',
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData(user);
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'viewer',
        department: '',
        status: 'invited',
      });
    }
    setDialogOpen(true);
  };

  const handleSaveUser = () => {
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...formData } as User : u));
    } else {
      const newUser: User = {
        ...formData as User,
        id: `U${users.length + 1}`,
        lastLogin: 'Never',
        createdAt: new Date().toISOString().split('T')[0] || '',
      };
      setUsers([...users, newUser]);
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    setDialogOpen(false);
  };

  const handleToggleStatus = (userId: string) => {
    setUsers(users.map(u => 
      u.id === userId 
        ? { ...u, status: u.status === 'active' ? 'inactive' as const : 'active' as const } 
        : u
    ));
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin': return <Shield color="error" />;
      case 'admin': return <AdminPanelSettings color="primary" />;
      case 'field_worker': return <Person color="info" />;
      case 'viewer': return <Person color="disabled" />;
      default: return <Person />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'error';
      case 'admin': return 'primary';
      case 'field_worker': return 'info';
      case 'viewer': return 'default';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'invited': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <div>
            <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
              👥 User Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage admin accounts, roles, and permissions
            </Typography>
          </div>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => handleOpenDialog()}
            size="large"
          >
            Invite New User
          </Button>
        </Box>

        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            ✅ User {editingUser ? 'updated' : 'invited'} successfully! {!editingUser && 'Invitation email sent.'}
          </Alert>
        )}

        {/* Stats Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h3" fontWeight={700} color="primary.main">
              {users.filter(u => u.role === 'super_admin').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">Super Admins</Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h3" fontWeight={700} color="info.main">
              {users.filter(u => u.role === 'admin').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">Admins</Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h3" fontWeight={700} color="success.main">
              {users.filter(u => u.role === 'field_worker').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">Field Workers</Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h3" fontWeight={700}>
              {users.filter(u => u.status === 'active').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">Active Users</Typography>
          </Paper>
        </Box>

        {/* Users Table */}
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>User</strong></TableCell>
                <TableCell><strong>Role</strong></TableCell>
                <TableCell><strong>Department</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Last Login</strong></TableCell>
                <TableCell><strong>Joined</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {user.name.charAt(0)}
                      </Avatar>
                      <div>
                        <Typography variant="body2" fontWeight={600}>
                          {user.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.email}
                        </Typography>
                      </div>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getRoleIcon(user.role)}
                      label={user.role.replace('_', ' ').toUpperCase()}
                      size="small"
                      color={getRoleColor(user.role) as any}
                    />
                  </TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.status.toUpperCase()}
                      size="small"
                      color={getStatusColor(user.status) as any}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {user.lastLogin}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {user.createdAt}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="Edit User">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleOpenDialog(user)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={user.status === 'active' ? 'Deactivate' : 'Activate'}>
                        <IconButton 
                          size="small" 
                          color={user.status === 'active' ? 'error' : 'success'}
                          onClick={() => handleToggleStatus(user.id)}
                        >
                          {user.status === 'active' ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      {user.status === 'invited' && (
                        <Tooltip title="Resend Invitation">
                          <IconButton size="small" color="info">
                            <Email fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete User">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Role Permissions Info */}
        <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            🔐 Role Permissions
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" color="error.main" fontWeight={600}>
                🛡️ Super Admin
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Full system access, user management, system settings, all features
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="primary.main" fontWeight={600}>
                👨‍💼 Admin
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Incident management, traffic control, event scheduling, reports
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="info.main" fontWeight={600}>
                👷 Field Worker
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View assigned tasks, update incident status, add comments, upload photos
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                👁️ Viewer
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Read-only access to dashboards, reports, and analytics
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Create/Edit User Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingUser ? 'Edit User' : 'Invite New User'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />

              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                helperText="User will receive invitation email"
              />

              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  label="Role"
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                >
                  <MenuItem value="super_admin">🛡️ Super Admin (Full Access)</MenuItem>
                  <MenuItem value="admin">👨‍💼 Admin</MenuItem>
                  <MenuItem value="field_worker">👷 Field Worker</MenuItem>
                  <MenuItem value="viewer">👁️ Viewer (Read Only)</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g., Public Works, Traffic Police"
              />

              {editingUser && (
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="invited">Invited</MenuItem>
                  </Select>
                </FormControl>
              )}

              <Alert severity="info">
                <strong>Note:</strong> Invited users will receive an email with login instructions via Clerk authentication.
              </Alert>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleSaveUser}
              disabled={!formData.name || !formData.email || !formData.role}
            >
              {editingUser ? 'Update User' : 'Send Invitation'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}
