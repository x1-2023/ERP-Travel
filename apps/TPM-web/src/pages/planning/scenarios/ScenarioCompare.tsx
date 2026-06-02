/**
 * Scenario Compare Page
 */

import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Plus, X, GitCompare, Loader2 } from 'lucide-react';
import { ComparisonChart } from '@/components/planning';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useToast } from '@/hooks/useToast';
import {
  useScenarios,
  useScenarioComparison,
} from '@/hooks/planning/useScenarios';

export default function ScenarioCompare() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  // Get initial IDs from URL
  const initialIds = searchParams.get('ids')?.split(',').filter(Boolean) || [];
  const [selectedIds, setSelectedIds] = useState<string[]>(initialIds);

  // Fetch all completed scenarios for selection
  const { data: scenariosData, isLoading: scenariosLoading } = useScenarios({
    status: 'COMPLETED',
    limit: 100,
  });

  // Fetch comparison data
  const {
    data: comparisonData,
    isLoading: comparisonLoading,
    error: comparisonError,
  } = useScenarioComparison(selectedIds);

  // Update URL when selection changes
  useEffect(() => {
    if (selectedIds.length > 0) {
      setSearchParams({ ids: selectedIds.join(',') });
    } else {
      setSearchParams({});
    }
  }, [selectedIds, setSearchParams]);

  const completedScenarios = scenariosData?.data || [];

  const addScenario = (id: string) => {
    if (selectedIds.length >= 5) {
      toast({
        title: 'Maximum 5 scenarios',
        description: 'You can compare up to 5 scenarios at a time.',
        variant: 'destructive',
      });
      return;
    }
    if (!selectedIds.includes(id)) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const removeScenario = (id: string) => {
    setSelectedIds(selectedIds.filter((i) => i !== id));
  };

  if (scenariosLoading) return <LoadingSpinner fullScreen />;

  const availableScenarios = completedScenarios.filter(
    (s) => !selectedIds.includes(s.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/planning/scenarios">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Compare Scenarios</h1>
          <p className="text-muted-foreground">
            Select 2-5 completed scenarios to compare their performance
          </p>
        </div>
      </div>

      {/* Scenario Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Selected Scenarios ({selectedIds.length}/5)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selected scenarios */}
          <div className="flex flex-wrap gap-2">
            {selectedIds.map((id) => {
              const scenario = completedScenarios.find((s) => s.id === id);
              return (
                <div
                  key={id}
                  className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg"
                >
                  <span className="font-medium">
                    {scenario?.name || 'Unknown'}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => removeScenario(id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Add scenario dropdown */}
          {selectedIds.length < 5 && availableScenarios.length > 0 && (
            <div className="flex items-center gap-2">
              <Select onValueChange={addScenario}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Add a scenario..." />
                </SelectTrigger>
                <SelectContent>
                  {availableScenarios.map((scenario) => (
                    <SelectItem key={scenario.id} value={scenario.id}>
                      {scenario.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </div>
          )}

          {availableScenarios.length === 0 && selectedIds.length < 2 && (
            <p className="text-sm text-muted-foreground">
              No completed scenarios available for comparison. Run simulations
              first.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {selectedIds.length < 2 ? (
        <Card className="p-12 text-center">
          <GitCompare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Select at least 2 scenarios
          </h3>
          <p className="text-muted-foreground">
            Choose 2-5 completed scenarios from the dropdown above to compare
            their performance metrics.
          </p>
        </Card>
      ) : comparisonLoading ? (
        <Card className="p-12 text-center">
          <Loader2 className="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-spin" />
          <h3 className="text-lg font-semibold mb-2">Analyzing Scenarios...</h3>
          <p className="text-muted-foreground">
            Comparing metrics and generating recommendations.
          </p>
        </Card>
      ) : comparisonError ? (
        <Card className="p-12 text-center">
          <div className="text-destructive mb-4">
            Error loading comparison data
          </div>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </Card>
      ) : comparisonData ? (
        <ComparisonChart comparison={comparisonData} />
      ) : null}
    </div>
  );
}
