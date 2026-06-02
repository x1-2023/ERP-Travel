'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';
import { SkillRating } from './skill-rating';

interface EmployeeSkill {
  id: string;
  name: string;
  currentLevel: number;
  requiredLevel?: number;
}

interface EmployeeSkillsCardProps {
  employeeName: string;
  position?: string;
  skills: EmployeeSkill[];
}

export function EmployeeSkillsCard({ employeeName, position, skills }: EmployeeSkillsCardProps) {
  const avgLevel = skills.length > 0
    ? Math.round(skills.reduce((sum, s) => sum + s.currentLevel, 0) / skills.length * 10) / 10
    : 0;

  const gapCount = skills.filter((s) => s.requiredLevel && s.currentLevel < s.requiredLevel).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-sm">{employeeName}</CardTitle>
              {position && <p className="text-xs text-muted-foreground">{position}</p>}
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">{avgLevel}</p>
            <p className="text-xs text-muted-foreground">TB cap do</p>
          </div>
        </div>
        {gapCount > 0 && (
          <Badge variant="destructive" className="text-xs mt-2">
            {gapCount} ky nang can cai thien
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {skills.map((skill) => (
          <div key={skill.id} className="flex items-center justify-between gap-3">
            <span className="text-xs truncate">{skill.name}</span>
            <SkillRating
              value={skill.currentLevel}
              required={skill.requiredLevel}
              readonly
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
