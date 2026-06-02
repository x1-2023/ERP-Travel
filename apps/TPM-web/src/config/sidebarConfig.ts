import {
  LayoutDashboard,
  FileText,
  GitBranch,
  Activity,
  Wallet,
  TrendingUp,
  Target,
  Sparkles,
  Calendar,
  Tag,
  Settings,
  FileStack,
  Rocket,
  Link2,
  AlertTriangle,
  ShoppingCart,
  DollarSign,
  Truck,
  Package,
  ClipboardList,
  Receipt,
  CreditCard,
  BookOpen,
  BarChart3,
  Lightbulb,
  PieChart,
  Brain,
  MessageSquare,
  Webhook,
  Shield,
  Building2,
  Cog,
  Users,
  Handshake,
  Plus,
  Zap,
  Bell,
  Radio,
  type LucideIcon,
} from 'lucide-react';

// ============================================================================
// ENHANCED TYPE DEFINITIONS
// ============================================================================

export type BadgeType = 'count' | 'dot' | 'pulse' | 'text';
export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'premium';
export type VisualPriority = 'primary' | 'default' | 'muted';

export interface SmartBadge {
  type: BadgeType;
  value?: string | number;
  variant: BadgeVariant;
  animate?: boolean;
}

export interface TooltipFeature {
  text: string;
}

export interface EnhancedTooltip {
  title: string;
  description?: string;
  features?: TooltipFeature[];
}

export interface SidebarItem {
  id: string;
  title: string;
  titleVi?: string;
  href: string;
  icon: LucideIcon;
  // Legacy badge support
  badge?: string | number;
  badgeVariant?: 'default' | 'success' | 'warning' | 'danger';
  // Enhanced badge
  smartBadge?: SmartBadge;
  // User Story reference
  sublabel?: string;
  // Keyboard shortcut
  shortcut?: string;
  // Visual priority
  priority?: VisualPriority;
  isPrimary?: boolean;
  // Enhanced tooltip
  tooltip?: EnhancedTooltip;
  // Other
  children?: Omit<SidebarItem, 'children'>[];
  permissions?: string[];
  brdRef?: string;
  isNew?: boolean;
  isBeta?: boolean;
  description?: string;
}

export interface SidebarSection {
  id: string;
  title: string;
  titleEn?: string;
  items: SidebarItem[];
  defaultExpanded?: boolean;
  defaultCollapsed?: boolean;
  permissions?: string[];
  brdSection?: string;
  // Enhanced: section-level badge
  sectionBadge?: SmartBadge;
  // Visual variant
  variant?: 'primary' | 'default' | 'muted';
}

export interface SidebarConfig {
  brand: {
    name: string;
    subtitle: string;
    icon: LucideIcon;
  };
  sections: SidebarSection[];
  footer: {
    showStatus: boolean;
    statusItems?: Array<{
      label: string;
      status: 'online' | 'offline' | 'syncing';
      value?: string;
    }>;
  };
}

// ============================================================================
// SIDEBAR CONFIGURATION - ENHANCED VERSION
// 11 Sections | 45 Items | Smart Badges | Keyboard Shortcuts | Tooltips
// ============================================================================

