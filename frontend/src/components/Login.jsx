import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Divider, Paper, Alert, CircularProgress } from '@mui/material';
import EnergySavingsLeafIcon from '@mui/icons-material/EnergySavingsLeaf';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await loginUser(email, password);
            navigate('/map', { state: { freshLogin: true } });
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
            background: 'radial-gradient(ellipse at 50% 30%, rgba(26,109,181,0.18) 0%, transparent 60%)',
            backgroundColor: 'background.default',
        }}>
            <Paper elevation={0} sx={{
                maxWidth: 420, width: '100%', mx: 2,
                p: 5,
                borderRadius: 4,
                border: '1.5px solid',
                borderColor: 'rgba(26,109,181,0.2)',
                boxShadow: '0 8px 40px rgba(15,27,45,0.12)',
                backgroundColor: 'background.paper',
            }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Box sx={{
                        width: 64, height: 64, borderRadius: 3,
                        backgroundColor: 'rgba(26,109,181,0.12)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        mx: 'auto', mb: 2,
                    }}>
                        <EnergySavingsLeafIcon color="primary" sx={{ fontSize: 34 }} />
                    </Box>
                    <Typography variant="h5" fontWeight={700} color="text.primary">
                        Eco Awareness
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
                        Συνδεθείτε για να δείτε τα περιβαλλοντικά δεδομένα
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleLogin}>
                    <TextField
                        fullWidth label="Email" type="email"
                        variant="outlined" margin="normal" required
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        sx={fieldStyle}
                        disabled={loading}
                    />
                    <TextField
                        fullWidth label="Κωδικός" type="password"
                        variant="outlined" margin="normal" required
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        sx={fieldStyle}
                        disabled={loading}
                    />
                    <Button
                        type="submit" fullWidth variant="contained" size="large"
                        color="primary"
                        disabled={loading}
                        sx={{
                            mt: 3, mb: 2,
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '1rem',
                            borderRadius: 2,
                            boxShadow: '0 4px 16px rgba(26,109,181,0.4)',
                        }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Είσοδος'}
                    </Button>
                </form>

                <Divider sx={{ my: 1, borderColor: 'rgba(26,109,181,0.15)' }} />

                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2, fontWeight: 500 }}>
                    Δεν έχετε λογαριασμό;{' '}
                    <Link to="/register" style={{ color: '#1a6db5', textDecoration: 'none', fontWeight: 700 }}>
                        Εγγραφείτε
                    </Link>
                </Typography>
            </Paper>
        </Box>
    );
}

const fieldStyle = {
    '& .MuiOutlinedInput-root': {
        borderRadius: 2,
    }
};
