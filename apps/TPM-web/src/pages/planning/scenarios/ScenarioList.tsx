/**
 * Scenario List Page
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Plus,
  Search,
  BarChart3,
  FileText,
  PlayCircle,
  CheckCircle,
  GitCompare,
} from 'lucide-react';
import { ScenarioCard } from '@/components/planning';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useToast } from '@/hooks/useToast';
import {
  useScenarios,
  useDeleteScenario,
  useRunScenario,
  useCloneScenario,
} from '@/hooks/planning/useScenarios';

export default function ScenarioList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isCompareMode, setIsCompareMode] = useState(false);

  const { data, isLoading, error } = useScenarios({
    page,
    limit: 12,
    search: search || undefined,
    status: status !== 'all' ? status : undefined,
  });

  const deleteMutation = useDeleteScenario();
  const runMutation = useRunScenario();
  const cloneMutation = useCloneScenario();

  const handleRun = async (id: string) => {
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

  const handleClone = async (id: string) => {
    try {
      const cloned = await cloneMutation.mutateAsync({ id });
      toast({
        title: 'Scenario Cloned',
        description: 'New scenario created from the original.',
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
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast({
        title: 'Scenario Deleted',
        description: 'The scenario has been deleted.',
      });
      setDeleteId(null);
    } catch (err: any) {
      toast({
        title: 'Delete Failed',
        description: err.message || 'Failed to delete scenario',
        variant: 'destructive',
      });
    }
  };

  const handleSelect = (id: string, selected: boolean) => {
    if (selected) {
      if (selectedIds.length < 5) {
        setSelectedIds([...selectedIds, id]);
      } else {
        toast({
          title: 'Maximum 5 scenarios',
          description: 'You can compare up to 5 scenarios at a time.',
          variant: 'destructive',
        });
      }
    } else {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    }
  };

  const handleCompare = () => {
    if (selectedIds.length >= 2) {
      navigate(`/planning/scenarios/compare?ids=${selectedIds.join(',')}`);
    }
  };

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (error) return <div className="p-6 text-destructive">Error loading scenarios</div>;

  const scenarios = data?.data || [];
  const summary = data?.summary;
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Scenarios</h1>
          <p className="text-muted-foreground">
            Create and compare promotion scenarios
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isCompareMode && selectedIds.length >= 2 && (
            <Button onClick={handleCompare}>
              <GitCompare className="h-4 w-4 mr-2" />
              Compare ({selectedIds.length})
            </Button>
          )}
          <Button
            variant={isCompareMode ? 'secondary' : 'outline'}
            onClick={() => {
              setIsCompareMode(!isCompareMode);
              if (isCompareMode) setSelectedIds([]);
            }}
          >
            <GitCompare className="h-4 w-4 mr-2" />
            {isCompareMode ? 'Cancel Compare' : 'Compare Mode'}
          </Button>
          <Button asChild>
            <Link to="/planning/scenarios/new">
              <Plus className="h-4 w-4 mr-2" />
              New Scenario
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      {summary && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Scenarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold">{summary.total}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Draft
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-500" />
                <span className="text-2xl font-bold">
                  {summary.byStatus?.DRAFT || 0}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Running
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-blue-500" />
                <span className="text-2xl font-bold">
                  {summary.byStatus?.RUNNING || 0}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold">
                  {summary.byStatus?.COMPLETED || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search scenarios..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="RUNNING">Running</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Compare Mode Instructions */}
      {isCompareMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            Select 2-5 completed scenarios to compare. Selected:{' '}
            <strong>{selectedIds.length}</strong> / 5
          </p>
        </div>
      )}

      {/* Scenario Grid */}
      {scenarios.length === 0 ? (
        <Card className="p-12 text-center">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No scenarios found</h3>
          <p className="text-muted-foreground mb-4">
            Create your first scenario to start planning promotions.
          </p>
          <Button asChild>
            <Link to="/planning/scenarios/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Scenario
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarios.map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              onRun={handleRun}
              onClone={handleClone}
              onDelete={setDeleteId}
              onSelect={handleSelect}
              isSelected={selectedIds.includes(scenario.id)}
              showSelect={isCompareMode && scenario.status === 'COMPLETED'}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === pagination.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Scenario</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this scenario? This action cannot
              be undone and all version history will be lost.
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
    </div>
  );
}