export const sidebarConfig: SidebarConfig = {
  brand: {
    name: 'Promo Master',
    subtitle: 'Suntory PepsiCo',
    icon: Package,
  },
  sections: [
    // ============================================
    // 1. TỔNG QUAN - Entry Point
    // ============================================
    {
      id: 'overview',
      title: 'TỔNG QUAN',
      titleEn: 'OVERVIEW',
      defaultExpanded: true,
      variant: 'primary',
      items: [
        {
          id: 'dashboard',
          title: 'Dashboard',
          titleVi: 'Tổng quan',
          href: '/dashboard',
          icon: LayoutDashboard,
          shortcut: '⌘1',
          isPrimary: true,
          tooltip: {
            title: 'Dashboard',
            description: 'Tổng quan KPI và báo cáo real-time',
            features: [
              { text: 'KPI overview' },
              { text: 'Real-time metrics' },
              { text: 'Quick actions' },
            ],
          },
        },
      ],
    },

    // ============================================
    // 2. QUẢN LÝ NGÂN SÁCH (BRD 3.1) - Primary
    // ============================================
    {
      id: 'budget-management',
      title: 'QUẢN LÝ NGÂN SÁCH',
      titleEn: 'BUDGET MANAGEMENT',
      defaultExpanded: true,
      brdSection: '3.1',
      variant: 'primary',
      sectionBadge: { type: 'count', value: 2, variant: 'warning' },
      items: [
        {
          id: 'budget-definition',
          title: 'Budget Definition',
          titleVi: 'Định nghĩa & Kiểm soát',
          href: '/budget/definition',
          icon: FileText,
          brdRef: '3.1.1',
          isNew: true,
          shortcut: '⌘2',
          sublabel: 'US-01, US-02',
          smartBadge: { type: 'count', value: 2, variant: 'warning' },
          tooltip: {
            title: 'Budget Definition & Control',
            description: 'Định nghĩa ngân sách theo năm/quý/tháng',
            features: [
              { text: 'Create budget definitions' },
              { text: 'Set budget limits' },
              { text: 'Version control' },
            ],
          },
        },
        {
          id: 'budget-allocation',
          title: 'Budget Allocation',
          titleVi: 'Phân bổ Ngân sách',
          href: '/budget/allocation',
          icon: GitBranch,
          brdRef: '3.1.2',
          isNew: true,
          sublabel: 'US-03',
          tooltip: {
            title: 'Budget Allocation',
            description: 'Phân bổ ngân sách theo kênh/vùng/sản phẩm',
            features: [
              { text: 'Tree-view allocation' },
              { text: 'Drag & drop' },
              { text: 'Auto-calculate' },
            ],
          },
        },
        {
          id: 'budget-monitoring',
          title: 'Budget Monitoring',
          titleVi: 'Giám sát Ngân sách',
          href: '/budget/monitoring',
          icon: Activity,
          brdRef: '3.1.3',
          isNew: true,
          sublabel: 'US-04',
          smartBadge: { type: 'dot', variant: 'success', animate: true },
          tooltip: {
            title: 'Budget Monitoring',
            description: 'Dashboard theo dõi ngân sách real-time',
            features: [
              { text: 'Real-time dashboard' },
              { text: 'Channel analysis' },
              { text: 'Variance alerts' },
            ],
          },
        },
        {
          id: 'fund-management',
          title: 'Fund Management',
          titleVi: 'Quản lý Quỹ',
          href: '/funds',
          icon: Wallet,
          description: 'Quản lý các quỹ FIXED/VARIABLE',
          tooltip: {
            title: 'Fund Management',
            description: 'Quản lý các quỹ khuyến mãi',
            features: [
              { text: 'Fixed funds' },
              { text: 'Variable funds' },
              { text: 'Fund transfers' },
            ],
          },
        },
      ],
    },

    // ============================================
    // 3. LẬP KẾ HOẠCH KINH DOANH (BRD 3.2) - Primary
    // ============================================
    {
      id: 'business-planning',
      title: 'LẬP KẾ HOẠCH KINH DOANH',
      titleEn: 'BUSINESS PLANNING',
      defaultExpanded: true,
      brdSection: '3.2',
      variant: 'primary',
      items: [
        {
          id: 'baselines',
          title: 'Baseline Management',
          titleVi: 'Quản lý Baseline',
          href: '/baselines',
          icon: TrendingUp,
          brdRef: '3.2.1',
          sublabel: 'US-05',
          tooltip: {
            title: 'Baseline Management',
            description: 'Quản lý dữ liệu baseline cho dự báo',
          },
        },
        {
          id: 'targets',
          title: 'Target Management',
          titleVi: 'Quản lý Mục tiêu',
          href: '/targets',
          icon: Target,
          brdRef: '3.2.2',
          sublabel: 'US-06',
          tooltip: {
            title: 'Target Management',
            description: 'Thiết lập và theo dõi mục tiêu',
          },
        },
        {
          id: 'scenarios',
          title: 'Scenario Planning',
          titleVi: 'Lập kế hoạch Kịch bản',
          href: '/planning/scenarios',
          icon: GitBranch,
          brdRef: '3.2.3',
          sublabel: 'US-07',
          tooltip: {
            title: 'Scenario Planning',
            description: 'So sánh các kịch bản khuyến mãi',
          },
        },
        {
          id: 'tpo-suggestion',
          title: 'TPO - AI Suggestion',
          titleVi: 'Gợi ý Khuyến mãi (AI)',
          href: '/planning/tpo',
          icon: Sparkles,
          brdRef: '3.2.4',
          isNew: true,
          isBeta: true,
          shortcut: '⌘T',
          sublabel: 'US-08',
          smartBadge: { type: 'text', value: 'AI', variant: 'premium' },
          isPrimary: true,
          tooltip: {
            title: 'TPO - AI Suggestion',
            description: 'AI đề xuất promotion tối ưu',
            features: [
              { text: 'ML predictions' },
              { text: 'ROI optimization' },
              { text: 'Auto-recommendations' },
            ],
          },
        },
      ],
    },

    // ============================================
    // 4. LẬP KẾ HOẠCH KHUYẾN MÃI (BRD 3.3) - Primary
    // ============================================
    {
      id: 'promotion-planning',
      title: 'LẬP KẾ HOẠCH KHUYẾN MÃI',
      titleEn: 'PROMOTION PLANNING',
      defaultExpanded: true,
      brdSection: '3.3',
      variant: 'primary',
      sectionBadge: { type: 'count', value: 67, variant: 'primary' },
      items: [
        {
          id: 'promotion-calendar',
          title: 'Promotion Calendar',
          titleVi: 'Lịch Khuyến mãi',
          href: '/calendar',
          icon: Calendar,
          brdRef: '3.3.1',
          shortcut: '⌘3',
          sublabel: 'US-09',
          tooltip: {
            title: 'Promotion Calendar',
            description: 'Lịch khuyến mãi theo tuần/tháng/quý',
          },
        },
        {
          id: 'promotion-scheme',
          title: 'Promotion Scheme',
          titleVi: 'Chương trình Khuyến mãi',
          href: '/promotions',
          icon: Tag,
          brdRef: '3.3.2',
          sublabel: 'US-10, US-11',
          smartBadge: { type: 'count', value: 67, variant: 'primary' },
          isPrimary: true,
          tooltip: {
            title: 'Promotion Scheme',
            description: 'Quản lý các chương trình khuyến mãi',
            features: [
              { text: '67 active promotions' },
              { text: 'Multi-channel support' },
              { text: 'Approval workflow' },
            ],
          },
        },
        {
          id: 'mechanics-slab',
          title: 'Mechanics / Slab',
          titleVi: 'Cơ chế Khuyến mãi',
          href: '/promotions/mechanics',
          icon: Cog,
          brdRef: '3.3.3',
          sublabel: 'US-12',
          tooltip: {
            title: 'Mechanics / Slab',
            description: 'Cấu hình discount, rebate, free goods',
          },
        },
        {
          id: 'templates',
          title: 'Templates',
          titleVi: 'Mẫu Khuyến mãi',
          href: '/planning/templates',
          icon: FileStack,
          sublabel: 'US-13',
        },
        {
          id: 'projected-efficiency',
          title: 'Projected Efficiency',
          titleVi: 'Hiệu quả Dự kiến',
          href: '/promotions/efficiency',
          icon: BarChart3,
          brdRef: '3.3.4',
          isNew: true,
          sublabel: 'US-14',
          smartBadge: { type: 'text', value: 'NEW', variant: 'success' },
          tooltip: {
            title: 'Projected Efficiency',
            description: 'Tính toán hiệu quả dự kiến của promotion',
          },
        },
        {
          id: 'deployment-plan',
          title: 'Deployment Plan',
          titleVi: 'Kế hoạch Triển khai',
          href: '/promotions/deployment',
          icon: Rocket,
          brdRef: '3.3.5',
          isNew: true,
          sublabel: 'US-15',
          tooltip: {
            title: 'Deployment Plan',
            description: 'Checklist triển khai promotion',
          },
        },
        {
          id: 'dms-integration',
          title: 'DMS Integration',
          titleVi: 'Tích hợp DMS',
          href: '/integration/dms',
          icon: Link2,
          brdRef: '3.3.6',
          sublabel: 'US-16',
          smartBadge: { type: 'dot', variant: 'success' },
          tooltip: {
            title: 'DMS Integration',
            description: 'Export promotion sang DMS',
          },
        },
        {
          id: 'clash-detection',
          title: 'Clash Detection',
          titleVi: 'Phát hiện Xung đột',
          href: '/planning/clashes',
          icon: AlertTriangle,
          sublabel: 'US-17',
          smartBadge: { type: 'count', value: 3, variant: 'warning' },
          tooltip: {
            title: 'Clash Detection',
            description: 'Phát hiện và xử lý xung đột promotion',
          },
        },
      ],
    },

    // ============================================
    // 4B. HỢP ĐỒNG VOLUME (Pepsi V3) - Primary
    // ============================================
    {
      id: 'volume-contracts',
      title: 'HỢP ĐỒNG VOLUME',
      titleEn: 'VOLUME CONTRACTS',
      defaultExpanded: false,
      variant: 'primary',
      sectionBadge: { type: 'count', value: 5, variant: 'primary' },
      items: [
        {
          id: 'contract-list',
          title: 'Contract List',
          titleVi: 'Danh sách Hợp đồng',
          href: '/contracts',
          icon: Handshake,
          isNew: true,
          smartBadge: { type: 'count', value: 5, variant: 'primary' },
          tooltip: {
            title: 'Volume Contracts',
            description: 'Quản lý hợp đồng volume với key account',
            features: [
              { text: 'Contract tracking' },
              { text: 'Milestone management' },
              { text: 'Gap analysis' },
            ],
          },
        },
        {
          id: 'contract-create',
          title: 'New Contract',
          titleVi: 'Tạo Hợp đồng mới',
          href: '/contracts/create',
          icon: Plus,
        },
      ],
    },

    // ============================================
    // 5. THỰC THI & GIÁM SÁT (BRD 3.4.1-3.4.5) - Primary
    // ============================================
    {
      id: 'execution-monitoring',
      title: 'THỰC THI & GIÁM SÁT',
      titleEn: 'EXECUTION & MONITORING',
      defaultExpanded: false,
      brdSection: '3.4 (1-5)',
      variant: 'primary',
      items: [
        {
          id: 'psp-budget-monitoring',
          title: 'PSP Budget Monitoring',
          titleVi: 'Giám sát Ngân sách PSP',
          href: '/execution/psp-budget',
          icon: Activity,
          brdRef: '3.4.1',
          isNew: true,
          sublabel: 'US-18',
          smartBadge: { type: 'pulse', variant: 'success' },
          tooltip: {
            title: 'PSP Budget Monitoring',
            description: 'Real-time monitoring PSP budget',
          },
        },
        {
          id: 'sell-in-monitoring',
          title: 'Sell-in Monitoring',
          titleVi: 'Giám sát Sell-in',
          href: '/operations/sell-tracking/sell-in',
          icon: ShoppingCart,
          brdRef: '3.4.2',
          sublabel: 'US-19',
          smartBadge: { type: 'dot', variant: 'success', animate: true },
        },
        {
          id: 'sell-out-monitoring',
          title: 'Sell-out Monitoring',
          titleVi: 'Giám sát Sell-out',
          href: '/operations/sell-tracking/sell-out',
          icon: TrendingUp,
          brdRef: '3.4.3',
          sublabel: 'US-20',
          smartBadge: { type: 'dot', variant: 'success', animate: true },
        },
        {
          id: 'spending-monitoring',
          title: 'Spending Monitoring',
          titleVi: 'Giám sát Chi tiêu',
          href: '/execution/spending',
          icon: DollarSign,
          brdRef: '3.4.4',
          isNew: true,
          sublabel: 'US-21',
        },
        {
          id: 'delivery-tracking',
          title: 'Delivery Tracking',
          titleVi: 'Theo dõi Giao hàng',
          href: '/operations/delivery',
          icon: Truck,
          sublabel: 'US-22',
        },
        {
          id: 'inventory-tracking',
          title: 'Inventory Tracking',
          titleVi: 'Theo dõi Tồn kho',
          href: '/operations/inventory',
          icon: Package,
          sublabel: 'US-23',
        },
        {
          id: 'budget-reallocation',
          title: 'Budget Reallocation',
          titleVi: 'Điều chuyển Ngân sách',
          href: '/execution/reallocation',
          icon: GitBranch,
          brdRef: '3.4.5',
          isNew: true,
          sublabel: 'US-24',
        },
      ],
    },

    // ============================================
    // 6. YÊU CẦU & THANH TOÁN (BRD 3.4.6-3.4.8)
    // ============================================
    {
      id: 'claims-settlement',
      title: 'YÊU CẦU & THANH TOÁN',
      titleEn: 'CLAIMS & SETTLEMENT',
      defaultExpanded: false,
      brdSection: '3.4 (6-8)',
      variant: 'default',
      sectionBadge: { type: 'count', value: 12, variant: 'warning' },
      items: [
        {
          id: 'claims-reporting',
          title: 'Claims Reporting',
          titleVi: 'Báo cáo Claims',
          href: '/claims',
          icon: FileText,
          brdRef: '3.4.6',
          sublabel: 'US-25',
          smartBadge: { type: 'count', value: 12, variant: 'warning' },
        },
        {
          id: 'claims-processing',
          title: 'Claims Processing',
          titleVi: 'Xử lý Claims',
          href: '/claims/processing',
          icon: ClipboardList,
          sublabel: 'US-26',
        },
        {
          id: 'settlement',
          title: 'Settlement',
          titleVi: 'Thanh quyết toán',
          href: '/claims/settlement',
          icon: Receipt,
          brdRef: '3.4.7',
          isNew: true,
          sublabel: 'US-27',
        },
        {
          id: 'payment',
          title: 'Payment',
          titleVi: 'Thanh toán',
          href: '/claims/payment',
          icon: CreditCard,
          brdRef: '3.4.8',
          isNew: true,
          sublabel: 'US-28',
        },
      ],
    },

    // ============================================
    // 7. TÀI CHÍNH & KẾ TOÁN
    // ============================================
    {
      id: 'finance-accounting',
      title: 'TÀI CHÍNH & KẾ TOÁN',
      titleEn: 'FINANCE & ACCOUNTING',
      defaultExpanded: false,
      variant: 'default',
      items: [
        {
          id: 'accruals',
          title: 'Accruals',
          titleVi: 'Dồn tích Chi phí',
          href: '/finance/accruals',
          icon: BookOpen,
          sublabel: 'US-29',
        },
        {
          id: 'deductions',
          title: 'Deductions',
          titleVi: 'Khấu trừ',
          href: '/finance/deductions',
          icon: FileText,
          sublabel: 'US-30',
        },
        {
          id: 'gl-journals',
          title: 'GL Journals',
          titleVi: 'Sổ cái Tổng hợp',
          href: '/finance/journals',
          icon: BookOpen,
          sublabel: 'US-31',
        },
        {
          id: 'cheques',
          title: 'Cheques',
          titleVi: 'Séc Thanh toán',
          href: '/finance/cheques',
          icon: CreditCard,
          sublabel: 'US-32',
        },
      ],
    },

    // ============================================
    // 8. PHÂN TÍCH HIỆU QUẢ (BRD Section 2)
    // ============================================
    {
      id: 'performance-analysis',
      title: 'PHÂN TÍCH HIỆU QUẢ',
      titleEn: 'PERFORMANCE ANALYSIS',
      defaultExpanded: false,
      brdSection: 'Section 2',
      variant: 'default',
      items: [
        {
          id: 'roi-analysis',
          title: 'ROI Analysis',
          titleVi: 'Phân tích ROI',
          href: '/analysis/roi',
          icon: TrendingUp,
          isNew: true,
          sublabel: 'US-33',
          smartBadge: { type: 'text', value: 'NEW', variant: 'success' },
        },
        {
          id: 'efficiency-report',
          title: 'Efficiency Report',
          titleVi: 'Báo cáo Hiệu quả',
          href: '/analysis/efficiency',
          icon: BarChart3,
          isNew: true,
          sublabel: 'US-34',
        },
        {
          id: 'whatif-analysis',
          title: 'What-if Analysis',
          titleVi: 'Phân tích Giả định',
          href: '/analysis/what-if',
          icon: Lightbulb,
          isNew: true,
          sublabel: 'US-35',
        },
        {
          id: 'bi-dashboard',
          title: 'BI Dashboard',
          titleVi: 'Dashboard BI',
          href: '/bi',
          icon: PieChart,
          sublabel: 'US-36',
        },
      ],
    },

    // ============================================
    // 9. AI & PHÂN TÍCH - Muted
    // ============================================
    {
      id: 'ai-analytics',
      title: 'AI & PHÂN TÍCH',
      titleEn: 'AI & ANALYTICS',
      defaultExpanded: false,
      defaultCollapsed: true,
      variant: 'muted',
      items: [
        {
          id: 'ai-suggestions',
          title: 'AI Suggestions',
          titleVi: 'Gợi ý AI',
          href: '/ai/suggestions',
          icon: Sparkles,
          isNew: true,
          sublabel: 'Pepsi V3',
          smartBadge: { type: 'text', value: 'NEW', variant: 'success' },
          tooltip: {
            title: 'AI Promo Suggestions',
            description: 'AI gợi ý promotion tối ưu dựa trên data',
            features: [
              { text: 'Smart recommendations' },
              { text: 'ROI prediction' },
              { text: 'One-click apply' },
            ],
          },
        },
        {
          id: 'claims-ai',
          title: 'Claims AI',
          titleVi: 'Xử lý Claims AI',
          href: '/ai/claims-ai',
          icon: Zap,
          isNew: true,
          sublabel: 'Pepsi V3',
          smartBadge: { type: 'text', value: 'AI', variant: 'premium' },
          tooltip: {
            title: 'AI Claims Processing',
            description: 'Xử lý claims tự động bằng AI',
          },
        },
        {
          id: 'ai-insights',
          title: 'AI Insights',
          titleVi: 'Nhận diện AI',
          href: '/ai/insights',
          icon: Brain,
          isBeta: true,
          sublabel: 'US-37',
          smartBadge: { type: 'text', value: 'BETA', variant: 'warning' },
        },
        {
          id: 'ai-recommendations',
          title: 'AI Recommendations',
          titleVi: 'Đề xuất AI',
          href: '/ai/recommendations',
          icon: Sparkles,
          isBeta: true,
          sublabel: 'US-38',
        },
        {
          id: 'voice-commands',
          title: 'Voice Commands',
          titleVi: 'Lệnh Giọng nói',
          href: '/voice',
          icon: MessageSquare,
          isBeta: true,
          sublabel: 'US-39',
          smartBadge: { type: 'text', value: 'BETA', variant: 'warning' },
        },
      ],
    },

    // ============================================
    // 9B. GIÁM SÁT REALTIME (Pepsi V3) - Muted
    // ============================================
    {
      id: 'live-monitoring',
      title: 'GIÁM SÁT REALTIME',
      titleEn: 'LIVE MONITORING',
      defaultExpanded: false,
      defaultCollapsed: true,
      variant: 'muted',
      items: [
        {
          id: 'live-dashboard',
          title: 'Live Dashboard',
          titleVi: 'Dashboard Realtime',
          href: '/monitoring/live',
          icon: Radio,
          isNew: true,
          sublabel: 'Pepsi V3',
          smartBadge: { type: 'pulse', variant: 'success' },
          tooltip: {
            title: 'Live Monitoring Dashboard',
            description: 'Giám sát promotion và contract realtime',
          },
        },
        {
          id: 'alerts-management',
          title: 'Alerts',
          titleVi: 'Cảnh báo',
          href: '/monitoring/alerts',
          icon: Bell,
          isNew: true,
          sublabel: 'Pepsi V3',
          smartBadge: { type: 'count', value: 3, variant: 'warning' },
          tooltip: {
            title: 'Alert Management',
            description: 'Quản lý cảnh báo hệ thống',
          },
        },
      ],
    },

    // ============================================
    // 10. TÍCH HỢP HỆ THỐNG - Muted
    // ============================================
    {
      id: 'integration',
      title: 'TÍCH HỢP HỆ THỐNG',
      titleEn: 'SYSTEM INTEGRATION',
      defaultExpanded: false,
      defaultCollapsed: true,
      variant: 'muted',
      items: [
        {
          id: 'erp-integration',
          title: 'ERP Integration',
          titleVi: 'Tích hợp ERP',
          href: '/integration/erp',
          icon: Building2,
          sublabel: 'US-40',
          smartBadge: { type: 'dot', variant: 'success' },
        },
        {
          id: 'webhooks',
          title: 'Webhooks',
          titleVi: 'Webhooks',
          href: '/integration/webhooks',
          icon: Webhook,
          sublabel: 'US-41',
        },
        {
          id: 'security',
          title: 'Security',
          titleVi: 'Bảo mật',
          href: '/integration/security',
          icon: Shield,
          sublabel: 'US-42',
        },
      ],
    },

    // ============================================
    // 11. CÀI ĐẶT - Muted
    // ============================================
    {
      id: 'settings',
      title: 'CÀI ĐẶT',
      titleEn: 'SETTINGS',
      defaultExpanded: false,
      defaultCollapsed: true,
      variant: 'muted',
      items: [
        {
          id: 'customers',
          title: 'Customers',
          titleVi: 'Khách hàng',
          href: '/customers',
          icon: Users,
          sublabel: 'US-43',
        },
        {
          id: 'products',
          title: 'Products',
          titleVi: 'Sản phẩm',
          href: '/products',
          icon: Package,
          sublabel: 'US-44',
        },
        {
          id: 'system-config',
          title: 'System Config',
          titleVi: 'Cấu hình Hệ thống',
          href: '/settings',
          icon: Settings,
          permissions: ['ADMIN'],
          sublabel: 'US-45',
        },
      ],
    },
  ],
  footer: {
    showStatus: true,
    statusItems: [
      { label: 'API', status: 'online' },
      { label: 'Database', status: 'online' },
      { label: 'Sync', status: 'syncing', value: '2 phút trước' },
    ],
  },
};

