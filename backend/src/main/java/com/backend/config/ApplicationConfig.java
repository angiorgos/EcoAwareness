package com.backend.config;

import com.backend.repository.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * 📋 ApplicationConfig - Ρυθμίσεις Ασφάλειας
 *
 * Αυτή η κλάση δημιουργεί τα βασικά @Bean που χρησιμοποιούνται σε όλο το application
 * για ασφάλεια, κρυπτογράφηση και authentication.
 */
@Configuration
public class ApplicationConfig {

    private final UserRepository userRepository;

    public ApplicationConfig(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * 🔍 UserDetailsService Bean
     *
     * Υπεύθυνο για την αναζήτηση του χρήστη από τη βάση δεδομένων
     *
     * Ροή:
     *   1. Παίρνει το email του χρήστη
     *   2. Ψάχνει στη βάση με το UserRepository
     *   3. Επιστρέφει το User αν υπάρχει
     *   4. Αν δεν υπάρχει → UsernameNotFoundException
     *
     * Χρησιμοποιείται από:
     *   - AuthenticationManager (για έλεγχος credentials στο login)
     */
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Ο χρήστης δεν βρέθηκε"));
    }

    /**
     * 🔐 PasswordEncoder Bean
     *
     * BCryptPasswordEncoder = Στανταρ τρόπος για κρυπτογράφηση κωδικών
     *
     * Χαρακτηριστικά:
     *   ✅ Ένας κωδικός παράγει διαφορετική κρυπτογράφηση κάθε φορά (salt)
     *   ✅ Δεν ξεκωδικοποιούνται ποτέ - μόνο συγκρίνονται
     *   ✅ Γρήγορη επαλήθευση, αργή κρυπτογράφηση (ασφαλής)
     *
     * Παράδειγμα:
     *   plaintext:  "password123"
     *   encrypted:  "$2a$10$H4a.jJ8.5H8.hH8.hH8.hH" (κάθε φορά διαφορετικό!)
     *
     * Χρησιμοποιείται από:
     *   - AuthController.register() (για κρυπτογράφηση νέου κωδικού)
     *   - AuthenticationManager (για σύγκριση κωδικών στο login)
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * 🔑 AuthenticationManager Bean
     *
     * Υπεύθυνο για τον έλεγχο αν email + password είναι σωστά
     *
     * Ροή:
     *   1. Παίρνει email + password
     *   2. Ψάχνει τον χρήστη με UserDetailsService
     *   3. Συγκρίνει τον κωδικό με PasswordEncoder
     *   4. Αν όλα είναι OK → επιστρέφει Authentication object
     *   5. Αν κάτι είναι λάθος → ρίχνει BadCredentialsException
     *
     * Χρησιμοποιείται από:
     *   - AuthController.login() (για έλεγχος των credentials)
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}