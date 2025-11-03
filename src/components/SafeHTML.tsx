'use client';

import DOMPurify from 'isomorphic-dompurify';
import { useMemo } from 'react';

interface SafeHTMLProps {
  html: string;
  className?: string;
}

/**
 * Safely renders HTML content with XSS protection
 * Uses DOMPurify to sanitize HTML before rendering
 */
export default function SafeHTML({ html, className = '' }: SafeHTMLProps) {
  const sanitizedHTML = useMemo(() => {
    if (!html) return '';

    // Configure DOMPurify to allow safe HTML elements
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre',
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'class', 'target', 'rel',
      ],
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    });
  }, [html]);

  if (!sanitizedHTML) {
    return null;
  }

  return (
    <div
      className={`prose prose-slate max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:text-gray-900 prose-li:text-gray-800 prose-a:text-blue-600 ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  );
}
