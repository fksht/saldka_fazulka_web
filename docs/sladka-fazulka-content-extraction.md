# Sladká fazuľka — extrakcia obsahu z PDF cenníka

Zdroj: `Cenník Sladká Fazuľka .pdf` (autor: Zuzana Opálková, 23 strán, A4, Canva).

> Tento dokument je interný — slúži ako jediný zdroj pravdy pre obsah webu. Pri zmenách v cenníku najprv aktualizovať tento súbor, potom `src/data/sladkaFazulkaCatalog.ts`.

---

## 1. Brand tón

- Osobný, vrelý, „domáci“, ručná práca.
- Estetika svadieb, osláv a výnimočných príležitostí.
- Dôraz na **chuť** a **detail**, nie na masovú výrobu.
- Slogan strany 1: *„Candy bary, zákusky a torty na mieru — na svadby, oslavy a výnimočné príležitosti — s dôrazom na chuť a detail.“*
- Hlavná autorská značka: **Zuzka** (legenda o Sladkej fazuľke je rozprávková, hravá, mäkká).
- Vlastné originálne recepty (najmä **fazuľkové špeciality** = USP).

## 2. Vizuálny štýl

- Pozadie: **krémová vanilková farba** (papier), jemné ružové akvarelové škvrny v rohoch.
- Akcenty: **zlato/karamel** (tenké linky pod nadpismi, dekoratívne srdiečko).
- Typografia v PDF:
  - dekoratívny nadpisový font v štýle „bohémskeho“ ručného serif (Canva voľba — pre web použijeme `Cormorant Garamond` / `Playfair Display` ako blízku alternatívu, plus `Caveat` na decoratívny script citát).
  - textový font: jemný sans-serif/serif mix — pre web `Inter` na čítanie.
- Fotky produktov: na **bielom/transparentnom pozadí**, premyslená kompozícia, žiadne ošumelé snímky.
- Galéria (strany 19–23): koláže reálnych fotiek z eventov a zo zákulisia.

## 3. Produktové kategórie

| Kategória | Strana | Cena | Min. odber |
|-----------|--------|------|------------|
| Mini zákusky — tartaletky | 4 | 2,20 €/ks | 10 ks z 1 príchute |
| Mini zákusky — poháriky | 4 | 2,20 €/ks | 10 ks z 1 príchute |
| Mini zákusky — rezy | 4 | 2,00 €/ks | 20 ks z 1 príchute |
| Mini cheesecake | 4 | 1,80 €/ks | 10 ks z 1 príchute |
| Špeciálne zákusky | 4 | 2,20 – 2,40 €/ks | 10 ks z 1 príchute |
| Fazuľkové brownie kocky | 5–6 | 1,80 €/ks | 10 ks z 1 príchute |
| Fazuľkové špeciality | 6 | 2,00 – 2,50 €/ks | 10 ks z 1 príchute |
| Dezertné torty, cheesecake, travel cake | 7 | 30 – 50 € | fixne |
| Torty na mieru | 8–10 | od 25 € (Bento) | individuálne |
| Candy bar (samostavba + balíčky) | 11–14 | 200 – 1 300 € | balíček |
| Svadobné výslužky Deluxe | 15 | 11 – 29 €/krabička | per kus |
| Ochutnávkové boxy | 16 | od 20 € | individuálne |

## 4. Mini zákusky — kompletný zoznam

(Minimálny odber: 10 ks z 1 príchute, pri rezoch 20 ks z 1 príchute.)

### Tartaletky ⌀ 4,5 cm — 2,20 €/ks
1. **Malina & Lotus** — alergény: 1, 3, 7
2. **Pistácia & Lieskový oriešok** — alergény: 1, 3, 7, 8
3. **Rafaelo & Biela čokoláda** — alergény: 1, 3, 7, 8
4. **Baileys & Cappuccino** — alergény: 1, 3, 7

### Poháriky — 2,20 €/ks
1. **Jahodové tiramisu** — alergény: 1, 3, 7
2. **Čokoládová pena** — alergény: ? *(needsReview — OCR/PDF nezobrazuje, je tam ikona „vegán“; predpokladám alternatívu bez mlieka)*
3. **Oreo & Mliečna čokoláda** — alergény: 1, 3, 7

