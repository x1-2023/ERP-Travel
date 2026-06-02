/**
 * PageHeader Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import { PageHeader } from '@/components/shared/page-header';

describe('PageHeader', () => {
  it('should render title', () => {
    render(<PageHeader title="Test Page" />);
    expect(screen.getByRole('heading', { name: 'Test Page' })).toBeInTheDocument();
  });

  it('should render description', () => {
    render(<PageHeader title="Test" description="This is a description" />);
    expect(screen.getByText('This is a description')).toBeInTheDocument();
  });

  it('should render actions', () => {
    render(
      <PageHeader
        title="Test"
        actions={<button>Action Button</button>}
      />
    );
    expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument();
  });

  it('should render breadcrumbs', () => {
    render(
      <PageHeader
        title="Detail Page"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'List', href: '/list' },
          { label: 'Detail' },
        ]}
      />
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('List')).toBeInTheDocument();
    expect(screen.getByText('Detail')).toBeInTheDocument();
  });

  it('should render clickable breadcrumbs with href', () => {
    render(
      <PageHeader
        title="Detail Page"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Current' },
        ]}
      />
    );

    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('should render status badge', () => {
    render(
      <PageHeader
        title="Page with Status"
        status={{ label: 'Active', variant: 'success' }}
      />
    );

    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('should render with all props', () => {
    render(
      <PageHeader
        title="Full Page"
        description="Complete page header"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Current' }]}
        status={{ label: 'Pending', variant: 'warning' }}
        actions={<button>Save</button>}
      />
    );

    expect(screen.getByRole('heading', { name: 'Full Page' })).toBeInTheDocument();
    expect(screen.getByText('Complete page header')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('should not render breadcrumbs nav when no breadcrumbs provided', () => {
    const { container } = render(<PageHeader title="No Breadcrumbs" />);
    expect(container.querySelector('nav')).not.toBeInTheDocument();
  });

  it('should not render description when not provided', () => {
    render(<PageHeader title="No Description" />);
    // Only the title should be in the document
    expect(screen.getByRole('heading', { name: 'No Description' })).toBeInTheDocument();
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
  });
});
