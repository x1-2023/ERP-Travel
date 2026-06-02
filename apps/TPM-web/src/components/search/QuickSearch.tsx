/**
 * QuickSearch Component
 * Command palette style search modal (⌘K)
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  LayoutDashboard,
  Calendar,
  Tag,
  DollarSign,
  TrendingUp,
  Sparkles,
  Clock,
  ArrowRight,
  Command,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { sidebarConfig } from '@/config/sidebarConfig';

interface QuickSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchItem {
  id: string;
  title: string;
  titleVi?: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  keywords?: string[];
}

// Build search items from sidebar config
const buildSearchItems = (): SearchItem[] => {
  const items: SearchItem[] = [];

  sidebarConfig.sections.forEach((section) => {
    section.items.forEach((item) => {
      items.push({
        id: item.id,
        title: item.title,
        titleVi: item.titleVi,
        href: item.href,
        icon: item.icon,
        category: section.title,
        keywords: [
          item.title.toLowerCase(),
          item.titleVi?.toLowerCase() || '',
          item.sublabel?.toLowerCase() || '',
          section.title.toLowerCase(),
        ].filter(Boolean),
      });
    });
  });

  return items;
};

// Quick actions
const quickActions = [
  {
    id: 'new-promotion',
    title: 'Create Promotion',
    titleVi: 'Tạo Khuyến mãi mới',
    href: '/promotions/new',
    icon: Tag,
    category: 'Quick Actions',
  },
  {
    id: 'new-budget',
    title: 'Create Budget',
    titleVi: 'Tạo Ngân sách mới',
    href: '/budget/definition',
    icon: DollarSign,
    category: 'Quick Actions',
  },
  {
    id: 'view-calendar',
    title: 'View Calendar',
    titleVi: 'Xem Lịch khuyến mãi',
    href: '/calendar',
    icon: Calendar,
    category: 'Quick Actions',
  },
  {
    id: 'ai-suggestions',
    title: 'AI Suggestions',
    titleVi: 'Gợi ý từ AI',
    href: '/planning/tpo',
    icon: Sparkles,
    category: 'Quick Actions',
  },
];

// Recent pages (mock - in production this would come from localStorage or API)
const recentPages = [
  { id: 'recent-1', title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { id: 'recent-2', title: 'Promotions', href: '/promotions', icon: Tag },
  { id: 'recent-3', title: 'Budget Monitoring', href: '/budget/monitoring', icon: TrendingUp },
];

export function QuickSearch({ open, onOpenChange }: QuickSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const searchItems = useMemo(() => buildSearchItems(), []);

  // Filter results based on query
  const filteredResults = useMemo(() => {
    if (!query.trim()) {
      return {
        quickActions,
        recent: recentPages,
        pages: [],
      };
    }

    const q = query.toLowerCase();
    const matchedPages = searchItems.filter((item) =>
      item.keywords?.some((keyword) => keyword.includes(q)) ||
      item.title.toLowerCase().includes(q) ||
      item.titleVi?.toLowerCase().includes(q)
    );

    const matchedActions = quickActions.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.titleVi?.toLowerCase().includes(q)
    );

    return {
      quickActions: matchedActions,
      recent: [],
      pages: matchedPages.slice(0, 8),
    };
  }, [query, searchItems]);

  // Flatten results for keyboard navigation
  const allResults = useMemo(() => {
    const results: Array<{ id: string; href: string; title: string }> = [];

    if (filteredResults.quickActions.length > 0) {
      results.push(...filteredResults.quickActions);
    }
    if (filteredResults.recent.length > 0) {
      results.push(...filteredResults.recent);
    }
    if (filteredResults.pages.length > 0) {
      results.push(...filteredResults.pages);
    }

    return results;
  }, [filteredResults]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Reset query when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < allResults.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : allResults.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (allResults[selectedIndex]) {
            navigate(allResults[selectedIndex].href);
            onOpenChange(false);
          }
          break;
        case 'Escape':
          onOpenChange(false);
          break;
      }
    },
    [allResults, selectedIndex, navigate, onOpenChange]
  );

  const handleSelect = (href: string) => {
    navigate(href);
    onOpenChange(false);
  };

  let currentIndex = 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 gap-0 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center border-b px-4">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            placeholder="Search pages, actions, promotions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-12"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <ScrollArea className="max-h-[400px]">
          <div className="p-2">
            {/* Quick Actions */}
            {filteredResults.quickActions.length > 0 && (
              <div className="mb-4">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  Quick Actions
                </div>
                {filteredResults.quickActions.map((item) => {
                  const Icon = item.icon;
                  const isSelected = currentIndex === selectedIndex;
                  const index = currentIndex++;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.href)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                        isSelected
                          ? 'bg-primary/10 text-foreground'
                          : 'hover:bg-muted'
                      )}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        {item.titleVi && (
                          <p className="text-xs text-muted-foreground truncate">
                            {item.titleVi}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Recent */}
            {filteredResults.recent.length > 0 && (
              <div className="mb-4">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  Recent
                </div>
                {filteredResults.recent.map((item) => {
                  const Icon = item.icon;
                  const isSelected = currentIndex === selectedIndex;
                  const index = currentIndex++;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.href)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors',
                        isSelected
                          ? 'bg-primary/10 text-foreground'
                          : 'hover:bg-muted'
                      )}
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{item.title}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Pages */}
            {filteredResults.pages.length > 0 && (
              <div>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  Pages
                </div>
                {filteredResults.pages.map((item) => {
                  const Icon = item.icon;
                  const isSelected = currentIndex === selectedIndex;
                  const index = currentIndex++;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.href)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors',
                        isSelected
                          ? 'bg-primary/10 text-foreground'
                          : 'hover:bg-muted'
                      )}
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{item.title}</p>
                        {item.titleVi && (
                          <p className="text-xs text-muted-foreground truncate">
                            {item.titleVi}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {item.category}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            )}

            {/* No results */}
            {query &&
              filteredResults.quickActions.length === 0 &&
              filteredResults.pages.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No results found for "{query}"</p>
                  <p className="text-xs mt-1">Try searching for pages or actions</p>
                </div>
              )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground bg-muted/30">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background rounded border text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-background rounded border text-[10px]">↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background rounded border text-[10px]">↵</kbd>
              <span>to select</span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Command className="h-3 w-3" />
            <span>K to open</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
