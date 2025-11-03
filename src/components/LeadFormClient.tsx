'use client';

import { useState, FormEvent } from 'react';

interface LeadFormClientProps {
  categories?: Array<{
    id: number;
    slug: string;
    name: string;
    count: number;
  }>;
}

export default function LeadFormClient({ categories = [] }: LeadFormClientProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Show loading state
    setIsSubmitting(true);
    setShowSuccess(false);
    setShowError(false);
    setErrorMessage('');

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      
      // Get form values
      const categoryValue = formData.get('category') as string;
      const postalCode = formData.get('postalCode') as string;
      const phone = formData.get('phone') as string;
      const email = formData.get('email') as string;
      const note = formData.get('note') as string;
      const consentSharing = formData.get('consentSharing') === 'on';
      const consentMarketing = formData.get('consentMarketing') === 'on';
      
      // Category mapping
      const categoryMap: Record<string, number> = {
        'plombier': 1,
        'electricien': 2,
        'chauffagiste': 3,
        'menuisier': 4,
        'peintre': 5,
        'carreleur': 6,
        'jardinier': 7,
        'nettoyage': 8
      };
      
      const payload = {
        categoryId: categoryValue ? categoryMap[categoryValue] || null : null,
        postalCode,
        phone,
        email: email || undefined,
        note: note || undefined,
        consentFlags: {
          sharing: consentSharing,
          marketing: consentMarketing,
          calls: true, // Default true for lead generation
          dataProcessing: true // Default true for GDPR compliance
        }
      };

      console.log('Sending lead data:', payload);

      // Send to API
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        // Show success message
        setShowSuccess(true);
        form.reset();
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          setShowSuccess(false);
        }, 5000);
      } else {
        // Get error details from response
        const errorData = await response.json();
        console.error('API Error:', errorData);
        
        // Show error message with details
        const errorText = errorData.error || 'Une erreur est survenue. Veuillez réessayer.';
        setErrorMessage(errorText);
        setShowError(true);
      }
    } catch (error) {
      console.error('Network Error:', error);
      setErrorMessage('Erreur de connexion. Vérifiez votre connexion internet.');
      setShowError(true);
    } finally {
      // Reset button state
      setIsSubmitting(false);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Trouvez le bon professionnel pour votre projet
        </h2>
        <p className="text-gray-600 mb-8 text-center">
          Décrivez votre besoin en quelques clics, nous vous mettons en relation avec les meilleurs experts locaux.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Type de service
            </label>
            <select 
              id="category" 
              name="category"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Sélectionnez une catégorie (optionnel)</option>
              <option value="plombier">🔧 Plombier</option>
              <option value="electricien">⚡ Électricien</option>
              <option value="chauffagiste">🔥 Chauffagiste</option>
              <option value="menuisier">🔨 Menuisier</option>
              <option value="peintre">🎨 Peintre</option>
              <option value="carreleur">🧱 Carreleur</option>
              <option value="jardinier">🌱 Jardinier</option>
              <option value="nettoyage">🧽 Nettoyage</option>
            </select>
          </div>

          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
              Code Postal <span className="text-red-500">*</span>
            </label>
            <input
              id="postalCode"
              name="postalCode"
              type="text"
              placeholder="Ex: 67000"
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Téléphone <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Ex: 0612345678"
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email (optionnel)
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Ex: votre.email@example.com"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
              Décrivez votre besoin (optionnel)
            </label>
            <textarea
              id="note"
              name="note"
              rows={4}
              placeholder="Ex: Je cherche un plombier pour réparer une fuite d'eau dans ma salle de bain."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="consentSharing"
                name="consentSharing"
                type="checkbox"
                required
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="consentSharing" className="font-medium text-gray-700">
                J'accepte que ma demande soit partagée avec les professionnels sélectionnés et que je sois recontacté(e). <span className="text-red-500">*</span>
              </label>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="consentMarketing"
                name="consentMarketing"
                type="checkbox"
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="consentMarketing" className="font-medium text-gray-700">
                J'accepte de recevoir des communications marketing de la part de la plateforme (optionnel).
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Envoi en cours...' : 'Envoyer Ma Demande'}
          </button>
        </form>

        {showSuccess && (
          <div className="mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
            ✅ Votre demande a été envoyée avec succès ! Nous vous contacterons bientôt.
          </div>
        )}

        {showError && (
          <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            ❌ {errorMessage}
          </div>
        )}
      </div>
    </section>
  );
}

