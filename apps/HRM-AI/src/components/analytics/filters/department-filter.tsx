'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Department {
  id: string;
  name: string;
}

interface DepartmentFilterProps {
  value: string;
  onChange: (departmentId: string) => void;
  className?: string;
}

export function DepartmentFilter({
  value,
  onChange,
  className,
}: DepartmentFilterProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const response = await fetch('/api/departments');
        if (response.ok) {
          const result = await response.json();
          setDepartments(result);
        }
      } catch (error) {
        console.error('Failed to fetch departments:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDepartments();
  }, []);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={loading}
      className={cn(
        'h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50',
        className
      )}
    >
      <option value="">Tất cả phòng ban</option>
      {departments.map((dept) => (
        <option key={dept.id} value={dept.id}>
          {dept.name}
        </option>
      ))}
    </select>
  );
}
