# Eco-Awareness Web App

> *Η πόλη σου, διαφανής.* Εξατομικευμένη περιβαλλοντική ανάλυση τοποθεσίας - από νούμερα σε αποφάσεις.

Διαδραστική web εφαρμογή που μετατρέπει ωμά περιβαλλοντικά δεδομένα (AQI, καιρός, ηλιακή ακτινοβολία) σε **κατανοητές συστάσεις** όπως «πήγαινε τώρα», «περίμενε ως 18:00», ή «απόφυγέ το σήμερα» - προσαρμοσμένες στο προφίλ υγείας και τις σχεδιαζόμενες δραστηριότητες του χρήστη.

Κεντραρισμένη γεωγραφικά στη Θεσσαλονίκη, με Ελληνικά ως πρωτεύουσα γλώσσα.

---

## Τι κάνει

1. **Δηλώνεις** χαρακτηριστικά υγείας (άσθμα, αλλεργίες, εγκυμοσύνη, παιδιά κ.λπ.) και σχεδιαζόμενες δραστηριότητες (περπάτημα, τρέξιμο, παιχνίδι σε πάρκο κ.λπ.).
2. **Κλικάρεις** οποιοδήποτε σημείο στον χάρτη.
3. **Διαβάζεις** μια σύσταση σε καθαρά Ελληνικά, με βάση τις τρέχουσες συνθήκες και την πρόβλεψη 24 ωρών - όχι ωμά νούμερα.

---

## Tech Stack

| Επίπεδο | Τεχνολογία |
|---|---|
| Frontend | React 19, Vite 7, Material-UI 7, Leaflet, React Router 7, Axios |
| Backend | Spring Boot 4.0.3, Java 25, Spring Security, Spring Data JPA, Spring AI |
| AI | Google Gemini (μέσω Spring AI structured output) |
| Data | Open-Meteo (weather, air quality, solar - δωρεάν, χωρίς API key) |
| Geocoding | Nominatim / OpenStreetMap (reverse geocoding) |
| Database | PostgreSQL (μόνο users - bcrypt passwords) |
| Auth | Session-based (HttpSession + JSESSIONID cookie) |
| Build | Maven (backend), Vite (frontend) |
| Deployment | Docker (Nginx για static frontend, Java για backend) |

---

## Βασικά Endpoints

| Method | Path | Σκοπός |
|---|---|---|
| `POST` | `/api/auth/register` | Δημιουργία λογαριασμού + auto-login |
| `POST` | `/api/auth/login` | Σύνδεση |
| `POST` | `/api/auth/logout` | Αποσύνδεση |
| `GET`  | `/api/auth/me` | Έλεγχος ενεργής συνεδρίας |
| `GET`  | `/api/snapshot?lat=X&lon=Y` | Γρήγορο snapshot (~1s, χωρίς AI) |
| `POST` | `/api/best-time` | Πλήρης απάντηση με AI ανάλυση + 24h forecast (~3-4s) |

---

## Setup

### Προαπαιτούμενα

- Java 25
- Node.js 20+
- PostgreSQL (ή access σε remote instance)
- API key για [Google Gemini](https://aistudio.google.com/apikey)

### Environment variables (backend)

```bash
export DB_USERNAME=your_db_user
export DB_PASSWORD=your_db_password
export GEMINI_API_KEY=your_gemini_key
```

### Backend

```bash
cd backend
./mvnw spring-boot:run
# Listens on http://localhost:8080
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173, proxies /api → backend
```

### Production build

```bash
# Frontend
cd frontend && npm run build    # → dist/

# Backend
cd backend && ./mvnw package    # → target/*.jar
```

### Docker (frontend)

```bash
cd frontend
docker build -t eco-frontend .
docker run -p 80:80 eco-frontend
```

---

## Δομή project

```
website/
├── backend/                     # Spring Boot
│   └── src/main/java/com/backend/
│       ├── config/              # SecurityConfig, ApplicationConfig
│       ├── controller/          # AuthController, MainController
│       ├── service/             # Weather, AirQuality, Solar, Geocoding,
│       │                        # AI, Environment (orchestrator)
│       ├── repository/          # UserRepository
│       └── model/               # User entity + DTO records
│
├── frontend/                    # React + Vite
│   └── src/
│       ├── App.jsx              # Routes
│       ├── components/          # LandingPage, Map, Drawer, Modal, ...
│       └── services/api.js      # Axios client
│
└── README.md                    # Αυτό το αρχείο
```

---

## Σχεδιαστικές αποφάσεις (highlights)

- **Παράλληλη ορχήστρωση**: το `/best-time` τρέχει 6 ταυτόχρονα `CompletableFuture` tasks σε Open-Meteo, μειώνοντας τον wall-clock χρόνο από ~12s (σειριακά) σε ~4s.
- **Structured AI output**: το Spring AI auto-generated JSON schema από Java record εγγυάται ότι το LLM γυρνά πάντα δομημένη απάντηση με συνεπή πεδία (`verdict`, `bestSlot`, `currentAnalysis`, ...).
- **Progressive loading**: το frontend καλεί `/snapshot` (γρήγορο) και `/best-time` (αργό) παράλληλα - τα cards γεμίζουν σε ~1s, η AI ανάλυση εμπλουτίζει σε ~3-4s.
- **Open guest mode**: το `/map` είναι ανοιχτό σε μη-συνδεδεμένους χρήστες· login ζητείται μόνο όταν επιχειρήσουν την πρώτη ανάλυση.
- **localStorage για preferences**: οι επιλογές του χρήστη επιβιώνουν reloads, διαγράφονται σε logout ή session expiry.

---

## Γνωστοί περιορισμοί

- Καθόλου caching → κάθε click στον χάρτη παράγει 8 εξωτερικές HTTP κλήσεις (6 Open-Meteo + 1 Nominatim + 1 Gemini).
- `ddl-auto=update` - όχι production-ready χωρίς proper migrations (Flyway/Liquibase).
- Hardcoded κέντρο χάρτη στη Θεσσαλονίκη.
- Αν πέσει ένας πάροχος Open-Meteo, χάνεται όλη η απάντηση (`CompletableFuture.allOf` δεν αντέχει partial failures).

---

## License

[CC BY-NC 4.0](./LICENSE)