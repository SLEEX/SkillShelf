# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SkillShelf 是一款面向个人 AI 开发者的桌面端 Skill 管理工具，用于跨平台（Claude Code、Codex、Gemini、OpenCode）统一管理、分类和部署 AI Skill 文件。

## Tech Stack

| 层级 | 技术选型 |
|------|----------|
| 桌面框架 | Tauri 2.x（Rust 后端） |
| 前端框架 | React 18 + TypeScript |
| 样式 | Tailwind CSS + shadcn/ui |
| 图标库 | [IconPark](https://github.com/bytedance/iconpark)（`@icon-park/react`） |
| 本地数据库 | SQLite（tauri-plugin-sql） |
| 构建打包 | Tauri bundler（生成 Windows .exe 安装包） |
| 云同步（Phase 2） | WebDAV 客户端 |

## Common Commands

```bash
# 前端开发
pnpm install          # 安装依赖
pnpm dev              # 启动前端开发服务器
pnpm build            # 构建前端

# Tauri 开发
pnpm tauri dev        # 启动 Tauri 开发模式（含热重载）
pnpm tauri build      # 构建生产版本 .exe 安装包

# 代码质量
pnpm lint             # ESLint 检查
pnpm typecheck        # TypeScript 类型检查
```

## Architecture

### 核心设计决策

1. **符号链接（symlink）部署** — Skill 部署到 AI 平台时创建 symlink 指向本地库原始文件，不复制文件。以追加模式操作，不影响平台目录中非本 App 管理的文件。

2. **离线优先** — 所有网络操作（云同步）为可选，离线状态下 App 完整可用。

3. **多对多关系** — 一个 Skill 可同时属于多个分类，通过 SQLite 中间表实现。

### 布局结构

参考 Obsidian / Raycast 风格：
- 左侧栏：分类树 + 平台选择器
- 主区域：Skill 卡片列表（列表/网格切换）
- 右侧面板：Skill 详情 + 中文备注编辑

### 各平台默认 Skill 目录

```
Claude Code:  ~/.claude/skills/
Codex:        ~/.codex/skills/
Gemini:       ~/.gemini/skills/
OpenCode:     ~/.opencode/skills/
```

## Git Commit 规则

开发过程中需要**主动**在合适的时机提交 git commit，不需要等用户要求：

- 完成一个完整的功能模块或用户故事（如 US-001 ~ US-006）
- 完成一个有意义的阶段性里程碑（如项目初始化、数据库 schema 建立、核心组件搭建）
- 完成一轮重构或 bug 修复
- 进行了大量文件变更（超过 5 个文件），避免积累过多未提交的改动

Commit message 使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式，中文描述：
```
feat: 实现 Skill 导入功能
fix: 修复分类删除时 symlink 未清理的问题
refactor: 重构部署状态管理逻辑
chore: 项目初始化 Tauri + React 脚手架
```

## Development Notes

- 目标平台：Phase 1 仅 Windows
- 界面语言：中文为主，支持中英文 Skill 描述并存
- App 不提供 Skill 编辑器，仅管理和部署
- PRD 文档位于 `tasks/prd-skillshelf.md`
