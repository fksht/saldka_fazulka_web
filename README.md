# Sladká fazuľka

Verejný web pre domácu cukrársku dielňu *Sladká fazuľka* (Zuzka Opálková, Košice). Obsahuje brand prezentáciu, kompletný cenník zákuskov a tort, konfigurátor tort na mieru, candy bar balíčky, svadobné výslužky, ochutnávkový box, galériu a nezáväzný objednávkový tok s creator/admin rozhraním.

## Stack

- React 18 + Vite 5 + TypeScript
- Tailwind CSS (custom paleta `cream` / `cocoa` / `rose` / `gold`)
- React Router 6
- React Hook Form + Zod
- Lokálny repository layer cez `localStorage` (jednoducho vymeniteľný za Supabase / Firebase)
- Email adapter pripravený na bezpečný serverless endpoint (Resend / SendGrid / Postmark)

## Zdroj obsahu

Pravdivý cenník, popisy, alergény, fotky a brand identity pochádzajú z PDF *Cenník Sladká Fazuľka .pdf* v koreni repa. Štruktúrované extrakcie sú v `docs/sladka-fazulka-content-extraction.md` a typovaný katalóg v `src/data/sladkaFazulkaCatalog.ts`.

Pri zmene cenníka: aktualizovať dokument `docs/sladka-fazulka-content-extraction.md` → potom upraviť `src/data/sladkaFazulkaCatalog.ts`.

### Fotky

- `public/images/sladka-fazulka/products/*.jpg` — 26 individuálnych product photos extrahovaných z PDF (`pdfimages -all`), složených s ich alfa maskou cez `magick … -compose CopyOpacity` a umiestnených na krémové pozadie (`#fffaf5`).
- `public/images/sladka-fazulka/gallery/*.jpg` — 5 koláží zo strán 19–23 PDF (galéria).
- `public/images/sladka-fazulka/{hero-cover,cake-3tier,about-zuzka,section-*}.jpg` — hero / sekčné obrázky.

## Spustenie

```bash
npm install
cp .env.example .env
npm run dev      # http://localhost:5173
npm run typecheck
npm run build    # tsc + vite production build
npm run lint     # ESLint --max-warnings 0
```

## Routy

| Cesta | Stránka |
|---|---|
| `/` | Domov — hero, USP, odporúčané, candy bar / cake teaser, FAQ |
| `/o-mne` | O Sladkej fazuľke — 8 dôvodov, legenda, fazuľkové USP |
| `/ponuka` | Cenník zákuskov v sekciách (tartaletky / poháriky / rezy / cheesecake / špeciálne / fazuľkové / dezertné torty) s alergénmi a legendou |
| `/torty-na-mieru` | 3-krokový konfigurátor (korpus → krém → veľkosť) |
| `/candy-bar` | Servisné info + 7 balíčkov (Mini → Exclusive Plus) |
| `/svadobne-vysluzky` | Výslužky S / M / L |
| `/ochutnavkovy-box` | Ochutnávka zákuskov + bento tortička |
| `/galeria` | Filter podľa kategórie + lightbox |
| `/objednavka` | Nezáväzný dopyt (košík → formulár → success) |
| `/kontakt` | Telefón, email, lokalita |
| `/admin` | Správa ponuky (produkty / balíčky / objednávky / galéria) |

## Typografia

