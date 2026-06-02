'use client';

import { useState, useEffect, useCallback } from 'react';
import { EmployeeSkill, SkillCategory } from '@/types/learning';

export function useSkills() {
  const [skills, setSkills] = useState<EmployeeSkill[]>([]);
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSkills = useCallback(async () => {
    try {
      setLoading(true);
      const [skillsRes, categoriesRes] = await Promise.all([
        fetch('/api/learning/skills/employee'),
        fetch('/api/learning/skills/categories'),
      ]);

      if (skillsRes.ok) {
        const data = await skillsRes.json();
        setSkills(Array.isArray(data) ? data : []);
      }
      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch skills:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  return { skills, categories, loading, refetch: fetchSkills };
}