// ============================================================================
// KEYBOARD SHORTCUTS MAP
// ============================================================================

export const keyboardShortcuts: Record<string, string> = {
  '⌘1': '/dashboard',
  '⌘2': '/budget/definition',
  '⌘3': '/calendar',
  '⌘T': '/planning/tpo',
  '⌘K': 'search', // Opens quick search
  '⌘B': 'toggle', // Toggles sidebar
};

// ============================================================================
// THEME COLORS
// ============================================================================

export interface SidebarColors {
  text: string;
  textMuted: string;
  textSubtle: string;
  textHover: string;
  border: string;
  borderAccent: string;
  bgHover: string;
  bgActive: string;
  bgSubtle: string;
  bgGradient: string;
  overlayGradient: string;
  statusOnline: string;
  statusOffline: string;
  statusSyncing: string;
}

export const getSidebarColors = (isDark: boolean): SidebarColors => {
  if (isDark) {
    // Dark theme: Navy blue sidebar with white text/icons
    return {
      text: '#FFFFFF',
      textMuted: 'rgba(255,255,255,0.85)',
      textSubtle: 'rgba(255,255,255,0.6)',
      textHover: '#FFFFFF',
      border: 'rgba(255,255,255,0.12)',
      borderAccent: 'rgba(255,255,255,0.25)',
      bgHover: 'rgba(255,255,255,0.1)',
      bgActive: 'rgba(255,255,255,0.18)',
      bgSubtle: 'rgba(255,255,255,0.12)',
      bgGradient: 'linear-gradient(90deg, rgba(255,255,255,0.08) 0%, transparent 100%)',
      overlayGradient: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 30%, rgba(0,0,0,0.25) 100%)',
      statusOnline: '#4ade80',
      statusOffline: '#f87171',
      statusSyncing: '#fbbf24',
    };
  }
  // Light theme: Dark green sidebar with white text
  return {
    text: '#FFFFFF',
    textMuted: 'rgba(255,255,255,0.85)',
    textSubtle: 'rgba(255,255,255,0.6)',
    textHover: '#FFFFFF',
    border: 'rgba(255,255,255,0.12)',
    borderAccent: 'rgba(255,255,255,0.25)',
    bgHover: 'rgba(255,255,255,0.1)',
    bgActive: 'rgba(255,255,255,0.18)',
    bgSubtle: 'rgba(255,255,255,0.12)',
    bgGradient: 'linear-gradient(90deg, rgba(255,255,255,0.08) 0%, transparent 100%)',
    overlayGradient: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, transparent 30%, rgba(0,0,0,0.2) 100%)',
    statusOnline: '#4ade80',
    statusOffline: '#f87171',
    statusSyncing: '#fbbf24',
  };
};

