import React, { useState, useEffect } from 'react';
import { X, Search, Check, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { getAllSkills, addSkillsToCategory, Skill, getAllCategories, Category } from '@/services/skillService';
import { cn } from '@/lib/utils';

interface ImportFromLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  categoryName: string;
  onSuccess: () => void;
  platformId: string;
}

export const ImportFromLibraryModal: React.FC<ImportFromLibraryModalProps> = ({ 
  isOpen, 
  onClose, 
  categoryId, 
  categoryName,
  onSuccess,
  platformId
}) => {
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedSourceCategoryId, setSelectedSourceCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadData();
      setSelectedIds(new Set());
      setSelectedSourceCategoryId('all');
    }
  }, [isOpen]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [skills, cats] = await Promise.all([
        getAllSkills(platformId),
        getAllCategories(platformId)
      ]);
      // Filter out skills already in this category
      const filtered = skills.filter(s => !s.categories?.includes(categoryId));
      setAllSkills(filtered);
      setCategories(cats);
    } catch (err) {
      console.error(err);
      toast("加载数据失败", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleImport = async () => {
    if (selectedIds.size === 0) return;
    
    setIsLoading(true);
    try {
      await addSkillsToCategory(Array.from(selectedIds), categoryId);
      toast(`成功导入 ${selectedIds.size} 个 Skill 到 ${categoryName}`, "success");
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast("导入失败", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredSkills = allSkills.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.original_description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedSourceCategoryId === 'all' || 
      s.categories?.includes(selectedSourceCategoryId);
      
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
      <div className="bg-background w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden border flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <div>
            <h3 className="font-bold text-lg">从库中导入 Skill</h3>
            <p className="text-xs text-muted-foreground">将已有 Skill 关联到「{categoryName}」分类</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>
        
        <div className="p-4 border-b shrink-0 bg-muted/20 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input 
                className="pl-9 h-9"
                placeholder="搜索库中的 Skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 bg-background border rounded-md px-2 h-9">
              <Filter size={14} className="text-muted-foreground" />
              <select 
                value={selectedSourceCategoryId}
                onChange={(e) => setSelectedSourceCategoryId(e.target.value)}
                className="text-xs font-medium bg-transparent focus:outline-none pr-2"
              >
                <option value="all">所有分类</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {isLoading && allSkills.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground">
              加载中...
            </div>
          ) : filteredSkills.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 text-muted-foreground gap-2">
              <Search size={32} className="opacity-20" />
              <p className="text-sm">{searchQuery || selectedSourceCategoryId !== 'all' ? '未找到匹配的 Skill' : '所有 Skill 已在该分类中'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {filteredSkills.map(skill => (
                <div 
                  key={skill.id}
                  onClick={() => toggleSelect(skill.id)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border-2 group",
                    selectedIds.has(skill.id) 
                      ? "border-primary bg-primary/5 shadow-sm" 
                      : "border-transparent hover:bg-muted/50 hover:border-muted-foreground/20"
                  )}
                >
                  <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                    <span className="font-bold text-sm truncate">{skill.name}</span>
                    <span className="text-[10px] text-muted-foreground line-clamp-1">
                      {skill.original_description || '无描述'}
                    </span>
                    <div className="flex gap-1 mt-1">
                      {skill.categories?.map(catId => {
                        const cat = categories.find(c => c.id === catId);
                        if (!cat) return null;
                        return (
                          <span key={catId} className="text-[8px] px-1 py-0.5 bg-muted rounded text-muted-foreground">
                            {cat.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center transition-colors shrink-0",
                    selectedIds.has(skill.id) 
                      ? "bg-primary text-primary-foreground" 
                      : "border-2 border-muted-foreground/20 group-hover:border-primary/50"
                  )}>
                    {selectedIds.has(skill.id) && <Check size={12} strokeWidth={3} />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-muted/30 border-t flex justify-between items-center shrink-0">
          <span className="text-xs text-muted-foreground font-medium">
            已选择 {selectedIds.size} 个 Skill
          </span>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose}>取消</Button>
            <Button 
              disabled={selectedIds.size === 0 || isLoading} 
              onClick={handleImport}
              className="min-w-[120px]"
            >
              导入到 {categoryName}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