### Rezy — 2,00 €/ks
1. **Karamelové kocky** — alergény: 1, 3, 7
2. **Kráľovský punčák** — alergény: 1, 3
3. **Mrkvovo-pomarančová kocka** — alergény: 1, 3, 7, 8

### Mini cheesecake — 1,80 €/ks
1. **Malina** — alergény: 1, 3, 7
2. **Čokoláda** — alergény: 1, 3, 7

### Špeciálne zákusky — 2,20 / 2,40 €/ks
1. **Lotus mousse s bielou čokoládou** — 2,20 €/ks — alergény: 1, 7
2. **Cara Choux — Slaný karamel & Jahoda** — 2,20 €/ks — alergény: 1, 3, 7
3. **Pistáciový sen** — 2,20 €/ks — alergény: 1, 3, 7, 8
4. **Mini Pavlovka — Maracuja** — 2,40 €/ks — alergény: 3, 7

## 5. Fazuľkové špeciality (#bezmuky #bezmlieka)

USP: bezlepkové, bez mlieka, výroba z červenej fazule, vyššia výživová hodnota.

### Brownie kocky „Fazuľky“ — 1,80 €/ks
1. **Čokoláda & Malina** — alergén: 3
2. **Čokoláda & Pistácia** — alergény: 3, 8
3. **Ferrero Rocher** — alergény: 3, 8

### Fazuľkové špeciality (kategória samostatne)
1. **Arašidka** — 2,00 €/ks — alergény: 3, 5
2. **Brownie s čokoládovým krémom a pomarančom** — 2,20 €/ks — alergény: 3
3. **Čokoládový pečený nanuk** *(náplň jahoda / banán)* — 2,50 €/ks — alergén: 3

## 6. Dezertné torty, cheesecake a travel cake (strana 7)

1. **Mrkvovo-pomarančová torta s bielou čokoládou** — 50 € / 14 ks porcií — alergény: 1, 3, 7, 8
2. **Extra čokoládový cheesecake 18 cm** — 45 € / 12 ks porcií — alergény: 1, 3, 7
3. **Pistáciový cheesecake 18 cm** — 48 € / 12 ks porcií — alergény: 1, 3, 7, 8
4. **Banánovo-malinový travel cake s čokoládou** — 30 € / 10 ks porcií — alergén: 8

## 7. Torty na mieru — konfigurátor

Trojkrokový výber: korpus → krém → veľkosť.

### Krok 1: Korpus
- **Vanilkový** — svetlý, mäkký, jemne sladký, ku všetkým príchutiam.
- **Kakaový** — nadýchaný, jemný, klasika ku čokoládovým aj ovocným krémom.
- **Orechový** — s mletými vlašskými alebo lieskovými orechmi, hutnejší, výraznejší.
- **Mrkvový** — šťavnatý, korenistý, obľúbený s mascarpone krémom.
- **Bezlepkový** — tri varianty:
  - Vanilkový (bezlepkový)
  - Makový (bezlepkový)
  - Čokoládový z červenej fazule (bezlepkový, fazuľková špecialita)

> Na želanie možno pripraviť **vegánsku** alebo **low sugar** verziu.

### Krok 2: Krém — zoskupené podľa nálady

- **Svieže** 🍊
  - Svieži pomarančový krém s kúskami marhúľ
  - Mascarpone s bielou čokoládou a lesným ovocím
  - Škoricový krém s kúskami jabĺk a karamelu
- **Sladké a jemné** 🍫
  - Vanilkový krém s karamelom, malinami a kúskami Lotus sušienok
  - Čokoládový krém s horkou čokoládou a malinami
  - Vanilkový pribináčikový krém s lesným ovocím
- **Orieškové a výrazné** 🌰
  - Rafaelo krém s bielou čokoládou, praženými mandľami a višňami
  - Pistáciový krém s kúskami pistácií a čučoriedok
- **Kávové** ☕
  - Tiramisu krém s amarettom
