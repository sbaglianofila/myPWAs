# 🏋️ GymLog — PWA per la palestra

App mobile (PWA) per gestire le tue routine di allenamento. Supporta **programmi multipli** selezionabili, funziona offline e si installa come app nativa su iOS e Android.

## Struttura file

```
gymlog/
├── index.html              ← App principale
├── manifest.json           ← Manifest PWA
├── sw.js                   ← Service Worker (offline)
├── programs.json           ← ⭐ Indice dei programmi disponibili
├── programs/
│   ├── push-pull-legs.json ← Programma PPL
│   ├── full-body.json      ← Programma Full Body
│   └── mio-programma.json  ← Aggiungi i tuoi!
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
└── README.md
```

## Come aggiungere un nuovo programma

### 1. Crea il file JSON nella cartella `programs/`

Ogni file è un array di routine. Esempio `programs/forza.json`:

```json
[
  {
    "id": "forza1",
    "day": "Lunedì",
    "name": "Forza A",
    "exercises": [
      {
        "kind": "exercise",
        "id": "f1",
        "name": "Squat",
        "type": "reps",
        "sets": [
          { "id": "f1s1", "reps": 5, "kg": 100, "rest": 180 },
          { "id": "f1s2", "reps": 5, "kg": 100, "rest": 180 }
        ]
      }
    ]
  }
]
```

> **Nota:** tutti gli `id` devono essere unici in tutto il file.

### 2. Registralo in `programs.json`

```json
[
  { "id": "ppl",    "name": "Push Pull Legs", "description": "Classico split 3 giorni", "days": 3, "file": "./programs/push-pull-legs.json" },
  { "id": "forza",  "name": "Forza Massimale","description": "5x5 intensità alta",      "days": 3, "file": "./programs/forza.json" }
]
```

### 3. Aggiungilo alla cache del Service Worker (`sw.js`)

```js
const ASSETS = [
  // ... file esistenti ...
  './programs/forza.json',
];
```

### 4. Fai push su GitHub

L'app mostrerà il nuovo programma nella schermata di selezione.

---

## Tipi di esercizio supportati

### Serie/Reps (con o senza peso)
```json
{ "kind": "exercise", "id": "e1", "name": "Trazioni", "type": "reps",
  "sets": [ { "id": "s1", "reps": 8, "rest": 120 } ] }
```
Ometti `"kg"` o metti `0` per esercizi a corpo libero — i kg non vengono mostrati.

### Serie/Durata
```json
{ "kind": "exercise", "id": "e2", "name": "Plank", "type": "duration",
  "sets": [ { "id": "s1", "duration": 60, "rest": 60 } ] }
```

### Superset
```json
{ "kind": "superset", "id": "ss1", "rounds": 3, "rest": 90,
  "exercises": [
    { "id": "se1", "name": "Curl", "type": "reps", "sets": [ { "id": "se1s1", "reps": 12, "kg": 12 } ] },
    { "id": "se2", "name": "Tricipiti", "type": "reps", "sets": [ { "id": "se2s1", "reps": 12, "kg": 15 } ] }
  ]
}
```

---

## Deploy su GitHub Pages

1. Crea un repository (es. `gymlog`) e carica tutti i file
2. **Settings → Pages → Deploy from branch → main → / (root)**
3. App disponibile su `https://<username>.github.io/gymlog/`

### Installare su iPhone
Safari → Condividi → **"Aggiungi a schermata Home"**

### Installare su Android
Chrome → ⋮ → **"Aggiungi a schermata Home"** o **"Installa app"**

---

## Come funziona la selezione programma

- **Primo avvio:** mostra la schermata di selezione programma
- **Avvii successivi:** carica direttamente l'ultimo programma usato (funziona offline)
- **Bottone "Cambia"** in home: torna alla selezione per cambiare programma
- **"Ripristina dal file originale"**: ri-scarica il JSON del programma attivo, sovrascrivendo le modifiche manuali
- Ogni programma ha il suo spazio in `localStorage` — cambiare programma non cancella le modifiche fatte agli altri
