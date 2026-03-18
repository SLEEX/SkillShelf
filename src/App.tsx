import { useState, useEffect } from 'react';
import { 
  Search, 
  Folder, 
  Archive, 
  Code, 
  BarChart2, 
  Download,
  Edit2,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';
import { Sidebar, Category } from './components/layout/Sidebar';
import { SkillCard, Skill } from './components/skill/SkillCard';
import { SettingsModal } from './components/layout/SettingsModal';
import { CategoryModal } from './components/layout/CategoryModal';
import { ImportFromLibraryModal } from './components/layout/ImportFromLibraryModal';
import { getAllCategories, getSkillsByCategory, toggleSkillStatus, getCategoryStatus } from './services/skillService';
import { pickAndImportSkill } from './services/importService';
import { toggleCategoryDeployment, deployCategoryToPlatform } from './services/deployService';
import { scanLocalLibrary } from './services/scanService';
import { Button } from './components/ui/Button';
import { Switch } from './components/ui/Switch';
import { useToast } from './components/ui/Toast';

function App() {
  const [activeCategoryId, setActiveCategoryId] = useState('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [platformId, setPlatformId] = useState('claude');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editCategoryData, setEditCategoryData] = useState<{ id: string; name: string; color: string; icon?: string } | null>(null);
  const [isCategoryEnabled, setIsCategoryEnabled] = useState(false);
  const [isImportLibraryOpen, setIsImportLibraryOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  const checkInitialSetup = async () => {
    const db = await getAllCategories(); // Just to ensure DB is ready
    const settings = await (await import('./services/db')).getDb().then(db => 
      db.select<any[]>("SELECT value FROM settings WHERE key = 'base_path'")
    );
    if (settings.length === 0 || !settings[0].value) {
      setIsSettingsOpen(true);
    }
  };

  useEffect(() => {
    checkInitialSetup();
  }, []);

  const fetchCategories = async () => {
    const cats = await getAllCategories(platformId);
    // Add "All Skills" manually
    const allCount = cats.reduce((acc, curr) => acc + (curr.count || 0), 0);
    const formattedCats: Category[] = [
      { id: 'all', name: '全部 Skills', icon: 'Folder', count: allCount },
      ...cats.map(c => ({
        id: c.id,
        name: c.name,
        icon: c.id === 'unclassified' ? 'Archive' : undefined,
        count: c.count || 0,
        color: c.color || (c.id === 'unclassified' ? '' : 'text-blue-500'),
        enabled: c.enabled
      }))
    ];
    setCategories(formattedCats);
  };

  const fetchSkills = async () => {
    const fetchedSkills = await getSkillsByCategory(activeCategoryId, platformId);
    setSkills(fetchedSkills.map(s => ({
      id: s.id,
      name: s.name,
      description: s.original_description || '',
      tags: s.categories || [],
      enabled: s.enabled || false,
    })));

    if (activeCategoryId !== 'all') {
      const status = await getCategoryStatus(activeCategoryId, platformId);
      setIsCategoryEnabled(status);
    } else {
      setIsCategoryEnabled(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [skills]);

  useEffect(() => {
    fetchSkills();
  }, [activeCategoryId, platformId]);

  const handleToggleSkill = async (id: string, enabled: boolean) => {
    // Optimistic update
    setSkills(prev => prev.map(s => s.id === id ? { ...s, enabled } : s));

    try {
      await toggleSkillStatus(id, platformId, enabled);
      // If category is enabled, we need to update symlinks
      if (activeCategoryId !== 'all' && isCategoryEnabled) {
        await deployCategoryToPlatform(activeCategoryId, platformId);
      }
      // Final sync with database
      fetchSkills();
    } catch (err: any) {
      // Revert if failed
      fetchSkills();
      alert(err.message);
    }
  };

  const handleToggleCategory = async (enabled: boolean) => {
    if (activeCategoryId === 'all') return;
    try {
      // Optimistic update
      setIsCategoryEnabled(enabled);
      setCategories(prev => prev.map(c => 
        c.id === activeCategoryId ? { ...c, enabled } : c
      ));

      await toggleCategoryDeployment(activeCategoryId, platformId, enabled);
      // Refresh to ensure database and UI are in sync
      await Promise.all([fetchCategories(), fetchSkills()]);
    } catch (err: any) {
      // Revert if failed
      const status = await getCategoryStatus(activeCategoryId, platformId);
      setIsCategoryEnabled(status);
      fetchCategories();
      alert(err.message);
    }
  };

  const handleZipImport = async () => {
    try {
      const result = await pickAndImportSkill();
      if (result) {
        toast("导入成功", "success");
        fetchSkills();
      }
    } catch (err: any) {
      toast(`导入失败: ${err.message}`, "error");
    }
  };

  const handleScanLocal = async () => {
    setIsScanning(true);
    try {
      const count = await scanLocalLibrary();
      if (count > 0) {
        toast(`扫描完成，新增 ${count} 个 Skill`, "success");
        fetchSkills();
      } else {
        toast("本地存储库已是最新状态", "success");
      }
    } catch (err: any) {
      toast(`扫描失败: ${err.message}`, "error");
    } finally {
      setIsScanning(false);
    }
  };

  const handleEditCategory = () => {
    if (activeCategoryId === 'all' || activeCategoryId === 'unclassified') return;
    const cat = categories.find(c => c.id === activeCategoryId);
    if (cat) {
      setEditCategoryData({ id: cat.id, name: cat.name, color: cat.color || '', icon: cat.icon });
      setIsCategoryModalOpen(true);
    }
  };

  const activeCategory = categories.find(c => c.id === activeCategoryId);
  const activeCategoryName = activeCategory?.name || 'Skills';
  const isCustomCategory = activeCategoryId !== 'all' && activeCategoryId !== 'unclassified';

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans">
      <Sidebar 
        activeCategoryId={activeCategoryId} 
        onCategoryChange={setActiveCategoryId}
        categories={categories}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAddCategory={() => {
          setEditCategoryData(null);
          setIsCategoryModalOpen(true);
        }}
        platformId={platformId}
        onPlatformChange={setPlatformId}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-card min-w-0">
        {/* Header */}
        <header className="h-16 border-b flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input 
                type="text" 
                placeholder="搜索 Skills..." 
                className="w-full pl-9 pr-4 py-1.5 bg-muted/50 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 ml-4">
            <Button onClick={handleZipImport} className="gap-2 h-9">
              <Download size={16} />
              导入 .zip
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 group">
                <h2 className="text-2xl font-bold tracking-tight">{activeCategoryName}</h2>
                {isCustomCategory && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleEditCategory}
                  >
                    <Edit2 size={14} className="text-muted-foreground" />
                  </Button>
                )}
              </div>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                共 {skills.length} 个 Skill
              </span>
            </div>
            
            {activeCategoryId === 'all' ? (
              <Button 
                variant="outline" 
                onClick={handleScanLocal} 
                className="gap-3 h-[52px] border shadow-sm px-6 bg-muted/50 hover:bg-muted/80 transition-all rounded-lg"
                disabled={isScanning}
              >
                <RefreshCw size={18} className={isScanning ? "animate-spin text-primary" : "text-muted-foreground"} />
                <div className="flex flex-col items-start">
                  <span className="text-xs font-bold">同步本地 skill</span>
                  <span className="text-[10px] text-muted-foreground">扫描库目录并同步状态</span>
                </div>
              </Button>
            ) : (
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsImportLibraryOpen(true)}
                  className="gap-2 h-[52px] border shadow-sm px-4 bg-muted/50 hover:bg-muted/80 transition-all rounded-lg"
                >
                  <PlusCircle size={18} className="text-primary" />
                  <div className="flex flex-col items-start text-left">
                    <span className="text-xs font-bold">导入现有 Skill</span>
                    <span className="text-[10px] text-muted-foreground">从库中选择并添加到本分类</span>
                  </div>
                </Button>

                <div className="flex items-center gap-3 px-4 h-[52px] bg-muted/50 rounded-lg border shadow-sm">
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold">一键部署到 {platformId === 'claude' ? 'Claude' : 'Codex'}</span>
                    <span className="text-[10px] text-muted-foreground">{isCategoryEnabled ? '已启用符号链接' : '未部署'}</span>
                  </div>
                  <Switch 
                    checked={isCategoryEnabled} 
                    onCheckedChange={handleToggleCategory}
                  />
                </div>
              </div>
            )}
          </div>

          {skills.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-xl text-muted-foreground">
              <Code size={48} className="mb-4 opacity-20" />
              <p>暂无 Skill，点击右上方“导入”开始吧</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {skills.map((skill) => (
                <SkillCard 
                  key={skill.id} 
                  skill={skill} 
                  onToggle={handleToggleSkill}
                  onClick={(id) => console.log('Skill clicked:', id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onRefresh={fetchSkills}
      />
      <CategoryModal 
        isOpen={isCategoryModalOpen} 
        onClose={() => setIsCategoryModalOpen(false)} 
        onSuccess={fetchCategories}
        editData={editCategoryData}
      />
      <ImportFromLibraryModal
        isOpen={isImportLibraryOpen}
        onClose={() => setIsImportLibraryOpen(false)}
        categoryId={activeCategoryId}
        categoryName={activeCategoryName}
        onSuccess={fetchSkills}
        platformId={platformId}
      />
    </div>
  );
}

export default App;
