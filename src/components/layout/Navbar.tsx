import { Menu as MenuIcon, ShoppingBasket, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const navLinks = [
  { name: 'Domov', path: '/' },
  { name: 'O mne', path: '/o-mne' },
  { name: 'Ponuka', path: '/ponuka' },
  { name: 'Galéria', path: '/galeria' },
  { name: 'Kontakt', path: '/kontakt' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-cream-300 bg-white/92 backdrop-blur">
      <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Hlavná navigácia">
        <Link to="/" className="flex flex-col leading-none" onClick={() => setIsOpen(false)}>
          <span className="font-serif text-2xl font-bold italic text-cocoa-950">Sladká fazuľka</span>
          <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-rose-600">domáce dobroty</span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `text-sm font-semibold transition ${isActive ? 'text-rose-700' : 'text-cocoa-600 hover:text-cocoa-950'}`
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
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-cocoa-800 hover:bg-cream-100 md:hidden"
        >
          <span className="sr-only">Otvoriť menu</span>
          {isOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <MenuIcon className="h-6 w-6" aria-hidden="true" />}
        </button>
      </nav>

      {isOpen && (
        <div className="border-t border-cream-300 bg-white px-4 pb-5 pt-2 md:hidden">
          <div className="grid gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-3 text-base font-semibold ${isActive ? 'bg-rose-50 text-rose-700' : 'text-cocoa-700 hover:bg-cream-50'}`
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
              Objednať sladkosť {itemCount > 0 ? `(${itemCount})` : ''}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
