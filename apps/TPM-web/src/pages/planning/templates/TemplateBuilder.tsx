/**
 * Template Builder Page - Create New Template
 */

import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TemplateForm, TemplateFormData } from '@/components/planning/TemplateForm';
import { useCreateTemplate } from '@/hooks/planning/useTemplates';
import { useToast } from '@/hooks/useToast';

export default function TemplateBuilderPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const createTemplate = useCreateTemplate();

  const handleSubmit = async (formData: TemplateFormData) => {
    try {
      const result = await createTemplate.mutateAsync({
        code: formData.code,
        name: formData.name,
        description: formData.description || undefined,
        type: formData.type,
        category: formData.category || undefined,
        defaultDuration: formData.defaultDuration || undefined,
        defaultBudget: formData.defaultBudget || undefined,
        mechanics: formData.mechanics,
        eligibility: formData.eligibility,
      });

      toast({
        title: 'Success',
        description: 'Template created successfully',
      });

      // Navigate to the new template
      if (result?.data?.id) {
        navigate(`/planning/templates/${result.data.id}`);
      } else {
        navigate('/planning/templates');
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to create template',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/planning/templates')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create Template</h1>
          <p className="text-muted-foreground">
            Build a reusable promotion template
          </p>
        </div>
      </div>

      {/* Form */}
      <TemplateForm
        onSubmit={handleSubmit}
        onCancel={() => navigate('/planning/templates')}
        isLoading={createTemplate.isPending}
      />
    </div>
  );
}
