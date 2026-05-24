import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Button, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import EnergySavingsLeafIcon from '@mui/icons-material/EnergySavingsLeaf';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import TuneIcon from '@mui/icons-material/Tune';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../services/api';

export default function Header({ isDrawerOpen, setIsDrawerOpen, isMobile, onEditPreferences, isAuthed = true }) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logoutUser(); // Invalidates the session on the server
        // Drop cached preferences so the next user on this browser starts fresh.
        try { localStorage.removeItem('eco-awareness:preferences'); } catch {}
        navigate('/login');
    };

    const handleLogin = () => navigate('/login');

    return (
        <AppBar
            position="static"
            elevation={0}
            sx={{
                backgroundColor: 'background.paper',
                borderBottom: '1.5px solid',
                borderBottomColor: 'rgba(26,109,181,0.15)',
                zIndex: 1400,
            }}
        >
            <Toolbar sx={{ px: isMobile ? 1 : 2 }}>
                <IconButton
                    size="large"
                    edge="start"
                    color="primary"
                    sx={{ mr: isMobile ? 0 : 2 }}
                    onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                >
                    <MenuIcon />
                </IconButton>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
                    <EnergySavingsLeafIcon color="primary" sx={{ fontSize: isMobile ? 22 : 26 }} />
                    <Typography
                        variant="h6"
                        fontWeight="bold"
                        color="text.primary"
                        sx={{ fontSize: isMobile ? '1rem' : '1.2rem', letterSpacing: 0.3 }}
                    >
                        Eco Awareness
                    </Typography>
                </Box>

                {/* Preferences button */}
                {onEditPreferences && (
                    isMobile ? (
                        <Tooltip title="Προτιμήσεις">
                            <IconButton
                                onClick={onEditPreferences}
                                aria-label="Προτιμήσεις"
                                sx={{
                                    color: '#1a6db5',
                                    mr: 0.5,
                                    '&:hover': { backgroundColor: 'rgba(26,109,181,0.08)' },
                                }}
                            >
                                <TuneIcon />
                            </IconButton>
                        </Tooltip>
                    ) : (
                        <Button
                            onClick={onEditPreferences}
                            startIcon={<TuneIcon />}
                            sx={{
                                color: '#1a6db5',
                                fontWeight: 600,
                                textTransform: 'none',
                                fontSize: '1rem',
                                mr: 1,
                                '&:hover': { backgroundColor: 'rgba(26,109,181,0.08)' },
                            }}
                        >
                            Προτιμήσεις
                        </Button>
                    )
                )}

                {/* Login / Logout button */}
                {isAuthed ? (
                    <Button
                        onClick={handleLogout}
                        startIcon={<LogoutIcon />}
                        sx={{
                            color: '#c0392b',
                            fontWeight: 600,
                            textTransform: 'none',
                            fontSize: isMobile ? '0.85rem' : '1rem',
                            '&:hover': { backgroundColor: 'rgba(192,57,43,0.06)' },
                        }}
                    >
                        {!isMobile && 'Αποσύνδεση'}
                    </Button>
                ) : (
                    <Button
                        onClick={handleLogin}
                        startIcon={<LoginIcon />}
                        sx={{
                            color: '#1a6db5',
                            fontWeight: 600,
                            textTransform: 'none',
                            fontSize: isMobile ? '0.85rem' : '1rem',
                            '&:hover': { backgroundColor: 'rgba(26,109,181,0.08)' },
                        }}
                    >
                        {!isMobile && 'Σύνδεση'}
                    </Button>
                )}
            </Toolbar>
        </AppBar>
    );
}
