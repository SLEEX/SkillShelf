import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { addCategory, updateCategory } from '@/services/skillService';
import { cn } from '@/lib/utils';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: { id: string; name: string; color: string } | null;
}

const PRESET_COLORS = [
  { name: 'Gray', value: 'text-muted-foreground', bg: 'bg-muted-foreground' },
  { name: 'Blue', value: 'text-blue-500', bg: 'bg-blue-500' },
  { name: 'Green', value: 'text-green-500', bg: 'bg-green-500' },
  { name: 'Red', value: 'text-red-500', bg: 'bg-red-500' },
  { name: 'Yellow', value: 'text-yellow-500', bg: 'bg-yellow-500' },
  { name: 'Purple', value: 'text-purple-500', bg: 'bg-purple-500' },
  { name: 'Pink', value: 'text-pink-500', bg: 'bg-pink-500' },
  { name: 'Orange', value: 'text-orange-500', bg: 'bg-orange-500' },
];

export const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, onSuccess, editData }) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0].value);
  const { toast } = useToast();
  
  useEffect(() => {
    if (editData) {
      setName(editData.name);
      setSelectedColor(editData.color || PRESET_COLORS[0].value);
    } else {
      setName('');
      setSelectedColor(PRESET_COLORS[0].value);
    }
  }, [editData, isOpen]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast("分类名称不能为空", "error");
      return;
    }
    
    try {
      if (editData) {
        await updateCategory(editData.id, name.trim(), selectedColor);
        toast("分类已更新", "success");
      } else {
        await addCategory(name.trim(), "", selectedColor);
        toast("分类已创建", "success");
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast(editData ? "更新分类失败" : "创建分类失败", "error");
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-background w-full max-w-sm rounded-xl shadow-2xl overflow-hidden border">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-lg">{editData ? '编辑分类' : '新建分类'}</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold">分类名称</label>
            <Input 
              autoFocus
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="如: 常用工具, AI 绘图..." 
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold">选择主题颜色</label>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={cn(
                    "h-10 rounded-md flex items-center justify-center transition-all border-2",
                    selectedColor === color.value ? "border-primary" : "border-transparent"
                  )}
                >
                  <div className={cn("w-6 h-6 rounded-full shadow-sm flex items-center justify-center", color.bg)}>
                    {selectedColor === color.value && <Check size={14} className="text-white" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 bg-muted/30 border-t flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button onClick={handleSave}>{editData ? '保存修改' : '确认创建'}</Button>
        </div>
      </div>
    </div>
  );
};
