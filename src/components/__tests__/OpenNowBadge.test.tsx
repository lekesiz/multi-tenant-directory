/**
 * OpenNowBadge Component Tests
 */

import { render, screen, waitFor } from '@testing-library/react';
import { OpenNowBadge } from '../OpenNowBadge';

// Mock Date to control time in tests
const mockDate = (dateString: string) => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date(dateString));
};

describe('OpenNowBadge Component', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  test('should return null when no schedule provided', () => {
    const { container } = render(<OpenNowBadge />);
    expect(container.firstChild).toBeNull();
  });

  test('should show closed when day is not open', () => {
    mockDate('2025-11-10T14:00:00'); // Monday 14:00

    const schedule = {
      monday: { isOpen: false, openTime: '09:00', closeTime: '18:00' },
    };

    render(<OpenNowBadge weeklySchedule={schedule} />);

    waitFor(() => {
      expect(screen.getByText(/Fermé/)).toBeInTheDocument();
    });
  });

  test('should show open when within business hours', () => {
    mockDate('2025-11-10T14:00:00'); // Monday 14:00

    const schedule = {
      monday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    };

    render(<OpenNowBadge weeklySchedule={schedule} />);

    waitFor(() => {
      expect(screen.getByText(/Ouvert/)).toBeInTheDocument();
    });
  });

  test('should show opening time when before opening hours', () => {
    mockDate('2025-11-10T08:00:00'); // Monday 08:00

    const schedule = {
      monday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    };

    render(<OpenNowBadge weeklySchedule={schedule} />);

    waitFor(() => {
      expect(screen.getByText(/Ouvre à 09:00/)).toBeInTheDocument();
    });
  });

  test('should show closing soon when less than 30 minutes until close', () => {
    mockDate('2025-11-10T17:45:00'); // Monday 17:45

    const schedule = {
      monday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    };

    render(<OpenNowBadge weeklySchedule={schedule} />);

    waitFor(() => {
      expect(screen.getByText(/Ferme bientôt/)).toBeInTheDocument();
    });
  });

  test('should show closing time when less than 2 hours until close', () => {
    mockDate('2025-11-10T16:30:00'); // Monday 16:30

    const schedule = {
      monday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    };

    render(<OpenNowBadge weeklySchedule={schedule} />);

    waitFor(() => {
      expect(screen.getByText(/Ferme à 18:00/)).toBeInTheDocument();
    });
  });

  test('should apply custom className', () => {
    mockDate('2025-11-10T14:00:00');

    const schedule = {
      monday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    };

    const { container } = render(
      <OpenNowBadge weeklySchedule={schedule} className="custom-class" />
    );

    waitFor(() => {
      const badge = container.querySelector('.custom-class');
      expect(badge).toBeInTheDocument();
    });
  });

  test('should have green styling when open', () => {
    mockDate('2025-11-10T14:00:00');

    const schedule = {
      monday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    };

    const { container } = render(<OpenNowBadge weeklySchedule={schedule} />);

    waitFor(() => {
      const badge = container.querySelector('.bg-green-100');
      expect(badge).toBeInTheDocument();
    });
  });

  test('should have red styling when closed', () => {
    mockDate('2025-11-10T20:00:00'); // After closing

    const schedule = {
      monday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    };

    const { container } = render(<OpenNowBadge weeklySchedule={schedule} />);

    waitFor(() => {
      const badge = container.querySelector('.bg-red-100');
      expect(badge).toBeInTheDocument();
    });
  });
});
