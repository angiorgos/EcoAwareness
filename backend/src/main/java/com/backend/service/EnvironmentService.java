package com.backend.service;

import com.backend.model.AirQualityResponse;
import com.backend.model.BestTimeAiOutput;
import com.backend.model.BestTimeResponse;
import com.backend.model.ForecastSlot;
import com.backend.model.FullResponse;
import com.backend.model.OpenMeteoAirQualityResponse;
import com.backend.model.OpenMeteoForecastResponse;
import com.backend.model.OpenMeteoWeatherResponse;
import com.backend.model.SolarResponse;
import com.backend.model.UserPreferences;
import com.backend.model.WeatherResponse;
import com.backend.util.WeatherCodeMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Ορχηστρωτής service για τα composite environment endpoints. Συντονίζει
 * παράλληλες κλήσεις στα WeatherService/AirQualityService/SolarService,
 * ευθυγραμμίζει τα ωριαία forecasts σε λίστα ForecastSlot, και (για το
 * best-time) καλεί το AiService με structured output.
 */
@Service
public class EnvironmentService {

    private final WeatherService weatherService;
    private final AirQualityService airQualityService;
    private final SolarService solarService;
    private final AiService aiService;

    public EnvironmentService(WeatherService weatherService,
                              AirQualityService airQualityService,
                              SolarService solarService,
                              AiService aiService) {
        this.weatherService = weatherService;
        this.airQualityService = airQualityService;
        this.solarService = solarService;
        this.aiService = aiService;
    }

    /**
     * Γρήγορο snapshot — 3 παράλληλες κλήσεις (current weather/AQ/solar), χωρίς AI.
     */
    public FullResponse getSnapshot(double lat, double lon) {
        CompletableFuture<WeatherResponse> weather =
                CompletableFuture.supplyAsync(() -> weatherService.getCurrentWeather(lat, lon));
        CompletableFuture<AirQualityResponse> aq =
                CompletableFuture.supplyAsync(() -> airQualityService.getAirQuality(lat, lon));
        CompletableFuture<SolarResponse> solar =
                CompletableFuture.supplyAsync(() -> solarService.getSolarIrradiance(lat, lon));

        CompletableFuture.allOf(weather, aq, solar).join();

        return new FullResponse(weather.join(), aq.join(), solar.join(), null);
    }

    /**
     * Best-time — 6 παράλληλες κλήσεις (3 current + 3 forecast) + 1 LLM call με structured output.
     */
    public BestTimeResponse getBestTime(double lat, double lon, UserPreferences preferences) {
        UserPreferences prefs = preferences != null
                ? preferences
                : new UserPreferences(List.of(), List.of());

        CompletableFuture<WeatherResponse> currentWeather =
                CompletableFuture.supplyAsync(() -> weatherService.getCurrentWeather(lat, lon));
        CompletableFuture<AirQualityResponse> currentAq =
                CompletableFuture.supplyAsync(() -> airQualityService.getAirQuality(lat, lon));
        CompletableFuture<SolarResponse> currentSolar =
                CompletableFuture.supplyAsync(() -> solarService.getSolarIrradiance(lat, lon));
        CompletableFuture<OpenMeteoWeatherResponse.Hourly> weatherFc =
                CompletableFuture.supplyAsync(() -> weatherService.getForecast(lat, lon));
        CompletableFuture<OpenMeteoAirQualityResponse.Hourly> aqFc =
                CompletableFuture.supplyAsync(() -> airQualityService.getForecast(lat, lon));
        CompletableFuture<OpenMeteoForecastResponse.Hourly> solarFc =
                CompletableFuture.supplyAsync(() -> solarService.getForecast(lat, lon));

        CompletableFuture.allOf(currentWeather, currentAq, currentSolar, weatherFc, aqFc, solarFc).join();

        List<ForecastSlot> slots = assembleSlots(weatherFc.join(), aqFc.join(), solarFc.join());

        WeatherResponse current = currentWeather.join();
        AirQualityResponse aqNow = currentAq.join();
        SolarResponse solarNow = currentSolar.join();

        BestTimeAiOutput ai = aiService.getBestTime(current, aqNow, solarNow, slots, prefs);

        return new BestTimeResponse(
                current,
                aqNow,
                solarNow,
                ai.currentAnalysis(),
                current.cityName(),
                ai.verdict(),
                ai.bestSlot(),
                ai.alternativeSlot(),
                ai.explanation(),
                slots
        );
    }

