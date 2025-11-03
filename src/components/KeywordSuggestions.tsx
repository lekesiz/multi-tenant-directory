'use client';

import { useState, useEffect } from 'react';

interface KeywordSuggestionsProps {
  companyName: string;
  category: string;
  city: string;
  description?: string;
  currentTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export default function KeywordSuggestions({
  companyName,
  category,
  city,
  description = '',
  currentTags,
  onTagsChange,
}: KeywordSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Generate keyword suggestions based on company data
  useEffect(() => {
    const generateSuggestions = () => {
      const suggested: string[] = [];

      // Category-based keywords
      const categoryKeywords: Record<string, string[]> = {
        'restaurant': ['cuisine', 'gastronomie', 'repas', 'déjeuner', 'dîner', 'menu', 'carte', 'chef'],
        'cafe': ['café', 'boissons', 'terrasse', 'petit-déjeuner', 'croissant', 'espresso'],
        'boulangerie': ['pain', 'viennoiserie', 'pâtisserie', 'artisanal', 'frais', 'tradition'],
        'hotel': ['hébergement', 'chambre', 'séjour', 'nuitée', 'réservation', 'confort'],
        'pharmacie': ['médicaments', 'santé', 'ordonnance', 'conseil', 'soins'],
        'coiffeur': ['coiffure', 'coupe', 'coloration', 'brushing', 'cheveux', 'salon'],
        'garage': ['réparation', 'mécanique', 'entretien', 'auto', 'voiture', 'révision'],
        'boucherie': ['viande', 'boucher', 'charcuterie', 'qualité', 'local', 'artisan'],
        'fleuriste': ['fleurs', 'bouquet', 'composition', 'mariage', 'décoration'],
        'supermarche': ['courses', 'alimentation', 'épicerie', 'produits frais', 'discount'],
        'librairie': ['livres', 'lecture', 'romans', 'jeunesse', 'BD', 'papeterie'],
        'veterinaire': ['animaux', 'soins vétérinaires', 'consultation', 'vaccins', 'urgence'],
        'plombier': ['plomberie', 'dépannage', 'installation', 'réparation', 'eau', 'chauffage'],
        'electricien': ['électricité', 'installation électrique', 'dépannage', 'rénovation'],
        'avocat': ['juridique', 'conseil', 'droit', 'assistance', 'contentieux'],
        'medecin': ['médecin', 'consultation', 'santé', 'soins', 'diagnostic', 'cabinet'],
        'dentiste': ['dentaire', 'soins dentaires', 'implants', 'orthodontie', 'blanchiment'],
        'opticien': ['lunettes', 'verres', 'optique', 'vue', 'monture', 'lentilles'],
        'banque': ['bancaire', 'crédit', 'compte', 'épargne', 'prêt', 'assurance'],
        'assurance': ['assurances', 'protection', 'garantie', 'contrat', 'sinistre'],
        'immobilier': ['immobilier', 'achat', 'vente', 'location', 'estimation', 'bien'],
        'agence-voyage': ['voyage', 'séjour', 'vacances', 'réservation', 'circuit', 'croisière'],
        'salle-sport': ['fitness', 'musculation', 'sport', 'gym', 'coaching', 'cardio'],
        'institut-beaute': ['beauté', 'soin', 'esthétique', 'massage', 'épilation', 'manucure'],
        'pressing': ['nettoyage à sec', 'repassage', 'pressing', 'entretien vêtements'],
      };

      // Add category-specific keywords
      const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
      const categoryWords = categoryKeywords[categorySlug] || [];
      suggested.push(...categoryWords.slice(0, 5));

      // Add city-based keyword
      if (city) {
        suggested.push(`${category.toLowerCase()} ${city.toLowerCase()}`);
        suggested.push(`${city.toLowerCase()}`);
      }

      // Extract keywords from description (common business terms)
      if (description) {
        const businessTerms = [
          'qualité', 'service', 'professionnel', 'expérience', 'tradition',
          'moderne', 'artisanal', 'local', 'conseil', 'expertise',
          'rapide', 'efficace', 'garantie', 'certifié', 'agréé',
          'famille', 'convivial', 'accueil', 'personnalisé'
        ];

        const descWords = description.toLowerCase().split(/\s+/);
        businessTerms.forEach(term => {
          if (descWords.some(word => word.includes(term))) {
            suggested.push(term);
          }
        });
      }

      // Extract unique words from company name (but not common words)
      const commonWords = ['le', 'la', 'les', 'de', 'du', 'des', 'et', 'chez', 'au', 'aux'];
      const nameWords = companyName.toLowerCase().split(/\s+/)
        .filter(word => word.length > 3 && !commonWords.includes(word));
      suggested.push(...nameWords);

      // Remove duplicates and current tags
      const unique = [...new Set(suggested)]
        .filter(tag => !currentTags.includes(tag))
        .slice(0, 12); // Limit to 12 suggestions

      setSuggestions(unique);
    };

    generateSuggestions();
  }, [companyName, category, city, description, currentTags]);

  const addTag = (tag: string) => {
    if (!currentTags.includes(tag)) {
      onTagsChange([...currentTags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    onTagsChange(currentTags.filter(t => t !== tag));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue.trim().toLowerCase());
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const filteredSuggestions = suggestions.filter(s =>
    s.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mots-clés SEO
        </label>

        {/* Current Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {currentTags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-2 text-blue-600 hover:text-blue-800"
                aria-label={`Supprimer ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>

        {/* Input */}
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onKeyDown={handleInputKeyDown}
            placeholder="Ajouter un mot-clé..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />

          {/* Dropdown Suggestions */}
          {showSuggestions && inputValue && filteredSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    addTag(suggestion);
                    setInputValue('');
                    setShowSuggestions(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="mt-2 text-sm text-gray-500">
          Appuyez sur Entrée pour ajouter un mot-clé personnalisé
        </p>
      </div>

      {/* Suggested Keywords */}
      {suggestions.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            💡 Suggestions basées sur votre activité:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 8).map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => addTag(suggestion)}
                className="px-3 py-1 rounded-full text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-500 transition-colors"
              >
                + {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          <strong>💡 Astuce SEO:</strong> Les mots-clés aident à améliorer le référencement de votre entreprise.
          Ajoutez 5-10 mots-clés pertinents liés à votre activité et votre localisation.
        </p>
      </div>
    </div>
  );
}
