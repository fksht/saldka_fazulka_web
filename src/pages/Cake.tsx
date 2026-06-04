import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CakeConfigurator from '../components/cake/CakeConfigurator';
import GoldDivider from '../components/ui/GoldDivider';
import Toast from '../components/ui/Toast';
import { useCart } from '../context/CartContext';
import { useSeo } from '../hooks/useSeo';
import { CakeConfiguration } from '../types';
import { SECTION_IMAGES } from '../data/sladkaFazulkaCatalog';

const Cake = () => {
  useSeo('/torty-na-mieru');
  const navigate = useNavigate();
  const { addCustomCake, updateCustomCake, items } = useCart();
  const [searchParams] = useSearchParams();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const editId = searchParams.get('edit');
  const editingItem = editId
    ? items.find((item) => item.productId === editId && item.kind === 'custom-cake')
    : undefined;

  const handleAdd = (config: CakeConfiguration) => {
    if (editingItem) {
      updateCustomCake(editingItem.productId, config);
      navigate('/objednavka');
      return;
    }
    addCustomCake(config);
    setToastMessage(`Torta na mieru (${config.sizeName}) je pridaná do dopytu.`);
  };

  return (
    <div className="bg-cream-50">
      <section className="relative overflow-hidden border-b border-cream-200 bg-white py-16 sm:py-20">
        <div className="watercolor-wash absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold-700">Torty na mieru</p>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.05] text-cocoa-950 sm:text-5xl lg:text-6xl">
              Vyskladajte si tortu krok za krokom
            </h1>
            <div className="mt-5">
              <GoldDivider align="left" />
            </div>
            <p className="mt-5 font-script text-2xl text-rose-700">Pre výnimočné príležitosti.</p>
            <p className="mt-5 max-w-xl text-lg leading-8 text-cocoa-700">
              Vyberte si korpus, kombináciu krémov a veľkosť. Cena „od" sa potvrdí po doladení dekoru a témy. Na želanie pripravím aj vegánsku alebo low sugar verziu.
            </p>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-rose-100/40 blur-3xl" aria-hidden="true" />
            <img
              src={SECTION_IMAGES.cake3tier}
              alt="Trojposchodová torta s kvetinovou dekoráciou"
              className="mx-auto w-full max-w-sm rounded-3xl shadow-xl ring-1 ring-cream-200 lg:max-w-none"
            />
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <CakeConfigurator
            onAdd={handleAdd}
            initialConfig={editingItem?.cakeConfiguration ?? null}
            submitLabel={editingItem ? 'Uložiť zmeny torty' : undefined}
          />
        </div>
      </section>

      {toastMessage && (
        <Toast
          message={toastMessage}
          actionLabel="Prejsť na dopyt"
          onAction={() => navigate('/objednavka')}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
};

export default Cake;
