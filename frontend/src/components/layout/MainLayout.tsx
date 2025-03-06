import { Box, Container, AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, Menu, MenuItem, Avatar, Chip, Divider } from '@mui/material';
import { 
  Menu as MenuIcon, 
  Dashboard, 
  Inventory, 
  Assignment, 
  Settings, 
  Person, 
  Logout, 
  Business,
  Add,
  LocationOn,
  SupervisorAccount
} from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate, Outlet, Link } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { UserRole } from '../../services/auth';

export const MainLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const { user, signOut } = useAuthContext();
  
  // Temporaire: Log pour debug
  console.log('User info:', user);
  console.log('Is admin?', user?.role === UserRole.ADMIN);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await signOut();
    handleCloseUserMenu();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Équipements', icon: <Inventory />, path: '/equipment' },
    { text: 'Mes emprunts', icon: <Assignment />, path: '/loans' },
    { 
      text: 'Gestion des emprunts', 
      icon: <Assignment />, 
      path: '/loans/admin', 
      allowedRoles: [UserRole.ADMIN, UserRole.ENSEIGNANT] 
    },
    { 
      text: 'Inventory', 
      icon: <LocationOn />, 
      path: '/inventory', 
      allowedRoles: [UserRole.ADMIN, UserRole.ENSEIGNANT] 
    },
    { 
      text: 'Users', 
      icon: <SupervisorAccount />, 
      path: '/users', 
      allowedRoles: [UserRole.ADMIN] 
    },
    { text: 'Settings', icon: <Settings />, path: '/settings' },
  ];

  // Vérifier si l'utilisateur a accès à un élément de menu en fonction de son rôle
  const hasMenuAccess = (item: any) => {
    // Si l'élément n'a pas de restrictions de rôles, tout le monde y a accès
    if (!item.allowedRoles) return true;
    
    // Si l'utilisateur n'a pas de rôle défini et que l'élément a des restrictions, refuser l'accès
    if (!user?.role) return false;
    
    // Vérifier si le rôle de l'utilisateur est dans la liste des rôles autorisés
    return item.allowedRoles.includes(user.role);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            IELMS
          </Typography>

          <Box>
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar alt={user?.email} src="/static/images/avatar/2.jpg">
                {user?.email?.[0]?.toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleCloseUserMenu}
            >
              <Box sx={{ px: 2, py: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="subtitle1">{user?.email}</Typography>
                {user?.role && (
                  <Chip 
                    label={user.role} 
                    color={user.role === UserRole.ADMIN ? 'error' : 
                           user.role === UserRole.ENSEIGNANT ? 'warning' : 'primary'} 
                    size="small" 
                    sx={{ mt: 0.5 }}
                  />
                )}
              </Box>
              <Divider sx={{ my: 1 }} />
              <MenuItem component={Link} to="/profile" onClick={handleCloseUserMenu}>
                <ListItemIcon>
                  <Person fontSize="small" />
                </ListItemIcon>
                <ListItemText>Profil</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                <ListItemText>Déconnexion</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <List>
          {menuItems.map((item) => (
            hasMenuAccess(item) && (
              <ListItem
                button
                key={item.text}
                onClick={() => {
                  navigate(item.path);
                  setDrawerOpen(false);
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            )
          ))}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
        }}
      >
        <Container maxWidth="lg">
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}; 