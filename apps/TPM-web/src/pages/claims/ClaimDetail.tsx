/**
 * Claim Detail Page - Phase 6 Enhanced with workflow, AI matches, audit log
 */

import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit, Trash2, Send, CheckCircle, XCircle,
  FileText, Receipt, Zap,
  History, Target, CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ClaimStatusBadge } from '@/components/claims/ClaimStatusBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import {
  useClaim, useDeleteClaim, useSubmitClaim, useApproveClaim,
  useRejectClaim, useRunAIMatching, useClaimAuditLog,
} from '@/hooks/useClaims';
import { formatDate } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import type { ClaimPromotionMatch, ClaimAuditLog, ClaimApproval } from '@/types';

export default function ClaimDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rejectReason, setRejectReason] = useState('');
  const [approveAmount, setApproveAmount] = useState<number | null>(null);
  const [approveComment, setApproveComment] = useState('');

  const { data: claim, isLoading } = useClaim(id || '');
  const { data: auditLogs } = useClaimAuditLog(id || '');
  const deleteClaim = useDeleteClaim();
  const submitClaim = useSubmitClaim();
  const approveClaim = useApproveClaim();
  const rejectClaim = useRejectClaim();
  const runMatching = useRunAIMatching();

  if (isLoading) return <LoadingSpinner fullScreen text="Đang tải claim..." />;
  if (!claim) return <div className="p-8 text-center text-muted-foreground">Không tìm thấy claim</div>;

  const claimAmount = claim.claimAmount || Number(claim.claimedAmount || claim.amount || 0);

  const handleDelete = async () => { await deleteClaim.mutateAsync(id!); navigate('/claims'); };
  const handleSubmit = async () => { await submitClaim.mutateAsync(id!); };
  const handleApprove = async () => {
    const amt = approveAmount ?? claimAmount;
    await approveClaim.mutateAsync({ id: id!, approvedAmount: amt, comments: approveComment || undefined });
  };
  const handleReject = async () => {
    await rejectClaim.mutateAsync({ id: id!, reason: rejectReason || 'Từ chối' });
  };
  const handleRunMatching = async () => { await runMatching.mutateAsync(id!); };

  const canSubmit = claim.status === 'DRAFT';
  const canMatch = ['SUBMITTED', 'PENDING_MATCH'].includes(claim.status);
  const canApprove = ['MATCHED', 'UNDER_REVIEW', 'PARTIALLY_APPROVED'].includes(claim.status);
  const canReject = ['MATCHED', 'UNDER_REVIEW', 'PARTIALLY_APPROVED'].includes(claim.status);
  const canEdit = ['DRAFT', 'REJECTED', 'VALIDATION_FAILED'].includes(claim.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/claims"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{claim.code}</h1>
              <ClaimStatusBadge status={claim.status} />
            </div>
            <p className="text-muted-foreground">
              {claim.customer?.name} {claim.promotion ? `• ${claim.promotion.name}` : ''}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canSubmit && (
            <Button onClick={handleSubmit} disabled={submitClaim.isPending}>
              <Send className="mr-2 h-4 w-4" />Gửi Claim
            </Button>
          )}
          {canMatch && (
            <Button variant="outline" onClick={handleRunMatching} disabled={runMatching.isPending}>
              <Zap className="mr-2 h-4 w-4" />Đối soát AI
            </Button>
          )}
          {canReject && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-red-600">
                  <XCircle className="mr-2 h-4 w-4" />Từ chối
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Từ chối Claim</AlertDialogTitle>
                  <AlertDialogDescription>Nhập lý do từ chối claim này.</AlertDialogDescription>
                </AlertDialogHeader>
                <textarea
                  className="w-full p-3 border rounded-md text-sm"
                  rows={3}
                  placeholder="Lý do từ chối..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReject} disabled={rejectClaim.isPending}>
                    Từ chối
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {canApprove && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button><CheckCircle className="mr-2 h-4 w-4" />Duyệt</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Duyệt Claim</AlertDialogTitle>
                  <AlertDialogDescription>
                    Nhập số tiền duyệt. Mặc định: {claimAmount.toLocaleString()}₫
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-3">
                  <input
                    type="number"
                    className="w-full p-3 border rounded-md text-sm"
                    placeholder={claimAmount.toString()}
                    value={approveAmount ?? ''}
                    onChange={(e) => setApproveAmount(e.target.value ? Number(e.target.value) : null)}
                  />
                  <textarea
                    className="w-full p-3 border rounded-md text-sm"
                    rows={2}
                    placeholder="Ghi chú (tùy chọn)..."
                    value={approveComment}
                    onChange={(e) => setApproveComment(e.target.value)}
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction onClick={handleApprove} disabled={approveClaim.isPending}>
                    Duyệt
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {canEdit && (
            <>
              <Button variant="outline" asChild>
                <Link to={`/claims/${id}/edit`}><Edit className="mr-2 h-4 w-4" />Sửa</Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" />Xóa</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Xóa Claim</AlertDialogTitle>
                    <AlertDialogDescription>Bạn có chắc chắn muốn xóa claim này? Hành động này không thể hoàn tác.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Xóa</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

      {/* Validation warnings */}
      {claim.validationErrors && Array.isArray(claim.validationErrors) && claim.validationErrors.length > 0 && (
        <Card className="border-orange-300 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="p-4">
            <p className="font-medium text-orange-700 dark:text-orange-400 mb-2">Lỗi xác thực:</p>
            <ul className="list-disc list-inside text-sm text-orange-600 dark:text-orange-300">
              {claim.validationErrors.map((err: string, i: number) => <li key={i}>{err}</li>)}
            </ul>
          </CardContent>
        </Card>
      )}

      {claim.rejectionReason && (
        <Card className="border-red-300 bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-4">
            <p className="font-medium text-red-700 dark:text-red-400">Lý do từ chối:</p>
            <p className="text-sm text-red-600 dark:text-red-300 mt-1">{claim.rejectionReason}</p>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Số tiền claim</CardTitle>
          </CardHeader>
          <CardContent><CurrencyDisplay amount={claimAmount} size="lg" /></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Đã duyệt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-emerald-600 dark:text-emerald-400">
              {claim.approvedAmount ? <CurrencyDisplay amount={Number(claim.approvedAmount)} size="lg" /> : '-'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Đã thanh toán</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-violet-600 dark:text-violet-400">
              {claim.settledAmount ? <CurrencyDisplay amount={Number(claim.settledAmount)} size="lg" /> : '-'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {claim.validationScore !== undefined && claim.validationScore !== null ? 'Điểm xác thực' : 'Ngày claim'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {claim.validationScore !== undefined && claim.validationScore !== null ? (
              <div className={`text-2xl font-bold ${claim.validationScore >= 70 ? 'text-emerald-600' : claim.validationScore >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                {claim.validationScore}/100
              </div>
            ) : (
              <div className="text-2xl font-bold">{formatDate(claim.claimDate)}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Details Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Claim Info */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Receipt className="h-5 w-5" />Thông tin Claim</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Mã Claim</p>
                <p className="font-medium">{claim.code}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ngày claim</p>
                <p className="font-medium">{formatDate(claim.claimDate)}</p>
              </div>
              {claim.type && (
                <div>
                  <p className="text-sm text-muted-foreground">Loại</p>
                  <p className="font-medium">{claim.type}</p>
                </div>
              )}
              {claim.source && (
                <div>
                  <p className="text-sm text-muted-foreground">Nguồn</p>
                  <p className="font-medium">{claim.source}</p>
                </div>
              )}
              {claim.invoiceNumber && (
                <div>
                  <p className="text-sm text-muted-foreground">Số hóa đơn</p>
                  <p className="font-medium">{claim.invoiceNumber}</p>
                </div>
              )}
              {claim.dueDate && (
                <div>
                  <p className="text-sm text-muted-foreground">Hạn thanh toán</p>
                  <p className="font-medium">{formatDate(claim.dueDate)}</p>
                </div>
              )}
            </div>
            {claim.description && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Mô tả</p>
                  <p className="text-sm">{claim.description}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Promotion & Customer */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" />Promotion & Khách hàng</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {claim.customer && (
              <div className="p-3 rounded-lg border">
                <p className="text-sm text-muted-foreground">Khách hàng</p>
                <p className="font-medium">{claim.customer.name}</p>
                {claim.customer.channel && <p className="text-xs text-muted-foreground">{claim.customer.channel}</p>}
              </div>
            )}
            {claim.promotion && (
              <Link
                to={`/promotions/${claim.promotion.id}`}
                className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <p className="text-sm text-muted-foreground">Promotion</p>
                <p className="font-medium">{claim.promotion.code} - {claim.promotion.name}</p>
                {claim.promotion.budget && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Budget: {Number(claim.promotion.budget).toLocaleString()}₫
                  </p>
                )}
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Line Items */}
      {claim.lineItems && claim.lineItems.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Chi tiết sản phẩm ({claim.lineItems.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium text-muted-foreground">Sản phẩm</th>
                    <th className="text-right p-2 font-medium text-muted-foreground">SL</th>
                    <th className="text-right p-2 font-medium text-muted-foreground">Đơn giá</th>
                    <th className="text-right p-2 font-medium text-muted-foreground">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {claim.lineItems.map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="p-2">
                        <p className="font-medium">{item.productName || item.productSku || 'N/A'}</p>
                        {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                      </td>
                      <td className="text-right p-2">{item.quantity ?? '-'}</td>
                      <td className="text-right p-2">{item.unitPrice ? Number(item.unitPrice).toLocaleString() : '-'}</td>
                      <td className="text-right p-2 font-medium">{Number(item.amount).toLocaleString()}₫</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Matches */}
      {claim.promotionMatches && claim.promotionMatches.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5" />Đối soát AI ({claim.promotionMatches.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {claim.promotionMatches.map((match: ClaimPromotionMatch) => (
                <div key={match.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{match.promotion?.code} - {match.promotion?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Variance: {Number(match.variance).toLocaleString()}₫ ({match.variancePercent.toFixed(1)}%)
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${match.confidenceScore >= 0.7 ? 'text-emerald-600' : match.confidenceScore >= 0.4 ? 'text-amber-600' : 'text-red-600'}`}>
                      {(match.confidenceScore * 100).toFixed(0)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Confidence</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settlements */}
      {claim.settlements && claim.settlements.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" />Thanh toán ({claim.settlements.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {claim.settlements.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{s.code || s.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">
                      {s.paymentMethod || 'BANK_TRANSFER'} • {formatDate(s.settledAt || s.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <CurrencyDisplay amount={Number(s.settledAmount || s.amount)} size="sm" />
                    <p className={`text-xs ${s.status === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>{s.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approvals */}
      {claim.approvals && claim.approvals.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle className="h-5 w-5" />Lịch sử phê duyệt</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {claim.approvals.map((a: ClaimApproval) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">Level {a.level} - {a.status}</p>
                    {a.comments && <p className="text-sm text-muted-foreground">{a.comments}</p>}
                    <p className="text-xs text-muted-foreground">{formatDate(a.decidedAt || a.createdAt)}</p>
                  </div>
                  {a.approvedAmount && (
                    <CurrencyDisplay amount={Number(a.approvedAmount)} size="sm" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Log */}
      {(auditLogs || claim.auditLogs) && (auditLogs || claim.auditLogs).length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><History className="h-5 w-5" />Lịch sử hoạt động</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(auditLogs || claim.auditLogs || []).slice(0, 20).map((log: ClaimAuditLog) => (
                <div key={log.id} className="flex items-start gap-3 py-2 border-b last:border-0">
                  <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{log.action}</span>
                      {log.fromStatus && log.toStatus && (
                        <span className="text-xs text-muted-foreground">
                          {log.fromStatus} → {log.toStatus}
                        </span>
                      )}
                    </div>
                    {log.notes && <p className="text-xs text-muted-foreground mt-0.5">{log.notes}</p>}
                    <p className="text-xs text-muted-foreground">{formatDate(log.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
