/**
 * New Claim Page
 */

import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClaimForm } from "@/components/forms";
import { useCreateClaim } from "@/hooks/useClaims";
import { useToast } from "@/hooks/useToast";
import type { ClaimFormValues } from "@/lib/validations";

export default function ClaimNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const createClaim = useCreateClaim();

  // Pre-select promotion if coming from promotion detail page
  const promotionId = searchParams.get("promotionId") || undefined;

  const handleSubmit = async (data: ClaimFormValues) => {
    try {
      await createClaim.mutateAsync({
        ...data,
        claimDate: data.claimDate.toISOString(),
      });
      toast({
        title: "Success",
        description: "Claim created successfully",
      });
      navigate("/claims");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create claim",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/claims">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">New Claim</h1>
          <p className="text-muted-foreground">Submit a new promotion claim</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl">
        <ClaimForm
          initialPromotionId={promotionId}
          onSubmit={handleSubmit}
          isSubmitting={createClaim.isPending}
        />
      </div>
    </div>
  );
}
