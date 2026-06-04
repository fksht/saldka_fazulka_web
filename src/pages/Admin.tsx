import { FormEvent, useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  CakeSlice,
  Images,
  LayoutDashboard,
  Loader2,
  Lock,
  LogOut,
  PackageCheck,
  ShoppingBag,
  UploadCloud,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import CakeBuilderManager from '../components/admin/CakeBuilderManager';
import GalleryManager from '../components/admin/GalleryManager';
import OrderDashboard from '../components/admin/OrderDashboard';
import PackageManager from '../components/admin/PackageManager';
import ProductManager from '../components/admin/ProductManager';
import { SECTION_IMAGES } from '../data/sladkaFazulkaCatalog';
import { dataService, isSupabaseBackend } from '../services/dataService';
import { supabase } from '../services/supabaseClient';

type AdminTab = 'orders' | 'products' | 'packages' | 'cakes' | 'gallery';

const tabs: Array<{ id: AdminTab; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'orders', label: 'Objednávky', icon: LayoutDashboard },
  { id: 'products', label: 'Produkty', icon: ShoppingBag },
  { id: 'packages', label: 'Balíčky', icon: PackageCheck },
  { id: 'cakes', label: 'Torty na mieru', icon: CakeSlice },
  { id: 'gallery', label: 'Galéria', icon: Images },
];

