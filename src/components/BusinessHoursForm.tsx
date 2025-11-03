'use client';

import { useState, useEffect } from 'react';

interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

interface BusinessHours {
  monday: DayHours | null;
  tuesday: DayHours | null;
  wednesday: DayHours | null;
  thursday: DayHours | null;
  friday: DayHours | null;
  saturday: DayHours | null;
  sunday: DayHours | null;
}

interface Props {
  companyId: number;
  initialHours?: BusinessHours | null;
}

const DAYS = [
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' },
  { key: 'sunday', label: 'Dimanche' },
] as const;

const defaultHours: DayHours = {
  open: '09:00',
  close: '18:00',
  closed: false,
};

export default function BusinessHoursForm({ companyId, initialHours }: Props) {
  const [loading, setLoading] = useState(false);
  const [fetchingHours, setFetchingHours] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [hours, setHours] = useState<BusinessHours>({
    monday: initialHours?.monday || defaultHours,
    tuesday: initialHours?.tuesday || defaultHours,
    wednesday: initialHours?.wednesday || defaultHours,
    thursday: initialHours?.thursday || defaultHours,
    friday: initialHours?.friday || defaultHours,
    saturday: initialHours?.saturday || { ...defaultHours, closed: true },
    sunday: initialHours?.sunday || { ...defaultHours, closed: true },
  });

  // Fetch existing business hours on mount
  useEffect(() => {
    const fetchHours = async () => {
      try {
        const response = await fetch(`/api/companies/${companyId}/hours`);
        if (response.ok) {
          const data = await response.json();
          // Convert from new format (with shifts) to old format for this form
          const convertedHours: BusinessHours = {
            monday: convertShiftsToDayHours(data.monday),
            tuesday: convertShiftsToDayHours(data.tuesday),
            wednesday: convertShiftsToDayHours(data.wednesday),
            thursday: convertShiftsToDayHours(data.thursday),
            friday: convertShiftsToDayHours(data.friday),
            saturday: convertShiftsToDayHours(data.saturday),
            sunday: convertShiftsToDayHours(data.sunday),
          };
          setHours(convertedHours);
        }
      } catch (err) {
        console.error('Error fetching business hours:', err);
      } finally {
        setFetchingHours(false);
      }
    };

    fetchHours();
  }, [companyId]);

  // Convert new format (shifts array) to old format (single open/close)
  const convertShiftsToDayHours = (dayData: any): DayHours | null => {
    if (!dayData) return defaultHours;
    if (dayData.closed) return { ...defaultHours, closed: true };
    if (dayData.shifts && dayData.shifts.length > 0) {
      // For now, just take the first shift (we'll enhance to support multiple shifts later)
      return {
        open: dayData.shifts[0].open,
        close: dayData.shifts[0].close,
        closed: false,
      };
    }
    // Old format
    if (dayData.open && dayData.close) {
      return {
        open: dayData.open,
        close: dayData.close,
        closed: dayData.closed || false,
      };
    }
    return defaultHours;
  };

  const updateDay = (day: keyof BusinessHours, field: keyof DayHours, value: string | boolean) => {
    setHours({
      ...hours,
      [day]: {
        ...hours[day],
        [field]: value,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/companies/${companyId}/hours`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hours),
      });

      if (response.ok) {
        setSuccess('Horaires d\'ouverture enregistrés avec succès');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Erreur lors de l\'enregistrement');
      }
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while fetching existing hours
  if (fetchingHours) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-3 text-gray-600">Chargement des horaires...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Horaires d'ouverture
        </h2>
        <p className="text-sm text-gray-600">
          Définissez les horaires d'ouverture de votre établissement
        </p>
      </div>

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {DAYS.map(({ key, label }) => {
          const dayHours = hours[key];
          if (!dayHours) return null;

          return (
            <div key={key} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              <div className="w-32">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={!dayHours.closed}
                    onChange={(e) => updateDay(key, 'closed', !e.target.checked)}
                    className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="font-medium text-gray-900">{label}</span>
                </label>
              </div>

              {!dayHours.closed ? (
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={dayHours.open}
                      onChange={(e) => updateDay(key, 'open', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <span className="text-gray-500">—</span>
                    <input
                      type="time"
                      value={dayHours.close}
                      onChange={(e) => updateDay(key, 'close', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1">
                  <span className="text-gray-400 italic">Fermé</span>
                </div>
              )}
            </div>
          );
        })}

        <div className="flex justify-end pt-4 border-t">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enregistrement...
              </>
            ) : (
              'Enregistrer les horaires'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
