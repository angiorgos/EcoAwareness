package com.backend.util;

import java.util.Map;

/**
 * Μετατρέπει WMO weather codes του Open-Meteo σε ελληνικές περιγραφές.
 * Αντικαθιστά την προηγούμενη AI translation κλήση — εκμηδενίζει 1 LLM call ανά request.
 * Αναφορά WMO codes: https://open-meteo.com/en/docs
 */
public final class WeatherCodeMapper {

    private WeatherCodeMapper() {}

    private static final Map<Integer, String> CODE_TO_GREEK = Map.ofEntries(
            Map.entry(0,  "Καθαρός ουρανός"),
            Map.entry(1,  "Σχεδόν καθαρός"),
            Map.entry(2,  "Μερικώς συννεφιασμένος"),
            Map.entry(3,  "Συννεφιασμένος"),
            Map.entry(45, "Ομίχλη"),
            Map.entry(48, "Παγωμένη ομίχλη"),
            Map.entry(51, "Ελαφρό ψιχάλισμα"),
            Map.entry(53, "Μέτριο ψιχάλισμα"),
            Map.entry(55, "Έντονο ψιχάλισμα"),
            Map.entry(56, "Ελαφρό παγωμένο ψιχάλισμα"),
            Map.entry(57, "Έντονο παγωμένο ψιχάλισμα"),
            Map.entry(61, "Ελαφρά βροχή"),
            Map.entry(63, "Μέτρια βροχή"),
            Map.entry(65, "Δυνατή βροχή"),
            Map.entry(66, "Ελαφρά παγωμένη βροχή"),
            Map.entry(67, "Δυνατή παγωμένη βροχή"),
            Map.entry(71, "Ελαφρό χιόνι"),
            Map.entry(73, "Μέτριο χιόνι"),
            Map.entry(75, "Δυνατό χιόνι"),
            Map.entry(77, "Χιονοκόκκοι"),
            Map.entry(80, "Ασθενείς μπόρες"),
            Map.entry(81, "Μέτριες μπόρες"),
            Map.entry(82, "Σφοδρές μπόρες"),
            Map.entry(85, "Ελαφρές χιονοπτώσεις"),
            Map.entry(86, "Δυνατές χιονοπτώσεις"),
            Map.entry(95, "Καταιγίδα"),
            Map.entry(96, "Καταιγίδα με χαλάζι"),
            Map.entry(99, "Σφοδρή καταιγίδα με χαλάζι")
    );

    public static String toGreek(Integer code) {
        if (code == null) return "Άγνωστος καιρός";
        return CODE_TO_GREEK.getOrDefault(code, "Άγνωστος καιρός");
    }
}