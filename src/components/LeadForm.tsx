'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

const leadFormSchema = z.object({
  categoryId: z.number().optional(),
  postalCode: z.string().min(1, 'Postal code is required'),
  phone: z.string().min(10, 'Phone number is required'),
  email: z.string().email().optional().or(z.literal('')),
  note: z.string().optional(),
  budgetBand: z.enum(['low', 'medium', 'high', 'custom']).optional(),
  timeWindow: z.enum(['urgent', 'this_week', 'this_month', 'flexible']).optional(),
  consentFlags: z.object({
    marketing: z.boolean(),
    sharing: z.boolean(),
    calls: z.boolean(),
    dataProcessing: z.boolean()
  })
});

type LeadFormData = z.infer<typeof leadFormSchema>;

interface LeadFormProps {
  categories?: Array<{
    id: number;
    frenchName: string;
    icon?: string;
  }>;
  onSubmit?: (data: LeadFormData) => void;
}

export default function LeadForm({ categories = [], onSubmit }: LeadFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      consentFlags: {
        marketing: false,
        sharing: true,
        calls: true,
        dataProcessing: true
      }
    }
  });

  const watchedConsentFlags = watch('consentFlags');

  const onSubmitForm = async (data: LeadFormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Demande envoyée avec succès ! Nous vous contacterons bientôt.');
        onSubmit?.(data);
        // Reset form
        window.location.reload();
      } else {
        toast.error(result.error || 'Erreur lors de l\'envoi de la demande');
      }
    } catch (error) {
      toast.error('Erreur de connexion');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          🚀 Trouvez le Professionnel Idéal
        </h2>
        <p className="text-lg text-gray-600">
          Décrivez votre projet et recevez des devis personnalisés de professionnels qualifiés
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
        {/* Service Category */}
        {categories.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de service *
            </label>
            <select
              {...register('categoryId', { valueAsNumber: true })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sélectionnez un service</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.frenchName}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
            )}
          </div>
        )}

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Code postal *
          </label>
          <input
            type="text"
            {...register('postalCode')}
            placeholder="67000"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.postalCode && (
            <p className="mt-1 text-sm text-red-600">{errors.postalCode.message}</p>
          )}
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Téléphone *
            </label>
            <input
              type="tel"
              {...register('phone')}
              placeholder="06 12 34 56 78"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email (optionnel)
            </label>
            <input
              type="email"
              {...register('email')}
              placeholder="votre@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
        </div>

        {/* Project Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget estimé
            </label>
            <select
              {...register('budgetBand')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sélectionnez</option>
              <option value="low">Moins de 500€</option>
              <option value="medium">500€ - 2000€</option>
              <option value="high">Plus de 2000€</option>
              <option value="custom">Budget personnalisé</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Délai souhaité
            </label>
            <select
              {...register('timeWindow')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sélectionnez</option>
              <option value="urgent">Urgent (cette semaine)</option>
              <option value="this_week">Cette semaine</option>
              <option value="this_month">Ce mois</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>
        </div>

        {/* Project Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description du projet (optionnel)
          </label>
          <textarea
            {...register('note')}
            rows={4}
            placeholder="Décrivez votre projet en quelques mots..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Consent Checkboxes */}
        <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">
            Consentements RGPD *
          </h3>
          
          <div className="space-y-3">
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={watchedConsentFlags.sharing}
                onChange={(e) => setValue('consentFlags.sharing', e.target.checked)}
                className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">
                J'accepte que ma demande soit partagée avec les professionnels sélectionnés pour me proposer des devis. *
              </span>
            </label>

            <label className="flex items-start">
              <input
                type="checkbox"
                checked={watchedConsentFlags.calls}
                onChange={(e) => setValue('consentFlags.calls', e.target.checked)}
                className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">
                J'accepte d'être contacté par téléphone par les professionnels sélectionnés. *
              </span>
            </label>

            <label className="flex items-start">
              <input
                type="checkbox"
                checked={watchedConsentFlags.dataProcessing}
                onChange={(e) => setValue('consentFlags.dataProcessing', e.target.checked)}
                className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">
                J'accepte le traitement de mes données personnelles conformément à la politique de confidentialité. *
              </span>
            </label>

            <label className="flex items-start">
              <input
                type="checkbox"
                checked={watchedConsentFlags.marketing}
                onChange={(e) => setValue('consentFlags.marketing', e.target.checked)}
                className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">
                J'accepte de recevoir des communications marketing (optionnel)
              </span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !watchedConsentFlags.sharing || !watchedConsentFlags.calls || !watchedConsentFlags.dataProcessing}
          className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Envoi en cours...' : '🚀 Envoyer ma demande'}
        </button>

        <p className="text-xs text-gray-500 text-center">
          En envoyant cette demande, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
        </p>
      </form>
    </div>
  );
}
