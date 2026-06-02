# SUNTORY PEPSICO ENTERPRISE DESIGN GUIDELINES
## Trade Promotion Management System

**Philosophy:** Chuyên nghiệp • Đáng tin cậy • Hiệu quả

---

## 🎯 DESIGN PRINCIPLES

### 1. PRODUCTION FIRST
```
❌ KHÔNG                         ✅ CÓ
──────────────────────────────────────────────────────────
Hiệu ứng flashy, eye-candy    → Hiệu ứng subtle, functional
Animation nhiều, chậm          → Transition nhanh (<200ms)
Màu gradient rực rỡ           → Màu solid, high contrast
Icon nhiều màu                → Icon đơn sắc, consistent
Shadows mạnh                  → Shadows nhẹ, tinh tế
```

### 2. DATA READABILITY
- **Tabular-nums**: Số liệu luôn canh đều
- **High contrast**: Text/background ratio ≥ 4.5:1
- **Clear hierarchy**: Headings > Labels > Values > Meta

### 3. TRUST & RELIABILITY
- Animations nhanh, mượt (100-200ms)
- States rõ ràng (hover, active, disabled)
- Feedback tức thì khi tương tác
- Error handling hiển thị rõ ràng

---

## 🎨 COLOR SYSTEM

### Primary Palette
```css
/* Deep Navy - Primary Brand */
--primary-900: #001D3D;  /* Sidebar background */
--primary-800: #002855;  /* Hover states */
--primary-700: #003366;  /* Active states */
--primary-600: #004080;  /* Secondary actions */
--primary-500: #0047AB;  /* Primary actions, links */
--primary-100: #F0F5FF;  /* Light backgrounds */
--primary-50:  #F7FAFF;  /* Subtle highlights */
```

### Neutral Palette (High Contrast)
```css
--neutral-900: #111827;  /* Headings, important text */
--neutral-700: #374151;  /* Body text */
--neutral-600: #4B5563;  /* Secondary text */
--neutral-500: #6B7280;  /* Tertiary text */
--neutral-400: #9CA3AF;  /* Placeholder, disabled */
--neutral-200: #E5E7EB;  /* Borders */
--neutral-100: #F3F4F6;  /* Backgrounds */
--neutral-50:  #F9FAFB;  /* Page background */
```

### Semantic Colors (Clear, Unambiguous)
```css
/* Success - Green */
--success-700: #15803D;  /* Text */
--success-100: #DCFCE7;  /* Background */
--success-200: #BBF7D0;  /* Border */

/* Warning - Amber */
--warning-700: #A16207;  /* Text */
--warning-100: #FEF3C7;  /* Background */
--warning-200: #FDE68A;  /* Border */

/* Error - Red */
--error-700: #B91C1C;    /* Text */
--error-100: #FEE2E2;    /* Background */
--error-200: #FECACA;    /* Border */

/* Info - Blue */
--info-700: #1D4ED8;     /* Text */
--info-100: #DBEAFE;     /* Background */
--info-200: #BFDBFE;     /* Border */
```

---

## 🔤 TYPOGRAPHY

### Font Stack
```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, 
             'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

**Rationale:** System fonts cho performance tối ưu, render nhanh, native feel.

### Type Scale
```
Headings:
- Page Title:    18px / font-weight: 600 / color: #111827
- Section Title: 16px / font-weight: 600 / color: #111827
- Card Title:    14px / font-weight: 600 / color: #111827

Body:
- Primary:       14px / font-weight: 400 / color: #374151
- Secondary:     14px / font-weight: 400 / color: #6B7280
- Meta:          12px / font-weight: 400 / color: #9CA3AF

Data:
- Values:        14px / font-weight: 500 / color: #111827 / tabular-nums
- Labels:        12px / font-weight: 500 / color: #6B7280 / uppercase
```

### Number Formatting
```css
/* CRITICAL: Always use tabular-nums for data */
.data-value {
  font-variant-numeric: tabular-nums;
}
```

---

## 📐 SPACING SYSTEM

### Base Unit: 4px

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
```

### Component Spacing
```
Card Padding:     20px (space-5)
Table Cell:       16px horizontal, 14px vertical
Button Padding:   16px horizontal, 8px vertical
Form Input:       12px horizontal
Section Gap:      24px (space-6)
```

---

## 🌊 SIDEBAR WAVE PATTERN

### SVG Implementation
```svg
<pattern id="wave" width="120" height="24" patternUnits="userSpaceOnUse">
  <path 
    d="M0 12 Q 30 4, 60 12 T 120 12" 
    fill="none" 
    stroke="white" 
    stroke-width="1"
  />
  <path 
    d="M0 20 Q 30 12, 60 20 T 120 20" 
    fill="none" 
    stroke="white" 
    stroke-width="0.5"
    opacity="0.5"
  />
</pattern>
```

### Usage Rules
- Opacity: 4% (0.04) - barely visible
- Position: Behind all content
- Animation: NONE (static for performance)
- Overlay: Subtle gradient from top/bottom

---

## 🔲 ICONS - LUCIDE ONLY

### Guidelines
```
✅ Single color (inherit from text)
✅ Stroke width: 1.75 (slightly lighter than default 2)
✅ Size: 18px for nav/actions, 16px for inline, 20px for emphasis
✅ Consistent throughout application

❌ No colored icons
❌ No filled variants (use outline only)
❌ No mixing icon libraries
❌ No decorative icons without purpose
```

