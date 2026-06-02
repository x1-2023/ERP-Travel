/**
 * New Promotion Page
 */

import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PromotionForm } from "@/components/forms";
import { useCreatePromotion } from "@/hooks/usePromotions";
import { useToast } from "@/hooks/useToast";
import type { PromotionFormValues } from "@/lib/validations";

export default function PromotionNew() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createPromotion = useCreatePromotion();

  const handleSubmit = async (data: PromotionFormValues) => {
    try {
      await createPromotion.mutateAsync({
        ...data,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
      });
      toast({
        title: "Success",
        description: "Promotion created successfully",
      });
      navigate("/promotions");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create promotion",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/promotions">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">New Promotion</h1>
          <p className="text-muted-foreground">Create a new trade promotion</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl">
        <PromotionForm
          onSubmit={handleSubmit}
          isSubmitting={createPromotion.isPending}
        />
      </div>
    </div>
  );
}
