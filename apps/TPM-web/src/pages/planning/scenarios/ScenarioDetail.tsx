/**
 * Scenario Detail Page
 */

import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Play,
  Copy,
  Trash2,
  Edit,
  History,
  RotateCcw,
  Loader2,
  Calendar,
  DollarSign,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { ScenarioStatusBadge, ScenarioResults } from '@/components/planning';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useToast } from '@/hooks/useToast';
import { formatDate } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import {
  useScenario,
  useScenarioVersions,
  useRunScenario,
  useCloneScenario,
  useDeleteScenario,
  useRestoreScenarioVersion,
} from '@/hooks/planning/useScenarios';

export default function ScenarioDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('results');
  const [showDelete, setShowDelete] = useState(false);
  const [restoreVersion, setRestoreVersion] = useState<string | null>(null);

  const { data: scenario, isLoading, error } = useScenario(id);
  const { data: versionsData } = useScenarioVersions(id);

  const runMutation = useRunScenario();
  const cloneMutation = useCloneScenario();
  const deleteMutation = useDeleteScenario();
  const restoreMutation = useRestoreScenarioVersion();

  const handleRun = async () => {
    if (!id) return;
    try {
      await runMutation.mutateAsync({ id });
      toast({
        title: 'Simulation Complete',
        description: 'Scenario simulation has finished successfully.',
      });
    } catch (err: any) {
      toast({
        title: 'Simulation Failed',
        description: err.message || 'Failed to run simulation',
        variant: 'destructive',
      });
    }
  };

  const handleClone = async () => {
    if (!id) return;
    try {
      const cloned = await cloneMutation.mutateAsync({ id });
      toast({
        title: 'Scenario Cloned',
        description: 'New scenario created.',
      });
      navigate(`/planning/scenarios/${cloned.id}`);
    } catch (err: any) {
      toast({
        title: 'Clone Failed',
        description: err.message || 'Failed to clone scenario',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: 'Scenario Deleted',
        description: 'The scenario has been deleted.',
      });
      navigate('/planning/scenarios');
    } catch (err: any) {
      toast({
        title: 'Delete Failed',
        description: err.message || 'Failed to delete scenario',
        variant: 'destructive',
      });
    }
  };

  const handleRestore = async () => {
    if (!id || !restoreVersion) return;
    try {
      await restoreMutation.mutateAsync({
        scenarioId: id,
        versionId: restoreVersion,
      });
      toast({
        title: 'Version Restored',
        description: 'Scenario has been restored to the selected version.',
      });
      setRestoreVersion(null);
    } catch (err: any) {
      toast({
        title: 'Restore Failed',
        description: err.message || 'Failed to restore version',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (error || !scenario) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-destructive mb-4">Scenario not found</p>
          <Button asChild variant="outline">
            <Link to="/planning/scenarios">Back to Scenarios</Link>
          </Button>
        </div>
      </div>
    );
  }

  const versions = versionsData?.data?.versions || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/planning/scenarios">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{scenario.name}</h1>
              <ScenarioStatusBadge status={scenario.status} />
            </div>
            {scenario.description && (
              <p className="text-muted-foreground mt-1">{scenario.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {scenario.status === 'DRAFT' && (
            <Button onClick={handleRun} disabled={runMutation.isPending}>
              {runMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Run Simulation
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link to={`/planning/scenarios/${id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={handleClone}
            disabled={cloneMutation.isPending}
          >
            <Copy className="h-4 w-4 mr-2" />
            Clone
          </Button>
          <Button variant="destructive" onClick={() => setShowDelete(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-lg font-semibold">
                  {scenario.parameters.duration} days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Budget</p>
                <p className="text-lg font-semibold">
                  <CurrencyDisplay amount={scenario.parameters.budget} size="md" />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Expected Lift</p>
                <p className="text-lg font-semibold">
                  {scenario.parameters.expectedLiftPercent}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Percent className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Redemption Rate</p>
                <p className="text-lg font-semibold">
                  {scenario.parameters.redemptionRatePercent}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="parameters">Parameters</TabsTrigger>
          <TabsTrigger value="assumptions">Assumptions</TabsTrigger>
          <TabsTrigger value="versions">
            <History className="h-4 w-4 mr-2" />
            Versions ({versions.length})
          </TabsTrigger>
        </TabsList>

        {/* Results Tab */}
        <TabsContent value="results">
          {scenario.results ? (
            <ScenarioResults results={scenario.results} />
          ) : (
            <Card className="p-12 text-center">
              <Play className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Results Yet</h3>
              <p className="text-muted-foreground mb-4">
                Run the simulation to see results.
              </p>
              <Button onClick={handleRun} disabled={runMutation.isPending}>
                {runMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Run Simulation
              </Button>
            </Card>
          )}
        </TabsContent>

        {/* Parameters Tab */}
        <TabsContent value="parameters">
          <Card>
            <CardHeader>
              <CardTitle>Promotion Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Promotion Type</p>
                  <p className="font-medium">{scenario.parameters.promotionType}</p>
                </div>
                {scenario.parameters.discountPercent !== undefined && (
                  <div>
                    <p className="text-sm text-muted-foreground">Discount %</p>
                    <p className="font-medium">
                      {scenario.parameters.discountPercent}%
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="font-medium">
                    <CurrencyDisplay amount={scenario.parameters.budget} size="sm" />
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{scenario.parameters.duration} days</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">{scenario.parameters.startDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expected Lift</p>
                  <p className="font-medium">
                    {scenario.parameters.expectedLiftPercent}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Redemption Rate</p>
                  <p className="font-medium">
                    {scenario.parameters.redemptionRatePercent}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assumptions Tab */}
        <TabsContent value="assumptions">
          <Card>
            <CardHeader>
              <CardTitle>Business Assumptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Baseline Sales/Day
                  </p>
                  <p className="font-medium">
                    <CurrencyDisplay amount={scenario.assumptions.baselineSalesPerDay} size="sm" />
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Order Value</p>
                  <p className="font-medium">
                    <CurrencyDisplay amount={scenario.assumptions.averageOrderValue} size="sm" />
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Margin %</p>
                  <p className="font-medium">
                    {scenario.assumptions.marginPercent}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cannibalization %</p>
                  <p className="font-medium">
                    {scenario.assumptions.cannibalizedPercent || 0}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Halo Effect %</p>
                  <p className="font-medium">
                    {scenario.assumptions.haloEffectPercent || 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Versions Tab */}
        <TabsContent value="versions">
          <Card>
            <CardHeader>
              <CardTitle>Version History</CardTitle>
            </CardHeader>
            <CardContent>
              {versions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No versions yet. Run the simulation to create version history.
                </p>
              ) : (
                <div className="space-y-4">
                  {versions.map((version) => (
                    <div
                      key={version.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            Version {version.version}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(version.createdAt)}
                          </span>
                        </div>
                        {version.notes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {version.notes}
                          </p>
                        )}
                        {version.summary && (
                          <div className="flex gap-4 mt-2 text-sm">
                            <span>ROI: {version.summary.roi}%</span>
                            <span>
                              Margin: <CurrencyDisplay amount={version.summary.netMargin} size="sm" />
                            </span>
                            <span>Lift: {version.summary.salesLiftPercent}%</span>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRestoreVersion(version.id)}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Restore
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Baseline Info */}
      {scenario.baseline && (
        <Card>
          <CardHeader>
            <CardTitle>Baseline Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>{scenario.baseline.name}</strong> ({scenario.baseline.code})
            </p>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Scenario</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{scenario.name}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Confirmation */}
      <AlertDialog
        open={!!restoreVersion}
        onOpenChange={() => setRestoreVersion(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Version</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to restore this version? Current parameters
              and results will be replaced.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore}>Restore</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
