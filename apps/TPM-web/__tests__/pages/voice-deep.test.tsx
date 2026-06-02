/**
 * Deep Tests for Voice Command Center
 * Covers: page structure, sections, suggestions, command history, interactions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../test-utils';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// Mock voice hooks
vi.mock('@/hooks/voice', () => ({
  useProcessCommand: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCommandHistory: () => ({ data: undefined, isLoading: false }),
  useVoiceSuggestions: () => ({ data: undefined }),
}));

// Mock useToast
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

// Mock voice components
vi.mock('@/components/voice', () => ({
  VoiceButton: ({ onTranscript }: any) => (
    <button data-testid="voice-button" onClick={() => onTranscript('test command')}>
      Voice Button
    </button>
  ),
  VoiceTranscript: ({ transcript, response }: any) => (
    <div data-testid="voice-transcript">
      {transcript && <span>Transcript: {transcript}</span>}
      {response && <span>Response: {response}</span>}
    </div>
  ),
  VoiceCommandList: ({ commands }: any) => (
    <div data-testid="voice-command-list">
      {commands?.length > 0 ? `${commands.length} commands` : 'No commands'}
    </div>
  ),
  VoiceFeedback: ({ isProcessing }: any) => (
    <div data-testid="voice-feedback">
      {isProcessing ? 'Processing...' : 'Ready'}
    </div>
  ),
}));

vi.mock('@/components/shared/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
}));

// Mock types/advanced
vi.mock('@/types/advanced', () => ({
  VOICE_COMMAND_EXAMPLES: [
    { command: 'Show me pending claims', intent: 'NAVIGATE' },
    { command: 'What is the total budget?', intent: 'QUERY' },
    { command: 'Create a new promotion', intent: 'ACTION' },
  ],
}));

import VoiceCommandCenter from '@/pages/voice/VoiceCommandCenter';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('VoiceCommandCenter - Deep Tests', () => {
  it('renders page title', () => {
    render(<VoiceCommandCenter />);
    expect(screen.getByText('Voice Commands')).toBeInTheDocument();
  });

  it('renders page description', () => {
    render(<VoiceCommandCenter />);
    expect(screen.getByText('Control the system with your voice')).toBeInTheDocument();
  });

  it('renders Voice Input card', () => {
    render(<VoiceCommandCenter />);
    expect(screen.getByText('Voice Input')).toBeInTheDocument();
    expect(screen.getByText('Click the microphone and speak your command')).toBeInTheDocument();
  });

  it('renders Suggestions card', () => {
    render(<VoiceCommandCenter />);
    expect(screen.getByText('Suggestions')).toBeInTheDocument();
    expect(screen.getByText('Based on your recent activity')).toBeInTheDocument();
  });

  it('renders Example Commands card', () => {
    render(<VoiceCommandCenter />);
    expect(screen.getByText('Example Commands')).toBeInTheDocument();
    expect(screen.getByText('Try saying these commands')).toBeInTheDocument();
  });

  it('renders Recent Commands card', () => {
    render(<VoiceCommandCenter />);
    expect(screen.getByText('Recent Commands')).toBeInTheDocument();
    expect(screen.getByText('Your voice command history')).toBeInTheDocument();
  });

  it('renders voice button', () => {
    render(<VoiceCommandCenter />);
    expect(screen.getByTestId('voice-button')).toBeInTheDocument();
  });

  it('renders command history list', () => {
    render(<VoiceCommandCenter />);
    expect(screen.getByTestId('voice-command-list')).toBeInTheDocument();
  });

  it('renders example commands from mock data', () => {
    render(<VoiceCommandCenter />);
    expect(screen.getByText(/"Show me pending claims"/)).toBeInTheDocument();
    expect(screen.getByText(/"What is the total budget\?"/)).toBeInTheDocument();
    expect(screen.getByText(/"Create a new promotion"/)).toBeInTheDocument();
  });

  it('renders example command intents', () => {
    render(<VoiceCommandCenter />);
    expect(screen.getByText('Intent: NAVIGATE')).toBeInTheDocument();
    expect(screen.getByText('Intent: QUERY')).toBeInTheDocument();
    expect(screen.getByText('Intent: ACTION')).toBeInTheDocument();
  });

  it('shows no suggestions message when no suggestions', () => {
    render(<VoiceCommandCenter />);
    expect(screen.getByText('No suggestions available')).toBeInTheDocument();
  });

  it('shows click to start message', () => {
    render(<VoiceCommandCenter />);
    expect(screen.getByText('Click to start')).toBeInTheDocument();
  });

  it('shows no commands state', () => {
    render(<VoiceCommandCenter />);
    expect(screen.getByText('No commands')).toBeInTheDocument();
  });
});
