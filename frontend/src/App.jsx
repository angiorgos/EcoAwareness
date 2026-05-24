import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import theme from './theme';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import MapPage from './components/MapPage';
import NotFound from './components/NotFound';

export default function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <Routes>
                    {/* Landing Page */}
                    <Route path="/" element={<LandingPage />} />

                    {/* Login */}
                    <Route path="/login" element={<Login />} />

                    {/* Register */}
                    <Route path="/register" element={<Register />} />

                    {/* Map Page (open to guests — login is requested only when they interact with the map) */}
                    <Route path="/map" element={<MapPage />} />

                    {/* Catch-all: 404 για άκυρα URLs */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Router>
        </ThemeProvider>
    );
}
