'use client';

import { useState } from 'react';

interface Shift {
  open: string;
  close: string;
}

interface DayHours {
  closed: boolean;
  shifts?: Shift[];
  // Legacy format support
  open?: string;
  close?: string;
}

interface BusinessHoursData {
  [key: string]: DayHours | any;
}

interface BusinessHoursProps {
  businessHours: BusinessHoursData | null;
}

const dayNames: { [key: string]: string } = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche',
};

const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

/**
 * Normalize day hours to support both legacy and new formats
 */
function normalizeDayHours(dayData: any): DayHours | null {
  if (!dayData) return null;

  // Already in new format (has shifts array)
  if (dayData.shifts !== undefined) {
    return dayData as DayHours;
  }

  // Legacy format: convert to new format
  if (dayData.open && dayData.close) {
    return {
      closed: dayData.closed || false,
      shifts: dayData.closed ? [] : [{ open: dayData.open, close: dayData.close }],
    };
  }

  // Closed day
  if (dayData.closed) {
    return { closed: true, shifts: [] };
  }

  return null;
}

/**
 * Check if a time is within a shift range
 */
function isTimeInShift(currentTime: number, shift: Shift): boolean {
  const openTime = parseInt(shift.open.replace(':', ''));
  const closeTime = parseInt(shift.close.replace(':', ''));
  return currentTime >= openTime && currentTime < closeTime;
}

export default function BusinessHours({ businessHours }: BusinessHoursProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!businessHours || Object.keys(businessHours).length === 0) {
    return (
      <div className="text-gray-500 text-sm">
        Horaires non disponibles
      </div>
    );
  }

  // Get current day
  const today = new Date();
  const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][today.getDay()];
  const currentHour = today.getHours() * 100 + today.getMinutes();

  // Check if currently open
  const todayHours = normalizeDayHours(businessHours[currentDay]);
  const isOpenNow = todayHours && !todayHours.closed && todayHours.shifts && todayHours.shifts.length > 0
    ? todayHours.shifts.some(shift => isTimeInShift(currentHour, shift))
    : false;

  // Format time display
  const formatTimeRange = (day: string) => {
    const hours = normalizeDayHours(businessHours[day]);
    if (!hours || hours.closed || !hours.shifts || hours.shifts.length === 0) {
      return 'Fermé';
    }

    // Display all shifts for the day
    return hours.shifts
      .map(shift => `${shift.open} - ${shift.close}`)
      .join(', ');
  };

  // Show only today's hours when collapsed
  const displayDays = isExpanded ? dayOrder : [currentDay];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isOpenNow ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className={`text-xs sm:text-sm font-medium ${isOpenNow ? 'text-green-600' : 'text-red-600'}`}>
            {isOpenNow ? 'Ouvert' : 'Fermé'}
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium self-start sm:self-auto"
        >
          {isExpanded ? 'Voir moins' : 'Voir tous'}
        </button>
      </div>

      <div className="space-y-2">
        {displayDays.map((day) => (
          <div
            key={day}
            className={`flex justify-between items-center py-2 ${
              day === currentDay ? 'font-medium text-gray-900' : 'text-gray-600'
            }`}
          >
            <span className="capitalize text-sm">{dayNames[day]}</span>
            <span className="text-xs sm:text-sm">{formatTimeRange(day)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
