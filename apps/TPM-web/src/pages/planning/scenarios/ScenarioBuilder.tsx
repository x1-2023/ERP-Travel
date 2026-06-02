/**
 * Scenario Builder Page
 * Create and edit scenarios
 */

import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ScenarioForm } from '@/components/planning';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useToast } from '@/hooks/useToast';
import {
  useScenario,
  useCreateScenario,
  useUpdateScenario,
} from '@/hooks/planning/useScenarios';
import { useBaselines } from '@/hooks/useBaselines';

export default function ScenarioBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = !!id;

  const { data: scenario, isLoading: scenarioLoading } = useScenario(id);
  const { data: baselinesData } = useBaselines({ limit: 100 });
  const createMutation = useCreateScenario();
  const updateMutation = useUpdateScenario();

  const baselines = baselinesData?.baselines || [];

  const handleSubmit = async (data: any) => {
    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, ...data });
        toast({
          title: 'Scenario Updated',
          description: 'Your changes have been saved.',
        });
        navigate(`/planning/scenarios/${id}`);
      } else {
        const created = await createMutation.mutateAsync(data);
        toast({
          title: 'Scenario Created',
          description: 'Your new scenario has been created.',
        });
        navigate(`/planning/scenarios/${created.id}`);
      }
    } catch (err: any) {
      toast({
        title: isEdit ? 'Update Failed' : 'Create Failed',
        description: err.message || 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  if (isEdit && scenarioLoading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to={isEdit ? `/planning/scenarios/${id}` : '/planning/scenarios'}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEdit ? 'Edit Scenario' : 'Create Scenario'}
          </h1>
          <p className="text-muted-foreground">
            {isEdit
              ? 'Update scenario parameters and assumptions'
              : 'Configure a new promotion scenario for simulation'}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl">
        <ScenarioForm
          initialData={
            scenario
              ? {
                  name: scenario.name,
                  description: scenario.description || '',
                  baselineId: scenario.baselineId || '',
                  parameters: scenario.parameters,
                  assumptions: scenario.assumptions,
                }
              : undefined
          }
          baselines={baselines}
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
          submitLabel={isEdit ? 'Save Changes' : 'Create Scenario'}
        />
      </div>
    </div>
  );
}
