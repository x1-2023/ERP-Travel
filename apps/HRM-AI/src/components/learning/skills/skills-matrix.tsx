'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SkillRating } from './skill-rating';

interface Skill {
  id: string;
  name: string;
  category: string;
  currentLevel: number;
  requiredLevel?: number;
}

interface SkillsMatrixProps {
  skills: Skill[];
  readonly?: boolean;
  onSkillChange?: (skillId: string, value: number) => void;
}

export function SkillsMatrix({ skills, readonly = true, onSkillChange }: SkillsMatrixProps) {
  const groupedSkills = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    const category = skill.category || 'OTHER';
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(groupedSkills).map(([category, categorySkills]) => {
        return (
          <Card key={category}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm">{category}</CardTitle>
                <Badge variant="outline" className="text-xs">{categorySkills.length} ky nang</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {categorySkills.map((skill) => (
                <div key={skill.id} className="flex items-center justify-between gap-4">
                  <span className="text-sm min-w-0 truncate">{skill.name}</span>
                  <SkillRating
                    value={skill.currentLevel}
                    required={skill.requiredLevel}
                    readonly={readonly}
                    onChange={(value) => onSkillChange?.(skill.id, value)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