- **Rastlinné alternatívy** 🌿
  - Vegan krém (vanilka / karamel / čokoláda) s malinami

### Krok 3: Veľkosť (cena „od“ — finálna podľa dekoru, náročnosti)

| Veľkosť | Porcie | Cena od |
|---|---|---|
| Bentocake | 4 | 25 € |
| Malá ⌀ 16 cm | 10–12 | 60 € |
| Stredná ⌀ 18 cm | 13–15 | 75 € |
| Veľká ⌀ 20 cm | 18–20 | 95 € |
| Extra veľká ⌀ 24 cm | 25–30 | 125 € |
| Dvojposchodová 12/18 cm | 20–25 | 130 € |
| Dvojposchodová 14/20 cm | ~30 | 160 € |
| Dvojposchodová 16/22 cm | ~40 | 200 € |

Poznámky:
- Väčšie torty podľa individuálnej dohody.
- V cene je zahrnuté **základné jednoduché zdobenie**.
- Pri náročnejších tortách (napr. **modelované postavičky**) je cena stanovená individuálne.

## 8. Candy bar (strana 11)

- Možno vyskladať **individuálne podľa cenníka zákuskov** alebo si vybrať **balíček**.
- Odporúčaný objem: **~ 5 ks zákuskov na osobu**.
- Konkrétne zákusky vyberá Zuzka po dohode so zákazníkom (počet hostí, charakter udalosti, chuťové preferencie).

### Servisný poplatok (Košice)
- **60 €** — komplet: doprava, aranžovanie, zapožičanie podnosov a výzdoby, vyzdvihnutie podnosov na ďalší deň.
- **Záloha za podnosy 50 €** (vratná pri vrátení nepoškodených podnosov).
- **Mimo Košíc** — cena dopravy dohodou podľa vzdialenosti.

## 9. Candy bar balíčky

| Balíček | Hostia | Počet ks | Druhov | Cena | Zloženie |
|---|---|---|---|---|---|
| **Mini** | 20 | 100 | 8 | **200 €** | 2× tartaletky (10+10), 1× pohárik (10), 1× rez (20), 1× mini cheesecake (20), 2× špeciálne (10+10), 1× brownie (10) |
| **Classic** | 30–40 | 180 | 10 | **360 €** | 2× tartaletky (15+15), 2× poháriky (15+15), 1× rez (20), 1× mini cheesecake (20), 2× špeciálne (20+20), 1× brownie (20), 1× fazuľkové (20) |
| **Plus** | 50–60 | 260 | 12 | **520 €** | 2× tartaletky (20+20), 2× poháriky (20+20), 1× rez (30), 2× mini cheesecake (20+20), 2× špeciálne (20+20), 2× brownie (25+25), 1× fazuľkové (20) |
| **Premium** | 70–80 | 375 | 15 | **750 €** | 3× tartaletky (25×3), 2× poháriky (25+25), 2× rezy (25+25), 2× mini cheesecake (25+25), 3× špeciálne (25×3), 2× brownie (25+25), 1× fazuľkové (25) |
| **Luxury** | 90–100 | 460 | 16 | **900 €** | 3× tartaletky (30×3), 3× poháriky (25×3), 2× rezy (30+30), 2× mini cheesecake (30+30), 3× špeciálne (30×3), 2× brownie (30+30), 1× fazuľkové (25) |
| **Exclusive** | 110–120 | 560 | 18 | **1 100 €** | 4× tartaletky (30×4), 3× poháriky (30×3), 2× rezy (30+30), 2× mini cheesecake (35+35), 3× špeciálne (30×3), 2× brownie (35+35), 2× fazuľkové (30+30) |
| **Exclusive Plus** | 130–150 | 675 | 20 | **1 300 €** | 4× tartaletky (35×4), 3× poháriky (35×3), 3× rezy (30×3), 2× mini cheesecake (35+35), 4× špeciálne (35×4), 2× brownie (35+35), 2× fazuľkové (30+30) |

## 10. Svadobné výslužky Deluxe (strana 15)

