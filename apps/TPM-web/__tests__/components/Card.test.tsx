/**
 * Card Component Tests
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

describe('Card', () => {
  it('should render Card', () => {
    render(<Card data-testid="card">Content</Card>);
    expect(screen.getByTestId('card')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<Card data-testid="card" className="custom">Content</Card>);
    expect(screen.getByTestId('card')).toHaveClass('custom');
  });

  it('should have rounded corners and border', () => {
    render(<Card data-testid="card">Content</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('rounded-2xl');
    expect(card).toHaveClass('border');
  });

  it('should have card background', () => {
    render(<Card data-testid="card">Content</Card>);
    expect(screen.getByTestId('card')).toHaveClass('bg-card');
  });

  it('should have shadow', () => {
    render(<Card data-testid="card">Content</Card>);
    expect(screen.getByTestId('card')).toHaveClass('shadow-sm');
  });

  it('should render as div element', () => {
    render(<Card data-testid="card">Content</Card>);
    expect(screen.getByTestId('card').tagName).toBe('DIV');
  });

  it('should forward ref', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<Card ref={ref}>Content</Card>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('CardHeader', () => {
  it('should render CardHeader', () => {
    render(<CardHeader data-testid="header">Header</CardHeader>);
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('should have bottom border', () => {
    render(<CardHeader data-testid="header">Header</CardHeader>);
    expect(screen.getByTestId('header')).toHaveClass('border-b');
  });

  it('should apply custom className', () => {
    render(<CardHeader data-testid="header" className="custom">Header</CardHeader>);
    expect(screen.getByTestId('header')).toHaveClass('custom');
  });

  it('should have flex layout', () => {
    render(<CardHeader data-testid="header">Header</CardHeader>);
    expect(screen.getByTestId('header')).toHaveClass('flex');
  });

  it('should forward ref', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<CardHeader ref={ref}>Header</CardHeader>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('CardTitle', () => {
  it('should render as h3', () => {
    render(<CardTitle>Title</CardTitle>);
    expect(screen.getByText('Title').tagName).toBe('H3');
  });

  it('should render title text', () => {
    render(<CardTitle>My Title</CardTitle>);
    expect(screen.getByText('My Title')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<CardTitle className="custom">Title</CardTitle>);
    expect(screen.getByText('Title')).toHaveClass('custom');
  });

  it('should have font styles', () => {
    render(<CardTitle>Title</CardTitle>);
    expect(screen.getByText('Title')).toHaveClass('font-semibold');
  });

  it('should have uppercase tracking', () => {
    render(<CardTitle>Title</CardTitle>);
    expect(screen.getByText('Title')).toHaveClass('uppercase', 'tracking-wide');
  });
});

describe('CardDescription', () => {
  it('should render description text', () => {
    render(<CardDescription>Description</CardDescription>);
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<CardDescription className="custom">Desc</CardDescription>);
    expect(screen.getByText('Desc')).toHaveClass('custom');
  });

  it('should render as paragraph', () => {
    render(<CardDescription>Desc</CardDescription>);
    expect(screen.getByText('Desc').tagName).toBe('P');
  });

  it('should have muted text color', () => {
    render(<CardDescription>Desc</CardDescription>);
    expect(screen.getByText('Desc')).toHaveClass('text-foreground-muted');
  });
});

describe('CardContent', () => {
  it('should render content', () => {
    render(<CardContent data-testid="content">Content</CardContent>);
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('should have padding', () => {
    render(<CardContent data-testid="content">Content</CardContent>);
    expect(screen.getByTestId('content')).toHaveClass('p-4');
  });

  it('should apply custom className', () => {
    render(<CardContent data-testid="content" className="custom">Content</CardContent>);
    expect(screen.getByTestId('content')).toHaveClass('custom');
  });

  it('should forward ref', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<CardContent ref={ref}>Content</CardContent>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('CardFooter', () => {
  it('should render footer', () => {
    render(<CardFooter data-testid="footer">Footer</CardFooter>);
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('should have top border', () => {
    render(<CardFooter data-testid="footer">Footer</CardFooter>);
    expect(screen.getByTestId('footer')).toHaveClass('border-t');
  });

  it('should have flex layout', () => {
    render(<CardFooter data-testid="footer">Footer</CardFooter>);
    expect(screen.getByTestId('footer')).toHaveClass('flex');
  });

  it('should apply custom className', () => {
    render(<CardFooter data-testid="footer" className="custom">Footer</CardFooter>);
    expect(screen.getByTestId('footer')).toHaveClass('custom');
  });

  it('should forward ref', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<CardFooter ref={ref}>Footer</CardFooter>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('Full Card Composition', () => {
  it('should render complete card', () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Body content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Body content')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('should nest components properly', () => {
    render(
      <Card data-testid="card">
        <CardHeader data-testid="header">
          <CardTitle>Nested</CardTitle>
        </CardHeader>
        <CardContent data-testid="content">Body</CardContent>
      </Card>
    );
    const card = screen.getByTestId('card');
    const header = screen.getByTestId('header');
    const content = screen.getByTestId('content');
    expect(card).toContainElement(header);
    expect(card).toContainElement(content);
  });
});
