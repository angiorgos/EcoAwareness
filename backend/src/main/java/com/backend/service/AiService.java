package com.backend.service;

import com.backend.model.AirQualityResponse;
import com.backend.model.BestTimeAiOutput;
import com.backend.model.ForecastSlot;
import com.backend.model.SolarResponse;
import com.backend.model.UserPreferences;
import com.backend.model.WeatherResponse;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AiService {

    private final ChatClient chatClient;

    // Το Spring Boot κάνει αυτόματα inject το ChatClient.Builder
    public AiService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    /**
     * Στέλνει το prompt στο AI και επιστρέφει το κείμενο της απάντησης.
     */
    public String getAnalysis(String prompt) {
        try {
            return chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();
        } catch (Exception e) {
            // Αν πέσει το API του AI (π.χ. timeout), επιστρέφουμε ένα default μήνυμα
            // για να μην κρασάρει το endpoint σου.
            return "Τα δεδομένα συγκεντρώθηκαν επιτυχώς, αλλά ο AI βοηθός δεν είναι διαθέσιμος αυτή τη στιγμή. (Σφάλμα: " + e.getMessage() + ")";
        }
    }

    /**
     * Best-time recommendation. Παίρνει τα τωρινά δεδομένα + forecast 24h + προτιμήσεις χρήστη
     * και ζητάει από το Gemini μια δομημένη απάντηση μέσω Spring AI structured output:
     * το ChatClient.entity(...) παράγει JSON schema από το record και ζητάει από το LLM
     * να απαντήσει σε αυτή τη μορφή, μετά την μαπάρει αυτόματα σε BestTimeResponse.
     */
    public BestTimeAiOutput getBestTime(WeatherResponse current,
                                        AirQualityResponse currentAq,
                                        SolarResponse currentSolar,
                                        List<ForecastSlot> forecast,
                                        UserPreferences preferences) {
        try {
            String prompt = buildBestTimePrompt(current, currentAq, currentSolar, forecast, preferences);
            return chatClient.prompt()
                    .user(prompt)
                    .call()
                    .entity(BestTimeAiOutput.class);
        } catch (Exception e) {
            System.err.println("BestTime AI Error: " + e.getMessage());
            return new BestTimeAiOutput(
                    "Δεν είναι δυνατή η ανάλυση αυτή τη στιγμή.",
                    "UNKNOWN",
                    "",
                    "",
                    "Ο AI βοηθός δεν είναι διαθέσιμος. Δοκίμασε ξανά σε λίγο."
            );
        }
    }

    /**
     * Μετατροπή του εσωτερικού status code σε ελληνική περιγραφή που να μην παρερμηνεύεται
     * από το LLM (π.χ. "FAIR" → "Ικανοποιητικό", όχι "Μέτριο").
     */
    private String aqiStatusGreek(String status) {
        return switch (status) {
            case "GOOD"            -> "Καλό";
            case "FAIR"            -> "Ικανοποιητικό";
            case "MODERATE"        -> "Μέτριο";
            case "POOR"            -> "Κακό";
            case "VERY_POOR"       -> "Πολύ Κακό";
            case "EXTREMELY_POOR"  -> "Εξαιρετικά Κακό";
            default                -> "Άγνωστο";
        };
    }

    private String buildBestTimePrompt(WeatherResponse current,
                                       AirQualityResponse currentAq,
                                       SolarResponse currentSolar,
                                       List<ForecastSlot> forecast,
                                       UserPreferences preferences) {

        String profileText = (preferences != null && !preferences.profile().isEmpty())
                ? String.join(", ", preferences.profile())
                : "Δεν δόθηκαν ειδικά χαρακτηριστικά.";
        String activitiesText = (preferences != null && !preferences.activities().isEmpty())
                ? String.join(", ", preferences.activities())
                : "Δεν δόθηκαν συγκεκριμένες δραστηριότητες.";

        StringBuilder forecastTable = new StringBuilder();
        forecastTable.append("Ώρα   | Θερμ | Υγρ | Άνεμος | Καιρός | AQI | PM2.5 | PM10 | NO₂ | O₃  | UV  | Ηλιακή\n");
        for (var s : forecast) {
            forecastTable.append(String.format(
                    "%s | %4.1f | %3d | %5.1f  | %s | %3d | %5.1f | %4.1f | %3.0f | %3.0f | %3.1f | %4.0f%n",
                    s.localTime(), s.temp(), s.humidity(), s.windSpeed(),
                    s.description(), s.aqi(), s.pm25(), s.pm10(),
                    s.no2(), s.o3(), s.uvIndex(), s.solarRadiation()
            ));
        }

        return String.format("""
                Είσαι αναλυτής περιβαλλοντικών συνθηκών. Παράγεις ΔΥΟ συνδεδεμένα αποτελέσματα
                σε μία απάντηση, εγγυώντας ότι δεν θα αλληλοαντικρούονται:

                  (α) currentAnalysis: περιγραφή ΤΩΡΙΝΩΝ συνθηκών εστιασμένη στον χρήστη.
                  (β) verdict + bestSlot + explanation: πρόταση ΓΙΑ ΤΟ ΜΕΛΛΟΝ (πότε να βγει).

                ΠΡΟΦΙΛ ΧΡΗΣΤΗ: %s
                ΣΧΕΔΙΑΖΟΜΕΝΕΣ ΔΡΑΣΤΗΡΙΟΤΗΤΕΣ: %s

                ΤΩΡΑ (%s, %s):
                - Θερμοκρασία: %.1f°C, Υγρασία: %.0f%%, Άνεμος: %.1f km/h, %s
                - AQI (European): %d (%s), PM2.5: %.1f, PM10: %.1f, NO₂: %.0f, O₃: %.0f
                - Ηλιακή ακτινοβολία: %.0f W/m², UV Index: %.1f
                - Ανατολή ηλίου: %s, Δύση ηλίου: %s

                ΠΡΟΒΛΕΨΗ ΕΠΟΜΕΝΩΝ 24 ΩΡΩΝ (8 παράθυρα ανά 3ωρο):
                %s

                ΟΔΗΓΙΕΣ:

                1. currentAnalysis (3-5 προτάσεις, αυστηρά κάτω από 80 λέξεις):
                   Περιγραφή των ΤΩΡΙΝΩΝ συνθηκών εξατομικευμένη στο προφίλ/δραστηριότητες.
                   Π.χ. για άσθμα + τρέξιμο: σχολίασε την ποιότητα αέρα και την θερμοκρασία.
                   ΧΩΡΙΣ προλόγους, χωρίς bullets, κατευθείαν τελικό κείμενο.

                2. verdict (ένα από τρία — ΣΥΝΕΠΕΣ με την currentAnalysis):
                   - "GO_NOW" → οι ΤΩΡΙΝΕΣ συνθήκες είναι ικανοποιητικές για τη δραστηριότητα.
                     Αυτό είναι το default. Αν η currentAnalysis είναι θετική, το verdict ΠΡΕΠΕΙ
                     να είναι GO_NOW.
                   - "WAIT" → οι τωρινές συνθήκες ΔΕΝ είναι ιδανικές, ΑΛΛΑ μέσα στο 24ωρο
                     υπάρχει σαφώς καλύτερο παράθυρο. Αν διαλέξεις WAIT, η currentAnalysis
                     ΠΡΕΠΕΙ να αναφέρει πρόβλημα (όχι «ιδανικές»).
                   - "AVOID_TODAY" → όλη η μέρα είναι προβληματική για τον συγκεκριμένο χρήστη.

                3. bestSlot: μόνο για WAIT, μορφή "HH:mm-HH:mm". Κενό αλλιώς.
                4. alternativeSlot: μόνο για WAIT, δεύτερο καλύτερο. Κενό αλλιώς.

                5. explanation (1-2 προτάσεις, FORWARD-LOOKING):
                   Εξήγηση γιατί αυτό το verdict — με αναφορά στα δεδομένα του ΜΕΛΛΟΝΤΟΣ
                   (ή στο γιατί δεν αξίζει να περιμένεις, αν GO_NOW). ΟΧΙ επανάληψη της
                   currentAnalysis. Π.χ. για WAIT: «Στις 18:00 το UV πέφτει στο 1.2 και η
                   θερμοκρασία στους 22°C — πολύ καλύτερα για το παιδί.» Για GO_NOW: «Η μέρα
                   παραμένει σταθερή — δεν αξίζει να περιμένεις, οι συνθήκες ήδη ταιριάζουν.»

                Απάντησε ΜΟΝΟ στη ζητούμενη δομημένη μορφή. Όλα τα κείμενα στα Ελληνικά.
                """,
                profileText,
                activitiesText,
                current.cityName(), current.localTime(),
                current.temperature(), current.humidity(), current.windSpeed(), current.description(),
                currentAq.aqi(), aqiStatusGreek(currentAq.aqi_status()),
                currentAq.pm2_5(), currentAq.pm10(), currentAq.no2(), currentAq.o3(),
                currentSolar.value(), currentSolar.uvIndex(),
                currentSolar.sunrise(), currentSolar.sunset(),
                forecastTable
        );
    }
}
