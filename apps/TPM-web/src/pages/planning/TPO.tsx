/**
 * TPO (Trade Promotion Optimization) Page
 * AI-powered promotion planning and optimization
 */

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Brain,
  Sparkles,
  TrendingUp,
  Target,
  DollarSign,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Play,
  CheckCircle,
  BarChart3,
  Calendar,
  Users,
  Package,
  Percent,
  Zap,
  Award,
  Loader2,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useTPO, usePromotionSuggestions, useROIPrediction } from '@/hooks/useTPO';
import type { MechanicType, ChannelType } from '@/types/tpo';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import { useTranslation } from '@/lib/i18n/useTranslation';

// Types
interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  impact: {
    revenue: number;
    roi: number;
    cost: number;
  };
  confidence: number;
  category: 'TIMING' | 'DISCOUNT' | 'CHANNEL' | 'PRODUCT' | 'CUSTOMER';
  status: 'NEW' | 'ACCEPTED' | 'REJECTED' | 'IMPLEMENTED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

// Mock data
const mockRecommendations: AIRecommendation[] = [
  {
    id: '1',
    title: 'Shift Tet promotion timing by 1 week',
    description:
      'Historical data suggests starting Tet promotions 1 week earlier yields 15% higher engagement. Consumer spending patterns show peak activity begins earlier than currently planned.',
    impact: { revenue: 2500000000, roi: 18, cost: 500000000 },
    confidence: 92,
    category: 'TIMING',
    status: 'NEW',
    priority: 'HIGH',
  },
  {
    id: '2',
    title: 'Optimize discount depth for Pepsi 1.5L',
    description:
      'Current 15% discount is suboptimal. AI analysis suggests 12% discount achieves similar volume lift with better margin retention. Cannibalization effects considered.',
    impact: { revenue: 800000000, roi: 25, cost: -200000000 },
    confidence: 87,
    category: 'DISCOUNT',
    status: 'NEW',
    priority: 'HIGH',
  },
  {
    id: '3',
    title: 'Reallocate budget from MT to GT in Mekong',
    description:
      'GT channel in Mekong region shows 23% higher response rate to promotions. Recommend shifting 20% of MT budget to GT for this region.',
    impact: { revenue: 1200000000, roi: 15, cost: 0 },
    confidence: 78,
    category: 'CHANNEL',
    status: 'ACCEPTED',
    priority: 'MEDIUM',
  },
  {
    id: '4',
    title: 'Bundle Aquafina with snacks for Tet',
    description:
      'Cross-category analysis shows strong affinity between Aquafina and snack products during Tet. Bundling could increase basket size by 30%.',
    impact: { revenue: 600000000, roi: 22, cost: 100000000 },
    confidence: 85,
    category: 'PRODUCT',
    status: 'NEW',
    priority: 'MEDIUM',
  },
  {
    id: '5',
    title: 'Target high-value customers with premium offers',
    description:
      'Segment analysis identifies 15% of customers generating 45% of promotion revenue. Personalized premium offers recommended.',
    impact: { revenue: 900000000, roi: 30, cost: 150000000 },
    confidence: 81,
    category: 'CUSTOMER',
    status: 'IMPLEMENTED',
    priority: 'HIGH',
  },
];

const optimizationData = [
  { metric: 'ROI', current: 65, optimized: 85, max: 100 },
  { metric: 'Reach', current: 70, optimized: 82, max: 100 },
  { metric: 'Efficiency', current: 55, optimized: 78, max: 100 },
  { metric: 'Margin', current: 60, optimized: 72, max: 100 },
  { metric: 'Volume', current: 80, optimized: 88, max: 100 },
];

const scenarioData = [
  { month: 'Jan', conservative: 3200, balanced: 3800, aggressive: 4500 },
  { month: 'Feb', conservative: 3400, balanced: 4200, aggressive: 5000 },
  { month: 'Mar', conservative: 3600, balanced: 4500, aggressive: 5500 },
  { month: 'Apr', conservative: 3800, balanced: 4800, aggressive: 6000 },
  { month: 'May', conservative: 4000, balanced: 5000, aggressive: 6200 },
  { month: 'Jun', conservative: 4200, balanced: 5200, aggressive: 6500 },
];

const getCategoryIcon = (category: AIRecommendation['category']) => {
  const icons = {
    TIMING: Calendar,
    DISCOUNT: Percent,
    CHANNEL: BarChart3,
    PRODUCT: Package,
    CUSTOMER: Users,
  };
  return icons[category];
};

