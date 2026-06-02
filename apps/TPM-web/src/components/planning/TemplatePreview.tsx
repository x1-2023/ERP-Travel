/**
 * Template Preview Component
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { formatCurrencyCompact } from '@/components/ui/currency-display';
import { Clock, DollarSign, Tag, Users, Package, History } from 'lucide-react';
import type { PromotionTemplate, TemplateVersion } from '@/types/planning';

interface TemplatePreviewProps {
  template: PromotionTemplate;
  versions?: TemplateVersion[];
  recentPromotions?: Array<{
    id: string;
    code: string;
    name: string;
    status: string;
    startDate: string;
    endDate: string;
  }>;
}

export function TemplatePreview({ template, versions, recentPromotions }: TemplatePreviewProps) {
  return (
    <div className="space-y-6">
      {/* Header Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Badge className="mb-2">{template.type}</Badge>
              <CardTitle>{template.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{template.code}</p>
            </div>
            <Badge variant={template.isActive ? 'default' : 'secondary'}>
              {template.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{template.description || 'No description'}</p>
        </CardContent>
      </Card>

      {/* Default Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Default Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Duration</p>
                <p className="text-sm text-muted-foreground">
                  {template.defaultDuration ? `${template.defaultDuration} days` : 'Not set'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <DollarSign className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Budget</p>
                <p className="text-sm text-muted-foreground">
                  {template.defaultBudget ? formatCurrencyCompact(template.defaultBudget, 'VND') : 'Not set'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Tag className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Category</p>
                <p className="text-sm text-muted-foreground">
                  {template.category || 'Not set'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Package className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Usage</p>
                <p className="text-sm text-muted-foreground">
                  {template.usageCount || 0} times
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mechanics */}
      {template.mechanics && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Promotion Mechanics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {template.mechanics.discountType && (
                <div>
                  <p className="text-sm font-medium">Discount Type</p>
                  <Badge variant="outline">{template.mechanics.discountType}</Badge>
                </div>
              )}
              {template.mechanics.discountValue !== undefined && (
                <div>
                  <p className="text-sm font-medium">Discount Value</p>
                  <p className="text-sm text-muted-foreground">
                    {template.mechanics.discountType === 'PERCENTAGE'
                      ? `${template.mechanics.discountValue}%`
                      : formatCurrencyCompact(template.mechanics.discountValue, 'VND')}
                  </p>
                </div>
              )}
              {template.mechanics.minPurchase !== undefined && (
                <div>
                  <p className="text-sm font-medium">Min Purchase</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrencyCompact(template.mechanics.minPurchase, 'VND')}
                  </p>
                </div>
              )}
              {template.mechanics.maxDiscount !== undefined && (
                <div>
                  <p className="text-sm font-medium">Max Discount</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrencyCompact(template.mechanics.maxDiscount, 'VND')}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium">Stackable</p>
                <Badge variant={template.mechanics.stackable ? 'default' : 'secondary'}>
                  {template.mechanics.stackable ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Eligibility */}
      {template.eligibility && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-4 w-4" />
              Eligibility Criteria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {template.eligibility.customerTypes && template.eligibility.customerTypes.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1">Customer Types</p>
                  <div className="flex gap-1">
                    {template.eligibility.customerTypes.map((ct) => (
                      <Badge key={ct} variant="outline">
                        {ct}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {template.eligibility.regions && template.eligibility.regions.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1">Regions</p>
                  <div className="flex gap-1">
                    {template.eligibility.regions.map((r) => (
                      <Badge key={r} variant="outline">
                        {r}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {template.eligibility.minOrderValue && (
                <div>
                  <p className="text-sm font-medium">Min Order Value</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrencyCompact(template.eligibility.minOrderValue, 'VND')}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Version History */}
      {versions && versions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="h-4 w-4" />
              Version History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {versions.slice(0, 5).map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">Version {v.version}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(v.createdAt)}
                    </p>
                  </div>
                  {v.changes && (
                    <Badge variant="outline" className="text-xs">
                      {Object.keys(v.changes).length} changes
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Promotions */}
      {recentPromotions && recentPromotions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Promotions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentPromotions.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.code} • {formatDate(p.startDate)} - {formatDate(p.endDate)}
                    </p>
                  </div>
                  <Badge variant="outline">{p.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default TemplatePreview;
