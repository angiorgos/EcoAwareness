package com.backend.service;

import com.backend.model.OpenMeteoWeatherResponse;
import com.backend.model.WeatherResponse;
import com.backend.util.WeatherCodeMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

/**
 * Weather data μέσω Open-Meteo (api.open-meteo.com).
 * Δωρεάν, χωρίς API key. Δεν χρησιμοποιεί AI για μετάφραση — το WeatherCodeMapper
 * δίνει ελληνικές περιγραφές απευθείας από τους WMO κωδικούς.
 */
@Service
public class WeatherService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final GeocodingService geocodingService;

    public WeatherService(GeocodingService geocodingService) {
        this.geocodingService = geocodingService;
    }

    public WeatherResponse getCurrentWeather(double lat, double lon) {
        String url = "https://api.open-meteo.com/v1/forecast?latitude=" + lat
                + "&longitude=" + lon
                + "&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code"
                + "&timezone=auto&wind_speed_unit=kmh";

        try {
            OpenMeteoWeatherResponse response = restTemplate.getForObject(url, OpenMeteoWeatherResponse.class);
            if (response != null && response.current() != null) {
                var c = response.current();
                String description = WeatherCodeMapper.toGreek(c.weatherCode());

                // Open-Meteo με timezone=auto γυρνά "2026-05-18T21:45" σε τοπική ώρα.
                String localTime = (c.time() != null && c.time().length() >= 16)
                        ? c.time().substring(11, 16)   // "HH:mm"
                        : "";

                String cityName = geocodingService.getCityName(lat, lon);

                return new WeatherResponse(
                        cityName,
                        c.temperature() != null ? c.temperature() : 0.0,
                        "°C",
                        c.humidity() != null ? c.humidity() : 0,
                        "%",
                        c.windSpeed() != null ? c.windSpeed() : 0.0,
                        "km/h",
                        description,
                        localTime,
                        "Open-Meteo"
                );
            }
        } catch (Exception e) {
            System.err.println("Weather Service Error: " + e.getMessage());
        }
        return new WeatherResponse("Error", 0.0, "", 0.0, "", 0.0, "", "", "", "");
    }

    /**
     * Hourly forecast για επόμενες 48 ώρες (παράλληλοι πίνακες time[], temperature[], ...).
     * Ο caller στο MainController παίρνει κάθε 3η ώρα για να φτιάξει 8 slots × 3h = 24h.
     */
    public OpenMeteoWeatherResponse.Hourly getForecast(double lat, double lon) {
        String url = "https://api.open-meteo.com/v1/forecast?latitude=" + lat
                + "&longitude=" + lon
                + "&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code"
                + "&forecast_days=2&wind_speed_unit=kmh&timezone=auto";

        try {
            OpenMeteoWeatherResponse response = restTemplate.getForObject(url, OpenMeteoWeatherResponse.class);
            if (response != null && response.hourly() != null) {
                return response.hourly();
            }
        } catch (Exception e) {
            System.err.println("Weather Forecast Error: " + e.getMessage());
        }
        return new OpenMeteoWeatherResponse.Hourly(List.of(), List.of(), List.of(), List.of(), List.of());
    }
}