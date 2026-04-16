# 🏋️ GymLog — PWA per la palestra

App mobile (PWA) per gestire le tue routine di allenamento. Funziona offline, si installa come app nativa su iOS e Android.

## Funzionalità

- 📋 Routine multiple (una per ogni giorno)
- 🔁 Esercizi con **serie/reps** e **serie/durata**
- ⚡ **Superset** con n° di giri personalizzabile
- ✅ Spunta le serie completate in tempo reale
- ⏱ Timer di pausa automatico con vibrazione
- 📊 Barra di progresso dell'allenamento
- 💾 Dati salvati localmente (localStorage)
- 🌐 Funziona offline (Service Worker)
- 📱 Installabile come app (PWA)

## Struttura file

```
gymlog/
├── index.html       ← App principale
├── manifest.json    ← Manifest PWA
├── sw.js            ← Service Worker (offline)
├── routines.json    ← ⭐ Routine di default (modificabile)
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
└── README.md
```

## Come personalizzare le routine di default

Modifica `routines.json` direttamente. È un array di routine, ognuna con:

```json
{
  "id": "r1",
  "day": "Lunedì",
  "name": "Push",
  "exercises": [ ... ]
}
```

### Esercizio normale (serie/reps)
```json
{
  "kind": "exercise",
  "id": "e1",
  "name": "Panca Piana",
  "type": "reps",
  "sets": [
    { "id": "s1", "reps": 10, "kg": 80, "rest": 120 }
  ]
}
```

### Esercizio con durata
```json
{
  "kind": "exercise",
  "id": "e2",
  "name": "Plank",
  "type": "duration",
  "sets": [
    { "id": "s1", "duration": 60, "rest": 60 }
  ]
}
```

### Superset
```json
{
  "kind": "superset",
  "id": "ss1",
  "rounds": 3,
  "rest": 90,
  "exercises": [
    {
      "id": "se1",
      "name": "Alzate Laterali",
      "type": "reps",
      "sets": [ { "id": "ss1a", "reps": 12, "kg": 8 } ]
    },
    {
      "id": "se2",
      "name": "French Press",
      "type": "reps",
      "sets": [ { "id": "ss1b", "reps": 12, "kg": 20 } ]
    }
  ]
}
```

> **Nota:** Gli `id` devono essere unici in tutto il file.

## Deploy su GitHub Pages

1. Crea un repository su GitHub (es. `gymlog`)
2. Carica tutti i file nella root del repo
3. Vai su **Settings → Pages**
4. Source: **Deploy from a branch** → `main` → `/ (root)`
5. Salva. Dopo ~1 minuto l'app sarà disponibile su:  
   `https://<tuousername>.github.io/gymlog/`

### Installare come app su iPhone (iOS)
1. Apri il link in **Safari**
2. Tocca il tasto **Condividi** (rettangolo con freccia su)
3. Scorri e tocca **"Aggiungi a schermata Home"**
4. Conferma → l'icona GymLog appare nella home

### Installare come app su Android
1. Apri il link in **Chrome**
2. Tocca i tre puntini in alto a destra
3. Tocca **"Aggiungi a schermata Home"** o **"Installa app"**

## Come funziona il JSON esterno

- **Primo avvio:** l'app scarica `routines.json` e lo salva in `localStorage`
- **Avvii successivi:** usa i dati in `localStorage` (funziona offline)
- **Modifiche dall'app:** vengono salvate solo in `localStorage`, non toccano il file JSON
- **"Ripristina routine predefinite":** ri-scarica `routines.json` e sovrascrive le modifiche

Quindi per aggiornare le routine di default per tutti: modifica `routines.json` e fai push su GitHub.  
Gli utenti che hanno già l'app devono toccare "Ripristina routine predefinite" per ricevere gli aggiornamenti.

## Licenza

MIT — fai quello che vuoi.
