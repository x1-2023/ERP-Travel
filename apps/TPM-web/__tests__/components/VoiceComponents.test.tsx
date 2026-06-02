/**
 * Voice Components Tests
 * Tests for VoiceButton, VoiceCommandList, VoiceFeedback, VoiceTranscript
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';

// Mock formatRelativeTime utility
vi.mock('@/lib/utils', async () => {
  const actual = await vi.importActual('@/lib/utils');
  return {
    ...actual,
    formatRelativeTime: (date: string | Date) => '2 minutes ago',
  };
});

// ============================================================================
// VoiceButton
// ============================================================================
import { VoiceButton } from '@/components/voice/VoiceButton';

describe('VoiceButton', () => {
  it('renders microphone button', () => {
    render(<VoiceButton onTranscript={vi.fn()} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('renders in disabled state', () => {
    render(<VoiceButton onTranscript={vi.fn()} disabled />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<VoiceButton onTranscript={vi.fn()} size="sm" />);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<VoiceButton onTranscript={vi.fn()} size="lg" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});

// ============================================================================
// VoiceCommandList
// ============================================================================
import { VoiceCommandList } from '@/components/voice/VoiceCommandList';

describe('VoiceCommandList', () => {
  const mockCommands = [
    {
      id: '1',
      transcript: 'Show promotions',
      intent: 'NAVIGATE',
      response: 'Navigating to promotions page',
      success: true,
      duration: 150,
      createdAt: '2026-01-01T10:00:00Z',
    },
    {
      id: '2',
      transcript: 'Create new claim',
      intent: 'CREATE',
      response: 'Failed to create claim',
      success: false,
      duration: 300,
      createdAt: '2026-01-01T10:05:00Z',
    },
  ];

  it('renders empty state when no commands', () => {
    render(<VoiceCommandList commands={[]} />);
    expect(screen.getByText('No voice commands yet')).toBeInTheDocument();
  });

  it('renders commands in table view', () => {
    render(<VoiceCommandList commands={mockCommands} />);
    expect(screen.getByText('Show promotions')).toBeInTheDocument();
    expect(screen.getByText('Create new claim')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<VoiceCommandList commands={mockCommands} />);
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Command')).toBeInTheDocument();
    expect(screen.getByText('Intent')).toBeInTheDocument();
    expect(screen.getByText('Response')).toBeInTheDocument();
    expect(screen.getByText('Duration')).toBeInTheDocument();
    expect(screen.getByText('Time')).toBeInTheDocument();
  });

  it('renders compact view', () => {
    render(<VoiceCommandList commands={mockCommands} compact />);
    expect(screen.getByText('Show promotions')).toBeInTheDocument();
    // Compact view does not have table headers
    expect(screen.queryByText('Duration')).not.toBeInTheDocument();
  });

  it('shows duration in table view', () => {
    render(<VoiceCommandList commands={mockCommands} />);
    expect(screen.getByText('150ms')).toBeInTheDocument();
    expect(screen.getByText('300ms')).toBeInTheDocument();
  });
});

// ============================================================================
// VoiceFeedback
// ============================================================================
import { VoiceFeedback } from '@/components/voice/VoiceFeedback';

describe('VoiceFeedback', () => {
  it('renders nothing when no response and not processing', () => {
    const { container } = render(<VoiceFeedback response={null} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders processing state', () => {
    render(<VoiceFeedback response={null} isProcessing />);
    expect(screen.getByText('Processing command...')).toBeInTheDocument();
  });

  it('renders success response', () => {
    const response = {
      success: true,
      response: 'Command executed successfully',
      intent: 'NAVIGATE',
    };
    render(<VoiceFeedback response={response} />);
    expect(screen.getByText('Command executed')).toBeInTheDocument();
    expect(screen.getByText('Command executed successfully')).toBeInTheDocument();
  });

  it('renders failure response', () => {
    const response = {
      success: false,
      response: 'Could not process command',
      intent: 'UNKNOWN',
    };
    render(<VoiceFeedback response={response} />);
    expect(screen.getByText('Command failed')).toBeInTheDocument();
    expect(screen.getByText('Could not process command')).toBeInTheDocument();
  });

  it('renders navigate button when action type is NAVIGATE', () => {
    const response = {
      success: true,
      response: 'Going to promotions',
      intent: 'NAVIGATE',
      action: { type: 'NAVIGATE', params: { path: '/promotions' } },
    };
    const onNavigate = vi.fn();
    render(<VoiceFeedback response={response} onNavigate={onNavigate} />);
    expect(screen.getByText('Go to page')).toBeInTheDocument();
  });
});

// ============================================================================
// VoiceTranscript
// ============================================================================
import { VoiceTranscript } from '@/components/voice/VoiceTranscript';

describe('VoiceTranscript', () => {
  it('renders transcript text', () => {
    render(<VoiceTranscript transcript="Hello world" />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders "You said:" label', () => {
    render(<VoiceTranscript transcript="Test" />);
    expect(screen.getByText('You said:')).toBeInTheDocument();
  });

  it('renders listening state', () => {
    render(<VoiceTranscript transcript="" isListening />);
    expect(screen.getByText('Listening...')).toBeInTheDocument();
  });

  it('renders no speech state', () => {
    render(<VoiceTranscript transcript="" />);
    expect(screen.getByText('No speech detected')).toBeInTheDocument();
  });

  it('renders AI response when provided', () => {
    render(<VoiceTranscript transcript="Hello" response="Hi there!" />);
    expect(screen.getByText('Assistant:')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });

  it('does not render AI response section when not provided', () => {
    render(<VoiceTranscript transcript="Hello" />);
    expect(screen.queryByText('Assistant:')).not.toBeInTheDocument();
  });
});
