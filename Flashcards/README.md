# FlashCard PWA 🃏

Una Progressive Web App mobile-first per studiare con flashcard.  
Pubblicabile gratuitamente su **GitHub Pages**.

---

## ✨ Funzionalità

- **Fino a 4 lati** per carta (fronte + retro obbligatori, Extra 1 e Extra 2 opzionali)
- **Modalità Studio** — sfoglia le carte con swipe/tap, flip animato
- **Modalità Quiz** — risposta multipla automatica (distrattori dalle altre carte)
- **Risposta multipla manuale** — definisci le opzioni direttamente nel JSON
- **Shuffle** — mescola il mazzo in un tap
- **Offline** — funziona senza connessione grazie al Service Worker
- **Installabile** — aggiungila alla schermata Home come un'app nativa

---

## 📱 Installazione come PWA

1. Apri l'URL su **Safari** (iOS) o **Chrome** (Android)
2. Tocca "Condividi" → "Aggiungi a schermata Home"

---

## 🚀 Pubblica su GitHub Pages

1. Crea un repository su GitHub (es. `flashcard`)
2. Carica tutti i file in questo zip
3. Vai su **Settings → Pages → Source: main branch / root**
4. L'app sarà disponibile su `https://tuonome.github.io/flashcard/`

---

## 🗂️ Lista mazzi (index.json)

Per mostrare i mazzi già in home page, crea un file `index.json` nella stessa cartella:

```json
[
  {
    "name":        "Capitali del Mondo",
    "file":        "mazzi/capitali.json",
    "description": "Europa, Asia, Americhe",
    "icon":        "🌍",
    "cards":       42
  },
  {
    "name":        "Verbi Irregolari EN",
    "file":        "mazzi/verbi-en.json",
    "description": "I 100 verbi più comuni",
    "icon":        "🇬🇧"
  }
]
```

| Campo         | Tipo   | Obbligatorio | Descrizione                              |
|---------------|--------|:------------:|------------------------------------------|
| `name`        | string | ✅           | Nome mostrato in lista                   |
| `file`        | string | ✅           | Percorso relativo al file JSON del mazzo |
| `description` | string | –            | Sottotitolo descrittivo                  |
| `icon`        | string | –            | Emoji icona (default: 🃏)               |
| `cards`       | number | –            | Numero carte (solo informativo)          |

Se `index.json` non è presente, la sezione lista è semplicemente nascosta — l'app funziona lo stesso con il caricamento manuale.

---



### Struttura base — con label di default a livello mazzo

```json
{
  "name": "Nome del mazzo",
  "labels": ["Fronte", "Retro", "Extra 1", "Extra 2"],

  "cards": [
    {
      "side1": "Testo fronte (obbligatorio)",
      "side2": "Testo retro (obbligatorio)"
    },
    {
      "side1": "Altra carta",
      "side2": "Risposta",
      "side3": "Info aggiuntiva",
      "side4": "Ulteriore dettaglio"
    }
  ]
}
```

Il campo `labels` è **opzionale**: definisce le etichette dei lati per tutte le carte del mazzo. Se omesso, vengono usati i valori di default (`Fronte`, `Retro`, `Extra 1`, `Extra 2`).

Una singola carta può **sovrascrivere** l'etichetta di uno specifico lato tramite `label1`…`label4`:

```json
{
  "side1": "Domanda speciale?",
  "side2": "Risposta speciale",
  "label1": "Domanda",
  "label2": "Risposta"
}
```

### Campo `noteX` (opzionale)

Aggiunge un testo secondario in corsivo sotto il contenuto del lato. Utile per precisazioni, mnemonici, avvertenze:

```json
{
  "side1": "Australia",
  "side2": "Canberra",
  "note2": "Non Sydney!"
}
```

### Risposta multipla manuale

```json
{
  "side1": "Domanda?",
  "side2": "Risposta corretta",
  "multiple_choice": [
    { "text": "Risposta corretta", "correct": true  },
    { "text": "Distrat. A",        "correct": false },
    { "text": "Distrat. B",        "correct": false },
    { "text": "Distrat. C",        "correct": false }
  ]
}
```

Se `multiple_choice` non è presente, il quiz genera automaticamente i distrattori usando le risposte delle altre carte del mazzo.

### Campi supportati per carta

| Campo             | Tipo   | Obbligatorio | Descrizione                                      |
|-------------------|--------|:------------:|--------------------------------------------------|
| `side1`           | string | ✅           | Testo lato 1 (fronte)                            |
| `side2`           | string | ✅           | Testo lato 2 (retro)                             |
| `side3`           | string | –            | Testo lato 3                                     |
| `side4`           | string | –            | Testo lato 4                                     |
| `label1`…`label4` | string | –            | Sovrascrive l'etichetta del lato (carta)         |
| `note1`…`note4`   | string | –            | Testo secondario sotto il contenuto del lato     |
| `image1`…`image4` | string | –            | URL immagine (https://)                          |
| `multiple_choice` | array  | –            | Opzioni quiz manuale                             |

**A livello mazzo:**

| Campo    | Tipo    | Descrizione                                              |
|----------|---------|----------------------------------------------------------|
| `name`   | string  | Nome del mazzo (mostrato in home)                        |
| `labels` | array   | Etichette default per i 4 lati (es. `["IT","EN","DE"]`) |

---

## 🎮 Controlli in modalità Studio

| Azione              | Effetto                  |
|---------------------|--------------------------|
| Tap sulla carta     | Gira al lato successivo  |
| Swipe orizzontale   | Carta precedente/prossima|
| Swipe verticale     | Cambia lato              |
| Pulsante ⇄          | Mescola il mazzo         |
| Pulsanti ‹ ›        | Naviga tra le carte      |

---

## 📁 Struttura file

```
flashcard-pwa/
├── index.html       ← App principale
├── style.css        ← Stili
├── app.js           ← Logica
├── sw.js            ← Service Worker (offline)
├── manifest.json    ← Config PWA
├── esempio.json     ← Mazzo di esempio
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
└── README.md
```

---

## 🖼️ Icone

Le icone in `/icons/` sono placeholder generati automaticamente.  
Puoi sostituirle con le tue usando [PWA Builder](https://www.pwabuilder.com/) o [Maskable.app](https://maskable.app/).
