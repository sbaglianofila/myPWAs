# 📰 Edicola — PWA RSS Reader

Lettore RSS per mobile, installabile come PWA, senza login né API key.  
Le fonti si gestiscono **solo modificando `feeds.json`** — l'app si aggiorna automaticamente.

---

## 📁 Struttura del progetto

```
edicola/
├── index.html      → app principale
├── manifest.json   → configurazione PWA
├── sw.js           → service worker (offline)
├── feeds.json      ← MODIFICA QUESTO per aggiungere fonti
└── icons/
    ├── icon-192.png
    └── icon-512.png
```

---

## 🚀 Deploy su GitHub Pages

1. Crea un repository su GitHub (es. `edicola`)
2. Carica tutti i file nella root del repo
3. Vai su **Settings → Pages → Source: Deploy from branch → main → / (root)**
4. Dopo qualche minuto l'app è online su `https://tuonome.github.io/edicola/`

---

## ➕ Aggiungere un feed RSS

Apri `feeds.json` e aggiungi un oggetto nell'array `sources`:

```json
{
  "id": "id_univoco",
  "name": "Nome del giornale",
  "emoji": "🗞️",
  "url": "https://esempio.it/feed/rss.xml",
  "category": "Notizie",
  "enabled": true
}
```

### Campi disponibili

| Campo      | Tipo    | Obbligatorio | Descrizione                                      |
|------------|---------|:------------:|--------------------------------------------------|
| `id`       | string  | ✅           | ID univoco, senza spazi (es. `"corriere"`)       |
| `name`     | string  | ✅           | Nome visualizzato nell'app                       |
| `emoji`    | string  | ✅           | Emoji identificativa della fonte                 |
| `url`      | string  | ✅           | URL del feed RSS o Atom                          |
| `category` | string  | ✅           | Categoria (deve essere in `categories`)          |
| `enabled`  | boolean | ✅           | `true` = attivo di default, `false` = disattivo  |

### Categorie disponibili (modificabili)

```json
"categories": ["Notizie", "Economia", "Sport", "Tecnologia", "Cultura", "Locale"]
```

Puoi aggiungere nuove categorie nell'array `categories`.

---

## 📱 Installazione su smartphone

**Android (Chrome):**
- Apri l'URL → tocca il banner "Installa Edicola" in cima alla pagina

**iOS (Safari):**
- Apri l'URL in Safari → tocca l'icona **Condividi** (□↑) → **"Aggiungi a schermata Home"**

---

## ⚠️ Note tecniche

- I feed RSS vengono caricati tramite **proxy CORS pubblici** (allorigins.win, corsproxy.io)
  perché i browser bloccano le richieste cross-origin dirette.  
  La maggior parte dei feed italiani funziona correttamente.
- Le preferenze di abilitazione/disabilitazione delle fonti vengono salvate nel **localStorage**
  del dispositivo — ogni utente può personalizzarle senza modificare il JSON.
- Il file `feeds.json` viene ri-scaricato ogni 10 minuti per raccogliere nuove fonti.

---

## 🛠️ Trovare l'URL di un feed RSS

- Cerca su Google: `nome giornale rss feed`
- Prova `/feed`, `/rss`, `/feed/rss`, `/rss.xml` dopo il dominio
- Usa l'estensione browser [RSS Feed Finder](https://chrome.google.com/webstore/detail/rss-feed-reader/)
