package com.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * Raw response από api.open-meteo.com/v1/forecast.
 * Ανάλογα με τα query params, μπορεί να γεμίσει είτε το current είτε το hourly (ή και τα δύο).
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record OpenMeteoWeatherResponse(
        String timezone,
        Current current,
        Hourly hourly
) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Current(
            String time,                                              // π.χ. "2026-05-18T21:45"
            @JsonProperty("temperature_2m") Double temperature,
            @JsonProperty("relative_humidity_2m") Integer humidity,
            @JsonProperty("wind_speed_10m") Double windSpeed,
            @JsonProperty("weather_code") Integer weatherCode
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Hourly(
            List<String> time,
            @JsonProperty("temperature_2m") List<Double> temperature,
            @JsonProperty("relative_humidity_2m") List<Integer> humidity,
            @JsonProperty("wind_speed_10m") List<Double> windSpeed,
            @JsonProperty("weather_code") List<Integer> weatherCode
    ) {}
}