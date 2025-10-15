'use client';

import { useEffect, useState } from 'react';

interface DaySchedule {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

interface WeeklySchedule {
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
}

interface OpenNowBadgeProps {
  weeklySchedule?: WeeklySchedule;
  timezone?: string;
  className?: string;
}

export function OpenNowBadge({
  weeklySchedule,
  timezone = 'Europe/Paris',
  className = '',
}: OpenNowBadgeProps) {
  const [status, setStatus] = useState<{
    isOpen: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!weeklySchedule) {
      setStatus(null);
      return;
    }

    const checkStatus = () => {
      const now = new Date();
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const currentDay = days[now.getDay()] as keyof WeeklySchedule;
      const daySchedule = weeklySchedule[currentDay];

      if (!daySchedule || !daySchedule.isOpen) {
        // Find next opening day
        const nextDay = findNextOpeningDay(weeklySchedule, now.getDay());
        setStatus({
          isOpen: false,
          message: nextDay ? `Ouvre ${nextDay}` : 'Fermé',
        });
        return;
      }

      // Parse times
      const [openHour, openMinute] = daySchedule.openTime.split(':').map(Number);
      const [closeHour, closeMinute] = daySchedule.closeTime.split(':').map(Number);

      const openTime = new Date(now);
      openTime.setHours(openHour, openMinute, 0);

      const closeTime = new Date(now);
      closeTime.setHours(closeHour, closeMinute, 0);

      const currentTime = now.getTime();

      if (currentTime >= openTime.getTime() && currentTime <= closeTime.getTime()) {
        // Calculate closing time
        const minutesUntilClose = Math.floor((closeTime.getTime() - currentTime) / 60000);
        const hoursUntilClose = Math.floor(minutesUntilClose / 60);

        let closingMessage = '';
        if (minutesUntilClose < 30) {
          closingMessage = ` · Ferme bientôt`;
        } else if (hoursUntilClose < 2) {
          closingMessage = ` · Ferme à ${daySchedule.closeTime}`;
        }

        setStatus({
          isOpen: true,
          message: `Ouvert${closingMessage}`,
        });
      } else if (currentTime < openTime.getTime()) {
        setStatus({
          isOpen: false,
          message: `Ouvre à ${daySchedule.openTime}`,
        });
      } else {
        // Find next opening day
        const nextDay = findNextOpeningDay(weeklySchedule, now.getDay());
        setStatus({
          isOpen: false,
          message: nextDay ? `Ouvre ${nextDay}` : 'Fermé',
        });
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [weeklySchedule, timezone]);

  if (!status) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
        status.isOpen
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'
      } ${className}`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          status.isOpen ? 'bg-green-600' : 'bg-red-600'
        }`}
      />
      {status.message}
    </span>
  );
}

function findNextOpeningDay(schedule: WeeklySchedule, currentDayIndex: number): string | null {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayNames = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

  // Check next 7 days
  for (let i = 1; i <= 7; i++) {
    const nextDayIndex = (currentDayIndex + i) % 7;
    const nextDay = days[nextDayIndex] as keyof WeeklySchedule;
    const daySchedule = schedule[nextDay];

    if (daySchedule?.isOpen) {
      if (i === 1) {
        return 'demain';
      }
      return dayNames[nextDayIndex];
    }
  }

  return null;
}
