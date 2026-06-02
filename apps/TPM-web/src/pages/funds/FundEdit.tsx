/**
 * Edit Fund Page
 */

import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FundForm } from "@/components/forms";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useFund, useUpdateFund } from "@/hooks/useFunds";
import { useToast } from "@/hooks/useToast";
import type { FundFormValues } from "@/lib/validations";

export default function FundEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: fund, isLoading, error } = useFund(id!);
  const updateFund = useUpdateFund();

  const handleSubmit = async (data: FundFormValues) => {
    try {
      await updateFund.mutateAsync({
        id: id!,
        data: {
          ...data,
          startDate: data.startDate.toISOString(),
          endDate: data.endDate.toISOString(),
        },
      });
      toast({
        title: "Success",
        description: "Fund updated successfully",
      });
      navigate(`/funds/${id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update fund",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !fund) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load fund</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/funds">Back to Funds</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to={`/funds/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit {fund.code}</h1>
          <p className="text-muted-foreground">Update fund details</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl">
        <FundForm
          initialData={fund}
          onSubmit={handleSubmit}
          isSubmitting={updateFund.isPending}
        />
      </div>
    </div>
  );
}
