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

## Development Notes

- 目标平台：Phase 1 仅 Windows
- 界面语言：中文为主，支持中英文 Skill 描述并存
- App 不提供 Skill 编辑器，仅管理和部署
- PRD 文档位于 `tasks/prd-skillshelf.md`
