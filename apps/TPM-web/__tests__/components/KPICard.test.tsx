/**
 * StatCard Component Tests
 * (Formerly KPICard - migrated to unified StatCard)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../test-utils';
import { StatCard, StatCardCompact, StatCardHorizontal, StatCardGroup } from '@/components/ui/stat-card';
import { TrendingUp, DollarSign, Users, Package } from 'lucide-react';

describe('StatCard', () => {
  it('should render title and value', () => {
    render(<StatCard title="Total Sales" value="1,000,000" />);

    expect(screen.getByText('Total Sales')).toBeInTheDocument();
    expect(screen.getByText('1,000,000')).toBeInTheDocument();
  });

  it('should render with icon', () => {
    render(
      <StatCard
        title="Revenue"
        value="500,000"
        icon={TrendingUp}
      />
    );

    // StatCard uses LucideIcon component reference (not ReactNode)
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('500,000')).toBeInTheDocument();
  });

  it('should render trend with positive change', () => {
    render(
      <StatCard
        title="Sales"
        value="100"
        trend={{ value: 15 }}
      />
    );

    expect(screen.getByText('+15%')).toBeInTheDocument();
  });

  it('should render trend with negative change', () => {
    render(
      <StatCard
        title="Sales"
        value="100"
        trend={{ value: -10 }}
      />
    );

    expect(screen.getByText('-10%')).toBeInTheDocument();
  });

  it('should render subtitle', () => {
    render(
      <StatCard
        title="Revenue"
        value="1,000"
        subtitle="This month"
      />
    );

    expect(screen.getByText('This month')).toBeInTheDocument();
  });

  it('should render with custom className', () => {
    const { container } = render(
      <StatCard
        title="Test"
        value="123"
        className="custom-class"
      />
    );

    const card = container.firstChild;
    expect(card).toHaveClass('custom-class');
  });

  it('should render placeholder value', () => {
    render(<StatCard title="Loading" value="--" />);

    expect(screen.getByText('Loading')).toBeInTheDocument();
    expect(screen.getByText('--')).toBeInTheDocument();
  });
});

describe('StatCard color variants', () => {
  it('should render with primary color', () => {
    const { container } = render(
      <StatCard title="Revenue" value="1M" color="primary" icon={DollarSign} />
    );
    expect(container.firstChild).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
  });

  it('should render with success color', () => {
    render(<StatCard title="Growth" value="25%" color="success" icon={TrendingUp} />);
    expect(screen.getByText('Growth')).toBeInTheDocument();
  });

  it('should render with danger color', () => {
    render(<StatCard title="Overdue" value="5" color="danger" />);
    expect(screen.getByText('Overdue')).toBeInTheDocument();
  });

  it('should render with warning color', () => {
    render(<StatCard title="Pending" value="12" color="warning" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('should render with info color', () => {
    render(<StatCard title="Updates" value="8" color="info" />);
    expect(screen.getByText('Updates')).toBeInTheDocument();
  });

  it('should render with purple color', () => {
    render(<StatCard title="Special" value="3" color="purple" />);
    expect(screen.getByText('Special')).toBeInTheDocument();
  });

  it('should render with cyan color', () => {
    render(<StatCard title="Items" value="42" color="cyan" />);
    expect(screen.getByText('Items')).toBeInTheDocument();
  });

  it('should render with default color', () => {
    render(<StatCard title="Default" value="99" />);
    expect(screen.getByText('Default')).toBeInTheDocument();
  });
});

describe('StatCard features', () => {
  it('should render footer', () => {
    render(<StatCard title="Test" value="100" footer={<span>Footer text</span>} />);
    expect(screen.getByText('Footer text')).toBeInTheDocument();
  });

  it('should render pulse indicator', () => {
    const { container } = render(<StatCard title="Live" value="100" pulse />);
    expect(container.querySelector('.animate-ping')).toBeInTheDocument();
  });

  it('should not render pulse by default', () => {
    const { container } = render(<StatCard title="Static" value="100" />);
    expect(container.querySelector('.animate-ping')).not.toBeInTheDocument();
  });

  it('should handle onClick', () => {
    const onClick = vi.fn();
    render(<StatCard title="Clickable" value="100" onClick={onClick} />);
    fireEvent.click(screen.getByText('Clickable').closest('div[class*="rounded"]')!);
    expect(onClick).toHaveBeenCalled();
  });

  it('should add cursor-pointer when onClick is provided', () => {
    const { container } = render(<StatCard title="Click" value="1" onClick={() => {}} />);
    expect(container.firstChild).toHaveClass('cursor-pointer');
  });

  it('should not add cursor-pointer without onClick', () => {
    const { container } = render(<StatCard title="NoClick" value="1" />);
    expect(container.firstChild).not.toHaveClass('cursor-pointer');
  });

  it('should render with zero trend', () => {
    render(<StatCard title="Flat" value="100" trend={{ value: 0 }} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should render with trend label', () => {
    render(<StatCard title="Sales" value="100" trend={{ value: 5, label: 'vs last week' }} />);
    expect(screen.getByText('vs last week')).toBeInTheDocument();
  });
});

describe('StatCardCompact', () => {
  it('should render compact card', () => {
    render(<StatCardCompact title="Users" value="500" />);
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
  });

  it('should render with icon', () => {
    render(<StatCardCompact title="Users" value="500" icon={Users} />);
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  it('should render with trend', () => {
    render(<StatCardCompact title="Sales" value="100" trend={{ value: 10 }} />);
    expect(screen.getByText('10%')).toBeInTheDocument();
  });

  it('should render with negative trend', () => {
    render(<StatCardCompact title="Loss" value="50" trend={{ value: -7 }} />);
    expect(screen.getByText('7%')).toBeInTheDocument();
  });

  it('should render with color', () => {
    render(<StatCardCompact title="Revenue" value="1M" color="primary" icon={DollarSign} />);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
  });

  it('should handle onClick', () => {
    const onClick = vi.fn();
    render(<StatCardCompact title="Click" value="1" onClick={onClick} />);
    fireEvent.click(screen.getByText('Click').closest('div[class*="rounded"]')!);
    expect(onClick).toHaveBeenCalled();
  });

  it('should apply custom className', () => {
    const { container } = render(<StatCardCompact title="T" value="1" className="my-class" />);
    expect(container.firstChild).toHaveClass('my-class');
  });

  it('should add cursor-pointer when onClick is provided', () => {
    const { container } = render(<StatCardCompact title="T" value="1" onClick={() => {}} />);
    expect(container.firstChild).toHaveClass('cursor-pointer');
  });
});

describe('StatCardHorizontal', () => {
  it('should render horizontal card', () => {
    render(<StatCardHorizontal title="Orders" value="1,234" />);
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('should render with action', () => {
    render(
      <StatCardHorizontal
        title="Orders"
        value="1,234"
        action={<button>View All</button>}
      />
    );
    expect(screen.getByText('View All')).toBeInTheDocument();
  });

  it('should render with subtitle', () => {
    render(<StatCardHorizontal title="Revenue" value="1M" subtitle="This month" />);
    expect(screen.getByText('This month')).toBeInTheDocument();
  });

  it('should render with icon and positive trend', () => {
    render(
      <StatCardHorizontal
        title="Sales"
        value="500"
        icon={Package}
        trend={{ value: 15, label: 'vs last month' }}
        color="success"
      />
    );
    expect(screen.getByText('Sales')).toBeInTheDocument();
    expect(screen.getByText('+15%')).toBeInTheDocument();
    expect(screen.getByText('vs last month')).toBeInTheDocument();
  });

  it('should render with negative trend', () => {
    render(
      <StatCardHorizontal
        title="Returns"
        value="20"
        trend={{ value: -5 }}
      />
    );
    expect(screen.getByText('-5%')).toBeInTheDocument();
  });

  it('should render pulse in horizontal layout', () => {
    const { container } = render(
      <StatCardHorizontal title="Live" value="100" pulse />
    );
    expect(container.querySelector('.animate-ping')).toBeInTheDocument();
  });

  it('should handle onClick', () => {
    const onClick = vi.fn();
    render(<StatCardHorizontal title="Click" value="1" onClick={onClick} />);
    fireEvent.click(screen.getByText('Click').closest('div[class*="rounded"]')!);
    expect(onClick).toHaveBeenCalled();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <StatCardHorizontal title="T" value="1" className="my-horz-class" />
    );
    expect(container.firstChild).toHaveClass('my-horz-class');
  });
});

describe('StatCardGroup', () => {
  it('should render group with default 4 columns', () => {
    const { container } = render(
      <StatCardGroup>
        <StatCard title="A" value="1" />
        <StatCard title="B" value="2" />
      </StatCardGroup>
    );
    expect(container.firstChild).toHaveClass('grid');
    expect(container.firstChild).toHaveClass('lg:grid-cols-4');
  });

  it('should render with 2 columns', () => {
    const { container } = render(
      <StatCardGroup cols={2}>
        <StatCard title="A" value="1" />
      </StatCardGroup>
    );
    expect(container.firstChild).toHaveClass('sm:grid-cols-2');
  });

  it('should render with 3 columns', () => {
    const { container } = render(
      <StatCardGroup cols={3}>
        <StatCard title="A" value="1" />
      </StatCardGroup>
    );
    expect(container.firstChild).toHaveClass('md:grid-cols-3');
  });

  it('should render with 5 columns', () => {
    const { container } = render(
      <StatCardGroup cols={5}>
        <StatCard title="A" value="1" />
      </StatCardGroup>
    );
    expect(container.firstChild).toHaveClass('lg:grid-cols-5');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <StatCardGroup className="my-grid">
        <StatCard title="A" value="1" />
      </StatCardGroup>
    );
    expect(container.firstChild).toHaveClass('my-grid');
  });

  it('should have gap between children', () => {
    const { container } = render(
      <StatCardGroup>
        <StatCard title="A" value="1" />
        <StatCard title="B" value="2" />
      </StatCardGroup>
    );
    expect(container.firstChild).toHaveClass('gap-4');
  });
});
