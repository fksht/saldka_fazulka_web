import { Facebook, Instagram, Menu as MenuIcon, ShoppingBasket, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { CONTACT_INFO, SECTION_IMAGES } from '../../data/sladkaFazulkaCatalog';

const navLinks = [
  { name: 'O Sladkej Fazuľke', path: '/o-mne' },
  { name: 'Ponuka', path: '/ponuka' },
  { name: 'Torty na mieru', path: '/torty-na-mieru' },
  { name: 'Candy bar', path: '/candy-bar' },
  { name: 'Výslužky', path: '/svadobne-vysluzky' },
  { name: 'Ochutnávkový box', path: '/ochutnavkovy-box' },
  { name: 'Galéria', path: '/galeria' },
  { name: 'Kontakt', path: '/kontakt' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-cream-200 bg-cream-50/95 backdrop-blur">
      <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8 2xl:max-w-[1600px] 2xl:px-10" aria-label="Hlavná navigácia">
        <Link to="/" className="flex items-center gap-3 leading-none" onClick={() => setIsOpen(false)}>
          <img
            src={SECTION_IMAGES.logo}
            alt="Sladká fazuľka — logo"
            className="h-11 w-auto"
            width={88}
            height={64}
          />
          <span className="hidden flex-col sm:flex">
            <span className="font-display text-xl font-semibold italic text-cocoa-950">Sladká fazuľka</span>
            <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.28em] text-gold-500">Candy bary · zákusky · torty</span>
          </span>
        </Link>

        <div className="hidden items-center gap-4 xl:flex 2xl:gap-6">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `whitespace-nowrap text-sm font-semibold tracking-tight transition ${isActive ? 'text-rose-700' : 'text-cocoa-700 hover:text-cocoa-950'}`
              }
            >
              {link.name}
            </NavLink>
          ))}
          <Link
            to="/objednavka"
            className="relative inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-cocoa-800 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-cocoa-900"
          >
            <ShoppingBasket className="h-4 w-4" aria-hidden="true" />
            Objednať
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-rose-500 px-1 text-xs font-bold text-white">
                {itemCount}
              </span>
            )}
          </Link>
          <span className="h-6 w-px bg-cream-300" aria-hidden="true" />
          <a
            href={CONTACT_INFO.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-cocoa-700 transition hover:bg-cream-100 hover:text-rose-700"
          >
            <Instagram className="h-5 w-5" aria-hidden="true" />
          </a>
          <a
            href={CONTACT_INFO.facebook}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-cocoa-700 transition hover:bg-cream-100 hover:text-rose-700"
          >
            <Facebook className="h-5 w-5" aria-hidden="true" />
          </a>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-cocoa-800 hover:bg-cream-100 xl:hidden"
        >
          <span className="sr-only">Otvoriť menu</span>
          {isOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <MenuIcon className="h-6 w-6" aria-hidden="true" />}
        </button>
      </nav>

      {isOpen && (
        <div className="max-h-[calc(100vh-72px)] overflow-y-auto border-t border-cream-200 bg-cream-50 px-4 pb-5 pt-2 xl:hidden">
          <div className="grid gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-3 text-base font-semibold ${isActive ? 'bg-rose-50 text-rose-700' : 'text-cocoa-700 hover:bg-cream-100'}`
                }
              >
                {link.name}
              </NavLink>
            ))}
            <Link
              to="/objednavka"
              onClick={() => setIsOpen(false)}
              className="mt-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-cocoa-800 px-5 py-3 font-bold text-white"
            >
              <ShoppingBasket className="h-4 w-4" aria-hidden="true" />
              Nezáväzná objednávka {itemCount > 0 ? `(${itemCount})` : ''}
            </Link>
            <div className="mt-3 flex items-center justify-center gap-3">
              <a
                href={CONTACT_INFO.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-cream-200 text-cocoa-700 transition hover:bg-cream-100 hover:text-rose-700"
              >
                <Instagram className="h-5 w-5" aria-hidden="true" />
              </a>
              <a
                href={CONTACT_INFO.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-cream-200 text-cocoa-700 transition hover:bg-cream-100 hover:text-rose-700"
              >
                <Facebook className="h-5 w-5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
