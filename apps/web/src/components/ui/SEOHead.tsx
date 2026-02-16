import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  price?: number;
  currency?: string;
  siteName?: string;
  publishedDate?: string;
}

/**
 * SEOHead - Updates document head with Open Graph and Twitter meta tags
 * For proper SSR support, you'd want to use react-helmet or similar
 * This is a client-side solution that works for SPAs
 */
const SEOHead = ({
  title,
  description = 'Tirgus - Latvijas tiešsaistes tirgus vieta',
  image,
  url,
  type = 'website',
  price,
  currency = 'EUR',
  siteName = 'Tirgus',
  publishedDate,
}: SEOHeadProps) => {
  useEffect(() => {
    // Update page title — guard against null
    const safeTitle = title || 'Tirgus';
    const fullTitle = `${safeTitle} | ${siteName}`;
    document.title = fullTitle;

    // Helper to set or create meta tag
    const setMetaTag = (property: string, content: string, isName = false) => {
      const attribute = isName ? 'name' : 'property';
      let meta = document.querySelector(`meta[${attribute}="${property}"]`) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, property);
        document.head.appendChild(meta);
      }
      meta.content = content || '';
    };

    // Open Graph tags (Facebook, LinkedIn, etc.)
    setMetaTag('og:title', fullTitle);
    setMetaTag('og:description', description || '');
    setMetaTag('og:type', type);
    setMetaTag('og:site_name', siteName);
    
    if (url) {
      setMetaTag('og:url', url);
    } else {
      setMetaTag('og:url', window.location.href);
    }
    
    if (image) {
      setMetaTag('og:image', image);
      setMetaTag('og:image:width', '1200');
      setMetaTag('og:image:height', '630');
    }

    // Article published time (for shared jobs/tasks)
    if (type === 'article' && publishedDate) {
      setMetaTag('article:published_time', publishedDate);
    }

    // Twitter Card tags
    setMetaTag('twitter:card', image ? 'summary_large_image' : 'summary', true);
    setMetaTag('twitter:title', fullTitle, true);
    setMetaTag('twitter:description', description || '', true);
    if (image) {
      setMetaTag('twitter:image', image, true);
    }

    // Product-specific tags (for listings/offerings)
    // Use != null to guard against both null AND undefined
    if (type === 'product' && price != null) {
      setMetaTag('og:price:amount', String(price));
      setMetaTag('og:price:currency', currency);
      setMetaTag('product:price:amount', String(price));
      setMetaTag('product:price:currency', currency);
    }

    // Standard meta description
    setMetaTag('description', description || '', true);

    // Cleanup function - reset to defaults when component unmounts
    return () => {
      document.title = 'Tirgus - Latvijas Tirgus';
      // We could remove tags here, but it's usually fine to leave them
    };
  }, [title, description, image, url, type, price, currency, siteName, publishedDate]);

  // This component doesn't render anything
  return null;
};

export default SEOHead;
