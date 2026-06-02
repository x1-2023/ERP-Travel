/**
 * New Fund Page
 */

import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FundForm } from "@/components/forms";
import { useCreateFund } from "@/hooks/useFunds";
import { useToast } from "@/hooks/useToast";
import type { FundFormValues } from "@/lib/validations";

export default function FundNew() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createFund = useCreateFund();

  const handleSubmit = async (data: FundFormValues) => {
    try {
      await createFund.mutateAsync({
        ...data,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
      });
      toast({
        title: "Success",
        description: "Fund created successfully",
      });
      navigate("/funds");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create fund",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/funds">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">New Fund</h1>
          <p className="text-muted-foreground">Create a new trade fund</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl">
        <FundForm
          onSubmit={handleSubmit}
          isSubmitting={createFund.isPending}
        />
      </div>
    </div>
  );
}
