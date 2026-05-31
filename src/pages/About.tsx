import { CheckCircle2 } from 'lucide-react';
import GoldDivider from '../components/ui/GoldDivider';
import SectionHeader from '../components/ui/SectionHeader';
import { ABOUT_CONTENT } from '../services/mockData';
import { useSeo } from '../hooks/useSeo';

const About = () => {
  useSeo('/o-mne');
  return (
  <div className="bg-cream-50">
    <section className="relative overflow-hidden bg-white py-16 sm:py-24">
      <div className="watercolor-wash absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <div className="relative">
          <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-rose-100/40 blur-2xl" aria-hidden="true" />
          <img
            src={ABOUT_CONTENT.imageUrl}
            alt="Zuzana Opálková — autorka Sladkej fazuľky, domácej cukrárskej dielne v Košiciach"
            className="aspect-[4/5] w-full rounded-[2rem] object-cover shadow-xl ring-1 ring-cream-200"
          />
        </div>
        <div className="flex items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold-700">{ABOUT_CONTENT.eyebrow}</p>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.1] text-cocoa-950 sm:text-5xl">
              {ABOUT_CONTENT.title}
            </h1>
            <div className="mt-5">
              <GoldDivider align="left" />
            </div>
            <p className="mt-6 text-lg leading-8 text-cocoa-700">{ABOUT_CONTENT.intro}</p>
            <p className="mt-8 font-script text-4xl text-rose-700">{ABOUT_CONTENT.signature}</p>
            <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-cocoa-500">
              Zuzana Opálková · Sladká fazuľka, Košice
            </p>
          </div>
        </div>
      </div>
    </section>

    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Prečo Sladká fazuľka"
          title="Premyslený výber, ručná práca, osobný prístup"
          scriptEyebrow="Prehľadná ponuka = jednoduché rozhodovanie"
          withDivider
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {ABOUT_CONTENT.reasons.map((reason) => (
            <article
              key={reason.title}
              className="group flex h-full flex-col rounded-2xl border border-cream-200 bg-white p-6 transition hover:border-rose-200 hover:shadow-md"
            >
              <CheckCircle2 className="mb-4 h-5 w-5 text-sage-600 transition group-hover:scale-110" aria-hidden="true" />
              <h3 className="font-display text-lg font-semibold text-cocoa-950">{reason.title}</h3>
              <p className="mt-2 text-sm leading-6 text-cocoa-600">{reason.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-cream-50 p-8 sm:p-10">
          <div className="watercolor-wash absolute inset-0 opacity-50" aria-hidden="true" />
          <div className="relative">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold-700">Rozprávka</p>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-cocoa-950">{ABOUT_CONTENT.legend.title}</h2>
            <div className="mt-4">
              <GoldDivider align="left" />
            </div>
            <div className="mt-5 space-y-4 text-base leading-7 text-cocoa-700">
              {ABOUT_CONTENT.legend.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-gold-200 bg-cream-50 p-8 sm:p-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold-700">Fazuľkové špeciality</p>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-cocoa-950">
            {ABOUT_CONTENT.fazulkyUsp.title}
          </h2>
          <p className="mt-3 font-script text-2xl text-rose-700">#bezmuky · #bezmlieka</p>
          <ul className="mt-6 space-y-3 text-base leading-7 text-cocoa-700">
            {ABOUT_CONTENT.fazulkyUsp.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-3">
                <span className="mt-2 inline-block h-1.5 w-1.5 flex-none rounded-full bg-rose-500" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  </div>
  );
};

export default About;