const getPriorityBadge = (priority: AIRecommendation['priority']) => {
  const config = {
    HIGH: { variant: 'destructive' as const, label: 'High Priority' },
    MEDIUM: { variant: 'warning' as const, label: 'Medium' },
    LOW: { variant: 'outline' as const, label: 'Low' },
  };
  return <Badge variant={config[priority].variant}>{config[priority].label}</Badge>;
};

const getStatusBadge = (status: AIRecommendation['status']) => {
  const config = {
    NEW: { variant: 'default' as const, label: 'New', icon: Sparkles },
    ACCEPTED: { variant: 'success' as const, label: 'Accepted', icon: CheckCircle },
    REJECTED: { variant: 'secondary' as const, label: 'Rejected', icon: ThumbsDown },
    IMPLEMENTED: { variant: 'outline' as const, label: 'Implemented', icon: Award },
  };
  const { variant, label, icon: Icon } = config[status];
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
};

export default function TPOPage() {
  const { t } = useTranslation();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState('balanced');
  const [budgetConstraint, setBudgetConstraint] = useState([70]);
  const [includeCannibalisation, setIncludeCannibalisation] = useState(true);
  const [recommendations, setRecommendations] = useState(mockRecommendations);

  // TPO AI Integration
  const { isConnected, isLoading: tpoLoading, mechanics, channels } = useTPO();
  const { getSuggestions, suggestions, isLoading: suggestionsLoading, reset: _resetSuggestions } = usePromotionSuggestions();
  const { predict, result: roiResult, isLoading: roiLoading, reset: _resetROI } = useROIPrediction();

  // TPO AI Form State
  const [tpoForm, setTpoForm] = useState({
    channel: 'MT' as ChannelType,
    productCategory: 'Beverages',
    budgetMin: 20000000,
    budgetMax: 100000000,
    targetROI: 80,
    maxSuggestions: 5,
  });

  const [roiForm, setRoiForm] = useState({
    mechanicType: 'DISCOUNT' as MechanicType,
    discountPercent: 15,
    channel: 'MT' as ChannelType,
    productCategory: 'Beverages',
    budgetAmount: 50000000,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const handleGetSuggestions = () => {
    getSuggestions({
      channel: tpoForm.channel,
      product_category: tpoForm.productCategory,
      budget_range_min: tpoForm.budgetMin,
      budget_range_max: tpoForm.budgetMax,
      target_roi: tpoForm.targetROI,
      max_suggestions: tpoForm.maxSuggestions,
    });
  };

  const handlePredictROI = () => {
    predict({
      mechanic_type: roiForm.mechanicType,
      discount_percent: roiForm.discountPercent,
      channel: roiForm.channel,
      product_category: roiForm.productCategory,
      budget_amount: roiForm.budgetAmount,
      start_date: roiForm.startDate,
      end_date: roiForm.endDate,
    });
  };

  const handleAccept = (id: string) => {
    setRecommendations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'ACCEPTED' as const } : r))
    );
  };

  const handleReject = (id: string) => {
    setRecommendations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'REJECTED' as const } : r))
    );
  };

  const runOptimization = () => {
    setIsOptimizing(true);
    setTimeout(() => setIsOptimizing(false), 3000);
  };

  // Calculate summary stats
  const newRecommendations = recommendations.filter((r) => r.status === 'NEW');
  const acceptedRecommendations = recommendations.filter((r) => r.status === 'ACCEPTED');
  const totalPotentialRevenue = recommendations
    .filter((r) => r.status === 'NEW' || r.status === 'ACCEPTED')
    .reduce((sum, r) => sum + r.impact.revenue, 0);
  const avgConfidence =
    recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 p-2">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t('tpo.title')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('tpo.subtitle')}
            </p>
          </div>
        </div>
        <Button
          onClick={runOptimization}
          disabled={isOptimizing}
          className="bg-gradient-to-r from-purple-500 to-indigo-600"
        >
          {isOptimizing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Optimizing...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Run Optimization
            </>
          )}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Insights</CardTitle>
            <Lightbulb className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newRecommendations.length}</div>
            <p className="text-xs text-muted-foreground">recommendations to review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold"><CurrencyDisplay amount={totalPotentialRevenue} size="lg" /></div>
            <p className="text-xs text-muted-foreground">from accepted insights</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgConfidence.toFixed(0)}%</div>
            <Progress value={avgConfidence} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{acceptedRecommendations.length}</div>
            <p className="text-xs text-muted-foreground">ready to implement</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="tpoai" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tpoai" className="gap-2">
            <Sparkles className="h-4 w-4" />
            TPO AI
            {isConnected && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
          </TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          <TabsTrigger value="optimization">Optimization Engine</TabsTrigger>
          <TabsTrigger value="scenarios">Scenario Planning</TabsTrigger>
        </TabsList>

        {/* TPO AI Tab - Real API Integration */}
        <TabsContent value="tpoai" className="space-y-6">
          {/* Connection Status */}
          {tpoLoading ? (
            <Card>
              <CardContent className="p-6 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>Connecting to TPO Engine...</span>
              </CardContent>
            </Card>
          ) : !isConnected ? (
            <Card className="border-yellow-500">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 text-yellow-600">
                  <WifiOff className="w-6 h-6" />
                  <div>
                    <p className="font-medium">{t('tpo.notConnected')}</p>
                    <p className="text-sm">Start TPO Engine: <code className="bg-muted px-1 rounded">uvicorn app.main:app --port 8001</code></p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Connection Badge */}
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <Wifi className="w-3 h-3 mr-1" />
                  {t('tpo.connected')}
                </Badge>
                <div className="text-sm text-muted-foreground">
                  {mechanics.length} {t('tpo.mechanicsAvailable')} | {channels.length} {t('tpo.channelsAvailable')}
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Promotion Suggestions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      {t('tpo.aiSuggestions')}
                    </CardTitle>
                    <CardDescription>{t('tpo.subtitle')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label className="text-xs">{t('tpo.channel')}</Label>
                        <Select
                          value={tpoForm.channel}
                          onValueChange={(v) => setTpoForm((p) => ({ ...p, channel: v as ChannelType }))}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {channels.map((ch) => (
                              <SelectItem key={ch.type} value={ch.type}>{ch.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">{t('tpo.category')}</Label>
                        <Input
                          value={tpoForm.productCategory}
                          onChange={(e) => setTpoForm((p) => ({ ...p, productCategory: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">{t('tpo.budgetMin')}</Label>
                        <Input
                          type="number"
                          value={tpoForm.budgetMin}
                          onChange={(e) => setTpoForm((p) => ({ ...p, budgetMin: Number(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">{t('tpo.budgetMax')}</Label>
                        <Input
                          type="number"
                          value={tpoForm.budgetMax}
                          onChange={(e) => setTpoForm((p) => ({ ...p, budgetMax: Number(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">{t('tpo.targetRoi')}</Label>
                        <Input
                          type="number"
                          value={tpoForm.targetROI}
                          onChange={(e) => setTpoForm((p) => ({ ...p, targetROI: Number(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">{t('tpo.numSuggestions')}</Label>
                        <Input
                          type="number"
                          value={tpoForm.maxSuggestions}
                          onChange={(e) => setTpoForm((p) => ({ ...p, maxSuggestions: Number(e.target.value) }))}
                        />
                      </div>
                    </div>
                    <Button onClick={handleGetSuggestions} disabled={suggestionsLoading} className="w-full">
                      {suggestionsLoading ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
                      ) : (
                        <><Sparkles className="w-4 h-4 mr-2" /> {t('tpo.getAiSuggestions')}</>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* ROI Prediction */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                      {t('tpo.roiPrediction')}
                    </CardTitle>
                    <CardDescription>{t('tpo.subtitle')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label className="text-xs">{t('tpo.mechanic')}</Label>
                        <Select
                          value={roiForm.mechanicType}
                          onValueChange={(v) => setRoiForm((p) => ({ ...p, mechanicType: v as MechanicType }))}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {mechanics.map((m) => (
                              <SelectItem key={m.type} value={m.type}>{m.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">{t('tpo.channel')}</Label>
                        <Select
                          value={roiForm.channel}
                          onValueChange={(v) => setRoiForm((p) => ({ ...p, channel: v as ChannelType }))}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {channels.map((ch) => (
                              <SelectItem key={ch.type} value={ch.type}>{ch.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">{t('tpo.discount')}</Label>
                        <Input
                          type="number"
                          value={roiForm.discountPercent}
                          onChange={(e) => setRoiForm((p) => ({ ...p, discountPercent: Number(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">{t('tpo.budget')}</Label>
                        <Input
                          type="number"
                          value={roiForm.budgetAmount}
                          onChange={(e) => setRoiForm((p) => ({ ...p, budgetAmount: Number(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">{t('tpo.startDate')}</Label>
                        <Input
                          type="date"
                          value={roiForm.startDate}
                          onChange={(e) => setRoiForm((p) => ({ ...p, startDate: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">{t('tpo.endDate')}</Label>
                        <Input
                          type="date"
                          value={roiForm.endDate}
                          onChange={(e) => setRoiForm((p) => ({ ...p, endDate: e.target.value }))}
                        />
                      </div>
                    </div>
                    <Button onClick={handlePredictROI} disabled={roiLoading} className="w-full">
                      {roiLoading ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Predicting...</>
                      ) : (
                        <><TrendingUp className="w-4 h-4 mr-2" /> {t('tpo.predictRoi')}</>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Results Section */}
              {(suggestions || roiResult) && (
                <div className="space-y-6">
                  {/* Suggestions Results */}
                  {suggestions && (
                    <Card>
                      <CardHeader>
                        <CardTitle>AI Suggestions ({suggestions.suggestions.length})</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {suggestions.suggestions.map((s, i) => (
                          <div
                            key={i}
                            className={`p-4 rounded-lg border ${i === 0 ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20' : ''}`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <Badge variant={i === 0 ? 'default' : 'secondary'}>#{s.rank}</Badge>
                                  <span className="font-semibold">{s.mechanic_type}</span>
                                  <Badge variant="outline">{s.suggested_duration_days} days</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{s.rationale}</p>
                                <div className="flex gap-4 mt-2 text-sm">
                                  <span>Discount: <strong>{s.discount_percent}%</strong></span>
                                  <span>Cost: <CurrencyDisplay amount={s.predicted_cost} size="sm" /></span>
                                  <span>Start: <strong>{s.best_start_day}</strong></span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-green-600">{s.predicted_roi}%</div>
                                <div className="text-xs text-muted-foreground">Expected ROI</div>
                                <div className="text-sm mt-1">Confidence: {(s.confidence * 100).toFixed(0)}%</div>
                              </div>
                            </div>
                          </div>
                        ))}

                        {suggestions.market_insights.length > 0 && (
                          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <Target className="h-4 w-4 text-blue-500" />
                              Market Insights
                            </h4>
                            <ul className="space-y-1">
                              {suggestions.market_insights.map((insight, i) => (
                                <li key={i} className="text-sm text-muted-foreground">• {insight}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* ROI Prediction Results */}
                  {roiResult && (
                    <Card>
                      <CardHeader>
                        <CardTitle>ROI Prediction Results</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                          <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg text-center">
                            <div className="text-3xl font-bold text-green-600">{roiResult.predicted_roi}%</div>
                            <div className="text-sm text-muted-foreground">Predicted ROI</div>
                          </div>
                          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              <CurrencyDisplay amount={roiResult.predicted_incremental_sales} size="lg" />
                            </div>
                            <div className="text-sm text-muted-foreground">Incremental Sales</div>
                          </div>
                          <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              <CurrencyDisplay amount={roiResult.predicted_incremental_profit} size="lg" />
                            </div>
                            <div className="text-sm text-muted-foreground">Incremental Profit</div>
                          </div>
                          <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg text-center">
                            <div className="text-3xl font-bold text-orange-600">{(roiResult.confidence_score * 100).toFixed(0)}%</div>
                            <div className="text-sm text-muted-foreground">Confidence</div>
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 mt-4">
                          {roiResult.key_drivers.length > 0 && (
                            <div className="p-4 bg-muted rounded-lg">
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                Key Drivers
                              </h4>
                              <ul className="space-y-1">
                                {roiResult.key_drivers.map((d, i) => (
                                  <li key={i} className="text-sm">• {d}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {roiResult.optimization_suggestions.length > 0 && (
                            <div className="p-4 bg-muted rounded-lg">
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                <Lightbulb className="h-4 w-4 text-yellow-500" />
                                Optimization Tips
                              </h4>
                              <ul className="space-y-1">
                                {roiResult.optimization_suggestions.map((s, i) => (
                                  <li key={i} className="text-sm">• {s}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid gap-4">
            {recommendations.map((rec) => {
              const CategoryIcon = getCategoryIcon(rec.category);
              return (
                <Card key={rec.id} className="overflow-hidden">
                  <div className="flex">
                    {/* Left accent bar */}
                    <div
                      className={`w-1 ${
                        rec.priority === 'HIGH'
                          ? 'bg-red-500'
                          : rec.priority === 'MEDIUM'
                          ? 'bg-yellow-500'
                          : 'bg-blue-500'
                      }`}
                    />
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="rounded-lg bg-muted p-2">
                            <CategoryIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold">{rec.title}</h3>
                              {getPriorityBadge(rec.priority)}
                              {getStatusBadge(rec.status)}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {rec.description}
                            </p>

                            {/* Impact metrics */}
                            <div className="flex items-center gap-6 mt-3">
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-sm font-medium">
                                  +<CurrencyDisplay amount={rec.impact.revenue} size="sm" />
                                </span>
                                <span className="text-xs text-muted-foreground">revenue</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Percent className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium">{rec.impact.roi}%</span>
                                <span className="text-xs text-muted-foreground">ROI</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4 text-orange-500" />
                                <span className="text-sm font-medium">
                                  {rec.impact.cost >= 0 ? '+' : ''}<CurrencyDisplay amount={rec.impact.cost} size="sm" />
                                </span>
                                <span className="text-xs text-muted-foreground">cost</span>
                              </div>
                            </div>

                            {/* Confidence bar */}
                            <div className="flex items-center gap-2 mt-3">
                              <span className="text-xs text-muted-foreground">
                                AI Confidence:
                              </span>
                              <Progress value={rec.confidence} className="h-2 w-24" />
                              <span className="text-xs font-medium">{rec.confidence}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        {rec.status === 'NEW' && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReject(rec.id)}
                            >
                              <ThumbsDown className="h-4 w-4" />
                            </Button>
                            <Button size="sm" onClick={() => handleAccept(rec.id)}>
                              <ThumbsUp className="mr-2 h-4 w-4" />
                              Accept
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Optimization Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Optimization Parameters</CardTitle>
                <CardDescription>Configure AI optimization constraints</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Budget Utilization Target (%)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={budgetConstraint[0]}
                      onChange={(e) => setBudgetConstraint([parseInt(e.target.value) || 0])}
                      className="w-24"
                    />
                    <Progress value={budgetConstraint[0]} className="flex-1" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Primary Objective</Label>
                  <Select defaultValue="roi">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="roi">Maximize ROI</SelectItem>
                      <SelectItem value="revenue">Maximize Revenue</SelectItem>
                      <SelectItem value="volume">Maximize Volume</SelectItem>
                      <SelectItem value="margin">Maximize Margin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="cannibalization">Include Cannibalization Effects</Label>
                  <Switch
                    id="cannibalization"
                    checked={includeCannibalisation}
                    onCheckedChange={setIncludeCannibalisation}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="competitive">Consider Competitive Activity</Label>
                  <Switch id="competitive" defaultChecked />
                </div>

                <Button className="w-full" onClick={runOptimization} disabled={isOptimizing}>
                  {isOptimizing ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Run Optimization
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Optimization Results Radar */}
            <Card>
              <CardHeader>
                <CardTitle>Optimization Impact</CardTitle>
                <CardDescription>Current vs Optimized performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={optimizationData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="Current"
                      dataKey="current"
                      stroke="#94a3b8"
                      fill="#94a3b8"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name="Optimized"
                      dataKey="optimized"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.3}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Scenario Comparison</CardTitle>
                  <CardDescription>
                    Compare different budget allocation strategies
                  </CardDescription>
                </div>
                <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conservative">Conservative</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="aggressive">Aggressive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={scenarioData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${value / 1000}B`} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="conservative"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    name="Conservative"
                  />
                  <Line
                    type="monotone"
                    dataKey="balanced"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Balanced"
                  />
                  <Line
                    type="monotone"
                    dataKey="aggressive"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    name="Aggressive"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Scenario Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                id: 'conservative',
                name: 'Conservative',
                budget: 20000000000,
                roi: 15,
                revenue: 23000000000,
                risk: 'LOW',
                color: 'bg-slate-500',
              },
              {
                id: 'balanced',
                name: 'Balanced',
                budget: 28000000000,
                roi: 18,
                revenue: 33000000000,
                risk: 'MEDIUM',
                color: 'bg-blue-500',
              },
              {
                id: 'aggressive',
                name: 'Aggressive',
                budget: 35000000000,
                roi: 22,
                revenue: 42000000000,
                risk: 'HIGH',
                color: 'bg-purple-500',
              },
            ].map((scenario) => (
              <Card
                key={scenario.id}
                className={`cursor-pointer transition-all ${
                  selectedScenario === scenario.id
                    ? 'ring-2 ring-primary'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setSelectedScenario(scenario.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${scenario.color}`} />
                      <CardTitle className="text-base">{scenario.name}</CardTitle>
                    </div>
                    <Badge
                      variant={
                        scenario.risk === 'LOW'
                          ? 'outline'
                          : scenario.risk === 'MEDIUM'
                          ? 'warning'
                          : 'destructive'
                      }
                    >
                      {scenario.risk} Risk
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Budget</span>
                    <span className="font-mono"><CurrencyDisplay amount={scenario.budget} size="sm" /></span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expected ROI</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">{scenario.roi}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Projected Revenue</span>
                    <span className="font-mono"><CurrencyDisplay amount={scenario.revenue} size="sm" /></span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
