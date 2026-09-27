import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  structuredData?: Record<string, any> | Array<Record<string, any>>;
  noIndex?: boolean;
}

const DEFAULT_TITLE = 'Central Fire Safety Institute (CFSI) | Fire & Safety Courses in Vadodara, Gujarat';
const DEFAULT_DESCRIPTION = 'Central Fire Safety Institute (CFSI) Vadodara is an ISO 9001:2015 certified premier institute offering Government-recognized Diploma, Sub-Fire Officer, and Industrial Safety courses with 100% practical ground drill training.';
const DEFAULT_KEYWORDS = 'fire safety institute vadodara, fire safety courses gujarat, sub fire officer diploma, industrial safety course, firefighter training institute, CFSI vadodara, disaster management courses, fire engineering institute india';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=1200&q=80';

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  canonicalUrl,
  ogImage = DEFAULT_IMAGE,
  ogType = 'website',
  structuredData,
  noIndex = false,
}) => {
  const location = useLocation();

  useEffect(() => {
    // 1. Format document title
    const fullTitle = title 
      ? `${title} | Central Fire Safety Institute (CFSI)`
      : DEFAULT_TITLE;
    document.title = fullTitle;

    // 2. Helper to set or create meta tags
    const setMeta = (attr: 'name' | 'property', key: string, content: string) => {
      let element = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, key);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Standard Meta
    setMeta('name', 'description', description);
    setMeta('name', 'keywords', keywords);
    setMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');

    // Canonical link
    const currentUrl = canonicalUrl || `${window.location.origin}${location.pathname}`;
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', currentUrl);

    // OpenGraph (Facebook, WhatsApp, LinkedIn preview cards)
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:image', ogImage);
    setMeta('property', 'og:url', currentUrl);
    setMeta('property', 'og:type', ogType);
    setMeta('property', 'og:site_name', 'Central Fire Safety Institute (CFSI)');
    setMeta('property', 'og:locale', 'en_IN');

    // Twitter Card
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', ogImage);

    // 3. Structured Data (JSON-LD)
    const scriptId = 'cfsi-seo-jsonld';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (structuredData) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = scriptId;
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.text = JSON.stringify(structuredData);
    } else if (scriptTag) {
      scriptTag.remove();
    }
  }, [title, description, keywords, canonicalUrl, ogImage, ogType, structuredData, noIndex, location.pathname]);

  return null;
};
