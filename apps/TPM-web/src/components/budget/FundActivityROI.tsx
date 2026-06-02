/**
 * Fund Activity ROI Dashboard Component
 * Phase 5: Aforza-style ROI tracking for budget activities
 */

import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Target,
  BarChart3,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import {
  useFundActivitySummary,
  useFundActivities,
  getActivityTypeLabel,
  getActivityTypeColor,
  getStatusLabel,
  getStatusColor,
  formatCurrency,
  formatRoi,
  getRoiStatus,
  type FundActivityType,
} from '@/hooks/useFundActivities';

interface FundActivityROIProps {
  budgetId?: string;
  showActivities?: boolean;
}

export function FundActivityROI({ budgetId, showActivities = true }: FundActivityROIProps) {
  const [selectedType, setSelectedType] = useState<FundActivityType | 'all'>('all');

  const { data: summary, isLoading: summaryLoading, error: summaryError } = useFundActivitySummary(budgetId);
  const { data: activitiesData, isLoading: activitiesLoading } = useFundActivities({
    budgetId,
    activityType: selectedType !== 'all' ? selectedType : undefined,
    pageSize: 10,
  });

  const activities = activitiesData?.activities || [];

  if (summaryLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 text-center">
        <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Đang tải dữ liệu ROI...</p>
      </div>
    );
  }

  if (summaryError) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <h3 className="font-medium text-foreground mb-2">Lỗi tải dữ liệu</h3>
        <p className="text-sm text-muted-foreground">Không thể tải dữ liệu ROI. Vui lòng thử lại.</p>
      </div>
    );
  }

  if (!summary || summary.overview.totalActivities === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 text-center">
        <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="font-medium text-foreground mb-2">Chưa có hoạt động</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Chưa có hoạt động nào được liên kết với ngân sách này
        </p>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90">
          <Plus className="w-4 h-4" />
          Thêm hoạt động
        </button>
      </div>
    );
  }

  const roiStatus = getRoiStatus(summary.overview.overallRoi);
  const roiStatusConfig = {
    excellent: { color: 'text-green-600', bg: 'bg-green-100', icon: TrendingUp, label: 'Xuất sắc' },
    good: { color: 'text-blue-600', bg: 'bg-blue-100', icon: TrendingUp, label: 'Tốt' },
    warning: { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: AlertCircle, label: 'Trung bình' },
    critical: { color: 'text-red-600', bg: 'bg-red-100', icon: TrendingDown, label: 'Thấp' },
  };
  const RoiIcon = roiStatusConfig[roiStatus].icon;

  return (
    <div className="space-y-4">
      {/* Overview Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-foreground">
                {summary.overview.totalActivities}
              </div>
              <div className="text-xs text-muted-foreground">Hoạt động</div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-xl font-semibold text-foreground">
                {formatCurrency(summary.overview.totalSpent)}
              </div>
              <div className="text-xs text-muted-foreground">
                Đã chi ({summary.overview.utilizationRate.toFixed(1)}%)
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-xl font-semibold text-foreground">
                {formatCurrency(summary.overview.totalRevenue)}
              </div>
              <div className="text-xs text-muted-foreground">Doanh thu</div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${roiStatusConfig[roiStatus].bg} flex items-center justify-center`}>
              <RoiIcon className={`w-5 h-5 ${roiStatusConfig[roiStatus].color}`} />
            </div>
            <div>
              <div className={`text-2xl font-semibold ${roiStatusConfig[roiStatus].color}`}>
                {formatRoi(summary.overview.overallRoi)}
              </div>
              <div className="text-xs text-muted-foreground">
                ROI tổng ({roiStatusConfig[roiStatus].label})
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ROI by Type */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          ROI theo loại hoạt động
        </h3>
        <div className="space-y-3">
          {summary.byType.map((item) => {
            const roi = item.totalSpent > 0 ? item.totalRevenue / item.totalSpent : 0;
            const roiPct = Math.min(100, roi * 33.33); // Scale for visual (3x = 100%)
            const typeRoiStatus = getRoiStatus(roi);

            return (
              <div key={item.type} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getActivityTypeColor(item.type as FundActivityType)}`}>
                      {item.label}
                    </span>
                    <span className="text-muted-foreground">
                      {item.count} hoạt động
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-foreground-subtle text-xs">
                      {formatCurrency(item.totalSpent)} → {formatCurrency(item.totalRevenue)}
                    </span>
                    <span className={`font-medium ${roiStatusConfig[typeRoiStatus].color}`}>
                      {formatRoi(roi)}
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${roiStatusConfig[typeRoiStatus].bg.replace('bg-', 'bg-').replace('-100', '-500')}`}
                    style={{ width: `${roiPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <Clock className="w-5 h-5 mx-auto mb-1 text-gray-500" />
          <div className="text-lg font-semibold text-foreground">{summary.byStatus.PLANNED}</div>
          <div className="text-xs text-muted-foreground">Kế hoạch</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
          <Activity className="w-5 h-5 mx-auto mb-1 text-blue-500" />
          <div className="text-lg font-semibold text-blue-600">{summary.byStatus.ACTIVE}</div>
          <div className="text-xs text-blue-600/80">Đang chạy</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
          <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-green-500" />
          <div className="text-lg font-semibold text-green-600">{summary.byStatus.COMPLETED}</div>
          <div className="text-xs text-green-600/80">Hoàn thành</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
          <XCircle className="w-5 h-5 mx-auto mb-1 text-red-500" />
          <div className="text-lg font-semibold text-red-600">{summary.byStatus.CANCELLED}</div>
          <div className="text-xs text-red-600/80">Đã hủy</div>
        </div>
      </div>

      {/* Top/Bottom Performers */}
      <div className="grid grid-cols-2 gap-4">
        {/* Top Performers */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            Top ROI
          </h3>
          <div className="space-y-2">
            {summary.topPerformers.length > 0 ? (
              summary.topPerformers.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm py-1"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 text-xs font-medium flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-foreground truncate max-w-[150px]">
                      {item.activityName}
                    </span>
                  </div>
                  <span className="font-medium text-green-600">{formatRoi(item.roi)}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-2">
                Chưa có dữ liệu ROI
              </p>
            )}
          </div>
        </div>

        {/* Underperformers */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-500" />
            Cần cải thiện
          </h3>
          <div className="space-y-2">
            {summary.underperformers.length > 0 ? (
              summary.underperformers.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm py-1"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 text-xs font-medium flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-foreground truncate max-w-[150px]">
                      {item.activityName}
                    </span>
                  </div>
                  <span className="font-medium text-red-600">{formatRoi(item.roi)}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-2">
                Chưa có dữ liệu
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Activity List */}
      {showActivities && (
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-foreground">Danh sách hoạt động</h3>
            <div className="flex items-center gap-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as FundActivityType | 'all')}
                className="h-8 px-2 text-sm bg-muted border border-border rounded-lg text-foreground"
              >
                <option value="all">Tất cả loại</option>
                <option value="promotion">Khuyến mãi</option>
                <option value="display">Trưng bày</option>
                <option value="sampling">Dùng thử</option>
                <option value="event">Sự kiện</option>
                <option value="listing_fee">Phí listing</option>
              </select>
              <button className="h-8 px-3 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-1">
                <Plus className="w-3 h-3" />
                Thêm
              </button>
            </div>
          </div>

          {activitiesLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 mx-auto animate-spin text-muted-foreground" />
            </div>
          ) : activities.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 font-medium text-muted-foreground">Hoạt động</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">Loại</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Phân bổ</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Đã chi</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Doanh thu</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">ROI</th>
                    <th className="text-center py-2 font-medium text-muted-foreground">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((activity) => {
                    const actRoi = activity.spentAmount > 0 && activity.revenueGenerated
                      ? activity.revenueGenerated / activity.spentAmount
                      : 0;
                    const actRoiStatus = getRoiStatus(actRoi);

                    return (
                      <tr key={activity.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-2">
                          <div className="font-medium text-foreground">{activity.activityName}</div>
                          {activity.activityCode && (
                            <div className="text-xs text-muted-foreground">{activity.activityCode}</div>
                          )}
                        </td>
                        <td className="py-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getActivityTypeColor(activity.activityType)}`}>
                            {getActivityTypeLabel(activity.activityType)}
                          </span>
                        </td>
                        <td className="py-2 text-right text-foreground">
                          {formatCurrency(activity.allocatedAmount)}
                        </td>
                        <td className="py-2 text-right text-foreground">
                          {formatCurrency(activity.spentAmount)}
                        </td>
                        <td className="py-2 text-right text-foreground">
                          {activity.revenueGenerated
                            ? formatCurrency(activity.revenueGenerated)
                            : '-'}
                        </td>
                        <td className={`py-2 text-right font-medium ${roiStatusConfig[actRoiStatus].color}`}>
                          {actRoi > 0 ? formatRoi(actRoi) : '-'}
                        </td>
                        <td className="py-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(activity.status)}`}>
                            {getStatusLabel(activity.status)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Không có hoạt động nào
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FundActivityROI;
