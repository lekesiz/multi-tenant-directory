/**
 * Tooltip Component Tests
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Tooltip, HelpTooltip } from '../Tooltip';

describe('Tooltip Component', () => {
  test('should not show tooltip initially', () => {
    render(
      <Tooltip content="Test tooltip">
        <button>Hover me</button>
      </Tooltip>
    );

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  test('should show tooltip on mouse enter', async () => {
    render(
      <Tooltip content="Test tooltip">
        <button>Hover me</button>
      </Tooltip>
    );

    const trigger = screen.getByText('Hover me');
    fireEvent.mouseEnter(trigger.parentElement!);

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
      expect(screen.getByText('Test tooltip')).toBeInTheDocument();
    });
  });

  test('should hide tooltip on mouse leave', async () => {
    render(
      <Tooltip content="Test tooltip">
        <button>Hover me</button>
      </Tooltip>
    );

    const trigger = screen.getByText('Hover me');
    fireEvent.mouseEnter(trigger.parentElement!);

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    fireEvent.mouseLeave(trigger.parentElement!);

    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  test('should show tooltip on focus', async () => {
    render(
      <Tooltip content="Test tooltip">
        <button>Focus me</button>
      </Tooltip>
    );

    const trigger = screen.getByText('Focus me');
    fireEvent.focus(trigger.parentElement!);

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });

  test('should hide tooltip on blur', async () => {
    render(
      <Tooltip content="Test tooltip">
        <button>Focus me</button>
      </Tooltip>
    );

    const trigger = screen.getByText('Focus me');
    fireEvent.focus(trigger.parentElement!);

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    fireEvent.blur(trigger.parentElement!);

    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  test('should apply custom className', () => {
    const { container } = render(
      <Tooltip content="Test" className="custom-class">
        <button>Test</button>
      </Tooltip>
    );

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('custom-class');
  });

  test('should accept different positions', async () => {
    const positions: Array<'top' | 'bottom' | 'left' | 'right'> = ['top', 'bottom', 'left', 'right'];

    for (const position of positions) {
      const { unmount } = render(
        <Tooltip content="Test" position={position}>
          <button>Test</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Test');
      fireEvent.mouseEnter(trigger.parentElement!);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      unmount();
    }
  });

  test('should render children', () => {
    render(
      <Tooltip content="Test tooltip">
        <button>Click me</button>
      </Tooltip>
    );

    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});

describe('HelpTooltip Component', () => {
  test('should render help icon', () => {
    render(<HelpTooltip content="Help text" />);
    
    const button = screen.getByLabelText('Help');
    expect(button).toBeInTheDocument();
  });

  test('should show tooltip on hover', async () => {
    render(<HelpTooltip content="Help text" />);
    
    const button = screen.getByLabelText('Help');
    fireEvent.mouseEnter(button.parentElement!);

    await waitFor(() => {
      expect(screen.getByText('Help text')).toBeInTheDocument();
    });
  });

  test('should apply custom className', () => {
    const { container } = render(<HelpTooltip content="Help" className="custom-class" />);
    
    const wrapper = container.querySelector('.custom-class');
    expect(wrapper).toBeInTheDocument();
  });

  test('should have help icon svg', () => {
    const { container } = render(<HelpTooltip content="Help" />);
    
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
