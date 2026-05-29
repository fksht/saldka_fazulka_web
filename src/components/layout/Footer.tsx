import { Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CONTACT_INFO } from '../../services/mockData';
import { SECTION_IMAGES } from '../../data/sladkaFazulkaCatalog';

const Footer = () => (
  <footer className="bg-cocoa-950 text-cream-100">
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="grid gap-12 md:grid-cols-[1.2fr_0.9fr_0.9fr]">
        <div>
          <Link to="/" className="inline-flex items-center gap-3">
            <img
              src={SECTION_IMAGES.logo}
              alt="Sladká fazuľka"
              className="h-14 w-auto drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]"
              width={112}
              height={82}
            />
            <span className="font-display text-2xl font-semibold italic text-white">Sladká fazuľka</span>
          </Link>
          <p className="mt-3 font-script text-2xl text-gold-300">Candy bary, zákusky a torty na mieru</p>
          <p className="mt-5 max-w-sm leading-7 text-cream-200">
            Ručná výroba pre svadby, oslavy a výnimočné príležitosti — s dôrazom na chuť a detail.
          </p>
          <p className="mt-4 text-[11px] uppercase tracking-[0.28em] text-gold-300">Domáca dielňa · Košice</p>
        </div>

        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.28em] text-rose-200">Web</h2>
          <nav className="mt-4 grid gap-2 text-cream-200">
            <Link to="/ponuka" className="transition hover:text-white">Ponuka zákuskov</Link>
            <Link to="/torty-na-mieru" className="transition hover:text-white">Torty na mieru</Link>
            <Link to="/candy-bar" className="transition hover:text-white">Candy bar balíčky</Link>
            <Link to="/svadobne-vysluzky" className="transition hover:text-white">Svadobné výslužky</Link>
            <Link to="/ochutnavkovy-box" className="transition hover:text-white">Ochutnávkový box</Link>
            <Link to="/galeria" className="transition hover:text-white">Galéria</Link>
          </nav>
        </div>

        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.28em] text-rose-200">Kontakt</h2>
          <ul className="mt-4 space-y-3 text-sm text-cream-200">
            <li className="flex gap-3">
              <Mail className="mt-0.5 h-4 w-4 text-rose-200" aria-hidden="true" />
              <span>
                {CONTACT_INFO.emailNeedsReview ? (
                  <>
                    {CONTACT_INFO.email}
                    <span className="mt-1 block text-xs text-amber-200">overiť pred publikovaním</span>
                  </>
                ) : (
                  <a href={`mailto:${CONTACT_INFO.email}`} className="transition hover:text-white">
                    {CONTACT_INFO.email}
                  </a>
                )}
              </span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 text-rose-200" aria-hidden="true" />
              <a href={`tel:${CONTACT_INFO.phone.replace(/\s/g, '')}`} className="transition hover:text-white">
                {CONTACT_INFO.phone}
              </a>
            </li>
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-rose-200" aria-hidden="true" />
              <span>{CONTACT_INFO.location}</span>
            </li>
          </ul>
          <div className="mt-5 flex items-center gap-3">
            <a
              href={CONTACT_INFO.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-cream-100 transition hover:border-rose-200 hover:bg-white/10 hover:text-white"
            >
              <Instagram className="h-5 w-5" aria-hidden="true" />
            </a>
            <a
              href={CONTACT_INFO.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-cream-100 transition hover:border-rose-200 hover:bg-white/10 hover:text-white"
            >
              <Facebook className="h-5 w-5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      <div className="mt-12 flex items-center justify-center gap-3 text-gold-300">
        <span className="h-px w-16 bg-gradient-to-r from-transparent via-gold-300/60 to-gold-300/60" />
        <span className="font-script text-lg">S láskou pečené ručne</span>
        <span className="h-px w-16 bg-gradient-to-l from-transparent via-gold-300/60 to-gold-300/60" />
      </div>

      <div className="mt-8 border-t border-white/10 pt-6 text-sm text-cream-300">
        <p>© {new Date().getFullYear()} Sladká fazuľka. Objednávka cez web je nezáväzná — finálne potvrdenie prebieha po vzájomnej dohode.</p>
        <p className="mt-2 text-xs text-cream-400">
          Zákusky vyrábam v prostredí, kde sa pracuje s lepkom, mliekom, orechmi a inými alergénmi. Môžu obsahovať ich stopy.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
