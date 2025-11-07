'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Avatar,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Map as MapIcon,
  Assessment as AssessmentIcon,
  Report as ReportIcon,
  Event as EventIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  SimCardDownload as SimulateIcon,
  Assistant as AssistantIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { usePathname, useRouter } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';

const drawerWidth = 280;

interface NavigationItem {
  title: string;
  path: string;
  icon: React.ReactNode;
}

const navigationItems: NavigationItem[] = [
  { title: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon /> },
  { title: 'Traffic Map', path: '/admin/traffic-map', icon: <MapIcon /> },
  { title: 'Reports', path: '/admin/reports', icon: <ReportIcon /> },
  { title: 'Incidents', path: '/admin/incidents', icon: <AssessmentIcon /> },
  { title: 'Events', path: '/admin/events', icon: <EventIcon /> },
  { title: 'Users', path: '/admin/users', icon: <PeopleIcon /> },
  { title: 'Simulator', path: '/admin/simulate', icon: <SimulateIcon /> },
  { title: 'AI Assistant', path: '/admin/assistant', icon: <AssistantIcon /> },
  { title: 'Settings', path: '/admin/settings', icon: <SettingsIcon /> },
];

export default function AdminNavigation({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setDrawerOpen(false); // Always close drawer after navigation
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo/Brand Section */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          sx={{
            bgcolor: 'primary.main',
            width: 40,
            height: 40,
          }}
        >
          🏛️
        </Avatar>
        <Typography variant="h6" fontWeight="bold" noWrap>
          Civic Admin
        </Typography>
        <IconButton
          onClick={handleDrawerToggle}
          sx={{ ml: 'auto' }}
          aria-label="close menu"
        >
          <CloseIcon />
        </IconButton>
      </Box>
      
      <Divider />

      {/* Navigation List */}
      <List sx={{ flexGrow: 1, pt: 2 }}>
        {navigationItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ px: 1, mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? 'inherit' : 'text.secondary',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{
                    fontSize: '0.95rem',
                    fontWeight: isActive ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* User Profile Section */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={user?.imageUrl}
            alt={user?.fullName || 'Admin'}
            sx={{ width: 36, height: 36 }}
          />
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {user?.fullName || 'Admin User'}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user?.primaryEmailAddress?.emailAddress || 'admin@civic.gov'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar with Hamburger Menu - Always Visible */}
      <AppBar
        position="fixed"
        sx={{
          width: '100%',
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {navigationItems.find(item => item.path === pathname)?.title || 'Admin Panel'}
          </Typography>

          {/* User Button from Clerk */}
          <UserButton afterSignOutUrl="/login" />
        </Toolbar>
      </AppBar>

      {/* Drawer - Always Temporary (Overlay) */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better performance
        }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Content - Full Width */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar /> {/* Spacer for AppBar */}
        {children}
      </Box>
    </Box>
  );
}
