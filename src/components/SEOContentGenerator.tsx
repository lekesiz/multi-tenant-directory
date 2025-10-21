'use client';

import { logger } from '@/lib/logger';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface SEOContentGeneratorProps {
  businessData: {
    name: string;
    category: string;
    city: string;
    services: string[];
    currentDescription?: string;
  };
  onContentGenerated: (content: string, type: string) => void;
  onClose: () => void;
}

const CONTENT_TYPES = [
  {
    id: 'description',
    name: 'Description professionnelle',
    description: 'Description optimisée SEO pour votre profil entreprise',
    maxLength: 300,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 'about',
    name: 'Présentation détaillée',
    description: 'Section "À propos" complète avec mots-clés locaux',
    maxLength: 500,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'services',
    name: 'Liste des services',
    description: 'Description détaillée de vos services avec SEO',
    maxLength: 400,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    id: 'meta',
    name: 'Meta description',
    description: 'Description pour moteurs de recherche (155 caractères)',
    maxLength: 155,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
];

export default function SEOContentGenerator({ businessData, onContentGenerated, onClose }: SEOContentGeneratorProps) {
  const [selectedType, setSelectedType] = useState<string>('description');
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const selectedContentType = CONTENT_TYPES.find(type => type.id === selectedType);

  const generateContent = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/seo-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessData,
          contentType: selectedType,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération du contenu');
      }

      const data = await response.json();
      setGeneratedContent(data.content);
      setIsEditing(true);
    } catch (error) {
      logger.error('Error generating SEO content:', error);
      toast.error('Erreur lors de la génération du contenu');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAccept = () => {
    if (generatedContent.trim()) {
      onContentGenerated(generatedContent, selectedType);
      toast.success('Contenu SEO généré avec succès !');
      onClose();
    }
  };

  const handleRegenerate = () => {
    setGeneratedContent('');
    setIsEditing(false);
    generateContent();
  };

  const handleTypeChange = (typeId: string) => {
    setSelectedType(typeId);
    setGeneratedContent('');
    setIsEditing(false);
  };

  const wordCount = generatedContent.split(/\s+/).filter(word => word.length > 0).length;
  const charCount = generatedContent.length;
  const maxLength = selectedContentType?.maxLength || 300;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Générateur de Contenu SEO
                </h3>
                <p className="text-sm text-gray-600">
                  Créez du contenu optimisé pour les moteurs de recherche
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex h-[calc(90vh-120px)]">
            {/* Sidebar - Content Types */}
            <div className="w-1/3 border-r border-gray-200 p-6 overflow-y-auto">
              <h4 className="font-semibold text-gray-900 mb-4">Type de contenu</h4>
              <div className="space-y-3">
                {CONTENT_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleTypeChange(type.id)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      selectedType === type.id
                        ? 'border-purple-200 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${
                        selectedType === type.id ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {type.icon}
                      </div>
                      <div className="flex-1">
                        <h5 className={`font-medium ${
                          selectedType === type.id ? 'text-purple-900' : 'text-gray-900'
                        }`}>
                          {type.name}
                        </h5>
                        <p className={`text-sm mt-1 ${
                          selectedType === type.id ? 'text-purple-700' : 'text-gray-600'
                        }`}>
                          {type.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Max: {type.maxLength} caractères
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Business Context */}
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-2">Contexte business</h5>
                <div className="space-y-2 text-sm text-blue-800">
                  <p><span className="font-medium">Entreprise:</span> {businessData.name}</p>
                  <p><span className="font-medium">Secteur:</span> {businessData.category}</p>
                  <p><span className="font-medium">Ville:</span> {businessData.city}</p>
                  {businessData.services.length > 0 && (
                    <p><span className="font-medium">Services:</span> {businessData.services.slice(0, 3).join(', ')}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {!generatedContent && !isGenerating && (
                <div className="text-center py-12">
                  <div className="p-4 bg-purple-100 rounded-full inline-block mb-4">
                    {selectedContentType?.icon}
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {selectedContentType?.name}
                  </h4>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {selectedContentType?.description}
                  </p>
                  
                  {/* SEO Tips */}
                  <div className="mb-6 p-4 bg-yellow-50 rounded-lg max-w-md mx-auto">
                    <h5 className="font-medium text-yellow-900 mb-2">💡 Conseils SEO</h5>
                    <ul className="text-sm text-yellow-800 text-left space-y-1">
                      <li>• Mots-clés locaux intégrés naturellement</li>
                      <li>• Structure claire et lisible</li>
                      <li>• Call-to-action engageant</li>
                      <li>• Optimisé pour {businessData.city}</li>
                    </ul>
                  </div>

                  <button
                    onClick={generateContent}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Générer le contenu
                  </button>
                </div>
              )}

              {isGenerating && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <span className="text-gray-600 text-lg">Génération en cours...</span>
                  </div>
                  <p className="text-gray-500 mt-4">
                    L'IA analyse votre entreprise et crée un contenu optimisé
                  </p>
                </div>
              )}

              {generatedContent && (
                <div className="space-y-6">
                  {/* Content Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {selectedContentType?.name}
                      </h4>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <span>{charCount}/{maxLength} caractères</span>
                        <span>{wordCount} mots</span>
                        <span className={`px-2 py-1 rounded ${
                          charCount <= maxLength ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {charCount <= maxLength ? '✓ Conforme' : '⚠ Trop long'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleRegenerate}
                        disabled={isGenerating}
                        className="text-purple-600 hover:text-purple-800 text-sm font-medium disabled:opacity-50"
                      >
                        Régénérer
                      </button>
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        {isEditing ? 'Aperçu' : 'Modifier'}
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  {isEditing ? (
                    <textarea
                      value={generatedContent}
                      onChange={(e) => setGeneratedContent(e.target.value)}
                      className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Modifiez le contenu généré..."
                    />
                  ) : (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <pre className="whitespace-pre-wrap text-gray-800 font-sans">
                        {generatedContent}
                      </pre>
                    </div>
                  )}

                  {/* SEO Analysis */}
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h5 className="font-medium text-green-900 mb-2">✓ Analyse SEO</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-green-800 font-medium">Mots-clés détectés:</span>
                        <p className="text-green-700 mt-1">
                          {businessData.category}, {businessData.city}, {businessData.name}
                        </p>
                      </div>
                      <div>
                        <span className="text-green-800 font-medium">Optimisations:</span>
                        <p className="text-green-700 mt-1">
                          Référencement local, Structure claire, Call-to-action
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleAccept}
                      disabled={charCount > maxLength}
                      className="px-6 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Utiliser ce contenu
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}