import React, { useState, useRef } from 'react';
import { Drawer as MuiDrawer, Box, Typography, ToggleButtonGroup, ToggleButton } from '@mui/material';
import EnergySavingsLeafIcon from '@mui/icons-material/EnergySavingsLeaf';
import AnalysisPanel from './AnalysisPanel';
import ForecastTimeline from './ForecastTimeline';

export default function Drawer({
    isDrawerOpen, isMobile, selectedLocation,
    isLoading, isAiLoading, error, apiData, snapshotData,
    viewMode, setViewMode
}) {
    const [drawerHeight, setDrawerHeight] = useState(isMobile ? 45 : 100);
    const [isDragging, setIsDragging] = useState(false);
    const drawerRef = useRef(null);
    const startYRef = useRef(0);
    const startHeightRef = useRef(0);

    // Handle drag start
    const handleMouseDown = (e) => {
        if (!isMobile) return;
        setIsDragging(true);
        startYRef.current = e.clientY;
        startHeightRef.current = drawerHeight;
    };

    // Handle drag move
    const handleMouseMove = (e) => {
        if (!isDragging || !isMobile) return;

        const delta = startYRef.current - e.clientY; // negative = up, positive = down
        const newHeight = Math.max(25, Math.min(100, startHeightRef.current + (delta / window.innerHeight) * 100));
        setDrawerHeight(newHeight);
    };

    // Handle drag end
    const handleMouseUp = () => {
        setIsDragging(false);

        // Snap to nearest position
        if (drawerHeight > 62) {
            setDrawerHeight(100); // Expand to full
        } else if (drawerHeight < 37) {
            setDrawerHeight(25); // Collapse to minimum
        } else {
            setDrawerHeight(45); // Middle position
        }
    };

    React.useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, drawerHeight]);

    return (
        <MuiDrawer
            anchor={isMobile ? "bottom" : "left"}
            open={isDrawerOpen}
            variant="persistent"
            hideBackdrop={true}
            sx={{
                zIndex: 1200,
                '& .MuiDrawer-paper': {
                    position: 'absolute',
                    boxSizing: 'border-box',
                    overflowX: 'hidden',
                    boxShadow: '-4px 0 16px rgba(15,27,45,0.12)',
                    backgroundColor: 'background.paper',
                    borderRight: '1.5px solid',
                    borderColor: 'rgba(26,109,181,0.15)',
                    transition: isDragging ? 'none' : 'height 0.3s ease-out',
                    ...(isMobile && {
                        boxShadow: '0 -4px 16px rgba(15,27,45,0.12)',
                        borderRight: 'none',
                        borderTop: '1.5px solid',
                        borderColor: 'rgba(26,109,181,0.15)',
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        width: '100%',
                        height: `${drawerHeight}%`,
                        bottom: 0,
                    }),
                    ...(!isMobile && {
                        width: 340,
                        height: '100%',
                        top: 0,
                        left: 0,
                    })
                }
            }}
            ref={drawerRef}
        >
            {/* Drag Handle */}
            {isMobile && (
                <Box
                    onMouseDown={handleMouseDown}
                    onTouchStart={(e) => {
                        setIsDragging(true);
                        startYRef.current = e.touches[0].clientY;
                        startHeightRef.current = drawerHeight;
                    }}
                    onTouchMove={(e) => {
                        if (!isDragging) return;
                        const delta = startYRef.current - e.touches[0].clientY;
                        const newHeight = Math.max(25, Math.min(100, startHeightRef.current + (delta / window.innerHeight) * 100));
                        setDrawerHeight(newHeight);
                    }}
                    onTouchEnd={handleMouseUp}
                    sx={{
                        width: '100%',
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'grab',
                        userSelect: 'none',
                        '&:active': { cursor: 'grabbing' },
                        mb: 1,
                    }}
                >
                    <Box
                        sx={{
                            width: 40,
                            height: 4,
                            backgroundColor: 'rgba(0,0,0,0.2)',
                            borderRadius: 2,
                        }}
                    />
                </Box>
            )}

            <Box sx={{
                width: '100%',
                flex: 1,
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
                overflowY: 'auto',
                overflowX: 'hidden',
                // ✅ Custom scrollbar styling
                '&::-webkit-scrollbar': {
                    width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                    backgroundColor: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(0,0,0,0.15)',
                    borderRadius: '3px',
                },
                // Firefox scrollbar
                scrollbarColor: 'rgba(100,100,100,0.3) transparent',
                scrollbarWidth: 'thin',
            }}>

                <Box mt={0}>
                    {!selectedLocation ? (
                        <Box textAlign="center" mt={isMobile ? 2 : 6}>
                            <EnergySavingsLeafIcon color="primary" sx={{ fontSize: 50, opacity: 0.8 }} />
                            <Typography variant="h6" mt={1} color="text.primary" fontWeight="bold">Καλώς ήρθατε!</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Κάντε κλικ στον χάρτη για να δείτε την ανάλυση.
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            {/* View toggle: Τώρα / Πρόβλεψη */}
                            {setViewMode && (
                                <ToggleButtonGroup
                                    value={viewMode || 'now'}
                                    exclusive
                                    onChange={(_, v) => v && setViewMode(v)}
                                    size="small"
                                    fullWidth
                                    sx={{
                                        mb: 2,
                                        '& .MuiToggleButton-root': {
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            fontSize: '0.85rem',
                                            borderColor: 'rgba(26,109,181,0.25)',
                                            '&.Mui-selected': {
                                                backgroundColor: '#1a6db5',
                                                color: 'white',
                                                '&:hover': { backgroundColor: '#155a96' },
                                            },
                                        },
                                    }}
                                >
                                    <ToggleButton value="now">Τώρα</ToggleButton>
                                    <ToggleButton value="forecast">Πρόβλεψη 24h</ToggleButton>
                                </ToggleButtonGroup>
                            )}

                            {viewMode === 'forecast' ? (
                                <ForecastTimeline
                                    data={apiData}
                                    isLoading={isAiLoading}
                                    error={error}
                                />
                            ) : (
                                <AnalysisPanel
                                    data={apiData ?? snapshotData}
                                    isLoading={isLoading}
                                    isAiLoading={isAiLoading}
                                    error={error}
                                />
                            )}
                        </>
                    )}
                </Box>
            </Box>
        </MuiDrawer>
    );
}