- **Display:** Cormorant Garamond (nadpisy, brand)
- **Script:** Caveat (gold akcenty „Candy bary, zákusky a torty na mieru")
- **Body:** Inter
- **Fallback serif:** Playfair Display

Všetky fonty sú načítané cez Google Fonts v `src/index.css`.

## Admin

Admin je na `/admin`. Demo heslo sa nastavuje cez `VITE_ADMIN_PASSWORD` (viď `.env.example`). Ak premenná nie je nastavená, admin login ostane vypnutý.

> ⚠️ **Bezpečnostné upozornenie (MVP)**
> - `VITE_ADMIN_PASSWORD` sa pri builde **vloží priamo do JS bundle** — ktokoľvek si ho vie pozrieť v DevTools. Nie je to skutočná autentifikácia, len malá prekážka pre náhodné kliknutie.
> - Všetky zmeny v admine sa ukladajú do **localStorage prehliadača**, v ktorom ste prihlásená. Iní návštevníci ich nevidia, ani Zuzka sama, ak otvorí web v druhom prehliadači / zariadení / inkognito.
> - Pred ostrým spustením treba pripojiť reálnu autentifikáciu (Supabase / Firebase / vlastný backend) a databázu cez `src/services/dataService.ts`.

```bash
cp .env.example .env
```

Admin podporuje:
- pridanie / úpravu / skrytie produktu (vrátane min. odberu, jednotky, alergénov)
- úpravu existujúcich candy bar balíčkov podľa aktuálneho cenníka
- prehľad objednávok so stavmi (nová / kontaktovaná / potvrdená / dokončená / zrušená)
- pridanie galéria fotiek

## Dáta

`src/data/sladkaFazulkaCatalog.ts` je zdrojom pravdy pre celý web. Z neho `src/services/mockData.ts` exportuje produkty, candy bar balíčky a galériu, ktoré sa pri prvom načítaní zapíšu do `localStorage` cez `dataService` (`src/services/dataService.ts`). Pre prepojenie na Supabase / Firebase stačí prepísať metódy v `dataService` — UI ostáva.

Výpočet orientačných súm je sústredený v `src/utils/orderPricing.ts`. Ceny typu `from`, `on_request` a `individual` sa vždy zobrazujú ako orientačné alebo dohodou; finálna cena sa potvrdzuje ručne.

## Email tok

`emailService.sendOrderEmails(order)` posiela rekapituláciu zákazníkovi aj cukrárke.

- Ak `VITE_EMAIL_ENDPOINT` nie je nastavený v development režime → console mock (objaví sa v devtools).
- V produkčnom builde bez `VITE_EMAIL_ENDPOINT` odoslanie zlyhá, aby web nesľuboval email, ktorý neodišiel.
- Inak POST cez email adapter na váš serverless endpoint. Príklad: `api/send-order-email.example.ts`.
- API kľúče (`EMAIL_API_KEY`, `EMAIL_FROM`, `EMAIL_TO`) patria iba na server. Nikdy do frontendu.

Predmety:
- Zákazník: „Rekapitulácia objednávky – Sladká fazuľka ({orderId})"
- Cukrárka: „Nová objednávka – Sladká fazuľka ({orderId})"

## Platby

Online platby zatiaľ nie sú implementované — objednávka je vedená ako *nezáväzný dopyt*. Stripe / GoPay / TrustPay sa pripoja až po doplnení backendu, reálnej správy stavov a potvrdenia dostupnosti termínu.

## TODO / needsReview

Vychádza z PDF, ktoré obsahovalo nejasnosti:

- [ ] **Email** — v PDF je zapísaný ako `sladkafazulka@.gmail.com` (preklep s bodkou). Predpokladaný správny tvar `sladkafazulka@gmail.com` je uložený v `CONTACT_INFO`, ale s `emailNeedsReview: true`. **Overiť so Zuzkou pred publikovaním**.
- [ ] **Pohárik Čokoládová pena** — v PDF je „VEGAN" ikona, ale presné alergény pohárika nepotvrdené. Zatiaľ prázdne pole alergénov + `needsReview: true`.
- [ ] **Fazuľková špecialita „Brownie s čokoládovým krémom a pomarančom"** — v PDF nemá samostatnú fotku, dočasne re-používa fotku iného fazuľkového brownie + `needsReview: true`. Po novom fotení nahradiť.
- [ ] **Sociálne siete** — PDF neuvádza Instagram, Facebook ani vlastný web. Nepoužívame fiktívne handle.
- [ ] **IČO / sídlo** — PDF neuvádza, pre fakturáciu doplniť osobne.

## Deployment

### GitHub Pages (statický web)

GitHub Actions workflow je v `.github/workflows/deploy.yml`. Vite `base` path sa pri builde automaticky nastaví na `/<názov-repa>/` (z `GITHUB_REPOSITORY`). Obrázky v katalógu prefixujeme cez `import.meta.env.BASE_URL` (`src/data/sladkaFazulkaCatalog.ts → assetPath()`), takže fungujú aj pod subpathom.

Pre vlastnú doménu (root path) nastavte `VITE_BASE_PATH=/`. SPA routing funguje cez `public/404.html` GH Pages redirect.

### Email odosielanie (potrebný backend)

`/objednavka` posiela payload na `VITE_EMAIL_ENDPOINT`. Bez endpointu funguje console mock iba lokálne v development režime; produkčný build odoslanie odmietne. Pre produkciu pripojte serverless funkciu, ktorá drží `EMAIL_API_KEY` výhradne na serveri (`api/send-order-email.example.ts` je vzor pre Vercel/Netlify-style runtime).

Statický GitHub Pages email **neodošle** — buď nasaďte frontend cez Vercel/Netlify a tam dorobte API route, alebo k frontendu pripojte ľubovoľný serverless endpoint.

### Bezpečnostný checklist pred ostrým spustením

- [ ] Nahradiť `VITE_ADMIN_PASSWORD` reálnym auth providerom.
- [ ] Pripojiť databázu cez `src/services/dataService.ts` (Supabase odporúčam pre rýchly štart).
- [ ] Pripojiť email endpoint (`VITE_EMAIL_ENDPOINT` + serverless funkcia s `EMAIL_API_KEY`).
- [ ] Overiť kontaktný email so Zuzkou (`emailNeedsReview` v `CONTACT_INFO`).
- [ ] Doplniť IČO/sídlo, ak treba vystavovať faktúry.

### Veľký súbor v repozitári

PDF cenníka (`Cenník Sladká Fazuľka .pdf`, ~165 MB) je v `.gitignore` — slúži ako lokálny zdroj obsahu, ale nepretláča sa do gitu. Pri klonovaní si ho stiahnite samostatne.

## Štruktúra

```
src/
├── App.tsx                          # routing
├── data/sladkaFazulkaCatalog.ts     # PDF → typovaný katalóg (zdroj pravdy)
├── pages/
│   ├── Home.tsx                     # hero, USP, odporúčané
│   ├── About.tsx                    # 8 dôvodov + legenda + fazuľkové USP
│   ├── Menu.tsx                     # cenník zákuskov v sekciách
│   ├── Cake.tsx                     # konfigurátor tort
│   ├── CandyBar.tsx                 # candy bar info + balíčky
│   ├── Vysluzky.tsx                 # svadobné výslužky
│   ├── Ochutnavka.tsx               # ochutnávkový box
│   ├── Gallery.tsx                  # filtre + lightbox
│   ├── Order.tsx                    # košík → formulár
│   ├── Contact.tsx
│   └── Admin.tsx
├── components/
│   ├── cake/CakeConfigurator.tsx
│   ├── candybar/PackageCard.tsx
│   ├── vysluzky/WeddingBoxCard.tsx
│   ├── gallery/{GalleryGrid,GalleryLightbox}.tsx
│   ├── products/{ProductCard,ProductModal,ProductGroup,AllergenBadges}.tsx
│   ├── order/OrderSummary.tsx
│   ├── admin/{ProductManager,AdminProductForm,PackageManager,OrderDashboard,GalleryManager}.tsx
│   ├── forms/OrderForm.tsx
│   ├── layout/{Navbar,Footer}.tsx
│   └── ui/{Button,SectionHeader,Toast}.tsx
├── context/CartContext.tsx          # cart + cake config + balíčky + výslužky
├── services/
│   ├── dataService.ts               # localStorage repo (vymeniteľné)
│   ├── emailService.ts              # mock / serverless adapter
│   └── mockData.ts                  # re-export z katalógu
├── utils/orderPricing.ts            # jednotná logika orientačných cien
└── types/index.ts                   # všetky doménové typy
docs/sladka-fazulka-content-extraction.md   # extrakcia obsahu z PDF
```