### Common Icons
```javascript
import {
  // Navigation
  LayoutDashboard, Package, FileText, DollarSign,
  BarChart3, Users, Settings, Building2, 
  
  // Actions
  Plus, Filter, Search, Bell, ChevronDown, ChevronRight,
  
  // Status
  CheckCircle, AlertCircle, XCircle, Clock, Loader,
  
  // Data
  TrendingUp, TrendingDown, ArrowUp, ArrowDown
} from 'lucide-react';
```

### Icon Button Standard
```jsx
<button className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-gray-100">
  <Bell className="w-[18px] h-[18px] text-gray-500" strokeWidth={1.75} />
</button>
```

---

## 🎬 TRANSITIONS & ANIMATIONS

### Timing
```css
/* Fast - Immediate feedback */
--duration-fast: 100ms;

/* Normal - Most interactions */
--duration-normal: 150ms;

/* Slow - Page transitions, modals */
--duration-slow: 200ms;
```

### Easing
```css
--ease-default: ease;  /* Simple, performant */
```

### Usage Rules
```
✅ Hover states:     100ms ease
✅ Focus states:     100ms ease
✅ Button press:     75ms ease
✅ Dropdown open:    150ms ease
✅ Modal open:       200ms ease
✅ Sidebar collapse: 200ms ease

❌ No animations >300ms
❌ No bouncing effects
❌ No elastic easing
❌ No continuous animations (except loading)
```

---

## 📊 DATA TABLE STANDARDS

### Structure
```
┌─────────────────────────────────────────────────────────────┐
│  Header Row                                                  │
│  • Background: #F9FAFB                                      │
│  • Text: 12px, uppercase, #4B5563, tracking-wider          │
│  • Border: 1px solid #E5E7EB bottom                        │
├─────────────────────────────────────────────────────────────┤
│  Data Rows                                                   │
│  • Padding: 14px vertical, 16px horizontal                  │
│  • Text: 14px, #374151                                      │
│  • Border: 1px solid #F3F4F6 bottom                        │
│  • Hover: background #F9FAFB                               │
├─────────────────────────────────────────────────────────────┤
│  Footer/Pagination                                           │
│  • Background: white                                         │
│  • Border: 1px solid #E5E7EB top                           │
└─────────────────────────────────────────────────────────────┘
```

### Column Types
```
ID/Code:      font-mono, primary color, font-medium
Name/Title:   font-medium, neutral-900
Category:     regular, neutral-600
Status:       Badge component
Numbers:      text-right, tabular-nums
Progress:     Progress bar + percentage
Actions:      Icon buttons, right-aligned
```

---

## 🏷 STATUS BADGES

### Standard Format
```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 4px;
  border: 1px solid;
}
```

### Status Variants
```
Active/Success:   bg: #ECFDF5, text: #15803D, border: #BBF7D0
Pending/Warning:  bg: #FFFBEB, text: #A16207, border: #FDE68A
Draft/Neutral:    bg: #F9FAFB, text: #4B5563, border: #E5E7EB
Completed/Info:   bg: #EFF6FF, text: #1D4ED8, border: #BFDBFE
Rejected/Error:   bg: #FEF2F2, text: #B91C1C, border: #FECACA
```

---

## 🔘 BUTTONS

### Primary (Main CTA)
```css
.btn-primary {
  height: 36px;
  padding: 0 16px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  background: #0047AB;
  border-radius: 6px;
  transition: background 100ms ease;
}
.btn-primary:hover {
  background: #003D91;
}
```

### Secondary (Alternative)
```css
.btn-secondary {
  height: 36px;
  padding: 0 12px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
}
.btn-secondary:hover {
  background: #F9FAFB;
}
```

### Sizing
```
Small:   h-8  px-3 text-sm
Default: h-9  px-4 text-sm
Large:   h-10 px-5 text-sm
```

---

## 📝 FORMS

### Input Standard
```css
.input {
  height: 36px;
  padding: 0 12px;
  font-size: 14px;
  color: #111827;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  transition: all 150ms ease;
}
.input:focus {
  background: white;
  border-color: #0047AB;
  box-shadow: 0 0 0 3px rgba(0,71,171,0.1);
  outline: none;
}
```

### Label
```css
.label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}
```

---

## 📐 LAYOUT

### Sidebar
```
Width:           256px (expanded), 64px (collapsed)
Background:      #001D3D
Border:          none (uses shadow)
Wave pattern:    opacity 4%
```

### Header
```
Height:          64px
Background:      white
Border:          1px solid #E5E7EB bottom
Position:        sticky top
```

### Content
```
Padding:         24px
Max-width:       none (fluid)
Background:      #F9FAFB
```

---

## ✅ QUALITY CHECKLIST

### Before Shipping
- [ ] All text readable (contrast ≥ 4.5:1)
- [ ] Numbers use tabular-nums
- [ ] Icons all Lucide, stroke-width 1.75
- [ ] Transitions ≤ 200ms
- [ ] No decorative animations
- [ ] Status badges follow standard colors
- [ ] Tables have proper hover states
- [ ] Buttons have clear states (default, hover, active, disabled)
- [ ] Forms have focus states
- [ ] Loading states present
- [ ] Error states handled

---

## 🚀 IMPLEMENTATION PRIORITY

```
Phase 1: Foundation
├── Color tokens
├── Typography scale
├── Spacing system
└── Icon setup (Lucide)

Phase 2: Core Components
├── Buttons
├── Badges
├── Form inputs
├── Cards
└── Tables

Phase 3: Layout
├── Sidebar with wave
├── Header
└── Page templates

Phase 4: Polish
├── Transitions
├── Loading states
└── Error states
```

---

**Remember:** Đây là ứng dụng enterprise cho khách hàng cao cấp. Mọi quyết định design phải đặt **reliability, readability, và efficiency** lên hàng đầu.