    /**
     * Ευθυγραμμίζει τα δεδομένα των 3 Open-Meteo πηγών σε ενιαία λίστα ForecastSlot.
     * Όλες οι 3 πηγές γυρνούν ωριαία δεδομένα σε παράλληλους πίνακες (timezone=auto, ίδια ζώνη).
     * Παίρνουμε 8 slots ξεκινώντας από την επόμενη ώρα, ανά 3ωρα (24h ορίζοντας).
     */
    List<ForecastSlot> assembleSlots(
            OpenMeteoWeatherResponse.Hourly weather,
            OpenMeteoAirQualityResponse.Hourly aq,
            OpenMeteoForecastResponse.Hourly solar) {

        if (weather == null || weather.time() == null || weather.time().isEmpty()) return List.of();

        // Βρες τον δείκτη της πρώτης ώρας ≥ "τώρα" (string comparison σε ISO 8601 δουλεύει).
        String nowIso = LocalDateTime.now().truncatedTo(ChronoUnit.HOURS)
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm"));
        int startIdx = 0;
        for (int i = 0; i < weather.time().size(); i++) {
            if (weather.time().get(i).compareTo(nowIso) >= 0) { startIdx = i; break; }
        }

        List<ForecastSlot> result = new ArrayList<>();
        for (int slotNum = 0; slotNum < 8; slotNum++) {
            int wIdx = startIdx + slotNum * 3;
            if (wIdx >= weather.time().size()) break;

            String timestamp = weather.time().get(wIdx);
            String displayTime = timestamp.length() >= 16 ? timestamp.substring(11, 16) : "";

            // Ταιριάζουμε δείκτες ανά timestamp string (όλες οι πηγές χρησιμοποιούν timezone=auto).
            int aqIdx = (aq != null && aq.time() != null) ? aq.time().indexOf(timestamp) : -1;
            int sIdx  = (solar != null && solar.time() != null) ? solar.time().indexOf(timestamp) : -1;

            result.add(new ForecastSlot(
                    timestamp,
                    displayTime,
                    pickD(weather.temperature(), wIdx),
                    pickI(weather.humidity(), wIdx),
                    pickD(weather.windSpeed(), wIdx),
                    WeatherCodeMapper.toGreek(pickI(weather.weatherCode(), wIdx)),
                    aqIdx >= 0 ? pickI(aq.europeanAqi(), aqIdx) : 0,
                    aqIdx >= 0 ? pickD(aq.pm25(), aqIdx) : 0.0,
                    aqIdx >= 0 ? pickD(aq.pm10(), aqIdx) : 0.0,
                    aqIdx >= 0 ? pickD(aq.no2(), aqIdx) : 0.0,
                    aqIdx >= 0 ? pickD(aq.ozone(), aqIdx) : 0.0,
                    sIdx  >= 0 ? pickD(solar.uvIndex(), sIdx) : 0.0,
                    sIdx  >= 0 ? pickD(solar.shortwaveRadiation(), sIdx) : 0.0
            ));
        }
        return result;
    }

    private static double pickD(List<Double> list, int idx) {
        if (list == null || idx < 0 || idx >= list.size() || list.get(idx) == null) return 0.0;
        return list.get(idx);
    }

    private static int pickI(List<Integer> list, int idx) {
        if (list == null || idx < 0 || idx >= list.size() || list.get(idx) == null) return 0;
        return list.get(idx);
    }
}