const adminPassword = ((import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) ?? '').trim();

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('orders');

  // --- Authentication ---
  const [isLoggedIn, setIsLoggedIn] = useState(
    () =>
      !isSupabaseBackend &&
      Boolean(adminPassword) &&
      window.sessionStorage.getItem('sladka-fazulka.admin') === 'true',
  );
  // For Supabase we must first check for an existing session before showing the form.
  const [authReady, setAuthReady] = useState(!isSupabaseBackend);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    if (!isSupabaseBackend || !supabase) return;
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setIsLoggedIn(Boolean(data.session));
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session));
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError(null);

    if (isSupabaseBackend && supabase) {
      setLoggingIn(true);
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      setLoggingIn(false);
      if (error) {
        setLoginError('Prihlásenie zlyhalo. Skontroluj email a heslo.');
        return;
      }
      // onAuthStateChange flips isLoggedIn.
      return;
    }

    if (!adminPassword) {
      setLoginError('Prístup ešte nie je pripravený. Skontroluj nastavenie hesla.');
      return;
    }
    if (password === adminPassword) {
      window.sessionStorage.setItem('sladka-fazulka.admin', 'true');
      setIsLoggedIn(true);
      return;
    }
    setLoginError('Heslo nesedí. Skús ho skontrolovať.');
  };

  const handleLogout = async () => {
    if (isSupabaseBackend && supabase) {
      await supabase.auth.signOut();
    } else {
      window.sessionStorage.removeItem('sladka-fazulka.admin');
    }
    setIsLoggedIn(false);
    setPassword('');
    setEmail('');
  };

  // --- First-run catalog import (Supabase only) ---
  const [needsSeed, setNeedsSeed] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedError, setSeedError] = useState<string | null>(null);
  const [seedDone, setSeedDone] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !isSupabaseBackend) return;
    dataService
      .needsSeeding()
      .then(setNeedsSeed)
      .catch(() => setNeedsSeed(false));
  }, [isLoggedIn]);

  const handleSeed = async () => {
    setSeeding(true);
    setSeedError(null);
    try {
      await dataService.seedCatalog();
      setNeedsSeed(false);
      setSeedDone(true);
    } catch (error) {
      setSeedError(error instanceof Error ? error.message : 'Import zlyhal.');
    } finally {
      setSeeding(false);
    }
  };

  const loginDisabled = !isSupabaseBackend && !adminPassword;

  if (!authReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream-50">
        <Loader2 className="h-7 w-7 animate-spin text-rose-600" aria-hidden="true" />
      </main>
    );
  }

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-cream-50 px-4 py-10">
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center">
          <section className="w-full rounded-3xl border border-cream-200 bg-white p-8 shadow-xl">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-700 ring-1 ring-rose-100">
              <Lock className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold-700">Sladká fazuľka</p>
              <h1 className="mt-2 font-display text-3xl font-semibold text-cocoa-950">Správa ponuky</h1>
              <p className="mt-3 text-sm leading-6 text-cocoa-600">
                Súkromný vstup pre úpravu ponuky, objednávok a galérie.
              </p>
            </div>

            <form onSubmit={handleLogin} className="mt-7 space-y-4">
              {isSupabaseBackend && (
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-cocoa-700">Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="username"
                    className="w-full rounded-lg border border-cream-200 bg-cream-50 px-4 py-3 text-cocoa-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                    placeholder="email@priklad.sk"
                    autoFocus
                  />
                </label>
              )}
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-cocoa-700">Heslo</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={loginDisabled}
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-cream-200 bg-cream-50 px-4 py-3 text-center text-cocoa-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                  placeholder="••••••••"
                  autoFocus={!isSupabaseBackend}
                />
              </label>
              {loginDisabled && (
                <p className="rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-800">
                  Prístup ešte nie je pripravený. Skontroluj nastavenie hesla.
                </p>
              )}
              {loginError && <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{loginError}</p>}
              <button
                type="submit"
                disabled={loginDisabled || loggingIn}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-cocoa-800 px-5 py-3 font-bold text-white transition hover:bg-cocoa-900 disabled:pointer-events-none disabled:opacity-50"
              >
                {loggingIn && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                Vstúpiť
              </button>
            </form>

            <Link to="/" className="mt-6 block text-center text-sm font-semibold text-cocoa-500 transition hover:text-cocoa-900">
              ← Späť na web
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-cream-200 pb-6 lg:flex-row lg:items-center">
          <Link to="/" className="flex items-center gap-3 leading-none">
            <img
              src={SECTION_IMAGES.logo}
              alt="Sladká fazuľka — logo"
              className="h-12 w-auto"
              width={96}
              height={70}
            />
            <span className="flex flex-col">
              <span className="font-display text-3xl font-semibold italic text-cocoa-950">Sladká fazuľka</span>
              <span className="mt-1 text-[11px] font-bold uppercase tracking-[0.28em] text-gold-700">Správa ponuky</span>
            </span>
          </Link>
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

        {!isSupabaseBackend && (
          <div
            className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"
            role="status"
          >
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-none text-amber-600" aria-hidden="true" />
            <div>
              <p className="font-bold">Skúšobný režim — zmeny sa ukladajú iba do tohto prehliadača.</p>
              <p className="mt-1 text-amber-800">
                Zmeny produktov, balíčkov, objednávok a galérie sú teraz viditeľné iba v tomto prehliadači.
                Pred ostrým spustením treba zapnúť spoločné úložisko a plnohodnotné prihlasovanie.
              </p>
            </div>
          </div>
        )}

        {isSupabaseBackend && needsSeed && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-cocoa-800 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <UploadCloud className="mt-0.5 h-5 w-5 flex-none text-rose-600" aria-hidden="true" />
              <div>
                <p className="font-bold text-cocoa-900">Databáza je zatiaľ prázdna.</p>
                <p className="mt-1">Jedným kliknutím naimportujte aktuálnu ponuku (produkty, galériu a balíčky).</p>
                {seedError && <p className="mt-1 font-semibold text-red-700">{seedError}</p>}
              </div>
            </div>
            <button
              type="button"
              onClick={handleSeed}
              disabled={seeding}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-cocoa-800 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-cocoa-900 disabled:opacity-50"
            >
              {seeding ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <UploadCloud className="h-4 w-4" aria-hidden="true" />}
              Importovať aktuálnu ponuku
            </button>
          </div>
        )}

        {isSupabaseBackend && seedDone && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
            <CheckCircle2 className="h-5 w-5 flex-none text-emerald-600" aria-hidden="true" />
            Ponuka bola naimportovaná. Obnovte stránku, ak sa zoznamy hneď nezobrazia.
          </div>
        )}

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
            {activeTab === 'packages' && <PackageManager />}
            {activeTab === 'cakes' && <CakeBuilderManager />}
            {activeTab === 'gallery' && <GalleryManager />}
          </section>
        </div>
      </div>
    </main>
  );
};

export default AdminPage;
