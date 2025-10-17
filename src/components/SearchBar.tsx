'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Star, MapPin } from 'lucide-react';

interface Suggestion {
  id: number;
  name: string;
  slug: string;
  city: string;
  category: string | null;
  rating: number | null;
  reviewCount: number;
  label: string;
}

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || searchParams.get('search') || '');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        fetchSuggestions();
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/search/suggestions?q=${encodeURIComponent(query)}&limit=10`
      );
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
        setIsOpen(data.suggestions?.length > 0);
        setSelectedIndex(-1);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/annuaire?search=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
    }
  };

  const handleSelectSuggestion = (slug: string) => {
    router.push(`/companies/${slug}`);
    setIsOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectSuggestion(suggestions[selectedIndex].slug);
        } else if (query.trim()) {
          handleSearch(e as any);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full relative">
      <form onSubmit={handleSearch} className="w-full">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && suggestions.length > 0 && setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher un professionnel, une activité..."
            className="w-full px-6 py-4 pr-32 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            autoComplete="off"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            {isLoading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            )}
          </button>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              onClick={() => handleSelectSuggestion(suggestion.slug)}
              className={`w-full text-left px-6 py-3 border-b border-gray-100 hover:bg-blue-50 transition-colors flex items-start justify-between gap-4 ${
                index === selectedIndex ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 truncate">
                  {suggestion.name}
                </div>
                <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                  {suggestion.city && (
                    <>
                      <MapPin className="w-4 h-4" />
                      {suggestion.city}
                    </>
                  )}
                  {suggestion.category && (
                    <span className="text-gray-500 ml-2">• {suggestion.category}</span>
                  )}
                </div>
              </div>
              {suggestion.rating !== null && (
                <div className="text-right whitespace-nowrap">
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">
                      {suggestion.rating.toFixed(1)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {suggestion.reviewCount} avis
                  </div>
                </div>
              )}
            </button>
          ))}

          {query.trim() && (
            <button
              onClick={handleSearch}
              className="w-full text-center px-6 py-3 text-blue-600 font-semibold hover:bg-blue-50 transition-colors"
            >
              Voir tous les résultats pour "{query}"
            </button>
          )}
        </div>
      )}
    </div>
  );
}

