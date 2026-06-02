/**
 * Template Card Component
 */

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrencyCompact } from '@/components/ui/currency-display';
import { MoreVertical, Pencil, Play, Eye, Trash2, Copy } from 'lucide-react';
import type { PromotionTemplate } from '@/types/planning';

interface TemplateCardProps {
  template: PromotionTemplate;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onApply?: (template: PromotionTemplate) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (template: PromotionTemplate) => void;
}

const typeColors: Record<string, string> = {
  DISCOUNT: 'bg-primary text-primary-foreground',
  REBATE: 'bg-success text-success-foreground',
  COUPON: 'bg-accent text-accent-foreground',
  BUNDLE: 'bg-warning text-warning-foreground',
  BOGO: 'bg-danger text-danger-foreground',
  FREE_GOODS: 'bg-accent text-accent-foreground',
  LOYALTY: 'bg-warning text-warning-foreground',
};

export function TemplateCard({
  template,
  onView,
  onEdit,
  onApply,
  onDelete,
  onDuplicate,
}: TemplateCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <Badge className={typeColors[template.type] || 'bg-surface-hover text-foreground-muted'}>
              {template.type}
            </Badge>
            <CardTitle className="mt-2 text-lg">{template.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{template.code}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onView && (
                <DropdownMenuItem onClick={() => onView(template.id)}>
                  <Eye className="mr-2 h-4 w-4" /> View Details
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(template.id)}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
              )}
              {onDuplicate && (
                <DropdownMenuItem onClick={() => onDuplicate(template)}>
                  <Copy className="mr-2 h-4 w-4" /> Duplicate
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(template.id)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {template.description || 'No description'}
        </p>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Duration:</span>
            <span className="ml-1 font-medium">
              {template.defaultDuration ? `${template.defaultDuration} days` : 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Budget:</span>
            <span className="ml-1 font-medium">
              {template.defaultBudget ? formatCurrencyCompact(template.defaultBudget) : 'N/A'}
            </span>
          </div>
        </div>

        {template.mechanics && (
          <div className="mt-3 flex flex-wrap gap-1">
            {template.mechanics.discountType && (
              <Badge variant="outline" className="text-xs">
                {template.mechanics.discountType}
              </Badge>
            )}
            {template.mechanics.discountValue && (
              <Badge variant="outline" className="text-xs">
                {template.mechanics.discountType === 'PERCENTAGE'
                  ? `${template.mechanics.discountValue}%`
                  : formatCurrencyCompact(template.mechanics.discountValue)}
              </Badge>
            )}
            {template.mechanics.stackable && (
              <Badge variant="outline" className="text-xs bg-green-50">
                Stackable
              </Badge>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Used {template.usageCount || 0} times
          </span>
          <Badge variant={template.isActive ? 'default' : 'secondary'}>
            {template.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={() => onApply?.(template)}
          disabled={!template.isActive}
        >
          <Play className="mr-2 h-4 w-4" /> Apply Template
        </Button>
      </CardFooter>
    </Card>
  );
}

export default TemplateCard;
