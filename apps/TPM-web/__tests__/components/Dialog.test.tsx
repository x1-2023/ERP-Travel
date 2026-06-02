/**
 * Dialog Component Tests
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';

describe('Dialog', () => {
  it('should not show content when closed', () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Dialog body</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    expect(screen.queryByText('Dialog body')).not.toBeInTheDocument();
  });

  it('should show content when trigger is clicked', async () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Visible content</DialogDescription>
        </DialogContent>
      </Dialog>
    );

    fireEvent.click(screen.getByText('Open'));
    await waitFor(() => {
      expect(screen.getByText('Visible content')).toBeInTheDocument();
    });
  });

  it('should render trigger button', () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText('Open Dialog')).toBeInTheDocument();
  });

  it('should show dialog when open prop is true', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Controlled Title</DialogTitle>
          <DialogDescription>Controlled content</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText('Controlled content')).toBeInTheDocument();
  });

  it('should render close button in content', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Content</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  it('should render title', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>My Dialog Title</DialogTitle>
          <DialogDescription>Desc</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText('My Dialog Title')).toBeInTheDocument();
  });

  it('should render description', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>My dialog description</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText('My dialog description')).toBeInTheDocument();
  });
});

describe('DialogHeader', () => {
  it('should render header content', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader data-testid="header">
            <DialogTitle>Header Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText('Header Title')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader data-testid="header" className="custom-header">
            <DialogTitle>Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByTestId('header')).toHaveClass('custom-header');
  });

  it('should have flex column layout', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader data-testid="header">
            <DialogTitle>Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByTestId('header')).toHaveClass('flex', 'flex-col');
  });
});

describe('DialogFooter', () => {
  it('should render footer content', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogFooter>
            <button>Cancel</button>
            <button>Confirm</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogFooter data-testid="footer" className="custom-footer">
            <button>OK</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByTestId('footer')).toHaveClass('custom-footer');
  });

  it('should have flex layout', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogFooter data-testid="footer">
            <button>OK</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByTestId('footer')).toHaveClass('flex');
  });
});

describe('DialogTitle', () => {
  it('should render title text', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Test Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('should have font styles', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Styled Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText('Styled Title')).toHaveClass('font-semibold');
  });

  it('should apply custom className', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle className="custom-title">Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText('Title')).toHaveClass('custom-title');
  });
});

describe('DialogDescription', () => {
  it('should render description text', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description text here</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText('Description text here')).toBeInTheDocument();
  });

  it('should have muted text style', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Muted desc</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText('Muted desc')).toHaveClass('text-muted-foreground');
  });

  it('should apply custom className', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription className="custom-desc">Desc</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText('Desc')).toHaveClass('custom-desc');
  });
});

describe('Full Dialog Composition', () => {
  it('should render complete dialog', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>Are you sure you want to proceed?</DialogDescription>
          </DialogHeader>
          <div>Dialog body content</div>
          <DialogFooter>
            <button>Cancel</button>
            <button>Continue</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
    expect(screen.getByText('Dialog body content')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Continue')).toBeInTheDocument();
  });

  it('should call onOpenChange when dialog state changes', async () => {
    const onOpenChange = vi.fn();
    render(
      <Dialog onOpenChange={onOpenChange}>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Content</DialogDescription>
        </DialogContent>
      </Dialog>
    );

    fireEvent.click(screen.getByText('Open'));
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });
  });
});
