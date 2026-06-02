/**
 * SmartSidebarBadge Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import { SmartSidebarBadge, SidebarBadge } from '@/components/layout/sidebar/SidebarBadge';
import { getSidebarColors } from '@/config/sidebarConfig';

const mockColors = getSidebarColors(false); // Light mode colors

describe('SidebarBadge (Legacy)', () => {
  it('should render badge value', () => {
    render(<SidebarBadge value={5} colors={mockColors} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should render string value', () => {
    render(<SidebarBadge value="NEW" colors={mockColors} />);
    expect(screen.getByText('NEW')).toBeInTheDocument();
  });

  it('should apply default variant styles', () => {
    render(<SidebarBadge value={3} variant="default" colors={mockColors} />);
    const badge = screen.getByText('3');
    expect(badge).toHaveClass('rounded');
  });

  it('should apply success variant', () => {
    render(<SidebarBadge value="OK" variant="success" colors={mockColors} />);
    expect(screen.getByText('OK')).toBeInTheDocument();
  });

  it('should apply warning variant', () => {
    render(<SidebarBadge value={12} variant="warning" colors={mockColors} />);
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('should apply danger variant', () => {
    render(<SidebarBadge value="!" variant="danger" colors={mockColors} />);
    expect(screen.getByText('!')).toBeInTheDocument();
  });
});

describe('SmartSidebarBadge', () => {
  describe('Count Badge', () => {
    it('should render count value', () => {
      render(
        <SmartSidebarBadge
          badge={{ type: 'count', value: 42, variant: 'primary' }}
          colors={mockColors}
        />
      );
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should render with different variants', () => {
      const variants = ['default', 'primary', 'success', 'warning', 'danger', 'info', 'premium'] as const;

      variants.forEach((variant) => {
        const { container } = render(
          <SmartSidebarBadge
            badge={{ type: 'count', value: 1, variant }}
            colors={mockColors}
          />
        );
        expect(container.querySelector('span')).toBeInTheDocument();
      });
    });
  });

  describe('Dot Badge', () => {
    it('should render dot indicator', () => {
      const { container } = render(
        <SmartSidebarBadge
          badge={{ type: 'dot', variant: 'success' }}
          colors={mockColors}
        />
      );
      const dot = container.querySelector('span');
      expect(dot).toHaveClass('w-2', 'h-2', 'rounded-full');
    });

    it('should animate when animate prop is true', () => {
      const { container } = render(
        <SmartSidebarBadge
          badge={{ type: 'dot', variant: 'success', animate: true }}
          colors={mockColors}
        />
      );
      const dot = container.querySelector('span');
      expect(dot).toHaveClass('animate-pulse');
    });

    it('should not animate by default', () => {
      const { container } = render(
        <SmartSidebarBadge
          badge={{ type: 'dot', variant: 'info' }}
          colors={mockColors}
        />
      );
      const dot = container.querySelector('span');
      expect(dot).not.toHaveClass('animate-pulse');
    });
  });

  describe('Pulse Badge', () => {
    it('should render pulse indicator with animation', () => {
      const { container } = render(
        <SmartSidebarBadge
          badge={{ type: 'pulse', variant: 'success' }}
          colors={mockColors}
        />
      );
      // Pulse has two spans - one for ping animation, one for static dot
      const spans = container.querySelectorAll('span');
      expect(spans.length).toBeGreaterThanOrEqual(2);

      // Check for animate-ping class on first inner span
      const pingSpan = container.querySelector('.animate-ping');
      expect(pingSpan).toBeInTheDocument();
    });
  });

  describe('Text Badge', () => {
    it('should render text value', () => {
      render(
        <SmartSidebarBadge
          badge={{ type: 'text', value: 'AI', variant: 'premium' }}
          colors={mockColors}
        />
      );
      expect(screen.getByText('AI')).toBeInTheDocument();
    });

    it('should render NEW badge', () => {
      render(
        <SmartSidebarBadge
          badge={{ type: 'text', value: 'NEW', variant: 'success' }}
          colors={mockColors}
        />
      );
      expect(screen.getByText('NEW')).toBeInTheDocument();
    });

    it('should render BETA badge', () => {
      render(
        <SmartSidebarBadge
          badge={{ type: 'text', value: 'BETA', variant: 'warning' }}
          colors={mockColors}
        />
      );
      expect(screen.getByText('BETA')).toBeInTheDocument();
    });

    it('should have uppercase text styling', () => {
      render(
        <SmartSidebarBadge
          badge={{ type: 'text', value: 'test', variant: 'info' }}
          colors={mockColors}
        />
      );
      const badge = screen.getByText('test');
      expect(badge).toHaveClass('uppercase');
    });
  });

  describe('Dark Mode', () => {
    const darkColors = getSidebarColors(true);

    it('should use dark mode colors when isDark is true', () => {
      const { container } = render(
        <SmartSidebarBadge
          badge={{ type: 'count', value: 5, variant: 'primary' }}
          colors={darkColors}
          isDark={true}
        />
      );
      expect(container.querySelector('span')).toBeInTheDocument();
    });

    it('should render dot with dark mode colors', () => {
      const { container } = render(
        <SmartSidebarBadge
          badge={{ type: 'dot', variant: 'success' }}
          colors={darkColors}
          isDark={true}
        />
      );
      expect(container.querySelector('span')).toBeInTheDocument();
    });
  });
});
