import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Chip,
    Stack,
    IconButton,
    Divider,
    TextField,
    useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import AddIcon from '@mui/icons-material/Add';

const PROFILE_OPTIONS = [
    { id: 'asthma', label: 'Άσθμα' },
    { id: 'allergies', label: 'Αλλεργίες' },
    { id: 'heart', label: 'Καρδιακό πρόβλημα' },
    { id: 'pregnant', label: 'Εγκυμοσύνη' },
    { id: 'child', label: 'Έχω παιδιά' },
    { id: 'elderly', label: 'Ηλικιωμένος/η' },
    { id: 'sensitive_skin', label: 'Ευαίσθητο δέρμα' },
];

const ACTIVITY_OPTIONS = [
    { id: 'walking', label: 'Περπάτημα' },
    { id: 'running', label: 'Τρέξιμο / Άθληση' },
    { id: 'cycling', label: 'Ποδήλατο' },
    { id: 'outdoor_work', label: 'Εργασία έξω' },
    { id: 'sunbathing', label: 'Ηλιοθεραπεία' },
    { id: 'kids_play', label: 'Παιχνίδι με παιδιά' },
    { id: 'relocation', label: 'Μετακόμιση / Διαμονή' },
];

function CustomChipInput({ accentColor, value, onChange, onAdd, placeholder, isMobile }) {
    const handleKey = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onAdd();
        }
    };

    return (
        <Stack
            direction={isMobile ? 'column' : 'row'}
            gap={1}
            alignItems={isMobile ? 'stretch' : 'center'}
            sx={{ mt: 1.2, width: '100%' }}
        >
            <TextField
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKey}
                placeholder={placeholder}
                size="small"
                fullWidth
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: '#f7fafd',
                        fontSize: '0.9rem',
                        '& fieldset': { borderColor: 'rgba(15,27,45,0.15)' },
                        '&:hover fieldset': { borderColor: accentColor },
                        '&.Mui-focused fieldset': { borderColor: accentColor, borderWidth: '1.5px' },
                    },
                }}
            />
            <Button
                onClick={onAdd}
                disabled={!value.trim()}
                variant="contained"
                disableElevation
                startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
                fullWidth={isMobile}
                sx={{
                    backgroundColor: accentColor,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    whiteSpace: 'nowrap',
                    minWidth: isMobile ? '100%' : 'auto',
                    '&:hover': { backgroundColor: accentColor, opacity: 0.9 },
                    '&.Mui-disabled': { backgroundColor: 'rgba(15,27,45,0.08)', color: 'rgba(15,27,45,0.35)' },
                }}
            >
                Προσθήκη
            </Button>
        </Stack>
    );
}

