/**
 * Inventory Table Component
 * Displays inventory data with sorting and filtering
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpDown, Eye, MoreHorizontal } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StockAlertBadge } from './StockAlertBadge';
import { formatNumber, formatDate } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import type { InventorySnapshot, StockStatus } from '@/types/operations';

interface InventoryTableProps {
  data: InventorySnapshot[];
  onRowClick?: (item: InventorySnapshot) => void;
  onDelete?: (id: string) => void;
}

export function InventoryTable({ data, onRowClick, onDelete }: InventoryTableProps) {
  const [sortField, setSortField] = useState<string>('snapshotDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    let aVal: any;
    let bVal: any;

    switch (sortField) {
      case 'snapshotDate':
        aVal = new Date(a.snapshotDate).getTime();
        bVal = new Date(b.snapshotDate).getTime();
        break;
      case 'quantity':
        aVal = a.quantity;
        bVal = b.quantity;
        break;
      case 'value':
        aVal = a.value;
        bVal = b.value;
        break;
      case 'customer':
        aVal = a.customer?.name || '';
        bVal = b.customer?.name || '';
        break;
      case 'product':
        aVal = a.product?.name || '';
        bVal = b.product?.name || '';
        break;
      default:
        return 0;
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const getExpiryStatus = (expiryDate?: string): StockStatus | undefined => {
    if (!expiryDate) return undefined;
    const now = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry <= 0) return 'OUT_OF_STOCK'; // Expired
    if (daysUntilExpiry <= 30) return 'LOW'; // Near expiry
    return 'OK';
  };

  const SortableHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <TableHead
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className="h-3 w-3" />
      </div>
    </TableHead>
  );

  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader field="snapshotDate">Date</SortableHeader>
            <SortableHeader field="customer">Customer</SortableHeader>
            <SortableHeader field="product">Product</SortableHeader>
            <TableHead>Location</TableHead>
            <SortableHeader field="quantity">Quantity</SortableHeader>
            <SortableHeader field="value">Value</SortableHeader>
            <TableHead>Expiry</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                No inventory records found
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((item) => {
              const expiryStatus = getExpiryStatus(item.expiryDate);

              return (
                <TableRow
                  key={item.id}
                  className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                  onClick={() => onRowClick?.(item)}
                >
                  <TableCell>{formatDate(item.snapshotDate)}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.customer?.name}</div>
                      <div className="text-xs text-muted-foreground">{item.customer?.code}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.product?.name}</div>
                      <div className="text-xs text-muted-foreground">{item.product?.code}</div>
                    </div>
                  </TableCell>
                  <TableCell>{item.location || '-'}</TableCell>
                  <TableCell className="font-medium">{formatNumber(item.quantity)}</TableCell>
                  <TableCell><CurrencyDisplay amount={item.value} size="sm" /></TableCell>
                  <TableCell>
                    {item.expiryDate ? (
                      <div className="flex items-center gap-2">
                        <span>{formatDate(item.expiryDate)}</span>
                        {expiryStatus && expiryStatus !== 'OK' && (
                          <StockAlertBadge
                            status={expiryStatus}
                            size="sm"
                          />
                        )}
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/operations/inventory/${item.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        {onDelete && (
                          <DropdownMenuItem
                            className="text-red-600 dark:text-red-400"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(item.id);
                            }}
                          >
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
