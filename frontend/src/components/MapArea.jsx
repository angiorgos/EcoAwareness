import React, { useRef, useEffect } from 'react';
import { MapContainer, TileLayer, ZoomControl, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

// Custom CSS για το Leaflet popup styling
const popupStyles = `
    .leaflet-popup-content-wrapper {
        background: linear-gradient(135deg, #f5f9ff 0%, #e8eff7 100%) !important;
        border-radius: 8px !important;
        box-shadow: 0 4px 12px rgba(26, 109, 181, 0.25) !important;
        border: 1px solid rgba(26, 109, 181, 0.15) !important;
    }
    .leaflet-popup-tip {
        background: #e8eff7 !important;
        border-top: 1px solid rgba(26, 109, 181, 0.15) !important;
    }
`;



export default function MapArea({ selectedLocation, onMapClick, showSelectLocationPrompt, onReopenPreferences }) {
    const markerRef = useRef(null);

    useEffect(() => {
        if (markerRef.current && selectedLocation) {
            markerRef.current.openPopup();
        }
    }, [selectedLocation]);

    const MapInteractionHandler = () => {
        useMapEvents({ click(e) { onMapClick(e.latlng); } });
        return null;
    };

    return (
        <div style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}>
            <style>{popupStyles}</style>
            {showSelectLocationPrompt && (
                <div style={{
                    position: 'absolute',
                    top: 16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1000,
                    backgroundColor: 'rgba(26,109,181,0.96)',
                    color: 'white',
                    padding: '10px 18px',
                    borderRadius: 999,
                    boxShadow: '0 4px 14px rgba(15,27,45,0.25)',
                    fontFamily: 'sans-serif',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    maxWidth: '90%',
                }}>
                    <span style={{ fontSize: '1rem' }}>📍</span>
                    <span>Κάνε κλικ σε ένα σημείο του χάρτη για ανάλυση</span>
                    {onReopenPreferences && (
                        <button
                            onClick={onReopenPreferences}
                            style={{
                                marginLeft: 8,
                                backgroundColor: 'rgba(255,255,255,0.18)',
                                border: '1px solid rgba(255,255,255,0.4)',
                                color: 'white',
                                padding: '4px 10px',
                                borderRadius: 999,
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                            title="Άλλαξε προτιμήσεις"
                        >
                            Προτιμήσεις
                        </button>
                    )}
                </div>
            )}
            <MapContainer center={[40.6401, 22.9444]} zoom={13} zoomControl={false} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <ZoomControl position="bottomright" />
                <MapInteractionHandler />

                {selectedLocation && (
                    <Marker position={selectedLocation} ref={markerRef}>
                        <Popup minWidth={140}>
                            <div style={{
                                fontFamily: 'sans-serif',
                                padding: '10px 12px',
                                textAlign: 'center',
                                background: 'linear-gradient(135deg, #f5f9ff 0%, #e8eff7 100%)',
                                borderRadius: '8px'
                            }}>
                                <div style={{ fontSize: '1.2rem', marginBottom: 8, lineHeight: 1 }}>📍</div>
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: '#1a6db5',
                                    marginBottom: 5,
                                    fontFamily: 'monospace',
                                    fontWeight: 700,
                                    letterSpacing: '0.5px'
                                }}>
                                    {selectedLocation.lat.toFixed(5)}
                                </div>
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: '#1a6db5',
                                    fontFamily: 'monospace',
                                    fontWeight: 700,
                                    letterSpacing: '0.5px'
                                }}>
                                    {selectedLocation.lng.toFixed(5)}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                )}
            </MapContainer>
        </div>
    );
}
