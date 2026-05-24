package com.backend.service;

import com.backend.model.AirQualityResponse;
import com.backend.model.OpenMeteoAirQualityResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/**
 * Air quality data μέσω Open-Meteo (air-quality-api.open-meteo.com).
 * Δωρεάν, χωρίς API key. Χρησιμοποιεί European AQI (κλίμακα 0-100+) αντί
 * της OpenWeather 1-5 κλίμακας. Τα WHO thresholds για τους ρύπους
 * (PM2.5/PM10/NO₂/O₃) μένουν ίδια — είναι απόλυτες τιμές μ/m³.
 */
@Service
public class AirQualityService {

    private final RestTemplate restTemplate = new RestTemplate();

    // WHO / EPA όρια (μg/m³) — ίδια με πριν, ανεξάρτητα από πάροχο
    private static final double PM2_5_GOOD = 12;
    private static final double PM2_5_MODERATE = 35.4;
    private static final double PM2_5_POOR = 55.4;

    private static final double PM10_GOOD = 54;
    private static final double PM10_MODERATE = 154;
    private static final double PM10_POOR = 254;

    private static final double NO2_GOOD = 40;
    private static final double NO2_MODERATE = 100;
    private static final double NO2_POOR = 200;

    private static final double O3_GOOD = 100;
    private static final double O3_MODERATE = 200;
    private static final double O3_POOR = 300;

    private String getStatus(double value, double good, double moderate, double poor) {
        if (value <= good)      return "GOOD";
        if (value <= moderate)  return "MODERATE";
        if (value <= poor)      return "POOR";
        return "VERY_POOR";
    }

    /**
     * Μετατροπή European AQI σε ένα από τα 6 official status labels του CAMS.
     * Πηγή κλίμακας: European Environment Agency (EEA) / Copernicus Atmosphere Monitoring Service.
     * Η κλίμακα ΔΕΝ είναι ίδια με την US EPA AQI (0-500) — εδώ 0-100+ με διαφορετικά thresholds.
     */
    private String getAqiStatus(int europeanAqi) {
        if (europeanAqi <= 20)  return "GOOD";            // 0-20:   Καλό
        if (europeanAqi <= 40)  return "FAIR";            // 20-40:  Ικανοποιητικό
        if (europeanAqi <= 60)  return "MODERATE";        // 40-60:  Μέτριο
        if (europeanAqi <= 80)  return "POOR";            // 60-80:  Κακό
        if (europeanAqi <= 100) return "VERY_POOR";       // 80-100: Πολύ Κακό
        return "EXTREMELY_POOR";                          // >100:   Εξαιρετικά Κακό
    }

    public AirQualityResponse getAirQuality(double lat, double lon) {
        String url = "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=" + lat
                + "&longitude=" + lon
                + "&current=european_aqi,pm2_5,pm10,nitrogen_dioxide,ozone";

        try {
            OpenMeteoAirQualityResponse response = restTemplate.getForObject(url, OpenMeteoAirQualityResponse.class);
            if (response != null && response.current() != null) {
                var c = response.current();
                int aqi = c.europeanAqi() != null ? c.europeanAqi() : 0;
                double pm25 = c.pm25() != null ? c.pm25() : 0.0;
                double pm10 = c.pm10() != null ? c.pm10() : 0.0;
                double no2 = c.no2() != null ? c.no2() : 0.0;
                double o3 = c.ozone() != null ? c.ozone() : 0.0;

                return new AirQualityResponse(
                        aqi, o3, no2, pm25, pm10,
                        getAqiStatus(aqi),
                        getStatus(pm25, PM2_5_GOOD, PM2_5_MODERATE, PM2_5_POOR),
                        getStatus(pm10, PM10_GOOD, PM10_MODERATE, PM10_POOR),
                        getStatus(no2, NO2_GOOD, NO2_MODERATE, NO2_POOR),
                        getStatus(o3, O3_GOOD, O3_MODERATE, O3_POOR),
                        "Open-Meteo"
                );
            }
        } catch (Exception e) {
            System.err.println("AirQuality Service Error: " + e.getMessage());
        }
        return new AirQualityResponse(0, 0.0, 0.0, 0.0, 0.0,
                "UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN", "Error");
    }

    /**
     * Hourly forecast για επόμενες ~48 ώρες.
     * Επιστρέφει τους παράλληλους πίνακες του Open-Meteo για περαιτέρω επεξεργασία.
     */
    public OpenMeteoAirQualityResponse.Hourly getForecast(double lat, double lon) {
        String url = "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=" + lat
                + "&longitude=" + lon
                + "&hourly=european_aqi,pm2_5,pm10,nitrogen_dioxide,ozone&forecast_days=2&timezone=auto";

        try {
            OpenMeteoAirQualityResponse response = restTemplate.getForObject(url, OpenMeteoAirQualityResponse.class);
            if (response != null && response.hourly() != null) {
                return response.hourly();
            }
        } catch (Exception e) {
            System.err.println("AirQuality Forecast Error: " + e.getMessage());
        }
        return new OpenMeteoAirQualityResponse.Hourly(
                java.util.List.of(), java.util.List.of(), java.util.List.of(),
                java.util.List.of(), java.util.List.of(), java.util.List.of()
        );
    }
}