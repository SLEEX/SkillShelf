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

| 层级       | 技术选型                                    |
| ---------- | ------------------------------------------- |
| **框架**   | [Tauri 2.x](https://tauri.app/) (Rust 后端) |
| **前端**   | React 18 + TypeScript + Vite                |
| **样式**   | Tailwind CSS + shadcn/ui                    |
| **数据库** | SQLite (tauri-plugin-sql)                   |
| **图标**   | Lucide React                                |

## 📂 项目结构 (Project Structure)

为了保持项目整洁，我们将开发文件与规划文件进行了分离：

- **`development/`**：核心开发目录，包含所有源代码、配置文件和构建脚本。
- **`planning/`**：项目规划与文档目录，包含任务清单（tasks）、产品需求文档（PRD）和界面截图（screenshot）。
- **`releases/`**：存放打包后的应用程序（如 `.msi`, `.exe`）。此目录在 `.gitignore` 中已忽略，建议仅用于本地存放阶段性版本。

---

## � 使用指南 (Usage Guide)

### 1. 基础配置
- **设置本地库路径**：首次使用时，在“设置”中指定一个文件夹作为你的 **Skill 本地真源库**。
- **配置 AI 平台路径**：
    - 点击“检查路径状态”按钮，系统会自动尝试探测 `Claude` 或 `Codex` 的默认 Skill 存放目录。
    - 如果自动探测失败，你可以手动选择 AI 平台的 Skill 路径并保存。

### 2. 管理 Skill
- **同步本地 Skill**：点击主界面的“同步本地 Skill”按钮，系统会扫描本地库文件夹，并将新的 Skill 自动录入数据库。
- **导入 Skill (ZIP)**：
    - 点击“导入 Skill”按钮，选择一个包含 `SKILL.md` 或 `README.md` 的 ZIP 压缩包。
    - 系统会自动解析 Skill 名称和描述，并将其解压到你的本地库中。
- **分类管理**：
    - 在侧边栏创建不同的“分类”（如：前端、数据分析、自动化等）。
    - 选中分类后，点击“从库中导入”即可将已有的 Skill 关联到该分类。一个 Skill 可以属于多个分类。

### 3. 一键启用/部署
- **针对分类启用**：在某个分类页面，点击右上角的“一键启用 Claude/Codex”开关。
- **部署原理**：SkillShelf 会在 AI 平台的配置目录下创建指向本地库的 **符号链接 (Symlink)**。
    - **优点**：你在本地库修改 Skill 代码，AI 平台会即时生效，无需重复复制粘贴。
- **取消部署**：关闭开关即可安全移除符号链接，不会影响本地库中的源文件。

---

## �� 开发指南 (Development Guide)

### 1. 环境准备
确保你的电脑已安装：
- [Node.js](https://nodejs.org/) (建议 v18+)
- [Rust](https://www.rust-lang.org/) 环境 (安装 `rustup`)
- [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) (Windows 必需)

### 2. 安装与运行
所有开发操作请在 `development` 目录下进行：
```bash
# 进入开发目录
cd development

# 安装依赖
npm install

# 启动开发模式
npm run tauri dev
```

### 3. 构建发布
```bash
cd development
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
