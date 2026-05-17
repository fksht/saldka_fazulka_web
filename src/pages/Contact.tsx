import { Instagram, Mail, MapPin, Phone, Send } from 'lucide-react';
import { ButtonLink } from '../components/ui/Button';
import SectionHeader from '../components/ui/SectionHeader';
import { CONTACT_INFO } from '../services/mockData';

const Contact = () => (
  <main className="bg-cream-50">
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Kontakt"
          title="Napíšte, zavolajte alebo pošlite predstavu cez objednávku."
          description={CONTACT_INFO.orderNote}
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Email', value: CONTACT_INFO.email, href: `mailto:${CONTACT_INFO.email}`, icon: Mail },
            { label: 'Telefón', value: CONTACT_INFO.phone, href: `tel:${CONTACT_INFO.phone.replace(/\s/g, '')}`, icon: Phone },
            { label: 'Instagram', value: CONTACT_INFO.instagram, href: '#', icon: Instagram },
            { label: 'Vyzdvihnutie', value: CONTACT_INFO.location, href: '#', icon: MapPin },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <a key={item.label} href={item.href} className="rounded-lg border border-cream-300 bg-cream-50 p-5 transition hover:border-rose-300 hover:bg-rose-50">
                <Icon className="mb-5 h-6 w-6 text-rose-600" aria-hidden="true" />
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-cocoa-400">{item.label}</p>
                <p className="mt-2 font-bold text-cocoa-950">{item.value}</p>
              </a>
            );
          })}
        </div>
      </div>
    </section>

    <section className="py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-rose-600">Ako objednať</p>
          <h2 className="mt-3 font-serif text-4xl font-bold text-cocoa-950">Najrýchlejšie je poslať dopyt cez formulár.</h2>
          <p className="mt-5 max-w-2xl leading-7 text-cocoa-600">
            Do poznámky napíšte dátum, počet porcií, obľúbené príchute, alergie a predstavu dekoru. Pri tortách na mieru môžete pridať aj odkaz na inšpiráciu.
          </p>
          <ButtonLink to="/objednavka" className="mt-8">
            Poslať objednávku
            <Send className="h-4 w-4" aria-hidden="true" />
          </ButtonLink>
        </div>
        <div className="rounded-lg border border-cream-300 bg-white p-6">
          <h3 className="font-serif text-2xl font-bold text-cocoa-950">Dôležité poznámky</h3>
          <ul className="mt-5 space-y-3 text-sm leading-6 text-cocoa-600">
            <li>Objednávka cez web je nezáväzný dopyt.</li>
            <li>Cena pri tortách na mieru bude potvrdená po dohode.</li>
            <li>Platba zatiaľ neprebieha online.</li>
            <li>Vyzdvihnutie alebo doručenie sa rieši individuálne.</li>
          </ul>
        </div>
      </div>
    </section>
  </main>
);

export default Contact;
