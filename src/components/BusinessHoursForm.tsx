'use client';

import { useState, useEffect } from 'react';

interface Shift {
  open: string;
  close: string;
}

interface DayHours {
  closed: boolean;
  shifts: Shift[];
}

interface BusinessHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

interface Props {
  companyId: number;
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

const defaultShift: Shift = {
  open: '09:00',
  close: '18:00',
};

const defaultDayHours: DayHours = {
  closed: false,
  shifts: [{ ...defaultShift }],
};

const defaultClosedDay: DayHours = {
  closed: true,
  shifts: [],
};

export default function BusinessHoursForm({ companyId }: Props) {
  const [loading, setLoading] = useState(false);
  const [fetchingHours, setFetchingHours] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [hours, setHours] = useState<BusinessHours>({
    monday: { ...defaultDayHours },
    tuesday: { ...defaultDayHours },
    wednesday: { ...defaultDayHours },
    thursday: { ...defaultDayHours },
    friday: { ...defaultDayHours },
    saturday: { ...defaultClosedDay },
    sunday: { ...defaultClosedDay },
  });

  // Fetch existing business hours on mount
  useEffect(() => {
    const fetchHours = async () => {
      try {
        const response = await fetch(`/api/companies/${companyId}/hours`);
        if (response.ok) {
          const data = await response.json();
          setHours(data);
        }
      } catch (err) {
        console.error('Error fetching business hours:', err);
      } finally {
        setFetchingHours(false);
      }
    };

    fetchHours();
  }, [companyId]);

  const toggleDayClosed = (day: keyof BusinessHours) => {
    setHours({
      ...hours,
      [day]: {
        ...hours[day],
        closed: !hours[day].closed,
        shifts: hours[day].closed ? [{ ...defaultShift }] : [],
      },
    });
  };

  const addShift = (day: keyof BusinessHours) => {
    const dayHours = hours[day];
    setHours({
      ...hours,
      [day]: {
        ...dayHours,
        shifts: [...dayHours.shifts, { ...defaultShift }],
      },
    });
  };

  const removeShift = (day: keyof BusinessHours, shiftIndex: number) => {
    const dayHours = hours[day];
    setHours({
      ...hours,
      [day]: {
        ...dayHours,
        shifts: dayHours.shifts.filter((_, index) => index !== shiftIndex),
      },
    });
  };

  const updateShift = (
    day: keyof BusinessHours,
    shiftIndex: number,
    field: 'open' | 'close',
    value: string
  ) => {
    const dayHours = hours[day];
    const updatedShifts = dayHours.shifts.map((shift, index) =>
      index === shiftIndex ? { ...shift, [field]: value } : shift
    );
    setHours({
      ...hours,
      [day]: {
        ...dayHours,
        shifts: updatedShifts,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Prepare clean data for API (only the required fields)
      const cleanData = {
        monday: hours.monday,
        tuesday: hours.tuesday,
        wednesday: hours.wednesday,
        thursday: hours.thursday,
        friday: hours.friday,
        saturday: hours.saturday,
        sunday: hours.sunday,
        timezone: 'Europe/Paris',
      };

      console.log('Sending business hours data:', cleanData);

      const response = await fetch(`/api/companies/${companyId}/hours`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanData),
      });

      if (response.ok) {
        setSuccess("Horaires d'ouverture enregistrés avec succès");
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        setError(errorData.error || "Erreur lors de l'enregistrement");
      }
    } catch (err) {
      console.error('Submit error:', err);
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
          <svg
            className="animate-spin h-8 w-8 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
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

          return (
            <div
              key={key}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={!dayHours.closed}
                    onChange={() => toggleDayClosed(key)}
                    className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="font-medium text-gray-900">{label}</span>
                </label>

                {!dayHours.closed && (
                  <button
                    type="button"
                    onClick={() => addShift(key)}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Ajouter une plage
                  </button>
                )}
              </div>

              {!dayHours.closed ? (
                <div className="space-y-2">
                  {dayHours.shifts.map((shift, shiftIndex) => (
                    <div key={shiftIndex} className="flex items-center gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="time"
                          value={shift.open}
                          onChange={(e) =>
                            updateShift(key, shiftIndex, 'open', e.target.value)
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                        <span className="text-gray-500">—</span>
                        <input
                          type="time"
                          value={shift.close}
                          onChange={(e) =>
                            updateShift(key, shiftIndex, 'close', e.target.value)
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>

                      {dayHours.shifts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeShift(key, shiftIndex)}
                          className="text-red-600 hover:text-red-700 p-2"
                          title="Supprimer cette plage"
                        >
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 italic text-sm">Fermé</div>
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
                <svg
                  className="animate-spin h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
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
