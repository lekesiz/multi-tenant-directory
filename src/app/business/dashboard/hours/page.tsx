'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

const DAYS = [
  { id: 'monday', label: 'Lundi' },
  { id: 'tuesday', label: 'Mardi' },
  { id: 'wednesday', label: 'Mercredi' },
  { id: 'thursday', label: 'Jeudi' },
  { id: 'friday', label: 'Vendredi' },
  { id: 'saturday', label: 'Samedi' },
  { id: 'sunday', label: 'Dimanche' },
];

interface DaySchedule {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

interface SpecialHour {
  id?: string;
  date: string;
  reason: string;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

const specialHourSchema = z.object({
  date: z.string().min(1, 'Date requise'),
  reason: z.string().min(3, 'Raison requise (min 3 caractères)'),
  isOpen: z.boolean(),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
});

export default function HoursPage() {
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>({
    monday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    wednesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    thursday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    friday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    saturday: { isOpen: false, openTime: '09:00', closeTime: '18:00' },
    sunday: { isOpen: false, openTime: '09:00', closeTime: '18:00' },
  });

  const [specialHours, setSpecialHours] = useState<SpecialHour[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showSpecialHourForm, setShowSpecialHourForm] = useState(false);

  const {
    register: registerSpecial,
    handleSubmit: handleSubmitSpecial,
    formState: { errors: specialErrors },
    reset: resetSpecial,
    watch,
  } = useForm<SpecialHour>({
    resolver: zodResolver(specialHourSchema),
    defaultValues: {
      isOpen: true,
    },
  });

  const isSpecialOpen = watch('isOpen');

  // Fetch existing hours
  useEffect(() => {
    async function fetchHours() {
      try {
        const response = await fetch('/api/business/hours');
        if (response.ok) {
          const data = await response.json();
          if (data.weeklySchedule) {
            setWeeklySchedule(data.weeklySchedule);
          }
          if (data.specialHours) {
            setSpecialHours(data.specialHours);
          }
        }
      } catch (error) {
        toast.error('Erreur lors du chargement des horaires');
      } finally {
        setIsFetching(false);
      }
    }

    fetchHours();
  }, []);

  // Handle day toggle
  const toggleDay = (day: keyof WeeklySchedule) => {
    setWeeklySchedule({
      ...weeklySchedule,
      [day]: {
        ...weeklySchedule[day],
        isOpen: !weeklySchedule[day].isOpen,
      },
    });
  };

  // Handle time change
  const updateDayTime = (
    day: keyof WeeklySchedule,
    field: 'openTime' | 'closeTime',
    value: string
  ) => {
    setWeeklySchedule({
      ...weeklySchedule,
      [day]: {
        ...weeklySchedule[day],
        [field]: value,
      },
    });
  };

  // Save weekly schedule
  const saveWeeklySchedule = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/business/hours', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weeklySchedule }),
      });

      if (!response.ok) throw new Error('Update failed');

      toast.success('Horaires mis à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  // Add special hour
  const onSubmitSpecialHour = async (data: SpecialHour) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/business/hours/special', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Add failed');

      const result = await response.json();
      setSpecialHours([...specialHours, result.specialHour]);
      resetSpecial();
      setShowSpecialHourForm(false);
      toast.success('Horaire spécial ajouté');
    } catch (error) {
      toast.error('Erreur lors de l\'ajout');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete special hour
  const deleteSpecialHour = async (id: string) => {
    if (!confirm('Supprimer cet horaire spécial ?')) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/business/hours/special/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Delete failed');

      setSpecialHours(specialHours.filter((h) => h.id !== id));
      toast.success('Horaire spécial supprimé');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Horaires d'ouverture</h1>

      {/* Weekly Schedule */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Horaires hebdomadaires</h2>

        <div className="space-y-4">
          {DAYS.map((day) => {
            const daySchedule = weeklySchedule[day.id as keyof WeeklySchedule];

            return (
              <div
                key={day.id}
                className="flex flex-col md:flex-row md:items-center gap-4 p-4 border border-gray-200 rounded-lg"
              >
                {/* Day Name & Toggle */}
                <div className="flex items-center space-x-3 md:w-40">
                  <input
                    type="checkbox"
                    checked={daySchedule.isOpen}
                    onChange={() => toggleDay(day.id as keyof WeeklySchedule)}
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    {day.label}
                  </label>
                </div>

                {/* Time Inputs */}
                {daySchedule.isOpen ? (
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">
                        Ouverture
                      </label>
                      <input
                        type="time"
                        value={daySchedule.openTime}
                        onChange={(e) =>
                          updateDayTime(
                            day.id as keyof WeeklySchedule,
                            'openTime',
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>

                    <span className="text-gray-500 mt-5">-</span>

                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">
                        Fermeture
                      </label>
                      <input
                        type="time"
                        value={daySchedule.closeTime}
                        onChange={(e) =>
                          updateDayTime(
                            day.id as keyof WeeklySchedule,
                            'closeTime',
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex-1">
                    <span className="text-sm text-gray-500 italic">Fermé</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={saveWeeklySchedule}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>

      {/* Special Hours */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Horaires spéciaux</h2>
          <button
            onClick={() => setShowSpecialHourForm(!showSpecialHourForm)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Ajouter
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Définissez des horaires exceptionnels pour les jours fériés, vacances, etc.
        </p>

        {/* Special Hour Form */}
        {showSpecialHourForm && (
          <form
            onSubmit={handleSubmitSpecial(onSubmitSpecialHour)}
            className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  {...registerSpecial('date')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {specialErrors.date && (
                  <p className="mt-1 text-sm text-red-600">
                    {specialErrors.date.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Raison *
                </label>
                <input
                  type="text"
                  {...registerSpecial('reason')}
                  placeholder="Ex: Noël, Vacances d'été"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {specialErrors.reason && (
                  <p className="mt-1 text-sm text-red-600">
                    {specialErrors.reason.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    {...registerSpecial('isOpen')}
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Ouvert ce jour
                  </span>
                </label>
              </div>

              {isSpecialOpen && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Heure d'ouverture
                    </label>
                    <input
                      type="time"
                      {...registerSpecial('openTime')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Heure de fermeture
                    </label>
                    <input
                      type="time"
                      {...registerSpecial('closeTime')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowSpecialHourForm(false);
                  resetSpecial();
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Ajouter
              </button>
            </div>
          </form>
        )}

        {/* Special Hours List */}
        {specialHours.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            Aucun horaire spécial défini
          </p>
        ) : (
          <div className="space-y-3">
            {specialHours
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((hour) => (
                <div
                  key={hour.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(hour.date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                        {hour.reason}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {hour.isOpen
                        ? `${hour.openTime} - ${hour.closeTime}`
                        : 'Fermé'}
                    </p>
                  </div>

                  <button
                    onClick={() => hour.id && deleteSpecialHour(hour.id)}
                    disabled={isLoading}
                    className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
