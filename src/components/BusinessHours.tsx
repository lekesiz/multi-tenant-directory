'use client';

import { useState } from 'react';

interface BusinessHoursData {
  [key: string]: {
    open?: string;
    close?: string;
    closed: boolean;
  };
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
  const todayHours = businessHours[currentDay];
  const isOpenNow = todayHours && !todayHours.closed && todayHours.open && todayHours.close ?
    (() => {
      const openTime = parseInt(todayHours.open.replace(':', ''));
      const closeTime = parseInt(todayHours.close.replace(':', ''));

      return currentHour >= openTime && currentHour < closeTime;
    })() : false;

  // Format time display
  const formatTimeRange = (day: string) => {
    const hours = businessHours[day];
    if (!hours || hours.closed) return 'Fermé';

    return `${hours.open} - ${hours.close}`;
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