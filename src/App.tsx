import { useState } from 'react';
import { 
  Search, 
  Plus, 
  Settings, 
  ChevronRight, 
  Folder, 
  Archive, 
  Code, 
  BarChart2, 
  Download,
  Bot
} from 'lucide-react';
import { cn } from './lib/utils';

function App() {
  const [activeCategory, setActiveCategory] = useState('前端开发');

  const categories = [
    { name: '全部 Skills', icon: Folder, count: 42 },
    { name: '未分类', icon: Archive, count: 3 },
    { name: '前端开发', icon: Code, count: 12, color: 'text-blue-500' },
    { name: '数据分析', icon: BarChart2, count: 8, color: 'text-green-500' },
  ];

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/30 flex flex-col shrink-0">
        <div className="p-4 flex items-center gap-2 border-b">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
            <Bot size={20} />
          </div>
          <h1 className="font-bold text-lg tracking-tight">SkillShelf</h1>
        </div>

        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          {/* AI Platform Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
              目标 AI 平台
            </label>
            <div className="flex items-center justify-between p-2 rounded-md border bg-card hover:bg-accent cursor-pointer transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-lg">🤖</span>
                <span className="text-sm font-medium">Claude Code</span>
              </div>
              <ChevronRight size={14} className="text-muted-foreground" />
            </div>
          </div>

          {/* Category Tree */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1 py-2">
              分类树 (CATEGORIES)
            </div>
            <div className="space-y-1">
              {categories.map((cat) => (
                <div
                  key={cat.name}
                  onClick={() => setActiveCategory(cat.name)}
                  className={cn(
                    "group flex items-center justify-between p-2 rounded-md cursor-pointer transition-all",
                    activeCategory === cat.name 
                      ? "bg-primary/10 text-primary" 
                      : "hover:bg-accent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <cat.icon size={18} className={cat.color} />
                    <span className="text-sm font-medium">{cat.name}</span>
                  </div>
                  <span className="text-xs font-medium bg-muted px-1.5 py-0.5 rounded-full group-hover:bg-accent-foreground/10">
                    {cat.count}
                  </span>
                </div>
              ))}
            </div>
            <button className="flex items-center gap-2 w-full p-2 mt-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors">
              <Plus size={16} />
              新建分类
            </button>
          </div>
        </div>

        <div className="p-4 border-t mt-auto">
          <button className="flex items-center gap-2 w-full p-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors">
            <Settings size={18} />
            设置与偏好
          </button>
        </div>
      </aside>

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
            <button className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors">
              <Download size={16} />
              导入 .zip
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight">{activeCategory}</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">共 12 个 Skill</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {/* Placeholder for Skill Cards */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="group p-4 rounded-xl border bg-card hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                    <Code size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex items-center h-6">
                    <div className="w-8 h-4 bg-primary/20 rounded-full relative">
                      <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-primary rounded-full" />
                    </div>
                  </div>
                </div>
                <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">Academic Forge</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  提供学术研究相关的 Skill 集合，支持论文检索、格式化和引文管理。
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 bg-muted rounded-md font-medium">Research</span>
                  <span className="text-[10px] px-2 py-0.5 bg-muted rounded-md font-medium">Academic</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
