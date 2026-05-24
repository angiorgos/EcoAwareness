package com.backend.repository;

import com.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * 📦 UserRepository - Επικοινωνία με Database
 *
 * Extends JpaRepository<User, Long> = Παίρνει έτοιμες μεθόδους:
 *   - save() - Αποθήκευση νέου χρήστη
 *   - findById() - Ψάχνει με ID
 *   - delete() - Διαγραφή
 *   - κ.α.
 */
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * CUSTOM method - Ψάχνει χρήστη με Email
     *
     * Το Spring Data JPA φτιάχνει αυτόματα τo SQL query από το όνομα:
     *   SELECT * FROM users WHERE email = ?
     *
     * @param email - To email προς αναζήτηση
     * @return Optional<User> - Μπορεί να υπάρχει ή να μην υπάρχει
     *
     * Χρήση στο Login/Register:
     *   Optional<User> user = userRepository.findByEmail("giorgos@example.com");
     *   if (user.isPresent()) { ... }
     */
    Optional<User> findByEmail(String email);

}