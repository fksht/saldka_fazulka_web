import { Award, Heart, Sparkles } from 'lucide-react';
import SectionHeader from '../components/ui/SectionHeader';
import { ABOUT_CONTENT } from '../services/mockData';

const About = () => (
  <div className="bg-cream-50">
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
        <div>
          <img
            src={ABOUT_CONTENT.imageUrl}
            alt="Zuzka pri príprave domácich sladkostí"
            className="aspect-[4/5] w-full rounded-lg object-cover shadow-xl"
          />
        </div>
        <div className="flex items-center">
          <div>
            <SectionHeader
              align="left"
              eyebrow={ABOUT_CONTENT.eyebrow}
              title={ABOUT_CONTENT.title}
            />
            <div className="mt-7 space-y-5 text-base leading-8 text-cocoa-600">
              {ABOUT_CONTENT.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <p className="mt-8 font-serif text-3xl font-bold italic text-rose-700">{ABOUT_CONTENT.signature}</p>
          </div>
        </div>
      </div>
    </section>

    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { title: 'Poctivá chuť', text: 'Krém, korpus a plnky sú pripravené tak, aby boli jemné a vyvážené.', icon: Heart },
            { title: 'Premyslený vzhľad', text: 'Dekor má doplniť oslavu, nie prebiť samotnú tortu.', icon: Sparkles },
            { title: 'Spoľahlivá dohoda', text: 'Termín, cena a detaily sú jasné ešte pred potvrdením objednávky.', icon: Award },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-lg border border-cream-300 bg-white p-6">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-rose-50 text-rose-700">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-bold text-cocoa-950">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-cocoa-600">{item.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  </div>
);

export default About;
