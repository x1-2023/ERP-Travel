/**
 * Voice Commands Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
  VoiceCommand,
  TranscribeRequest,
  TranscribeResponse,
  ProcessCommandRequest,
  ProcessCommandResponse,
  VoiceSuggestion,
  VoiceCommandHistoryParams,
  Pagination,
} from '@/types/advanced';

// Transcribe audio to text
export function useTranscribe() {
  return useMutation({
    mutationFn: async (data: TranscribeRequest) => {
      const res = await api.post('/voice/transcribe', data);
      return res.data as TranscribeResponse;
    },
  });
}

// Process voice command
export function useProcessCommand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProcessCommandRequest) => {
      const res = await api.post('/voice/process', data);
      return res.data as ProcessCommandResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-commands'] });
    },
  });
}

// Get command history
export function useCommandHistory(params?: VoiceCommandHistoryParams) {
  return useQuery({
    queryKey: ['voice-commands', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));

      const res = await api.get(`/voice/commands?${searchParams.toString()}`);
      return res.data as {
        data: VoiceCommand[];
        pagination: Pagination;
      };
    },
  });
}

// Get voice suggestions based on context
export function useVoiceSuggestions() {
  return useQuery({
    queryKey: ['voice-suggestions'],
    queryFn: async () => {
      const res = await api.get('/voice/suggestions');
      return res.data as { suggestions: VoiceSuggestion[] };
    },
  });
}
