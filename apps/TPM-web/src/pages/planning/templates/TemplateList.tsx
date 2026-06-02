/**
 * Template List Page
 */

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, LayoutGrid, List, Search } from 'lucide-react';
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
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/DataTable';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { TemplateCard } from '@/components/planning/TemplateCard';
import { ApplyTemplateDialog } from '@/components/planning/ApplyTemplateDialog';
import { Badge } from '@/components/ui/badge';
import {
  useTemplates,
  useDeleteTemplate,
  useApplyTemplate,
} from '@/hooks/planning/useTemplates';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import { useToast } from '@/hooks/useToast';
import type { PromotionTemplate } from '@/types/planning';

type ViewMode = 'grid' | 'table';

const PROMOTION_TYPES = [
  { value: 'DISCOUNT', label: 'Discount' },
  { value: 'REBATE', label: 'Rebate' },
  { value: 'COUPON', label: 'Coupon' },
  { value: 'BUNDLE', label: 'Bundle' },
  { value: 'BOGO', label: 'Buy One Get One' },
  { value: 'FREE_GOODS', label: 'Free Goods' },
  { value: 'LOYALTY', label: 'Loyalty' },
];

export default function TemplateListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  // State
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PromotionTemplate | null>(null);

  // Filters from URL
  const type = searchParams.get('type') || '';
  const isActive = searchParams.get('isActive') || '';
  const page = parseInt(searchParams.get('page') || '1');

  // Queries & Mutations
  const { data, isLoading, error } = useTemplates({
    type: type || undefined,
    isActive: isActive ? isActive === 'true' : undefined,
    search: searchQuery || undefined,
    page,
  });
  const deleteTemplate = useDeleteTemplate();
  const applyTemplate = useApplyTemplate();

  // Handlers
  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.delete('page');
    setSearchParams(newParams);
  };

  const handleApplyClick = (template: PromotionTemplate) => {
    setSelectedTemplate(template);
    setApplyDialogOpen(true);
  };

  const handleApply = async (data: any) => {
    if (!selectedTemplate) return;

    try {
      await applyTemplate.mutateAsync({ id: selectedTemplate.id, ...data });
      toast({
        title: 'Success',
        description: 'Promotion created from template',
      });
      setApplyDialogOpen(false);
      setSelectedTemplate(null);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to apply template',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      await deleteTemplate.mutateAsync(id);
      toast({ title: 'Success', description: 'Template deleted successfully' });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete template',
        variant: 'destructive',
      });
    }
  };

  // Table columns
  const columns: ColumnDef<PromotionTemplate>[] = [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.code}</span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-sm text-muted-foreground line-clamp-1">
            {row.original.description}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => <Badge>{row.original.type}</Badge>,
    },
    {
      accessorKey: 'defaultDuration',
      header: 'Duration',
      cell: ({ row }) =>
        row.original.defaultDuration ? `${row.original.defaultDuration} days` : '-',
    },
    {
      accessorKey: 'defaultBudget',
      header: 'Budget',
      cell: ({ row }) =>
        row.original.defaultBudget ? <CurrencyDisplay amount={row.original.defaultBudget} size="sm" /> : '-',
    },
    {
      accessorKey: 'usageCount',
      header: 'Usage',
      cell: ({ row }) => row.original.usageCount || 0,
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/planning/templates/${row.original.id}`)}
          >
            View
          </Button>
          <Button
            size="sm"
            onClick={() => handleApplyClick(row.original)}
            disabled={!row.original.isActive}
          >
            Apply
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <EmptyState
        title="Error loading templates"
        description="There was an error loading the templates. Please try again."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Promotion Templates</h1>
          <p className="text-muted-foreground">
            Reusable templates for creating promotions quickly
          </p>
        </div>
        <Button onClick={() => navigate('/planning/templates/builder')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      {/* Summary Stats */}
      {data?.summary && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{data.summary.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Inactive
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">
                {data.summary.inactive}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                By Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {Object.entries(data.summary.byType || {}).map(([type, count]) => (
                  <Badge key={type} variant="outline" className="text-xs">
                    {type}: {count as number}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          value={type || 'all'}
          onValueChange={(v) => handleFilterChange('type', v)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {PROMOTION_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={isActive || 'all'}
          onValueChange={(v) => handleFilterChange('isActive', v)}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex-1" />

        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('table')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {!data?.data?.length ? (
        <EmptyState
          title="No templates found"
          description="Create a template to get started."
          action={
            <Button onClick={() => navigate('/planning/templates/builder')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.data.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onView={(id) => navigate(`/planning/templates/${id}`)}
              onEdit={(id) => navigate(`/planning/templates/${id}?edit=true`)}
              onApply={handleApplyClick}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <DataTable columns={columns} data={data.data} />
      )}

      {/* Apply Dialog */}
      <ApplyTemplateDialog
        open={applyDialogOpen}
        onOpenChange={setApplyDialogOpen}
        template={selectedTemplate}
        onApply={handleApply}
        isLoading={applyTemplate.isPending}
      />
    </div>
  );
}
