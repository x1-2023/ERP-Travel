/**
 * Edit Promotion Page
 */

import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PromotionForm } from "@/components/forms";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { usePromotion, useUpdatePromotion } from "@/hooks/usePromotions";
import { useToast } from "@/hooks/useToast";
import type { PromotionFormValues } from "@/lib/validations";

export default function PromotionEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: promotion, isLoading, error } = usePromotion(id!);
  const updatePromotion = useUpdatePromotion();

  const handleSubmit = async (data: PromotionFormValues) => {
    try {
      await updatePromotion.mutateAsync({
        id: id!,
        data: {
          ...data,
          startDate: data.startDate.toISOString(),
          endDate: data.endDate.toISOString(),
        },
      });
      toast({
        title: "Success",
        description: "Promotion updated successfully",
      });
      navigate(`/promotions/${id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update promotion",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !promotion) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load promotion</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/promotions">Back to Promotions</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to={`/promotions/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit {promotion.code}</h1>
          <p className="text-muted-foreground">Update promotion details</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl">
        <PromotionForm
          initialData={promotion}
          onSubmit={handleSubmit}
          isSubmitting={updatePromotion.isPending}
        />
      </div>
    </div>
  );
}
