package com.backend.service;

import com.backend.model.OpenMeteoForecastResponse;
import com.backend.model.OpenMeteoResponse;
import com.backend.model.SolarResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class SolarService {

    private final RestTemplate restTemplate = new RestTemplate();

    public SolarResponse getSolarIrradiance(double lat, double lon) {
        String url = "https://api.open-meteo.com/v1/forecast?latitude=" + lat
                + "&longitude=" + lon
                + "&current=shortwave_radiation,uv_index"
                + "&daily=sunrise,sunset"
                + "&forecast_days=1&timezone=auto";

        try {
            OpenMeteoResponse response = restTemplate.getForObject(url, OpenMeteoResponse.class);

            if (response != null && response.current() != null) {
                var c = response.current();
                double solarValue = c.shortwaveRadiation() != null ? c.shortwaveRadiation() : 0.0;
                double uv = c.uvIndex() != null ? c.uvIndex() : 0.0;

                String sunrise = extractTime(response.daily() != null ? response.daily().sunrise() : null);
                String sunset  = extractTime(response.daily() != null ? response.daily().sunset()  : null);

                return new SolarResponse(solarValue, "W/m²", uv, sunrise, sunset);
            }
        } catch (Exception e) {
            System.err.println("Solar Service Error: " + e.getMessage());
        }

        return new SolarResponse(0.0, "W/m²", 0.0, "", "");
    }

    /** Παίρνει "2026-05-18T06:42" → "06:42". Επιστρέφει κενό αν λίστα κενή/null. */
    private String extractTime(List<String> isoList) {
        if (isoList == null || isoList.isEmpty() || isoList.get(0) == null) return "";
        String iso = isoList.get(0);
        return iso.length() >= 16 ? iso.substring(11, 16) : iso;
    }

    /**
     * Hourly forecast UV index + ηλιακής ακτινοβολίας για επόμενες ~48 ώρες.
     * Επιστρέφει παράλληλους πίνακες (time[], uvIndex[], shortwaveRadiation[]).
     */
    public OpenMeteoForecastResponse.Hourly getForecast(double lat, double lon) {
        String url = "https://api.open-meteo.com/v1/forecast?latitude=" + lat
                + "&longitude=" + lon
                + "&hourly=uv_index,shortwave_radiation&forecast_days=2&timezone=auto";

        try {
            OpenMeteoForecastResponse response = restTemplate.getForObject(url, OpenMeteoForecastResponse.class);
            if (response != null && response.hourly() != null) {
                return response.hourly();
            }
        } catch (Exception e) {
            System.err.println("Solar Forecast Error: " + e.getMessage());
        }
        return new OpenMeteoForecastResponse.Hourly(List.of(), List.of(), List.of());
    }
}