export default function PreferencesModal({ open, onSubmit, initialState }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [profile, setProfile] = useState(initialState?.profile ?? []);
    const [activities, setActivities] = useState(initialState?.activities ?? []);
    const [customProfile, setCustomProfile] = useState(initialState?.customProfile ?? []);
    const [customActivities, setCustomActivities] = useState(initialState?.customActivities ?? []);

    const [showProfileInput, setShowProfileInput] = useState(false);
    const [showActivityInput, setShowActivityInput] = useState(false);
    const [profileInputValue, setProfileInputValue] = useState('');
    const [activityInputValue, setActivityInputValue] = useState('');

    const toggle = (list, setList, id) => {
        setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
    };

    const addCustom = (value, setValue, customList, setCustomList, setShow) => {
        const trimmed = value.trim();
        if (!trimmed) return;
        if (!customList.includes(trimmed)) {
            setCustomList([...customList, trimmed]);
        }
        setValue('');
        setShow(false);
    };

    const removeCustom = (customList, setCustomList, value) => {
        setCustomList(customList.filter((x) => x !== value));
    };

    const handleSubmit = () => {
        const profileLabels = PROFILE_OPTIONS
            .filter((opt) => profile.includes(opt.id))
            .map((opt) => opt.label);
        const activityLabels = ACTIVITY_OPTIONS
            .filter((opt) => activities.includes(opt.id))
            .map((opt) => opt.label);

        onSubmit({
            labels: {
                profile: [...profileLabels, ...customProfile],
                activities: [...activityLabels, ...customActivities],
            },
            state: {
                profile,
                activities,
                customProfile,
                customActivities,
            },
        });
    };

    const handleSkip = () => {
        onSubmit({
            labels: { profile: [], activities: [] },
            state: { profile: [], activities: [], customProfile: [], customActivities: [] },
        });
    };

    const chipBaseSx = {
        height: 34,
        px: 0.5,
        fontSize: { xs: '0.8rem', sm: '0.83rem' },
        fontWeight: 600,
        borderRadius: 2,
        transition: 'all 0.18s ease',
        '& .MuiChip-label': { px: 1.3 },
    };

    const renderCustomChip = (label, customList, setCustomList, accentColor) => (
        <Chip
            key={`custom-${label}`}
            label={label}
            onDelete={() => removeCustom(customList, setCustomList, label)}
            sx={{
                ...chipBaseSx,
                backgroundColor: accentColor,
                color: 'white',
                border: `1.5px solid ${accentColor}`,
                boxShadow: `0 2px 8px ${accentColor}40`,
                '& .MuiChip-label': { px: 1.3 },
                '& .MuiChip-deleteIcon': {
                    color: 'rgba(255,255,255,0.85)',
                    '&:hover': { color: 'white' },
                },
            }}
        />
    );

    const renderAddOtherChip = (show, setShow, accentColor) => (
        <Chip
            label={show ? 'Άλλο…' : '+ Άλλο'}
            onClick={() => setShow(!show)}
            variant="outlined"
            sx={{
                ...chipBaseSx,
                backgroundColor: show ? `${accentColor}15` : 'transparent',
                color: accentColor,
                border: `1.5px dashed ${accentColor}`,
                '&:hover': {
                    backgroundColor: `${accentColor}10`,
                    transform: 'translateY(-1px)',
                },
            }}
        />
    );

    return (
        <Dialog
            open={open}
            onClose={() => {}}
            maxWidth="sm"
            fullWidth
            fullScreen={isMobile}
            disableEscapeKeyDown
            scroll="paper"
            // Sit above the page Header (which uses zIndex 1400)
            sx={{ zIndex: 1500 }}
            PaperProps={{
                sx: {
                    borderRadius: isMobile ? 0 : 4,
                    boxShadow: '0 20px 60px rgba(15,27,45,0.25)',
                    // Disable MUI's default flex layout so header/content/actions live in a
                    // single vertical flow that scrolls together (no sticky footer).
                    display: 'block',
                    overflowY: 'auto',
                    // Respect iOS safe area / notch so the modal header isn't hidden behind it
                    pt: { xs: 'env(safe-area-inset-top)', sm: 0 },
                },
            }}
        >
            {/* Header */}
            <DialogTitle
                component="div"
                sx={{
                    background: 'linear-gradient(135deg, #1a6db5 0%, #2d8bd9 100%)',
                    color: 'white',
                    px: { xs: 2.5, sm: 4 },
                    py: { xs: 2.5, sm: 3.5 },
                    pr: { xs: 6, sm: 4 }, // make room for close icon on mobile
                    position: 'relative',
                }}
            >
                <Typography
                    component="div"
                    sx={{
                        fontSize: { xs: '1.05rem', sm: '1.3rem' },
                        fontWeight: 700,
                        lineHeight: 1.3,
                        letterSpacing: '-0.01em',
                    }}
                >
                    Πες μας λίγα πράγματα για εσένα
                </Typography>
                <Typography
                    component="div"
                    sx={{
                        fontSize: { xs: '0.78rem', sm: '0.85rem' },
                        opacity: 0.92,
                        mt: { xs: 0.6, sm: 1 },
                        lineHeight: 1.45,
                    }}
                >
                    Θα εξατομικεύσουμε την περιβαλλοντική ανάλυση σύμφωνα με τις ανάγκες σου. Μπορείς και να το παραλείψεις.
                </Typography>
                <IconButton
                    onClick={handleSkip}
                    aria-label="παράλειψη"
                    sx={{
                        position: 'absolute',
                        right: { xs: 8, sm: 12 },
                        top: { xs: 8, sm: 12 },
                        color: 'white',
                        backgroundColor: 'rgba(255,255,255,0.12)',
                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.22)' },
                    }}
                    size="small"
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>

            {/* Content */}
            <DialogContent
                sx={{
                    px: { xs: 2.5, sm: 4 },
                    pb: { xs: 2, sm: 3.5 },
                    // Let the Paper scroll instead of this inner container, so the footer
                    // scrolls with the content rather than sticking to the bottom.
                    overflow: 'visible',
                    '&.MuiDialogContent-root': {
                        pt: { xs: 3, sm: 4.5 },
                    },
                }}
            >

                {/* Section 1: Profile */}
                <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                    <Stack direction="row" alignItems="center" gap={1.2} sx={{ mb: 0.5 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: { xs: 28, sm: 32 },
                                height: { xs: 28, sm: 32 },
                                borderRadius: '50%',
                                backgroundColor: 'rgba(192,57,43,0.1)',
                                flexShrink: 0,
                            }}
                        >
                            <FavoriteIcon sx={{ color: '#c0392b', fontSize: { xs: '0.95rem', sm: '1.05rem' } }} />
                        </Box>
                        <Typography
                            sx={{
                                fontWeight: 700,
                                color: '#0f1b2d',
                                fontSize: { xs: '0.95rem', sm: '1rem' },
                                letterSpacing: '-0.01em',
                            }}
                        >
                            Χαρακτηριστικά / Υγεία
                        </Typography>
                    </Stack>
                    <Typography
                        sx={{
                            fontSize: { xs: '0.78rem', sm: '0.82rem' },
                            color: '#5a6b80',
                            mb: { xs: 1.5, sm: 2 },
                            ml: { xs: 4.5, sm: 5.2 },
                            lineHeight: 1.5,
                        }}
                    >
                        Επίλεξε όσα ισχύουν για εσένα
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 0.8, sm: 1.2 } }}>
                        {PROFILE_OPTIONS.map((opt) => {
                            const selected = profile.includes(opt.id);
                            return (
                                <Chip
                                    key={opt.id}
                                    label={opt.label}
                                    onClick={() => toggle(profile, setProfile, opt.id)}
                                    sx={{
                                        ...chipBaseSx,
                                        backgroundColor: selected ? '#c0392b' : '#f7fafd',
                                        color: selected ? 'white' : '#2a3a52',
                                        border: `1.5px solid ${selected ? '#c0392b' : 'rgba(15,27,45,0.1)'}`,
                                        boxShadow: selected ? '0 2px 8px rgba(192,57,43,0.25)' : 'none',
                                        '&:hover': {
                                            backgroundColor: selected ? '#a8311f' : '#eef4fb',
                                            transform: 'translateY(-1px)',
                                        },
                                    }}
                                />
                            );
                        })}
                        {customProfile.map((label) =>
                            renderCustomChip(label, customProfile, setCustomProfile, '#c0392b')
                        )}
                        {renderAddOtherChip(showProfileInput, setShowProfileInput, '#c0392b')}
                    </Box>
                    {showProfileInput && (
                        <CustomChipInput
                            accentColor="#c0392b"
                            value={profileInputValue}
                            onChange={setProfileInputValue}
                            onAdd={() => addCustom(profileInputValue, setProfileInputValue, customProfile, setCustomProfile, setShowProfileInput)}
                            placeholder="π.χ. Διαβήτης, Ημικρανίες…"
                            isMobile={isMobile}
                        />
                    )}
                </Box>

                <Divider sx={{ my: { xs: 2, sm: 3 }, borderColor: 'rgba(15,27,45,0.08)' }} />

                {/* Section 2: Activities */}
                <Box>
                    <Stack direction="row" alignItems="center" gap={1.2} sx={{ mb: 0.5 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: { xs: 28, sm: 32 },
                                height: { xs: 28, sm: 32 },
                                borderRadius: '50%',
                                backgroundColor: 'rgba(26,122,60,0.1)',
                                flexShrink: 0,
                            }}
                        >
                            <DirectionsRunIcon sx={{ color: '#1a7a3c', fontSize: { xs: '0.95rem', sm: '1.05rem' } }} />
                        </Box>
                        <Typography
                            sx={{
                                fontWeight: 700,
                                color: '#0f1b2d',
                                fontSize: { xs: '0.95rem', sm: '1rem' },
                                letterSpacing: '-0.01em',
                            }}
                        >
                            Τι σκοπεύεις να κάνεις;
                        </Typography>
                    </Stack>
                    <Typography
                        sx={{
                            fontSize: { xs: '0.78rem', sm: '0.82rem' },
                            color: '#5a6b80',
                            mb: { xs: 1.5, sm: 2 },
                            ml: { xs: 4.5, sm: 5.2 },
                            lineHeight: 1.5,
                        }}
                    >
                        Διάλεξε όσα σε ενδιαφέρουν
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 0.8, sm: 1.2 } }}>
                        {ACTIVITY_OPTIONS.map((opt) => {
                            const selected = activities.includes(opt.id);
                            return (
                                <Chip
                                    key={opt.id}
                                    label={opt.label}
                                    onClick={() => toggle(activities, setActivities, opt.id)}
                                    sx={{
                                        ...chipBaseSx,
                                        backgroundColor: selected ? '#1a7a3c' : '#f7fafd',
                                        color: selected ? 'white' : '#2a3a52',
                                        border: `1.5px solid ${selected ? '#1a7a3c' : 'rgba(15,27,45,0.1)'}`,
                                        boxShadow: selected ? '0 2px 8px rgba(26,122,60,0.25)' : 'none',
                                        '&:hover': {
                                            backgroundColor: selected ? '#146030' : '#eef4fb',
                                            transform: 'translateY(-1px)',
                                        },
                                    }}
                                />
                            );
                        })}
                        {customActivities.map((label) =>
                            renderCustomChip(label, customActivities, setCustomActivities, '#1a7a3c')
                        )}
                        {renderAddOtherChip(showActivityInput, setShowActivityInput, '#1a7a3c')}
                    </Box>
                    {showActivityInput && (
                        <CustomChipInput
                            accentColor="#1a7a3c"
                            value={activityInputValue}
                            onChange={setActivityInputValue}
                            onAdd={() => addCustom(activityInputValue, setActivityInputValue, customActivities, setCustomActivities, setShowActivityInput)}
                            placeholder="π.χ. Κηπουρική, Φωτογραφία…"
                            isMobile={isMobile}
                        />
                    )}
                </Box>
            </DialogContent>

            {/* Actions — flows with the content, not sticky */}
            <DialogActions
                sx={{
                    px: { xs: 2.5, sm: 4 },
                    pt: { xs: 2, sm: 0 },
                    pb: { xs: 2.5, sm: 3.5 },
                    gap: 1,
                }}
            >
                <Button
                    onClick={handleSkip}
                    sx={{
                        color: '#5a6b80',
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: { xs: '0.85rem', sm: '0.9rem' },
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        '&:hover': { backgroundColor: 'rgba(15,27,45,0.04)' },
                    }}
                >
                    Παράλειψη
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disableElevation
                    sx={{
                        backgroundColor: '#1a6db5',
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: { xs: '0.85rem', sm: '0.9rem' },
                        px: { xs: 2.5, sm: 3.5 },
                        py: 1.1,
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(26,109,181,0.3)',
                        '&:hover': {
                            backgroundColor: '#155a96',
                            boxShadow: '0 6px 16px rgba(26,109,181,0.4)',
                        },
                    }}
                >
                    Συνέχεια στον χάρτη
                </Button>
            </DialogActions>
        </Dialog>
    );
}
