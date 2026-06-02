/**
 * Claim Form Component
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePromotionOptions } from "@/hooks/usePromotions";
import { claimFormSchema, type ClaimFormValues } from "@/lib/validations";
import { CurrencyDisplay } from "@/components/ui/currency-display";

interface PromotionOption {
  value: string;
  label: string;
  budget?: number;
  availableBudget?: number;
}

interface ClaimFormProps {
  initialPromotionId?: string;
  onSubmit: (data: ClaimFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export function ClaimForm({
  initialPromotionId,
  onSubmit,
  isSubmitting = false,
}: ClaimFormProps) {
  const { data: promotionOptions = [], isLoading: promotionsLoading } = usePromotionOptions();

  const form = useForm<ClaimFormValues>({
    resolver: zodResolver(claimFormSchema),
    defaultValues: {
      promotionId: initialPromotionId || "",
      claimDate: new Date(),
      claimAmount: undefined,
      description: "",
      invoiceNumber: "",
    },
  });

  const selectedPromotionId = form.watch("promotionId");
  const selectedPromotion = promotionOptions.find(
    (p: PromotionOption) => p.value === selectedPromotionId
  );

  const handleSubmit = async (data: ClaimFormValues) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Promotion Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Promotion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="promotionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Promotion *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={promotionsLoading || !!initialPromotionId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a promotion" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {promotionOptions.map((option: PromotionOption) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedPromotion && (
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  Available Budget:{" "}
                  <span className="font-medium text-foreground">
                    <CurrencyDisplay amount={selectedPromotion.availableBudget || 0} size="sm" />
                  </span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Claim Details */}
        <Card>
          <CardHeader>
            <CardTitle>Claim Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="claimDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Claim Date *</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select claim date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="claimAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Claim Amount (VND) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="invoiceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice Number</FormLabel>
                  <FormControl>
                    <Input placeholder="INV-2026-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter claim description..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Claim
          </Button>
        </div>
      </form>
    </Form>
  );
}
