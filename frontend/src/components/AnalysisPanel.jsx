import React from 'react';
import { Box, Card, CardContent, Typography, Skeleton, Alert, LinearProgress } from '@mui/material';
import PropTypes from 'prop-types';

export default function AnalysisPanel({ data, isLoading, isAiLoading, error }) {
    if (isLoading) {
        return (
            <Box sx={{ p: 1 }}>
                <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" height={100} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 1 }}>
                <Alert severity="error" sx={{ fontSize: '0.75rem' }}>{error}</Alert>
            </Box>
        );
    }

    if (!data) {
        return null;
    }

    const { weather, airQuality, solar, aiAnalysis } = data;


    // Helper function to get progress bar color and status label based on status string
    const getStatusColor = (status) => {
        switch (status) {
            case 'GOOD':
                return { color: '#27ae60', label: '✓ Καλό' };
            case 'FAIR':
                return { color: '#a3d166', label: '✓ Ικανοποιητικό' };
            case 'MODERATE':
                return { color: '#f39c12', label: '⚠️ Μέτριο' };
            case 'POOR':
                return { color: '#e74c3c', label: '❌ Κακό' };
            case 'VERY_POOR':
                return { color: '#c0392b', label: '❌❌ Πολύ Κακό' };
            case 'EXTREMELY_POOR':
            case 'SEVERE':
                return { color: '#8b0000', label: '🚨 Εξαιρετικά Κακό' };
            default:
                return { color: '#95a5a6', label: '? Άγνωστο' };
        }
    };

    // WHO/EPA όρια (μg/m³)
    const limits = {
        aqi: { label: 'European AQI (κλίμακα CAMS)' },
        pm2_5: { good: 12, moderate: 35.4, poor: 55.4, label: 'WHO όριο: 12' },
        pm10: { good: 54, moderate: 154, poor: 254, label: 'WHO όριο: 54' },
        no2: { good: 40, moderate: 100, poor: 200, label: 'WHO όριο: 40' },
        o3: { good: 100, moderate: 200, poor: 300, label: 'WHO όριο: 100' },
    };


    // Helper to normalize values for display (0-100 scale)
    const normalizeValue = (value, max) => Math.min((value / max) * 100, 100);

    return (
        <Box sx={{ p: 1.5, pb: 4 }}>
            {/* City Name */}
            <Typography sx={{ color: '#0f1b2d', fontWeight: 'bold', fontSize: '1rem', mb: 1.5 }}>
                {weather?.cityName || 'Άγνωστη τοποθεσία'}
            </Typography>

            {/* Weather Card */}
            {weather && (
                <Card sx={{ backgroundColor: '#f5f9ff', border: '1px solid rgba(26,109,181,0.15)', mb: 1.5 }}>
                    <CardContent sx={{ py: 1, px: 1.2 }}>
                        <Typography sx={{ fontSize: '0.85rem', color: '#3d5166', fontWeight: 700, mb: 1 }}>
                            🌤️ Καιρός
                        </Typography>

                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                            {/* Temperature */}
                            {weather.temperature !== undefined && (
                                <Box>
                                    <Typography sx={{ fontSize: '0.7rem', color: '#3d5166', fontWeight: 600 }}>
                                        Θερμοκρασία
                                    </Typography>
                                    <Typography sx={{ fontSize: '1rem', color: '#0f1b2d', fontWeight: 'bold' }}>
                                        {weather.temperature.toFixed(1)}{weather.tempUnit}
                                    </Typography>
                                </Box>
                            )}

                            {/* Humidity */}
                            {weather.humidity !== undefined && (
                                <Box>
                                    <Typography sx={{ fontSize: '0.7rem', color: '#3d5166', fontWeight: 600 }}>
                                        Υγρασία
                                    </Typography>
                                    <Typography sx={{ fontSize: '1rem', color: '#0f1b2d', fontWeight: 'bold' }}>
                                        {weather.humidity}{weather.humidityUnit}
                                    </Typography>
                                </Box>
                            )}

                            {/* Wind Speed */}
                            {weather.windSpeed !== undefined && (
                                <Box>
                                    <Typography sx={{ fontSize: '0.7rem', color: '#3d5166', fontWeight: 600 }}>
                                        Ανέμος
                                    </Typography>
                                    <Typography sx={{ fontSize: '1rem', color: '#0f1b2d', fontWeight: 'bold' }}>
                                        {weather.windSpeed.toFixed(1)}{weather.windSpeedUnit}
                                    </Typography>
                                </Box>
                            )}

                            {/* Description */}
                            {weather.description && (
                                <Box>
                                    <Typography sx={{ fontSize: '0.7rem', color: '#3d5166', fontWeight: 600 }}>
                                        Κατάσταση
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.85rem', color: '#0f1b2d', fontWeight: 'bold' }}>
                                        {weather.description}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </CardContent>
                </Card>
            )}

            {/* Air Quality Card */}
            {airQuality && (
                <Card sx={{ backgroundColor: '#f5f9ff', border: '1px solid rgba(26,109,181,0.15)', mb: 1.5 }}>
                    <CardContent sx={{ py: 1, px: 1.2 }}>
                        <Typography sx={{ fontSize: '0.85rem', color: '#3d5166', fontWeight: 700, mb: 1.2 }}>
                            🌫️ Ποιότητα Αέρα
                        </Typography>

                        {/* AQI */}
                         {airQuality.aqi !== undefined && (
                            <Box sx={{ mb: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                                    <Box>
                                        <Typography sx={{ fontSize: '0.7rem', color: '#3d5166', fontWeight: 600 }}>
                                            AQI
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.65rem', color: '#8a9bb5', fontStyle: 'italic' }}>
                                            {limits.aqi.label}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography sx={{ fontSize: '0.8rem', color: '#0f1b2d', fontWeight: 'bold' }}>
                                            {airQuality.aqi}
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: getStatusColor(airQuality.aqi_status).color }}>
                                            {getStatusColor(airQuality.aqi_status).label}
                                        </Typography>
                                    </Box>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={normalizeValue(airQuality.aqi, 100)}
                                    sx={{
                                        height: 6,
                                        borderRadius: 3,
                                        backgroundColor: 'rgba(0,0,0,0.1)',
                                        '& .MuiLinearProgress-bar': {
                                            borderRadius: 3,
                                            backgroundColor: getStatusColor(airQuality.aqi_status).color,
                                        },
                                    }}
                                />
                            </Box>
                        )}

                        {/* PM2.5 */}
                         {airQuality.pm2_5 !== undefined && (
                            <Box sx={{ mb: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                                    <Box>
                                        <Typography sx={{ fontSize: '0.7rem', color: '#3d5166', fontWeight: 600 }}>
                                            PM2.5
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.65rem', color: '#8a9bb5', fontStyle: 'italic' }}>
                                            {limits.pm2_5.label}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography sx={{ fontSize: '0.8rem', color: '#0f1b2d', fontWeight: 'bold' }}>
                                            {airQuality.pm2_5.toFixed(1)}
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: getStatusColor(airQuality.pm2_5_status).color }}>
                                            {getStatusColor(airQuality.pm2_5_status).label}
                                        </Typography>
                                    </Box>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={normalizeValue(airQuality.pm2_5, 100)}
                                    sx={{
                                        height: 6,
                                        borderRadius: 3,
                                        backgroundColor: 'rgba(0,0,0,0.1)',
                                        '& .MuiLinearProgress-bar': {
                                            borderRadius: 3,
                                            backgroundColor: getStatusColor(airQuality.pm2_5_status).color,
                                        },
                                    }}
                                />
                            </Box>
                        )}

                        {/* PM10 */}
                         {airQuality.pm10 !== undefined && (
                            <Box sx={{ mb: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                                    <Box>
                                        <Typography sx={{ fontSize: '0.7rem', color: '#3d5166', fontWeight: 600 }}>
                                            PM10
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.65rem', color: '#8a9bb5', fontStyle: 'italic' }}>
                                            {limits.pm10.label}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography sx={{ fontSize: '0.8rem', color: '#0f1b2d', fontWeight: 'bold' }}>
                                            {airQuality.pm10.toFixed(1)}
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: getStatusColor(airQuality.pm10_status).color }}>
                                            {getStatusColor(airQuality.pm10_status).label}
                                        </Typography>
                                    </Box>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={normalizeValue(airQuality.pm10, 150)}
                                    sx={{
                                        height: 6,
                                        borderRadius: 3,
                                        backgroundColor: 'rgba(0,0,0,0.1)',
                                        '& .MuiLinearProgress-bar': {
                                            borderRadius: 3,
                                            backgroundColor: getStatusColor(airQuality.pm10_status).color,
                                        },
                                    }}
                                />
                            </Box>
                        )}

                        {/* NO2 */}
                         {airQuality.no2 !== undefined && (
                            <Box sx={{ mb: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                                    <Box>
                                        <Typography sx={{ fontSize: '0.7rem', color: '#3d5166', fontWeight: 600 }}>
                                            NO₂
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.65rem', color: '#8a9bb5', fontStyle: 'italic' }}>
                                            {limits.no2.label}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography sx={{ fontSize: '0.8rem', color: '#0f1b2d', fontWeight: 'bold' }}>
                                            {airQuality.no2.toFixed(2)}
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: getStatusColor(airQuality.no2_status).color }}>
                                            {getStatusColor(airQuality.no2_status).label}
                                        </Typography>
                                    </Box>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={normalizeValue(airQuality.no2, 200)}
                                    sx={{
                                        height: 6,
                                        borderRadius: 3,
                                        backgroundColor: 'rgba(0,0,0,0.1)',
                                        '& .MuiLinearProgress-bar': {
                                            borderRadius: 3,
                                            backgroundColor: getStatusColor(airQuality.no2_status).color,
                                        },
                                    }}
                                />
                            </Box>
                        )}

                        {/* O3 */}
                         {airQuality.o3 !== undefined && (
                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                                    <Box>
                                        <Typography sx={{ fontSize: '0.7rem', color: '#3d5166', fontWeight: 600 }}>
                                            O₃
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.65rem', color: '#8a9bb5', fontStyle: 'italic' }}>
                                            {limits.o3.label}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography sx={{ fontSize: '0.8rem', color: '#0f1b2d', fontWeight: 'bold' }}>
                                            {airQuality.o3.toFixed(2)}
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: getStatusColor(airQuality.o3_status).color }}>
                                            {getStatusColor(airQuality.o3_status).label}
                                        </Typography>
                                    </Box>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={normalizeValue(airQuality.o3, 200)}
                                    sx={{
                                        height: 6,
                                        borderRadius: 3,
                                        backgroundColor: 'rgba(0,0,0,0.1)',
                                        '& .MuiLinearProgress-bar': {
                                            borderRadius: 3,
                                            backgroundColor: getStatusColor(airQuality.o3_status).color,
                                        },
                                    }}
                                />
                            </Box>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Sun Card (ίδιο style με την Καιρός κάρτα) */}
            {solar && (
                <Card sx={{ backgroundColor: '#f5f9ff', border: '1px solid rgba(26,109,181,0.15)', mb: 1.5 }}>
                    <CardContent sx={{ py: 1, px: 1.2 }}>
                        <Typography sx={{ fontSize: '0.85rem', color: '#3d5166', fontWeight: 700, mb: 1 }}>
                            ☀️ Ήλιος
                        </Typography>

                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                            {/* Ακτινοβολία */}
                            <Box>
                                <Typography sx={{ fontSize: '0.7rem', color: '#3d5166', fontWeight: 600 }}>
                                    Ακτινοβολία
                                </Typography>
                                <Typography sx={{ fontSize: '1rem', color: '#0f1b2d', fontWeight: 'bold' }}>
                                    {solar.value.toFixed(0)} {solar.unit}
                                </Typography>
                            </Box>

                            {/* UV Index */}
                            {solar.uvIndex !== undefined && (
                                <Box>
                                    <Typography sx={{ fontSize: '0.7rem', color: '#3d5166', fontWeight: 600 }}>
                                        UV Index
                                    </Typography>
                                    <Typography sx={{ fontSize: '1rem', color: '#0f1b2d', fontWeight: 'bold' }}>
                                        {solar.uvIndex.toFixed(1)}
                                    </Typography>
                                </Box>
                            )}

                            {/* Ανατολή */}
                            {solar.sunrise && (
                                <Box>
                                    <Typography sx={{ fontSize: '0.7rem', color: '#3d5166', fontWeight: 600 }}>
                                        Ανατολή
                                    </Typography>
                                    <Typography sx={{ fontSize: '1rem', color: '#0f1b2d', fontWeight: 'bold' }}>
                                        {solar.sunrise}
                                    </Typography>
                                </Box>
                            )}

                            {/* Δύση */}
                            {solar.sunset && (
                                <Box>
                                    <Typography sx={{ fontSize: '0.7rem', color: '#3d5166', fontWeight: 600 }}>
                                        Δύση
                                    </Typography>
                                    <Typography sx={{ fontSize: '1rem', color: '#0f1b2d', fontWeight: 'bold' }}>
                                        {solar.sunset}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </CardContent>
                </Card>
            )}

            {/* AI Analysis Card — skeleton όσο φορτώνει, content όταν φτάνει */}
            {(aiAnalysis || isAiLoading) && (
                <Card sx={{ backgroundColor: '#f5f9ff', border: '1px solid rgba(26,109,181,0.15)' }}>
                    <CardContent sx={{ py: 1, px: 1.2 }}>
                        <Typography sx={{ fontSize: '0.85rem', color: '#3d5166', fontWeight: 700, mb: 0.8 }}>
                            🤖 AI Ανάλυση
                        </Typography>
                        {isAiLoading && !aiAnalysis ? (
                            <>
                                <Skeleton variant="text" height={20} />
                                <Skeleton variant="text" height={20} />
                                <Skeleton variant="text" height={20} width="80%" />
                            </>
                        ) : (
                            <Typography sx={{ fontSize: '0.9rem', color: '#0f1b2d', lineHeight: 1.6 }}>
                                {aiAnalysis}
                            </Typography>
                        )}
                    </CardContent>
                </Card>
            )}
        </Box>
    );
}

AnalysisPanel.propTypes = {
    data: PropTypes.shape({
        weather: PropTypes.object,
        airQuality: PropTypes.object,
        solar: PropTypes.object,
        aiAnalysis: PropTypes.string,
    }),
    isLoading: PropTypes.bool,
    isAiLoading: PropTypes.bool,
    error: PropTypes.string,
};
