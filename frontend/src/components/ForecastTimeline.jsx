import React from 'react';
import { Box, Typography, Card, CardContent, Skeleton, Alert } from '@mui/material';
import PropTypes from 'prop-types';

// === Helpers ==================================================

const verdictMeta = {
    GO_NOW: {
        color: '#27ae60',
        bg: 'rgba(39,174,96,0.10)',
        label: 'Πήγαινε τώρα',
        emoji: '✅',
    },
    WAIT: {
        color: '#f39c12',
        bg: 'rgba(243,156,18,0.10)',
        label: 'Καλύτερα να περιμένεις',
        emoji: '⏳',
    },
    AVOID_TODAY: {
        color: '#e74c3c',
        bg: 'rgba(231,76,60,0.10)',
        label: 'Καλύτερα όχι σήμερα',
        emoji: '🚫',
    },
    UNKNOWN: {
        color: '#95a5a6',
        bg: 'rgba(149,165,166,0.10)',
        label: 'Άγνωστο',
        emoji: '❓',
    },
};

// Χρώμα segment βάσει European AQI (CAMS 6 κατηγορίες)
const aqiColor = (aqi) => {
    if (aqi <= 20)  return '#27ae60';  // Καλό
    if (aqi <= 40)  return '#a3d166';  // Ικανοποιητικό (Fair)
    if (aqi <= 60)  return '#f1c40f';  // Μέτριο
    if (aqi <= 80)  return '#e67e22';  // Κακό
    if (aqi <= 100) return '#e74c3c';  // Πολύ κακό
    return '#8b0000';                   // Εξαιρετικά κακό
};

// Χρώμα βάσει UV index (κλίμακα WHO)
const uvColor = (uv) => {
    if (uv <= 2)  return '#27ae60';    // Χαμηλό
    if (uv <= 5)  return '#f1c40f';    // Μέτριο
    if (uv <= 7)  return '#e67e22';    // Υψηλό
    if (uv <= 10) return '#e74c3c';    // Πολύ υψηλό
    return '#8b0000';                  // Ακραίο
};

// Emoji καιρού από την ελληνική περιγραφή του WeatherCodeMapper.
// Διακρίνει νύχτα/μέρα μέσω uvIndex (=0 → νύχτα) όταν είναι καθαρός ουρανός.
const weatherEmoji = (description, uv) => {
    const d = (description || '').toLowerCase();
    const isNight = (uv ?? 0) === 0;
    if (d.includes('καθαρός')) return isNight ? '🌙' : '☀️';
    if (d.includes('σχεδόν καθαρός')) return isNight ? '🌙' : '🌤️';
    if (d.includes('μερικώς')) return '⛅';
    if (d.includes('συννεφ')) return '☁️';
    if (d.includes('ομίχλη')) return '🌫️';
    if (d.includes('ψιχάλισμα') || d.includes('βροχή') || d.includes('μπόρ')) return '🌧️';
    if (d.includes('χιόν')) return '🌨️';
    if (d.includes('καταιγίδα')) return '⛈️';
    return '·';
};

// === Helper: μία γραμμή του timeline (label + 8 cells σε grid) =========
// Χρησιμοποιεί CSS Grid με repeat(8, 1fr) — εγγυάται ακριβώς ίδιο πλάτος
// ανά στήλη ασχέτως περιεχομένου (π.χ. emoji με διαφορετικά εγγενή πλάτη).
function TimelineRow({ label, slots, renderCell }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
            <Typography sx={{ fontSize: '0.65rem', color: '#5a6b80', fontWeight: 600, width: 48, flexShrink: 0, lineHeight: 1 }}>
                {label}
            </Typography>
            <Box sx={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 0.4 }}>
                {slots.map((s, i) => (
                    <Box key={i} sx={{ minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {renderCell(s)}
                    </Box>
                ))}
            </Box>
        </Box>
    );
}

TimelineRow.propTypes = {
    label: PropTypes.string.isRequired,
    slots: PropTypes.array.isRequired,
    renderCell: PropTypes.func.isRequired,
};

// === Component ================================================

