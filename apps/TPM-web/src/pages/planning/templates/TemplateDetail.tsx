/**
 * Template Detail Page
 */

import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Play, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { TemplatePreview } from '@/components/planning/TemplatePreview';
import { TemplateForm, TemplateFormData } from '@/components/planning/TemplateForm';
import { ApplyTemplateDialog } from '@/components/planning/ApplyTemplateDialog';
import {
  useTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
  useApplyTemplate,
} from '@/hooks/planning/useTemplates';
import { useToast } from '@/hooks/useToast';

export default function TemplateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  // Check if edit mode from URL
  const isEditMode = searchParams.get('edit') === 'true';

  // State
  const [activeTab, setActiveTab] = useState(isEditMode ? 'edit' : 'preview');
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);

  // Queries & Mutations
  const { data, isLoading, error } = useTemplate(id || '');
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();
  const applyTemplate = useApplyTemplate();

  const template = data?.data;

  const handleUpdate = async (formData: TemplateFormData) => {
    if (!id) return;

    try {
      await updateTemplate.mutateAsync({
        id,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        defaultDuration: formData.defaultDuration || undefined,
        defaultBudget: formData.defaultBudget || undefined,
        mechanics: formData.mechanics,
        eligibility: formData.eligibility,
        isActive: formData.isActive,
      });
      toast({ title: 'Success', description: 'Template updated successfully' });
      setActiveTab('preview');
      setSearchParams({});
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update template',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      await deleteTemplate.mutateAsync(id);
      toast({ title: 'Success', description: 'Template deleted successfully' });
      navigate('/planning/templates');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete template',
        variant: 'destructive',
      });
    }
  };

  const handleApply = async (data: any) => {
    if (!id) return;

    try {
      const result = await applyTemplate.mutateAsync({ id, ...data });
      toast({
        title: 'Success',
        description: 'Promotion created from template',
      });
      setApplyDialogOpen(false);
      // Navigate to the new promotion
      if (result?.data?.id) {
        navigate(`/promotions/${result.data.id}`);
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to apply template',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !template) {
    return (
      <EmptyState
        title="Template not found"
        description="The template you're looking for doesn't exist."
        action={
          <Button onClick={() => navigate('/planning/templates')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Templates
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/planning/templates')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{template.name}</h1>
            <p className="text-muted-foreground">{template.code}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setActiveTab('edit');
              setSearchParams({ edit: 'true' });
            }}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button onClick={() => setApplyDialogOpen(true)} disabled={!template.isActive}>
            <Play className="mr-2 h-4 w-4" />
            Apply Template
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="mt-6">
          <TemplatePreview
            template={template}
            versions={template.versions}
            recentPromotions={template.promotions}
          />
        </TabsContent>

        <TabsContent value="edit" className="mt-6">
          <TemplateForm
            template={template}
            onSubmit={handleUpdate}
            onCancel={() => {
              setActiveTab('preview');
              setSearchParams({});
            }}
            isLoading={updateTemplate.isPending}
          />
        </TabsContent>
      </Tabs>

      {/* Apply Dialog */}
      <ApplyTemplateDialog
        open={applyDialogOpen}
        onOpenChange={setApplyDialogOpen}
        template={template}
        onApply={handleApply}
        isLoading={applyTemplate.isPending}
      />
    </div>
  );
}