export const getSidebarBgColor = (isDark: boolean): string =>
  isDark ? '#0A2744' : '#1B5E20'; // Dark theme: navy blue, Light theme: dark green

// ============================================================================
// BADGE COLORS
// ============================================================================

export const getBadgeColors = (variant: BadgeVariant, isDark: boolean) => {
  if (isDark) {
    // Dark theme: Navy blue sidebar with white accents
    const colors = {
      default: {
        bg: 'rgba(255,255,255,0.2)',
        text: '#FFFFFF',
      },
      primary: {
        bg: 'rgba(96,165,250,0.35)',
        text: '#93c5fd',
      },
      success: {
        bg: 'rgba(74,222,128,0.35)',
        text: '#86efac',
      },
      warning: {
        bg: 'rgba(251,191,36,0.35)',
        text: '#fcd34d',
      },
      danger: {
        bg: 'rgba(248,113,113,0.35)',
        text: '#fca5a5',
      },
      info: {
        bg: 'rgba(103,232,249,0.35)',
        text: '#67e8f9',
      },
      premium: {
        bg: 'rgba(196,181,253,0.35)',
        text: '#c4b5fd',
      },
    };
    return colors[variant];
  }
  // Light theme: Dark green sidebar with white text
  const colors = {
    default: {
      bg: 'rgba(255,255,255,0.2)',
      text: '#FFFFFF',
    },
    primary: {
      bg: 'rgba(96,165,250,0.35)',
      text: '#93c5fd',
    },
    success: {
      bg: 'rgba(74,222,128,0.35)',
      text: '#86efac',
    },
    warning: {
      bg: 'rgba(251,191,36,0.35)',
      text: '#fcd34d',
    },
    danger: {
      bg: 'rgba(248,113,113,0.35)',
      text: '#fca5a5',
    },
    info: {
      bg: 'rgba(103,232,249,0.35)',
      text: '#67e8f9',
    },
    premium: {
      bg: 'rgba(196,181,253,0.35)',
      text: '#c4b5fd',
    },
  };
  return colors[variant];
};
