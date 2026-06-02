/**
 * SearchInput Component with debounce
 */

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';
import { useEffect, useState, useRef } from 'react';

interface SearchInputProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

export function SearchInput({
  value: externalValue = '',
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
  className,
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(externalValue);
  const debouncedValue = useDebounce(internalValue, debounceMs);
  const lastReportedValue = useRef(externalValue);
  const isExternalUpdate = useRef(false);

  // Call onChange only when debounced value changes and it's not from external update
  useEffect(() => {
    if (!isExternalUpdate.current && debouncedValue !== lastReportedValue.current) {
      lastReportedValue.current = debouncedValue;
      onChange(debouncedValue);
    }
    isExternalUpdate.current = false;
  }, [debouncedValue]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync with external value changes
  useEffect(() => {
    if (externalValue !== internalValue && externalValue !== lastReportedValue.current) {
      isExternalUpdate.current = true;
      setInternalValue(externalValue);
      lastReportedValue.current = externalValue;
    }
  }, [externalValue]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClear = () => {
    setInternalValue('');
    lastReportedValue.current = '';
    onChange('');
  };

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-10"
      />
      {internalValue && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2"
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
