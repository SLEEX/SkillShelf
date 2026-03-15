import React from 'react';
import { 
  Plus, 
  Settings, 
  ChevronRight, 
  Folder, 
  Archive, 
  Code, 
  BarChart2, 
  Bot
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export interface Category {
  id: string;
  name: string;
  icon?: any;
  count: number;
  color?: string;
}

interface SidebarProps {
  activeCategoryId: string;
  onCategoryChange: (id: string) => void;
  categories: Category[];
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeCategoryId, 
  onCategoryChange,
  categories,
  onOpenSettings
}) => {
  return (
    <aside className="w-64 border-r bg-muted/30 flex flex-col shrink-0 h-full">
      <div className="p-4 flex items-center gap-2 border-b">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
          <Bot size={20} />
        </div>
        <h1 className="font-bold text-lg tracking-tight">SkillShelf</h1>
      </div>

      <div className="p-4 space-y-6 flex-1 overflow-y-auto">
        {/* AI Platform Selector */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">
            目标 AI 平台
          </label>
          <div className="flex items-center justify-between p-2 rounded-md border bg-card hover:bg-accent cursor-pointer transition-colors shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <span className="text-sm font-semibold">Claude Code</span>
            </div>
            <ChevronRight size={14} className="text-muted-foreground" />
          </div>
        </div>

        {/* Category Tree */}
        <div className="space-y-1">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1 py-2">
            分类树 (CATEGORIES)
          </div>
          <div className="space-y-1">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={cn(
                  "group flex items-center justify-between p-2 rounded-md cursor-pointer transition-all",
                  activeCategoryId === cat.id 
                    ? "bg-primary/10 text-primary" 
                    : "hover:bg-accent text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-2.5">
                  {cat.icon ? <cat.icon size={18} className={cat.color} /> : <Folder size={18} className={cat.color} />}
                  <span className="text-sm font-medium">{cat.name}</span>
                </div>
                <span className="text-[10px] font-bold bg-muted px-1.5 py-0.5 rounded-full group-hover:bg-accent-foreground/10">
                  {cat.count}
                </span>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="w-full justify-start gap-2 h-9 px-2 text-muted-foreground font-medium mt-1">
            <Plus size={16} />
            新建分类
          </Button>
        </div>
      </div>

      <div className="p-4 border-t mt-auto">
        <Button onClick={onOpenSettings} variant="ghost" className="w-full justify-start gap-2 h-9 px-2 text-muted-foreground font-medium">
          <Settings size={18} />
          设置与偏好
        </Button>
      </div>
    </aside>
  );
};
