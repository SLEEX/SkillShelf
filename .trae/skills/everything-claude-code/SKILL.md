---
name: "everything-claude-code"
description: "集成 ECC 代理性能系统；当需要研究优先开发、质量门、循环验证、规则执行、模型路由等时调用。"
---

# Everything Claude Code（ECC）项目集成指南

## 作用
- 在本项目中规范使用 ECC 的命令、规则与工作流
- 提供可发现入口，帮助代理在需要时自动选择 ECC 能力

## 何时调用
- 需要研究优先（research-first）的开发流程与验证闭环
- 引入质量门（quality gate）、安全扫描与规则化约束
- 进行循环验证（loop-start/loop-status）与性能优化
- 使用模型路由、技能热加载、会话分支/搜索/导出

## 插件命令（示例）
- 命名空间形式（推荐）：
  - `/everything-claude-code:plan "添加用户认证"`
  - `/everything-claude-code:harness-audit`
  - `/everything-claude-code:quality-gate`
  - `/everything-claude-code:loop-start`
- 简短形式（手动安装别名后）：
  - `/plan "添加用户认证"`

## 本机规则安装（必需）
ECC 插件不自动分发 rules，需在本机安装。请在 PowerShell 执行：

```powershell
# 1) 克隆仓库
git clone https://github.com/affaan-m/everything-claude-code.git

# 2) 创建本地 rules 目录（如不存在）
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude\rules"

# 3) 复制通用 + 语言特定规则（按需选择技术栈）
Copy-Item -Recurse -Force "everything-claude-code\rules\common\*" "$env:USERPROFILE\.claude\rules\"
Copy-Item -Recurse -Force "everything-claude-code\rules\typescript\*" "$env:USERPROFILE\.claude\rules\"
Copy-Item -Recurse -Force "everything-claude-code\rules\python\*" "$env:USERPROFILE\.claude\rules\"
Copy-Item -Recurse -Force "everything-claude-code\rules\golang\*" "$env:USERPROFILE\.claude\rules\"
Copy-Item -Recurse -Force "everything-claude-code\rules\perl\*" "$env:USERPROFILE\.claude\rules\"
```

## 插件安装（IDE 内）
- 添加市场：
  - `/plugin marketplace add affaan-m/everything-claude-code`
- 安装插件：
  - `/plugin install everything-claude-code@everything-claude-code`
- 查看命令：
  - `/plugin list everything-claude-code@everything-claude-code`

## 运行时可选配置
- `ECC_HOOK_PROFILE=minimal|standard|strict` 控制 Hook 运行级别
- `ECC_DISABLED_HOOKS=...` 选择性禁用指定 Hook
- 遵循安全最佳实践，不提交或日志输出任何密钥

## 验证
- 安装完成后尝试：
  - `/everything-claude-code:plan "添加用户认证"`
  - `/everything-claude-code:harness-audit`
