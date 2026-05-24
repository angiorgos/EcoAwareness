package com.backend.model;

/**
 * Internal record — αυτό που ΖΗΤΑΜΕ από το LLM να γεμίσει (Spring AI structured output).
 * Δεν εκτίθεται απευθείας στο frontend· τα πεδία του copy-άρονται στο BestTimeResponse
 * μαζί με τα slots.
 *
 * Σημείωση: ΔΕΝ ζητάμε "currentStatus" από το LLM εδώ. Η περιγραφή του «τώρα» γίνεται
 * αποκλειστικά από το /full-analysis endpoint, ώστε να μην υπάρχει διπλή (και πιθανώς
 * αντιφατική) αξιολόγηση των τωρινών συνθηκών μεταξύ των δύο views.
 */
public record BestTimeAiOutput(
        String currentAnalysis,    // long-form περιγραφή τωρινών συνθηκών (όπως η /full-analysis)
        String verdict,            // "GO_NOW" | "WAIT" | "AVOID_TODAY"
        String bestSlot,           // π.χ. "07:00-10:00" (κενό αν GO_NOW/AVOID_TODAY)
        String alternativeSlot,    // πιθανώς κενό
        String explanation         // 1-2 προτάσεις: ΓΙΑΤΙ αυτό το verdict (forward-looking)
) {}
