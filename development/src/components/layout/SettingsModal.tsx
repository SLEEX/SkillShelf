import React, { useState, useEffect } from 'react';
import { X, FolderOpen, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getDb } from '@/services/db';
import { open } from '@tauri-apps/plugin-dialog';
import { exists } from '@tauri-apps/plugin-fs';
import { join, homeDir } from '@tauri-apps/api/path';
import { useToast } from '@/components/ui/Toast';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onRefresh }) => {
  const [basePath, setBasePath] = useState('');
  const [claudePath, setClaudePath] = useState('');
  const [codexPath, setCodexPath] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();
  
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

  const handlePickDirectory = async (setter: (path: string) => void) => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
      });
      if (selected && !Array.isArray(selected)) {
        setter(selected);
      }
    } catch (err) {
      console.error("Failed to pick directory:", err);
      toast("无法打开目录选择器", "error");
    }
  };

  const handleCheckPaths = async () => {
    if (!basePath) {
      toast("请先配置并保存本地存储目录", "error");
      return;
    }
    
    setIsScanning(true);
    try {
      const db = await getDb();
      
      // Try to find default paths if empty
      const home = await homeDir();
      const defaultClaude = await join(home, ".claude", "skills");
      const defaultCodex = await join(home, ".codex", "skills");

      const checkClaude = claudePath || defaultClaude;
      const checkCodex = codexPath || defaultCodex;

      const results = await Promise.all([
        exists(basePath),
        exists(checkClaude),
        exists(checkCodex)
      ]);

      let updated = false;
      if (results[1] && !claudePath) {
        setClaudePath(checkClaude);
        await db.execute("REPLACE INTO settings (key, value) VALUES ('claude_path', ?)", [checkClaude]);
        updated = true;
      }
      if (results[2] && !codexPath) {
        setCodexPath(checkCodex);
        await db.execute("REPLACE INTO settings (key, value) VALUES ('codex_path', ?)", [checkCodex]);
        updated = true;
      }

      const invalidPaths = [];
      if (!results[0]) invalidPaths.push("本地存储库");
      
      if (invalidPaths.length > 0) {
        toast(`路径无效: ${invalidPaths.join(", ")}`, "error");
      } else {
        toast(updated ? "已发现并保存有效路径" : "所有路径配置正常", "success");
      }
    } catch (err: any) {
      toast(`检查失败: ${err.message || err}`, "error");
    } finally {
      setIsScanning(false);
    }
  };

  const saveSettings = async () => {
    try {
      const db = await getDb();
      // Use REPLACE INTO for better compatibility and atomicity
      await db.execute("REPLACE INTO settings (key, value) VALUES ('base_path', ?)", [basePath]);
      await db.execute("REPLACE INTO settings (key, value) VALUES ('claude_path', ?)", [claudePath]);
      await db.execute("REPLACE INTO settings (key, value) VALUES ('codex_path', ?)", [codexPath]);
      
      toast("设置已保存", "success");
      onClose();
    } catch (err: any) {
      toast(`保存失败: ${err.message || err}`, "error");
      console.error("Save settings error:", err);
    }
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
              <Button 
                variant="outline" 
                size="icon" 
                className="shrink-0"
                onClick={() => handlePickDirectory(setBasePath)}
              >
                <FolderOpen size={18} />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">App 将在此目录下管理所有 Skill 副本。</p>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold">AI 平台 Skill 目录配置</label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCheckPaths}
                disabled={isScanning}
                className="h-7 gap-1.5 text-[10px] text-primary border-primary/20 hover:bg-primary/10 px-2"
              >
                <RefreshCcw size={12} className={isScanning ? "animate-spin" : ""} />
                检查路径状态
              </Button>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Claude Code</label>
              <div className="flex gap-2">
                <Input value={claudePath} onChange={(e) => setClaudePath(e.target.value)} placeholder="默认: ~/.claude/skills" />
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="shrink-0"
                  onClick={() => handlePickDirectory(setClaudePath)}
                >
                  <FolderOpen size={18} />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Codex</label>
              <div className="flex gap-2">
                <Input value={codexPath} onChange={(e) => setCodexPath(e.target.value)} placeholder="默认: ~/.codex/skills" />
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="shrink-0"
                  onClick={() => handlePickDirectory(setCodexPath)}
                >
                  <FolderOpen size={18} />
                </Button>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">点击“检查路径状态”可自动探测并保存默认安装路径。</p>
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
