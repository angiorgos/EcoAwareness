package com.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * Raw response από το Open-Meteo /v1/forecast endpoint όταν ζητάμε
 * hourly=uv_index,shortwave_radiation. Παράλληλοι πίνακες:
 * το time[i] αντιστοιχεί στο uvIndex[i] και shortwaveRadiation[i].
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record OpenMeteoForecastResponse(Hourly hourly) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Hourly(
            List<String> time,                                  // ISO 8601 "yyyy-MM-ddTHH:mm"
            @JsonProperty("uv_index") List<Double> uvIndex,
            @JsonProperty("shortwave_radiation") List<Double> shortwaveRadiation
    ) {}
}