| Variant | Vhodné pre | Mix | Cena/krabička |
|---|---|---|---|
| **Výslužka S** | 1 osobu | 6 ks | 11 € |
| **Výslužka M** | 2 osoby | 10 ks | 18 € |
| **Výslužka L** | 3–4 osoby | 16 ks | 29 € |

> Zloženie mixu sa môže líšiť podľa dostupnosti a výberu dezertov.

## 11. Ochutnávkové boxy (strana 16)

- **Zákusky:** konečná cena ochutnávky bude upresnená po výbere dezertov.
- **Torty:** bento tortička (4 porcie, 850 g) — **20 €**. Na výber z **10 druhov krému**, max **3 druhy krému** na jednu tortičku.
- **Termíny ochutnávok** na vyžiadanie.
- **Cena ochutnávky bude odpočítaná z konečnej ceny svadobnej objednávky.**

## 12. Alergény (strana 17)

Podľa smernice 1169/2011 EÚ:

| # | Alergén |
|---|---|
| 1 | Obilniny obsahujúce lepok |
| 2 | Kôrovce a výrobky z nich |
| 3 | Vajcia a výrobky z nich |
| 4 | Ryby a výrobky z nich |
| 5 | Arašidy a výrobky z nich |
| 6 | Sójové zrná a výrobky z nich |
| 7 | Mlieko a výrobky z neho |
| 8 | Orechy (mandle, lieskové, vlašské, kešu, pekanové, paraorechy, pistácie, makadamové, queenslandské) |
| 9 | Zeler a výrobky z neho |
| 10 | Horčica a výrobky z nej |
| 11 | Sezamové semená a výrobky z nich |
| 12 | Oxid siričitý a siričitany (> 10 mg/kg) |
| 13 | Vlčí bôb a výrobky z neho |
| 14 | Mäkkýše a výrobky z nich |

**Upozornenie:** Zákusky sú vyrábané v prostredí, kde sa pracuje s lepkom, mliekom, orechmi a ďalšími alergénmi, a môžu obsahovať ich stopy.

## 13. Kontakt (strana 18)

- **Email:** `sladkafazulka@.gmail.com` — **needsReview** *(v PDF je zjavný preklep — bodka pred „gmail.com“; pravdepodobne má byť `sladkafazulka@gmail.com`. Pred publikovaním overiť so Zuzkou.)*
- **Telefón:** 0911 410 544
- **Lokalita:** Košice a okolie

## 14. Fotogaléria (strany 19–23)

- Strana 19: koláž — mini dezerty, candy bar zostava.
- Strana 20: koláž tort (téma futbal, šport, krstiny, narodeniny).
- Strana 21: koláž tort (témy: Pikachu, Pilsner Urquell, šachy, kvety).
- Strana 22: koláž — krabičky, výslužky, candy bar setup.
- Strana 23: portréty Zuzky pri práci (3 fotky) + slogan **„Keď práca baví.“**

Tieto strany som uložil ako jednotlivé JPEG fotografie do `public/images/sladka-fazulka/gallery/`.

## 15. Položky na overenie (needsReview)

- **Email**: `sladkafazulka@.gmail.com` — bodka v PDF, treba overiť presné znenie.
- **Vegán pohárik**: ikona „VEGAN“ na strane 4 pri *Čokoládová pena*, ale alergény pohárika nie sú v PDF explicitne uvedené (predpokladám bez vajec, bez mlieka, ale treba potvrdiť so Zuzkou).
- **Cena „od“ vs „fixná“** pri travel cake / cheesecake: PDF zobrazuje konkrétnu sumu za celé balenie. Predpokladám, že ide o fixnú cenu produktu pre uvedený počet porcií, ale individuálne dekory môžu cenu zmeniť.
- **Sociálne siete**: PDF neuvádza Instagram, Facebook ani web. V kontaktnej sekcii nepoužívame fiktívne handle.
- **Dátum platnosti cenníka**: PDF neuvádza, treba ošetriť poznámkou „aktuálny cenník“.
- **Sídlo / IČO**: nie je v PDF. Pre fakturáciu zatiaľ neuvádzať.
