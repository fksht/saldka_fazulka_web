import { useEffect } from 'react';
import seoConfig from '../seo/pageSeo.json';

type PageSeo = { path: string; title: string; description: string };

const { siteUrl, defaultTitle, pages } = seoConfig as {
  siteUrl: string;
  defaultTitle: string;
  pages: PageSeo[];
};

const seoByPath = new Map(pages.map((page) => [page.path, page]));

const setMeta = (selector: string, attr: 'name' | 'property', key: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

const setCanonical = (href: string) => {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
};

/**
 * Keeps the document title and primary meta tags in sync with the current route.
 * The build step (scripts/generate-static-routes.mjs) bakes the same values into
 * each route's static HTML for crawlers; this hook updates them during SPA navigation.
 */
export const useSeo = (path: string) => {
  useEffect(() => {
    const page = seoByPath.get(path);
    const title = page?.title ?? defaultTitle;
    const description = page?.description;
    const canonical = path === '/' ? `${siteUrl}/` : `${siteUrl}${path}/`;

    document.title = title;
    setCanonical(canonical);
    setMeta('meta[property="og:title"]', 'property', 'og:title', title);
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonical);
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);

    if (description) {
      setMeta('meta[name="description"]', 'name', 'description', description);
      setMeta('meta[property="og:description"]', 'property', 'og:description', description);
      setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    }
  }, [path]);
};
