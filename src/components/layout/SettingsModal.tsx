import React, { useState, useEffect } from 'react';
import { X, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getDb } from '@/services/db';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [basePath, setBasePath] = useState('');
  const [claudePath, setClaudePath] = useState('');
  const [codexPath, setCodexPath] = useState('');
  
  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    const db = await getDb();
    const settings = await db.select<any[]>("SELECT * FROM settings");
    const settingsMap = settings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
    
    setBasePath(settingsMap['base_path'] || '');
    setClaudePath(settingsMap['claude_path'] || '');
    setCodexPath(settingsMap['codex_path'] || '');
  };

  const saveSettings = async () => {
    const db = await getDb();
    await db.execute("INSERT INTO settings (key, value) VALUES ('base_path', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value", [basePath]);
    await db.execute("INSERT INTO settings (key, value) VALUES ('claude_path', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value", [claudePath]);
    await db.execute("INSERT INTO settings (key, value) VALUES ('codex_path', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value", [codexPath]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-background w-full max-w-md rounded-xl shadow-2xl overflow-hidden border">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-lg">设置与偏好</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold">本地 Skill 库存储目录</label>
            <div className="flex gap-2">
              <Input value={basePath} onChange={(e) => setBasePath(e.target.value)} placeholder="如: C:\Users\Name\SkillShelf" />
              <Button variant="outline" size="icon" className="shrink-0">
                <FolderOpen size={18} />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">App 将在此目录下管理所有 Skill 副本。</p>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <label className="text-sm font-semibold">AI 平台 Skill 目录配置</label>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Claude Code</label>
              <div className="flex gap-2">
                <Input value={claudePath} onChange={(e) => setClaudePath(e.target.value)} placeholder="默认: ~/.claude/skills" />
                <Button variant="outline" size="icon" className="shrink-0">
                  <FolderOpen size={18} />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Codex</label>
              <div className="flex gap-2">
                <Input value={codexPath} onChange={(e) => setCodexPath(e.target.value)} placeholder="默认: ~/.codex/skills" />
                <Button variant="outline" size="icon" className="shrink-0">
                  <FolderOpen size={18} />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-muted/30 border-t flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button onClick={saveSettings}>保存配置</Button>
        </div>
      </div>
    </div>
  );
};
