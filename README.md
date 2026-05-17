# Sladká fazuľka

Moderný MVP web pre domácu cukrársku dielňu. Slúži ako verejné portfólio, katalóg produktov, galéria, nezáväzný objednávkový formulár a jednoduché creator/admin rozhranie.

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- React Router
- React Hook Form + Zod
- lokálny repository layer cez `localStorage`
- email adapter pripravený na bezpečný serverless endpoint

## Spustenie

```bash
npm install
npm run dev
```

Lokálne: `http://localhost:5173`

Build:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

## Admin

Admin je dostupný na `/admin`.

Demo heslo je nastavené cez `VITE_ADMIN_PASSWORD`; ak `.env` neexistuje, fallback je `fazulka-demo`.

```bash
cp .env.example .env
```

Toto je MVP ochrana pre lokálnu ukážku, nie produkčné zabezpečenie. Produkčná verzia má byť napojená na Supabase/Firebase auth alebo vlastný backend.

## GitHub Pages

Projekt má pripravený GitHub Actions workflow v `.github/workflows/deploy.yml`.

Postup:

```bash
git remote add origin https://github.com/USERNAME/REPO.git
git branch -M main
git push -u origin main
```

V GitHube potom otvorte `Settings -> Pages` a ako source vyberte `GitHub Actions`. Po dobehnutí workflow bude web dostupný na URL typu:

```text
https://USERNAME.github.io/REPO/
```

Vite base path sa v GitHub Actions nastaví automaticky podľa názvu repozitára. Ak budete používať custom doménu alebo iný hosting, môžete nastaviť `VITE_BASE_PATH`.

## Dáta

Produkty, objednávky, galéria a košík sa ukladajú do `localStorage`, aby sa MVP dalo skúšať bez databázy. Databázová výmena je sústredená v:

- `src/services/dataService.ts`
- `src/services/mockData.ts`
- `src/context/CartContext.tsx`

Pre Supabase/Firebase stačí nahradiť implementáciu repository metód v `dataService.ts`, UI môže zostať bez väčších zmien.

## Email flow

Frontend volá `emailService.sendOrderEmails(order)`.

Ak `VITE_EMAIL_ENDPOINT` nie je nastavený, použije sa console mock. Ak je nastavený, služba odošle payload na váš serverless endpoint.

Príklad endpointu je v `api/send-order-email.example.ts`. API kľúče pre Resend, SendGrid alebo Postmark patria iba na server:

- `EMAIL_API_KEY`
- `EMAIL_FROM`
- `EMAIL_TO`

Nikdy ich nedávajte do frontend kódu.

## Platby

Platba zatiaľ nie je implementovaná. Objednávkový flow je zámerne vedený ako „nezáväzný dopyt“. Stripe, GoPay alebo TrustPay sa majú dopojiť až po doplnení backendu, reálneho stavu objednávok a potvrdenia dostupnosti termínu.
