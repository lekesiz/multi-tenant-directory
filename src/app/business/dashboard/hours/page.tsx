'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { FormSkeleton } from '@/components/LoadingSkeleton';
import { HelpTooltip } from '@/components/Tooltip';

const DAYS = [
  { id: 'monday', label: 'Lundi' },
  { id: 'tuesday', label: 'Mardi' },
  { id: 'wednesday', label: 'Mercredi' },
  { id: 'thursday', label: 'Jeudi' },
  { id: 'friday', label: 'Vendredi' },
  { id: 'saturday', label: 'Samedi' },
  { id: 'sunday', label: 'Dimanche' },
];

interface TimeSlot {
  openTime: string;
  closeTime: string;
}

interface DaySchedule {
  isOpen: boolean;
  slots: TimeSlot[];
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

const DEFAULT_SLOT: TimeSlot = { openTime: '09:00', closeTime: '18:00' };

export default function HoursPage() {
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>({
    monday: { isOpen: true, slots: [{ openTime: '09:00', closeTime: '18:00' }] },
    tuesday: { isOpen: true, slots: [{ openTime: '09:00', closeTime: '18:00' }] },
    wednesday: { isOpen: true, slots: [{ openTime: '09:00', closeTime: '18:00' }] },
    thursday: { isOpen: true, slots: [{ openTime: '09:00', closeTime: '18:00' }] },
    friday: { isOpen: true, slots: [{ openTime: '09:00', closeTime: '18:00' }] },
    saturday: { isOpen: false, slots: [{ openTime: '09:00', closeTime: '18:00' }] },
    sunday: { isOpen: false, slots: [{ openTime: '09:00', closeTime: '18:00' }] },
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
            // Convert old format to new format if needed
            const convertedSchedule: WeeklySchedule = {} as WeeklySchedule;
            Object.keys(data.weeklySchedule).forEach((day) => {
              const dayData = data.weeklySchedule[day];
              if (dayData.slots) {
                // Already new format
                convertedSchedule[day as keyof WeeklySchedule] = dayData;
              } else if (dayData.openTime && dayData.closeTime) {
                // Old format - convert to new
                convertedSchedule[day as keyof WeeklySchedule] = {
                  isOpen: dayData.isOpen,
                  slots: [{ openTime: dayData.openTime, closeTime: dayData.closeTime }],
                };
              } else {
                // Default
                convertedSchedule[day as keyof WeeklySchedule] = {
                  isOpen: dayData.isOpen || false,
                  slots: [DEFAULT_SLOT],
                };
              }
            });
            setWeeklySchedule(convertedSchedule);
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

  // Add time slot
  const addTimeSlot = (day: keyof WeeklySchedule) => {
    const currentSlots = weeklySchedule[day].slots;
    if (currentSlots.length >= 2) {
      toast.error('Maximum 2 plages horaires par jour');
      return;
    }

    const lastSlot = currentSlots[currentSlots.length - 1];
    const newSlot: TimeSlot = {
      openTime: lastSlot.closeTime,
      closeTime: '18:00',
    };

    setWeeklySchedule({
      ...weeklySchedule,
      [day]: {
        ...weeklySchedule[day],
        slots: [...currentSlots, newSlot],
      },
    });
  };

  // Remove time slot
  const removeTimeSlot = (day: keyof WeeklySchedule, slotIndex: number) => {
    const currentSlots = weeklySchedule[day].slots;
    if (currentSlots.length === 1) {
      toast.error('Au moins une plage horaire requise');
      return;
    }

    setWeeklySchedule({
      ...weeklySchedule,
      [day]: {
        ...weeklySchedule[day],
        slots: currentSlots.filter((_, index) => index !== slotIndex),
      },
    });
  };

  // Update time slot
  const updateTimeSlot = (
    day: keyof WeeklySchedule,
    slotIndex: number,
    field: 'openTime' | 'closeTime',
    value: string
  ) => {
    const newSlots = [...weeklySchedule[day].slots];
    newSlots[slotIndex] = {
      ...newSlots[slotIndex],
      [field]: value,
    };

    setWeeklySchedule({
      ...weeklySchedule,
      [day]: {
        ...weeklySchedule[day],
        slots: newSlots,
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
      toast.error("Erreur lors de l'ajout");
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
      <div className="max-w-4xl">
        <div className="h-8 w-64 bg-gray-200 animate-pulse rounded mb-6"></div>
        <FormSkeleton />
        <div className="mt-8">
          <FormSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Horaires d'ouverture
        </h1>
        <HelpTooltip content="Configurez vos horaires d'ouverture réguliers avec possibilité d'ajouter une pause déjeuner. Définissez aussi des horaires spéciaux pour les jours fériés." />
      </div>

      {/* Weekly Schedule */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-8">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Horaires hebdomadaires</h2>
        <p className="text-sm text-gray-600 mb-4">
          💡 Vous pouvez ajouter jusqu'à 2 plages horaires par jour (ex: matin et après-midi avec pause déjeuner)
        </p>

        <div className="space-y-4">
          {DAYS.map((day) => {
            const daySchedule = weeklySchedule[day.id as keyof WeeklySchedule];

            return (
              <div
                key={day.id}
                className="flex flex-col gap-3 p-4 border border-gray-200 rounded-lg"
              >
                {/* Day Name & Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={daySchedule.isOpen}
                      onChange={() => toggleDay(day.id as keyof WeeklySchedule)}
                      className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="text-sm font-medium text-gray-700">{day.label}</label>
                  </div>

                  {daySchedule.isOpen && daySchedule.slots.length < 2 && (
                    <button
                      onClick={() => addTimeSlot(day.id as keyof WeeklySchedule)}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                    >
                      <PlusIcon className="h-4 w-4" />
                      Ajouter une plage
                    </button>
                  )}
                </div>

                {/* Time Slots */}
                {daySchedule.isOpen ? (
                  <div className="space-y-2">
                    {daySchedule.slots.map((slot, slotIndex) => (
                      <div key={slotIndex} className="flex items-center gap-3">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="flex-1">
                            <label className="block text-xs text-gray-500 mb-1">
                              {slotIndex === 0 ? 'Ouverture' : 'Réouverture'}
                            </label>
                            <input
                              type="time"
                              value={slot.openTime}
                              onChange={(e) =>
                                updateTimeSlot(
                                  day.id as keyof WeeklySchedule,
                                  slotIndex,
                                  'openTime',
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
                            />
                          </div>

                          <span className="text-gray-500 mt-5">-</span>

                          <div className="flex-1">
                            <label className="block text-xs text-gray-500 mb-1">
                              Fermeture
                            </label>
                            <input
                              type="time"
                              value={slot.closeTime}
                              onChange={(e) =>
                                updateTimeSlot(
                                  day.id as keyof WeeklySchedule,
                                  slotIndex,
                                  'closeTime',
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
                            />
                          </div>
                        </div>

                        {daySchedule.slots.length > 1 && (
                          <button
                            onClick={() =>
                              removeTimeSlot(day.id as keyof WeeklySchedule, slotIndex)
                            }
                            className="mt-5 p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                            title="Supprimer cette plage"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
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

      {/* Special Hours - Keep existing code */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-semibold">Horaires spéciaux</h2>
            <HelpTooltip content="Définissez des horaires exceptionnels pour les jours fériés, vacances, événements spéciaux, etc." />
          </div>
          <button
            onClick={() => setShowSpecialHourForm(!showSpecialHourForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            <PlusIcon className="h-5 w-5" />
            Ajouter
          </button>
        </div>

        {showSpecialHourForm && (
          <form
            onSubmit={handleSubmitSpecial(onSubmitSpecialHour)}
            className="mb-6 p-4 border border-blue-200 bg-blue-50 rounded-lg space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  {...registerSpecial('date')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                {specialErrors.date && (
                  <p className="mt-1 text-sm text-red-600">{specialErrors.date.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Raison
                </label>
                <input
                  type="text"
                  {...registerSpecial('reason')}
                  placeholder="Ex: Jour férié, Vacances..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                {specialErrors.reason && (
                  <p className="mt-1 text-sm text-red-600">{specialErrors.reason.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                {...registerSpecial('isOpen')}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="text-sm font-medium text-gray-700">Ouvert ce jour</label>
            </div>

            {isSpecialOpen && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Heure d'ouverture
                  </label>
                  <input
                    type="time"
                    {...registerSpecial('openTime')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Heure de fermeture
                  </label>
                  <input
                    type="time"
                    {...registerSpecial('closeTime')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowSpecialHourForm(false);
                  resetSpecial();
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Ajout...' : 'Ajouter'}
              </button>
            </div>
          </form>
        )}

        {specialHours.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            Aucun horaire spécial défini.
            <br />
            Définissez des horaires exceptionnels pour les jours fériés, vacances, événements
            spéciaux, etc.
          </p>
        ) : (
          <div className="space-y-3">
            {specialHours.map((hour) => (
              <div
                key={hour.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg gap-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(hour.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {hour.reason}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {hour.isOpen
                      ? `${hour.openTime} - ${hour.closeTime}`
                      : 'Fermé'}
                  </p>
                </div>

                <button
                  onClick={() => hour.id && deleteSpecialHour(hour.id)}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                >
                  <TrashIcon className="h-4 w-4" />
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