export default function ForecastTimeline({ data, isLoading, error }) {

    if (isLoading) {
        return (
            <Box>
                <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2, mb: 2 }} />
                <Skeleton variant="rectangular" height={70} sx={{ borderRadius: 2, mb: 2 }} />
                <Skeleton variant="text" height={28} />
                <Skeleton variant="text" height={28} />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
    }

    if (!data) return null;

    const v = verdictMeta[data.verdict] || verdictMeta.UNKNOWN;
    const slots = data.slots || [];

    return (
        <Box>
            {/* Title + city */}
            <Box sx={{ mb: 1.5 }}>
                <Typography sx={{ fontWeight: 700, color: '#0f1b2d', fontSize: '1rem' }}>
                    🔮 Πρόβλεψη Επόμενων 24h
                </Typography>
                {data.cityName && (
                    <Typography sx={{ fontSize: '0.8rem', color: '#5a6b80', mt: 0.3 }}>
                        📍 {data.cityName}
                    </Typography>
                )}
            </Box>

            {/* Verdict Card — το bestSlot εμφανίζεται μόνο όταν αξίζει (WAIT) */}
            <Card sx={{
                mb: 2,
                borderLeft: `5px solid ${v.color}`,
                backgroundColor: v.bg,
                boxShadow: 'none',
                borderRadius: 2,
            }}>
                <CardContent sx={{ pb: '16px !important' }}>
                    <Typography sx={{ fontWeight: 700, color: v.color, fontSize: '0.95rem', mb: data.verdict === 'WAIT' ? 0.5 : 0 }}>
                        {v.emoji} {v.label}
                    </Typography>
                    {data.verdict === 'WAIT' && data.bestSlot && (
                        <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f1b2d' }}>
                            Καλύτερη ώρα: {data.bestSlot}
                        </Typography>
                    )}
                </CardContent>
            </Card>

            {/* Timeline — 4 παράλληλες γραμμές (AQI / UV / Θερμοκρασία / Καιρός) */}
            {slots.length > 0 && (
                <Card sx={{ mb: 2, backgroundColor: '#f5f9ff', border: '1px solid rgba(26,109,181,0.15)', boxShadow: 'none' }}>
                    <CardContent sx={{ py: 1.2, px: 1.2, '&:last-child': { pb: 1.2 } }}>
                        <Typography sx={{ fontSize: '0.85rem', color: '#3d5166', fontWeight: 700, mb: 1 }}>
                            ⏱️ Πρόβλεψη ανά 3ωρο
                        </Typography>

                        {/* AQI row */}
                        <TimelineRow
                            label="AQI"
                            slots={slots}
                            renderCell={(s) => (
                                <Box sx={{
                                    width: '100%',
                                    height: 26,
                                    backgroundColor: aqiColor(s.aqi),
                                    borderRadius: 0.8,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                }}>
                                    {s.aqi}
                                </Box>
                            )}
                        />

                        {/* UV row */}
                        <TimelineRow
                            label="UV"
                            slots={slots}
                            renderCell={(s) => (
                                <Box sx={{
                                    width: '100%',
                                    height: 26,
                                    backgroundColor: uvColor(s.uvIndex),
                                    borderRadius: 0.8,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                }}>
                                    {s.uvIndex?.toFixed(0) ?? 0}
                                </Box>
                            )}
                        />

                        {/* Θερμοκρασία row */}
                        <TimelineRow
                            label="Θερμ."
                            slots={slots}
                            renderCell={(s) => (
                                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f1b2d', lineHeight: 1, py: 0.4 }}>
                                    {s.temp.toFixed(0)}°
                                </Typography>
                            )}
                        />

                        {/* Καιρός row */}
                        <TimelineRow
                            label="Καιρός"
                            slots={slots}
                            renderCell={(s) => (
                                <Typography
                                    component="span"
                                    sx={{ fontSize: '1.1rem', lineHeight: 1, py: 0.2 }}
                                    title={s.description}
                                >
                                    {weatherEmoji(s.description, s.uvIndex)}
                                </Typography>
                            )}
                        />

                        {/* x-axis: ώρες σε πλήρη "HH:00" μορφή */}
                        <TimelineRow
                            label=""
                            slots={slots}
                            renderCell={(s) => (
                                <Typography sx={{ fontSize: '0.62rem', color: '#5a6b80', fontWeight: 600, lineHeight: 1, whiteSpace: 'nowrap' }}>
                                    {s.localTime}
                                </Typography>
                            )}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Alternative slot — μόνο όταν προτείνουμε αναμονή */}
            {data.verdict === 'WAIT' && data.alternativeSlot && data.alternativeSlot.trim() !== '' && (
                <Typography sx={{ fontSize: '0.78rem', color: '#5a6b80', mb: 1.5, fontStyle: 'italic' }}>
                    Εναλλακτική επιλογή: <strong>{data.alternativeSlot}</strong>
                </Typography>
            )}

            {/* AI Analysis Card (ίδιο style με το AnalysisPanel) */}
            {data.explanation && (
                <Card sx={{ backgroundColor: '#f5f9ff', border: '1px solid rgba(26,109,181,0.15)' }}>
                    <CardContent sx={{ py: 1, px: 1.2 }}>
                        <Typography sx={{ fontSize: '0.85rem', color: '#3d5166', fontWeight: 700, mb: 0.8 }}>
                            🤖 AI Ανάλυση
                        </Typography>
                        <Typography sx={{ fontSize: '0.9rem', color: '#0f1b2d', lineHeight: 1.6 }}>
                            {data.explanation}
                        </Typography>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
}

ForecastTimeline.propTypes = {
    data: PropTypes.shape({
        cityName: PropTypes.string,
        verdict: PropTypes.string,
        bestSlot: PropTypes.string,
        alternativeSlot: PropTypes.string,
        explanation: PropTypes.string,
        slots: PropTypes.array,
    }),
    isLoading: PropTypes.bool,
    error: PropTypes.string,
};
