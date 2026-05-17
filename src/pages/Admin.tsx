import { FormEvent, useState } from 'react';
import { ExternalLink, Images, LayoutDashboard, Lock, LogOut, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import GalleryManager from '../components/admin/GalleryManager';
import OrderDashboard from '../components/admin/OrderDashboard';
import ProductManager from '../components/admin/ProductManager';

type AdminTab = 'orders' | 'products' | 'gallery';

const tabs: Array<{ id: AdminTab; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'orders', label: 'Objednávky', icon: LayoutDashboard },
  { id: 'products', label: 'Produkty', icon: ShoppingBag },
  { id: 'gallery', label: 'Galéria', icon: Images },
];

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('orders');
  const [isLoggedIn, setIsLoggedIn] = useState(() => window.sessionStorage.getItem('sladka-fazulka.admin') === 'true');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const adminPassword = (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) || 'fazulka-demo';

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password === adminPassword) {
      window.sessionStorage.setItem('sladka-fazulka.admin', 'true');
      setIsLoggedIn(true);
      setLoginError(null);
      return;
    }

    setLoginError('Heslo nesedí. Skúste ho skontrolovať.');
  };

  const handleLogout = () => {
    window.sessionStorage.removeItem('sladka-fazulka.admin');
    setIsLoggedIn(false);
    setPassword('');
  };

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-cream-50 px-4 py-10">
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center">
          <section className="w-full rounded-lg border border-cream-300 bg-white p-7 shadow-xl">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-700">
              <Lock className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-rose-600">Sladká fazuľka</p>
              <h1 className="mt-2 font-serif text-3xl font-bold text-cocoa-950">Administrácia</h1>
              <p className="mt-3 text-sm leading-6 text-cocoa-600">
                Demo prístup chráni lokálne úpravy. Produkčná verzia má byť napojená na Supabase alebo Firebase auth.
              </p>
            </div>

            <form onSubmit={handleLogin} className="mt-7 space-y-4">
              <label>
                <span className="mb-1 block text-sm font-semibold text-cocoa-700">Heslo</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-lg border border-cream-300 bg-white px-4 py-3 text-center text-cocoa-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                  placeholder="••••••••"
                  autoFocus
                />
              </label>
              {loginError && <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{loginError}</p>}
              <button type="submit" className="w-full rounded-full bg-cocoa-800 px-5 py-3 font-bold text-white transition hover:bg-cocoa-900">
                Vstúpiť
              </button>
            </form>

            <Link to="/" className="mt-6 block text-center text-sm font-semibold text-cocoa-500 hover:text-cocoa-900">
              Späť na web
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-cream-300 pb-6 lg:flex-row lg:items-center">
          <div>
            <Link to="/" className="font-serif text-3xl font-bold italic text-cocoa-950">
              Sladká fazuľka
            </Link>
            <p className="mt-1 text-sm font-semibold uppercase tracking-[0.22em] text-rose-600">Creator Studio</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/"
              target="_blank"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-cream-300 bg-white px-5 py-2.5 text-sm font-semibold text-cocoa-700 transition hover:border-rose-300 hover:bg-rose-50"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Zobraziť web
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Odhlásiť
            </button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside>
            <nav className="grid gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex min-h-11 items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-bold transition ${
                      activeTab === tab.id ? 'bg-cocoa-800 text-white shadow-sm' : 'text-cocoa-600 hover:bg-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          <section>
            {activeTab === 'orders' && <OrderDashboard />}
            {activeTab === 'products' && <ProductManager />}
            {activeTab === 'gallery' && <GalleryManager />}
          </section>
        </div>
      </div>
    </main>
  );
};

export default AdminPage;
