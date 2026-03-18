# SkillShelf 🗃️

SkillShelf 是一款专为 AI 开发者设计的 **Skill 管理与部署工具**。它能够帮助你统一管理散落在各个 AI 平台（如 Claude Code, Codex, Gemini 等）中的 Skill 文件，通过符号链接（Symlink）技术实现“一处编写，到处运行”。

---

## ✨ 核心功能

- **🚀 一键部署**：通过符号链接技术，将本地库中的 Skill 即时同步到 AI 平台的配置目录，无需手动复制。
- **📂 统一管理**：建立本地“真源”库，支持将 Skill 按需分类，一个 Skill 可同时属于多个分类。
- **🔍 智能扫描**：自动探测 AI 平台（Claude/Codex）的默认安装路径，支持一键从平台目录同步已有 Skill 到本地库。
- **📦 ZIP 导入**：支持将下载的 Skill 压缩包直接拖入或选择导入，自动解析 `SKILL.md` 元数据。
- **🟢 状态指示**：直观的分类启用状态指示灯，随时掌握各平台的部署情况。
- **🛠️ 配置检查**：内置路径有效性验证，确保开发环境始终可用。

## 🛠️ 技术栈

| 层级 | 技术选型 |
|------|----------|
| **框架** | [Tauri 2.x](https://tauri.app/) (Rust 后端) |
| **前端** | React 18 + TypeScript + Vite |
| **样式** | Tailwind CSS + shadcn/ui |
| **数据库** | SQLite (tauri-plugin-sql) |
| **图标** | Lucide React |

## 🚀 快速开始

### 1. 环境准备
确保你的电脑已安装：
- [Node.js](https://nodejs.org/) (建议 v18+)
- [Rust](https://www.rust-lang.org/) 环境 (安装 `rustup`)
- [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) (Windows 必需)

### 2. 安装与运行
```bash
# 克隆项目
git clone https://github.com/yourusername/SkillShelf.git
cd SkillShelf

# 安装依赖
npm install

# 启动开发模式
npm run tauri dev
```

### 3. 构建发布
```bash
npm run tauri build
```

## 🗺️ 路线图 (Roadmap)

- [x] **Phase 1: 核心基础**
  - [x] 符号链接部署引擎 (Rust)
  - [x] SQLite 数据库集成与多对多分类
  - [x] 本地存储库与平台路径自动探测
  - [x] UI 交互与乐观更新优化

- [ ] **Phase 2: 增强体验**
  - [ ] 导出已选分类为 ZIP
  - [ ] 支持更多 AI 平台 (OpenCode, Gemini 等)
  - [ ] 搜索过滤增强
  - [ ] 批量删除与批量重分类

- [ ] **Phase 3: 云端同步**
  - [ ] WebDAV 云同步支持
  - [ ] 多设备配置共享

---

## 📸 界面预览

*(请在此处插入你的截图)*

---

## 📄 开源协议

[MIT License](LICENSE)
