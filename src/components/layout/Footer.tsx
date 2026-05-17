import { Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CONTACT_INFO } from '../../services/mockData';

const Footer = () => (
  <footer className="bg-cocoa-950 text-cream-100">
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-10 md:grid-cols-[1.2fr_0.9fr_0.9fr]">
        <div>
          <Link to="/" className="font-serif text-3xl font-bold italic text-white">
            Sladká fazuľka
          </Link>
          <p className="mt-4 max-w-sm leading-7 text-cream-200">
            Domáce torty, sladké boxy a dezerty na objednávku. Poctivo, jemne a s dôrazom na detail.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.22em] text-rose-200">Navigácia</h2>
          <nav className="mt-4 grid gap-2 text-cream-200">
            <Link to="/ponuka" className="hover:text-white">Ponuka</Link>
            <Link to="/galeria" className="hover:text-white">Galéria</Link>
            <Link to="/objednavka" className="hover:text-white">Objednávka</Link>
            <Link to="/admin" className="hover:text-white">Admin</Link>
          </nav>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.22em] text-rose-200">Kontakt</h2>
          <ul className="mt-4 space-y-3 text-sm text-cream-200">
            <li className="flex gap-3">
              <Mail className="mt-0.5 h-4 w-4 text-rose-200" aria-hidden="true" />
              <a href={`mailto:${CONTACT_INFO.email}`} className="hover:text-white">{CONTACT_INFO.email}</a>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 text-rose-200" aria-hidden="true" />
              <a href={`tel:${CONTACT_INFO.phone.replace(/\s/g, '')}`} className="hover:text-white">{CONTACT_INFO.phone}</a>
            </li>
            <li className="flex gap-3">
              <Instagram className="mt-0.5 h-4 w-4 text-rose-200" aria-hidden="true" />
              <span>{CONTACT_INFO.instagram}</span>
            </li>
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-rose-200" aria-hidden="true" />
              <span>{CONTACT_INFO.location}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-10 border-t border-white/10 pt-6 text-sm text-cream-300">
        <p>© {new Date().getFullYear()} Sladká fazuľka. Objednávky sú nezáväzné do potvrdenia po dohode.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
