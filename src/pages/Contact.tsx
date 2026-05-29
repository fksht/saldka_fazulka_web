import { Facebook, Instagram, Mail, MapPin, Phone, Send } from 'lucide-react';
import { ButtonLink } from '../components/ui/Button';
import GoldDivider from '../components/ui/GoldDivider';
import SectionHeader from '../components/ui/SectionHeader';
import { CONTACT_INFO } from '../services/mockData';

const contactCardClass =
  'group rounded-3xl border border-cream-200 bg-cream-50 p-7 transition hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-50 hover:shadow-md';

const emailContent = (
  <>
    <Mail className="mb-5 h-7 w-7 text-rose-600 transition group-hover:scale-110" aria-hidden="true" />
    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-cocoa-500">Email</p>
    <p className="mt-2 break-words font-display text-2xl font-semibold text-cocoa-950">{CONTACT_INFO.email}</p>
    {CONTACT_INFO.emailNeedsReview && (
      <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">
        overiť pred publikovaním
      </p>
    )}
  </>
);

const Contact = () => (
  <main className="bg-cream-50">
    <section className="relative overflow-hidden bg-white py-16 sm:py-20">
      <div className="watercolor-wash absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Kontakt"
          title="Napíšte alebo zavolajte"
          scriptEyebrow="Rada vám poradím s výberom"
          description={CONTACT_INFO.orderNote}
          withDivider
        />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          <a
            href={`tel:${CONTACT_INFO.phone.replace(/\s/g, '')}`}
            className={contactCardClass}
          >
            <Phone className="mb-5 h-7 w-7 text-rose-600 transition group-hover:scale-110" aria-hidden="true" />
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-cocoa-500">Telefón</p>
            <p className="mt-2 font-display text-2xl font-semibold text-cocoa-950">{CONTACT_INFO.phone}</p>
            <p className="mt-2 text-sm text-cocoa-500">Najrýchlejšia cesta k termínu.</p>
          </a>
          {CONTACT_INFO.emailNeedsReview ? (
            <div className={contactCardClass}>{emailContent}</div>
          ) : (
            <a href={`mailto:${CONTACT_INFO.email}`} className={contactCardClass}>
              {emailContent}
            </a>
          )}
          <div className="rounded-3xl border border-cream-200 bg-cream-50 p-7">
            <MapPin className="mb-5 h-7 w-7 text-rose-600" aria-hidden="true" />
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-cocoa-500">Lokalita</p>
            <p className="mt-2 font-display text-2xl font-semibold text-cocoa-950">{CONTACT_INFO.location}</p>
            <p className="mt-2 text-sm text-cocoa-500">Vyzdvihnutie aj kompletný candy bar servis.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <a
            href={CONTACT_INFO.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className={contactCardClass}
          >
            <Instagram className="mb-5 h-7 w-7 text-rose-600 transition group-hover:scale-110" aria-hidden="true" />
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-cocoa-500">Instagram</p>
            <p className="mt-2 font-display text-2xl font-semibold text-cocoa-950">@sladkafazulka</p>
            <p className="mt-2 text-sm text-cocoa-500">Najnovšie zákusky, torty a candy bary.</p>
          </a>
          <a
            href={CONTACT_INFO.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className={contactCardClass}
          >
            <Facebook className="mb-5 h-7 w-7 text-rose-600 transition group-hover:scale-110" aria-hidden="true" />
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-cocoa-500">Facebook</p>
            <p className="mt-2 font-display text-2xl font-semibold text-cocoa-950">Sladká fazuľka</p>
            <p className="mt-2 text-sm text-cocoa-500">Sledujte aktuálnu ponuku a novinky.</p>
          </a>
        </div>
      </div>
    </section>

    <section className="py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:px-8">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold-600">Ako objednať</p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-[1.1] text-cocoa-950 sm:text-5xl">
            Najrýchlejšie je poslať dopyt cez formulár
          </h2>
          <div className="mt-5">
            <GoldDivider align="left" />
          </div>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-cocoa-700">
            Do poznámky napíšte dátum a typ udalosti, počet hostí alebo porcií, obľúbené príchute, alergie a predstavu dekoru. Pri tortách môžete priložiť aj odkaz na inšpiráciu.
          </p>
          <ButtonLink to="/objednavka" className="mt-8">
            Poslať nezáväznú objednávku
            <Send className="h-4 w-4" aria-hidden="true" />
          </ButtonLink>
        </div>
        <aside className="rounded-3xl border border-cream-200 bg-white p-7">
          <h3 className="font-display text-2xl font-semibold text-cocoa-950">Dôležité poznámky</h3>
          <ul className="mt-5 space-y-3 text-sm leading-6 text-cocoa-700">
            <li className="flex gap-2"><span className="text-rose-500">·</span> Objednávka cez web je nezáväzný dopyt.</li>
            <li className="flex gap-2"><span className="text-rose-500">·</span> Cena pri tortách na mieru bude potvrdená po dohode.</li>
            <li className="flex gap-2"><span className="text-rose-500">·</span> Platba zatiaľ neprebieha online.</li>
            <li className="flex gap-2"><span className="text-rose-500">·</span> Vyzdvihnutie alebo doručenie sa rieši individuálne.</li>
            <li className="flex gap-2"><span className="text-rose-500">·</span> Pri svadbách odporúčam ozvať sa s niekoľko-týždňovým predstihom.</li>
          </ul>
        </aside>
      </div>
    </section>
  </main>
);

export default Contact;
