import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import EnergySavingsLeafIcon from '@mui/icons-material/EnergySavingsLeaf';
import { useNavigate } from 'react-router-dom';

const PRIMARY = '#1a6db5';
const PRIMARY_DARK = '#145a99';
const TEXT = '#0f1b2d';
const TEXT_SECONDARY = '#3d5166';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <Box sx={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            height: '100vh',
            background: 'radial-gradient(ellipse at 50% 30%, rgba(26,109,181,0.18) 0%, transparent 60%), #e8eff7',
        }}>
            <Paper elevation={0} sx={{
                textAlign: 'center',
                p: 6, mx: 2,
                borderRadius: 4,
                border: '1.5px solid rgba(26,109,181,0.2)',
                boxShadow: '0 8px 40px rgba(15,27,45,0.12)',
                backgroundColor: '#f5f9ff',
            }}>
                <Box sx={{
                    width: 64, height: 64, borderRadius: 3,
                    backgroundColor: 'rgba(26,109,181,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    mx: 'auto', mb: 3,
                }}>
                    <EnergySavingsLeafIcon sx={{ fontSize: 34, color: PRIMARY }} />
                </Box>

                <Typography fontWeight={800} sx={{ fontSize: '5rem', color: PRIMARY, lineHeight: 1, mb: 1 }}>
                    404
                </Typography>
                <Typography variant="h6" fontWeight={700} sx={{ color: TEXT, mb: 1 }}>
                    Η σελίδα δεν βρέθηκε
                </Typography>
                <Typography variant="body2" sx={{ color: TEXT_SECONDARY, mb: 4, fontWeight: 500 }}>
                    Η διεύθυνση που πληκτρολογήσατε δεν υπάρχει.
                </Typography>

                <Button
                    variant="contained"
                    onClick={() => navigate('/')}
                    sx={{
                        backgroundColor: PRIMARY,
                        textTransform: 'none',
                        fontWeight: 700,
                        borderRadius: 2,
                        px: 4, py: 1.2,
                        boxShadow: '0 4px 16px rgba(26,109,181,0.4)',
                        '&:hover': { backgroundColor: PRIMARY_DARK },
                    }}
                >
                    Επιστροφή στην αρχική
                </Button>
            </Paper>
        </Box>
    );
}
