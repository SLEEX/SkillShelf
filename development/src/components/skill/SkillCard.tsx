import React from 'react';
import { Code } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/Switch';
import { Badge } from '@/components/ui/Badge';

export interface Skill {
  id: string;
  name: string;
  description: string;
  tags: string[];
  enabled: boolean;
  icon?: any;
}

interface SkillCardProps {
  skill: Skill;
  onToggle: (id: string, enabled: boolean) => void;
  onClick: (id: string) => void;
}

export const SkillCard: React.FC<SkillCardProps> = ({ 
  skill, 
  onToggle,
  onClick 
}) => {
  return (
    <div 
      onClick={() => onClick(skill.id)}
      className="group p-4 rounded-xl border bg-card hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer flex flex-col h-full"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center group-hover:bg-primary/5 transition-colors">
          {skill.icon ? <skill.icon size={20} className="text-muted-foreground group-hover:text-primary transition-colors" /> : <Code size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />}
        </div>
        <div className="flex items-center h-6" onClick={(e) => e.stopPropagation()}>
          <Switch 
            checked={skill.enabled} 
            onCheckedChange={(checked) => onToggle(skill.id, checked)}
          />
        </div>
      </div>
      <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">{skill.name}</h3>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed flex-1">
        {skill.description}
      </p>
      <div className="flex flex-wrap gap-1.5 mt-auto">
        {skill.tags.map(tag => (
          <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-muted/50 border-none">
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
};
