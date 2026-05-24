import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import AirIcon from '@mui/icons-material/Air';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CloudIcon from '@mui/icons-material/Cloud';
import EnergySavingsLeafIcon from '@mui/icons-material/EnergySavingsLeaf';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { checkAuth } from '../services/api';

const PRIMARY = '#1a6db5';
const PRIMARY_DARK = '#145a99';
const BG = '#e8eff7';
const SURFACE = '#f5f9ff';
const TEXT = '#0f1b2d';
const TEXT_SECONDARY = '#3d5166';

export default function LandingPage() {
    const navigate = useNavigate();

    // If the user already has an authenticated session, redirect to /map
    useEffect(() => {
        let cancelled = false;
        checkAuth().then((user) => {
            if (!cancelled && user) {
                navigate('/map', { replace: true });
            }
        });
        return () => { cancelled = true; };
    }, [navigate]);
    return (
        <Box sx={{ height: '100vh', overflowY: 'auto', bgcolor: BG }}>

            {/* Navbar */}
            <Box sx={{
                position: 'sticky', top: 0, zIndex: 100,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                px: { xs: 3, md: 8 }, py: 2,
                backdropFilter: 'blur(12px)',
                backgroundColor: 'rgba(232,239,247,0.92)',
                borderBottom: '1px solid rgba(26,109,181,0.15)',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EnergySavingsLeafIcon sx={{ color: PRIMARY, fontSize: 28 }} />
                    <Typography variant="h6" fontWeight="bold" sx={{ color: TEXT, letterSpacing: 0.5 }}>
                        Eco Awareness
                    </Typography>
                </Box>
                <Button
                    component={Link}
                    to="/login"
                    variant="outlined"
                    size="small"
                    sx={{
                        color: PRIMARY,
                        borderColor: PRIMARY,
                        fontWeight: 600,
                        textTransform: 'none',
                        borderRadius: 2,
                        '&:hover': { backgroundColor: 'rgba(26,109,181,0.08)' },
                    }}
                >
                    Σύνδεση
                </Button>
            </Box>

            {/* Hero */}
            <Box sx={{
                minHeight: '88vh',
                display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center',
                textAlign: 'center',
                px: 3,
                background: `radial-gradient(ellipse at 50% 30%, rgba(26,109,181,0.18) 0%, transparent 60%)`,
            }}>
                <Box sx={{
                    display: 'inline-flex', alignItems: 'center', gap: 1,
                    px: 2, py: 0.6, mb: 4,
                    border: `1.5px solid rgba(26,109,181,0.5)`,
                    borderRadius: 10,
                    backgroundColor: 'rgba(26,109,181,0.1)',
                }}>
                    <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: PRIMARY, animation: 'pulse 2s infinite' }} />
                    <Typography variant="caption" sx={{ color: PRIMARY, letterSpacing: 1, fontWeight: 700 }}>
                        LIVE ΠΕΡΙΒΑΛΛΟΝΤΙΚΑ ΔΕΔΟΜΕΝΑ
                    </Typography>
                </Box>

                <Typography variant="h2" fontWeight={800} sx={{
                    color: TEXT,
                    fontSize: { xs: '2.5rem', md: '4rem' },
                    lineHeight: 1.15,
                    mb: 3,
                    maxWidth: 750,
                }}>
                    Η πόλη σου,{' '}
                    <Box component="span" sx={{
                        background: `linear-gradient(90deg, ${PRIMARY}, #2a9fd6)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        διαφανής
                    </Box>
                </Typography>

                <Typography variant="h6" sx={{
                    color: TEXT_SECONDARY,
                    fontWeight: 500,
                    maxWidth: 520,
                    mb: 5,
                    lineHeight: 1.7,
                }}>
                    Ποιότητα αέρα, ηλιακή ενέργεια και καιρός — σε ένα διαδραστικό χάρτη, σε πραγματικό χρόνο.
                </Typography>

                <Button
                    component={Link}
                    to="/map"
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                        backgroundColor: PRIMARY,
                        color: '#fff',
                        fontWeight: 700,
                        px: 4, py: 1.5,
                        borderRadius: 3,
                        textTransform: 'none',
                        fontSize: '1rem',
                        boxShadow: '0 4px 20px rgba(26,109,181,0.4)',
                        '&:hover': { backgroundColor: PRIMARY_DARK, boxShadow: '0 6px 24px rgba(26,109,181,0.5)' },
                    }}
                >
                    Ξεκινήστε δωρεάν
                </Button>
            </Box>

            {/* Features */}
            <Box sx={{ backgroundColor: SURFACE, borderTop: '1.5px solid rgba(26,109,181,0.15)', borderBottom: '1.5px solid rgba(26,109,181,0.15)' }}>
                <Container maxWidth="lg" sx={{ py: 10 }}>
                    <Typography variant="overline" sx={{ color: PRIMARY, letterSpacing: 3, fontWeight: 700, display: 'block', textAlign: 'center', mb: 2 }}>
                        ΤΙ ΠΡΟΣΦΕΡΟΥΜΕ
                    </Typography>
                    <Typography variant="h4" fontWeight={700} sx={{ color: TEXT, textAlign: 'center', mb: 8 }}>
                        Όλα τα δεδομένα, σε ένα μέρος
                    </Typography>
                     <Box sx={{ display: 'flex', gap: 3 }}>
                         {[
                             {
                                 icon: <AirIcon sx={{ fontSize: 36, color: PRIMARY }} />,
                                 title: 'Ποιότητα Αέρα',
                                 text: 'Δείτε σε πραγματικό χρόνο τα επίπεδα ρύπανσης (AQI) σε κάθε σημείο του χάρτη.',
                                 accent: PRIMARY,
                                 bg: 'rgba(26,109,181,0.1)',
                             },
                             {
                                 icon: <WbSunnyIcon sx={{ fontSize: 36, color: '#c97a00' }} />,
                                 title: 'Ηλιακή Δυναμική',
                                 text: 'Υπολογίστε την απόδοση ηλιακών πάνελ με βάση τη θέση του ακινήτου σας.',
                                 accent: '#c97a00',
                                 bg: 'rgba(201,122,0,0.1)',
                             },
                             {
                                 icon: <CloudIcon sx={{ fontSize: 36, color: '#6b8cae' }} />,
                                 title: 'Καιρός',
                                 text: 'Παρακολουθήστε τη θερμοκρασία, την υγρασία και τις συνθήκες του καιρού στην περιοχή σας.',
                                 accent: '#6b8cae',
                                 bg: 'rgba(107,140,174,0.1)',
                             },
                         ].map((f) => (
                            <Paper key={f.title} elevation={0} sx={{
                                flex: '1 1 0',
                                p: 4,
                                backgroundColor: BG,
                                border: `1.5px solid rgba(0,0,0,0.1)`,
                                borderRadius: 3,
                                transition: 'border-color 0.3s, transform 0.3s, box-shadow 0.3s',
                                '&:hover': {
                                    borderColor: f.accent,
                                    transform: 'translateY(-4px)',
                                    boxShadow: `0 8px 28px rgba(0,0,0,0.1)`,
                                },
                            }}>
                                <Box sx={{
                                    width: 56, height: 56, borderRadius: 2,
                                    backgroundColor: f.bg,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    mb: 3,
                                }}>
                                    {f.icon}
                                </Box>
                                <Typography variant="h6" fontWeight={700} sx={{ color: TEXT, mb: 1.5 }}>
                                    {f.title}
                                </Typography>
                                <Typography variant="body2" sx={{ color: TEXT_SECONDARY, lineHeight: 1.8 }}>
                                    {f.text}
                                </Typography>
                            </Paper>
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* CTA */}
            <Box sx={{
                py: 12, textAlign: 'center',
                background: `radial-gradient(ellipse at 50% 50%, rgba(26,109,181,0.12) 0%, transparent 65%)`,
            }}>
                <Typography variant="h4" fontWeight={700} sx={{ color: TEXT, mb: 2 }}>
                    Έτοιμοι να εξερευνήσετε;
                </Typography>
                <Typography variant="body1" sx={{ color: TEXT_SECONDARY, mb: 5, fontWeight: 500 }}>
                    Συνδεθείτε και δείτε την πόλη σας με άλλα μάτια.
                </Typography>
                <Button
                    component={Link}
                    to="/map"
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                        backgroundColor: PRIMARY,
                        color: '#fff',
                        fontWeight: 700,
                        px: 5, py: 1.5,
                        borderRadius: 3,
                        textTransform: 'none',
                        fontSize: '1rem',
                        boxShadow: '0 4px 20px rgba(26,109,181,0.4)',
                        '&:hover': { backgroundColor: PRIMARY_DARK },
                    }}
                >
                    Ξεκινήστε τώρα
                </Button>
            </Box>

            {/* Footer */}
            <Box sx={{
                py: 4, textAlign: 'center',
                borderTop: '1.5px solid rgba(26,109,181,0.12)',
            }}>
                <Typography variant="caption" sx={{ color: TEXT_SECONDARY, fontWeight: 500 }}>
                    © 2025 Eco Awareness · Όλα τα δικαιώματα κατοχυρωμένα
                </Typography>
            </Box>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.3); }
                }
            `}</style>
        </Box>
    );
}
