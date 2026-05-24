package com.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * Raw response από air-quality-api.open-meteo.com/v1/air-quality.
 * Παρόμοιο pattern με το OpenMeteoWeatherResponse — current ή hourly ή και τα δύο.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record OpenMeteoAirQualityResponse(
        Current current,
        Hourly hourly
) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Current(
            String time,
            @JsonProperty("european_aqi") Integer europeanAqi,
            @JsonProperty("pm2_5") Double pm25,
            Double pm10,
            @JsonProperty("nitrogen_dioxide") Double no2,
            Double ozone
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Hourly(
            List<String> time,
            @JsonProperty("european_aqi") List<Integer> europeanAqi,
            @JsonProperty("pm2_5") List<Double> pm25,
            List<Double> pm10,
            @JsonProperty("nitrogen_dioxide") List<Double> no2,
            List<Double> ozone
    ) {}
}