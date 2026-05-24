import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Divider, Paper, Alert, CircularProgress } from '@mui/material';
import EnergySavingsLeafIcon from '@mui/icons-material/EnergySavingsLeaf';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';

const PRIMARY = '#1a6db5';
const PRIMARY_DARK = '#145a99';
const TEXT = '#0f1b2d';
const TEXT_SECONDARY = '#3d5166';

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '', confirm: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirm) {
            setError('Οι κωδικοί δεν ταιριάζουν.');
            return;
        }

        if (form.password.length < 6) {
            setError('Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες.');
            return;
        }

        setLoading(true);

        try {
            await registerUser(form.email, form.password);
            navigate('/map');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            height: '100vh',
            background: 'radial-gradient(ellipse at 50% 30%, rgba(26,109,181,0.18) 0%, transparent 60%), #e8eff7',
        }}>
            <Paper elevation={0} sx={{
                maxWidth: 440, width: '100%', mx: 2,
                p: 5,
                borderRadius: 4,
                border: '1.5px solid rgba(26,109,181,0.2)',
                boxShadow: '0 8px 40px rgba(15,27,45,0.12)',
                backgroundColor: '#f5f9ff',
            }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Box sx={{
                        width: 64, height: 64, borderRadius: 3,
                        backgroundColor: 'rgba(26,109,181,0.12)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        mx: 'auto', mb: 2,
                    }}>
                        <EnergySavingsLeafIcon sx={{ fontSize: 34, color: PRIMARY }} />
                    </Box>
                    <Typography variant="h5" fontWeight={700} sx={{ color: TEXT }}>
                        Δημιουργία Λογαριασμού
                    </Typography>
                    <Typography variant="body2" sx={{ color: TEXT_SECONDARY, mt: 0.5, fontWeight: 500 }}>
                        Εγγραφείτε για να αποκτήσετε πρόσβαση στα περιβαλλοντικά δεδομένα
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleRegister}>
                    <TextField
                        fullWidth name="email" label="Email" type="email"
                        variant="outlined" margin="normal" required
                        value={form.email} onChange={handleChange}
                        sx={fieldStyle}
                        disabled={loading}
                    />
                    <TextField
                        fullWidth name="password" label="Κωδικός" type="password"
                        variant="outlined" margin="normal" required
                        value={form.password} onChange={handleChange}
                        sx={fieldStyle}
                        disabled={loading}
                    />
                    <TextField
                        fullWidth name="confirm" label="Επαλήθευση Κωδικού" type="password"
                        variant="outlined" margin="normal" required
                        value={form.confirm} onChange={handleChange}
                        sx={fieldStyle}
                        disabled={loading}
                    />
                    <Button
                        type="submit" fullWidth variant="contained" size="large"
                        disabled={loading}
                        sx={{
                            mt: 3, mb: 2,
                            backgroundColor: PRIMARY,
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '1rem',
                            borderRadius: 2,
                            boxShadow: '0 4px 16px rgba(26,109,181,0.4)',
                            '&:hover': { backgroundColor: PRIMARY_DARK },
                        }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Εγγραφή'}
                    </Button>
                </form>

                <Divider sx={{ my: 1, borderColor: 'rgba(26,109,181,0.15)' }} />

                <Typography variant="body2" sx={{ color: TEXT_SECONDARY, textAlign: 'center', mt: 2, fontWeight: 500 }}>
                    Έχετε ήδη λογαριασμό;{' '}
                    <Link to="/login" style={{ color: PRIMARY, textDecoration: 'none', fontWeight: 700 }}>
                        Συνδεθείτε
                    </Link>
                </Typography>
            </Paper>
        </Box>
    );
}

const fieldStyle = {
    '& .MuiOutlinedInput-root': {
        borderRadius: 2,
        '&:hover fieldset': { borderColor: '#1a6db5' },
        '&.Mui-focused fieldset': { borderColor: '#1a6db5' },
    },
    '& label.Mui-focused': { color: '#1a6db5' },
};
