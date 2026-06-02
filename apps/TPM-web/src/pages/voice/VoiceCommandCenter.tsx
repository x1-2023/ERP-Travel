/**
 * Voice Command Center Page
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, History, HelpCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import {
  VoiceButton,
  VoiceTranscript,
  VoiceCommandList,
  VoiceFeedback,
} from '@/components/voice';
import {
  useProcessCommand,
  useCommandHistory,
  useVoiceSuggestions,
} from '@/hooks/voice';
import { useToast } from '@/hooks/useToast';
import { VOICE_COMMAND_EXAMPLES } from '@/types/advanced';
import type { ProcessCommandResponse } from '@/types/advanced';

export default function VoiceCommandCenter() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [response, setResponse] = useState<ProcessCommandResponse | null>(null);

  const { data: historyData, isLoading: historyLoading } = useCommandHistory({ pageSize: 10 });
  const { data: suggestionsData } = useVoiceSuggestions();
  const processCommandMutation = useProcessCommand();

  const commands = historyData?.data || [];
  const suggestions = suggestionsData?.suggestions || [];

  const handleTranscript = async (text: string) => {
    setTranscript(text);
    setIsListening(false);

    try {
      const result = await processCommandMutation.mutateAsync({ transcript: text });
      setResponse(result);

      // Handle navigation if action type is NAVIGATE
      if (result.action?.type === 'NAVIGATE' && result.action.params?.path) {
        toast({
          title: 'Navigating...',
          description: result.response,
        });
      }
    } catch {
      toast({
        title: 'Command Failed',
        description: 'Failed to process voice command',
        variant: 'destructive',
      });
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleSuggestionClick = (command: string) => {
    setTranscript(command);
    handleTranscript(command);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Voice Commands</h1>
          <p className="text-muted-foreground">
            Control the system with your voice
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Voice Input */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Voice Input
            </CardTitle>
            <CardDescription>
              Click the microphone and speak your command
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-6">
              <VoiceButton
                onTranscript={handleTranscript}
                onError={(error) => toast({ title: 'Error', description: error, variant: 'destructive' })}
                size="lg"
              />
              <p className="text-sm text-muted-foreground">
                {isListening ? 'Listening...' : 'Click to start'}
              </p>
            </div>

            {/* Transcript & Response */}
            {(transcript || response) && (
              <div className="space-y-4 pt-4 border-t">
                <VoiceTranscript
                  transcript={transcript}
                  isListening={isListening}
                  response={response?.response}
                />
                <VoiceFeedback
                  response={response}
                  isProcessing={processCommandMutation.isPending}
                  onNavigate={handleNavigate}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Suggestions
            </CardTitle>
            <CardDescription>
              Based on your recent activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {suggestions.length > 0 ? (
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3"
                    onClick={() => handleSuggestionClick(suggestion.command)}
                  >
                    <div>
                      <p className="font-medium">"{suggestion.command}"</p>
                      <p className="text-xs text-muted-foreground">
                        {suggestion.description}
                      </p>
                    </div>
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No suggestions available
              </p>
            )}
          </CardContent>
        </Card>

        {/* Command Examples */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Example Commands
            </CardTitle>
            <CardDescription>
              Try saying these commands
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {VOICE_COMMAND_EXAMPLES.map((example, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto py-2"
                  onClick={() => handleSuggestionClick(example.command)}
                >
                  <div>
                    <p className="text-sm">"{example.command}"</p>
                    <p className="text-xs text-muted-foreground">
                      Intent: {example.intent}
                    </p>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Command History */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Recent Commands
            </CardTitle>
            <CardDescription>
              Your voice command history
            </CardDescription>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : (
              <VoiceCommandList commands={commands} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
