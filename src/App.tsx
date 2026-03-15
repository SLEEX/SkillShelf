import { useState, useEffect } from 'react';
import { 
  Search, 
  Folder, 
  Archive, 
  Code, 
  BarChart2, 
  Download,
} from 'lucide-react';
import { Sidebar, Category } from './components/layout/Sidebar';
import { SkillCard, Skill } from './components/skill/SkillCard';
import { SettingsModal } from './components/layout/SettingsModal';
import { getAllCategories, getSkillsByCategory, toggleSkillStatus, getCategoryStatus } from './services/skillService';
import { pickAndImportSkill } from './services/importService';
import { toggleCategoryDeployment, deployCategoryToPlatform } from './services/deployService';
import { Button } from './components/ui/Button';
import { Switch } from './components/ui/Switch';

function App() {
  const [activeCategoryId, setActiveCategoryId] = useState('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [platformId, setPlatformId] = useState('claude');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCategoryEnabled, setIsCategoryEnabled] = useState(false);

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
    const cats = await getAllCategories();
    // Add "All Skills" manually
    const allCount = cats.reduce((acc, curr) => acc + (curr.count || 0), 0);
    const formattedCats: Category[] = [
      { id: 'all', name: '全部 Skills', icon: Folder, count: allCount },
      ...cats.map(c => ({
        id: c.id,
        name: c.name,
        icon: c.id === 'unclassified' ? Archive : (c.name === '数据分析' ? BarChart2 : Code),
        count: c.count || 0,
        color: c.id === 'unclassified' ? '' : (c.name === '数据分析' ? 'text-green-500' : 'text-blue-500')
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
    await toggleSkillStatus(id, platformId, enabled);
    // If category is enabled, we need to update symlinks
    if (activeCategoryId !== 'all') {
      await deployCategoryToPlatform(activeCategoryId, platformId);
    }
    fetchSkills();
  };

  const handleToggleCategory = async (enabled: boolean) => {
    if (activeCategoryId === 'all') return;
    try {
      await toggleCategoryDeployment(activeCategoryId, platformId, enabled);
      fetchSkills();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleImport = async () => {
    try {
      const result = await pickAndImportSkill();
      if (result) {
        fetchSkills();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const activeCategoryName = categories.find(c => c.id === activeCategoryId)?.name || 'Skills';

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans">
      <Sidebar 
        activeCategoryId={activeCategoryId} 
        onCategoryChange={setActiveCategoryId}
        categories={categories}
        onOpenSettings={() => setIsSettingsOpen(true)}
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
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded-full">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              最后同步: 5 分钟前
            </div>
            <Button onClick={handleImport} className="gap-2 h-9">
              <Download size={16} />
              导入 .zip
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold tracking-tight">{activeCategoryName}</h2>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                共 {skills.length} 个 Skill
              </span>
            </div>
            
            {activeCategoryId !== 'all' && (
              <div className="flex items-center gap-3 px-4 py-2 bg-muted/50 rounded-lg border shadow-sm">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold">一键部署到 {platformId === 'claude' ? 'Claude' : 'Codex'}</span>
                  <span className="text-[10px] text-muted-foreground">{isCategoryEnabled ? '已启用符号链接' : '未部署'}</span>
                </div>
                <Switch 
                  checked={isCategoryEnabled} 
                  onCheckedChange={handleToggleCategory}
                />
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

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}

export default App;
