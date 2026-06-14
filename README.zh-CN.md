# Useful Skills

**MIPyao 的开源 Agent Skills 集合，面向 Claude Code、Cursor、Codex 等所有支持 `SKILL.md` 格式的 AI 编程代理。**

[![skills.sh](https://skills.sh/b/MIPyao/useful-skills)](https://skills.sh/MIPyao/useful-skills) [![Vidwise Skill](https://img.shields.io/badge/skills-1-orange)](#skills-gallery) [![License: MIT](https://img.shields.io/github/license/MIPyao/useful-skills?style=flat-square&color=blue)](LICENSE) [![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](#贡献)

[English](./README.md) · [中文文档](./README.zh-CN.md)

---

## 目录

- [安装](#安装)
- [什么是 Skill？](#什么是-skill)
- [贡献](#贡献)
- [许可证](#许可证)

---

## Skills

### [`vidwise`](./skills/vidwise)

**类别：** 网页视频 / 演示工程  
**适合：** 把口播稿、文章、课程、产品演示和 talk 做成视频（网页模拟）。

![vidwise 示例](./assets/vidwise-example.png)

`vidwise` 用于构建适合录屏的 Vite + React + TypeScript 演示。它会把原始文章转成口播稿，把口播节拍映射成全屏视觉 step，在关键节点暂停让用户确认，并可在视觉 outline 确认后选择性合成口播音频。

亮点：

- 固定 1920×1080 舞台，并按视口缩放，适合稳定录屏
- 点击 / 键盘驱动 `(chapter, step)` 游标，一个口播节拍对应一个视觉 step
- 在稿子、主题、outline、开发模式和可选音频合成前设置硬 checkpoint
- 悬浮才出现的进度控制，录屏时画面保持干净
- 基于主题 token 的视觉架构，内置 **23 套主题**，每套独立设计签名
- **可插拔 TTS**：provider-agnostic 音频 runner，内置 3 个 provider（MiniMax、OpenAI、edge-tts）
- **可选 SRT 字幕生成**：从 mp3 时长生成字幕文件（需要 ffprobe/ffmpeg）
- 脚手架产出 Vite + React + TypeScript 项目，并附带舞台原语与录屏指南

链接：[README](./skills/vidwise/README.zh-CN.md) · [SKILL.md](./skills/vidwise/SKILL.md)

---

## 安装

### 方式 A · `skills` CLI（npx）

最快的、跨 Agent 通用的方式。直接使用社区标准的 [`npx skills` CLI](https://www.npmjs.com/package/skills)。

```bash
# 安装整个仓库（所有 Skill），最新版
npx skills add MIPyao/useful-skills

# 只安装 vidwise
npx skills add MIPyao/useful-skills -s vidwise

# 安装到全局 (~/.skills) 而不是当前项目 (./.skills)
npx skills add MIPyao/useful-skills -s vidwise --global
```

常用子命令：

```bash
npx skills list          # 看已安装了什么
npx skills find vidwise  # 在仓库内搜索
npx skills update        # 全部升级
npx skills remove vidwise  # 卸载
```

### 方式 B · Claude Code 插件市场

如果你用 [Claude Code](https://docs.anthropic.com/en/docs/claude-code)，可以订阅插件市场：

```bash
/plugin marketplace add MIPyao/useful-skills
/plugin install vidwise-skills@useful-skills
```

插件包定义在 [`.claude-plugin/marketplace.json`](./.claude-plugin/marketplace.json)：

| 插件包 | 包含的 Skills |
|--------|---------------|
| `vidwise-skills` | `vidwise` |

### 方式 C · Releases 钉版本 `.zip`

从 [GitHub Releases](https://github.com/MIPyao/useful-skills/releases) 下载固定版本的 `.zip`：

```bash
# 下载并解压到项目的 skills 目录
curl -fsSL -o vidwise.zip \
  "https://github.com/MIPyao/useful-skills/releases/latest/download/vidwise-latest.zip"
unzip -q vidwise.zip -d .claude/skills/
```

### 方式 D · 手动拷贝到项目

```bash
git clone https://github.com/MIPyao/useful-skills.git
cp -r useful-skills/skills/vidwise your-project/.claude/skills/
```

---

## 什么是 Skill？

**Skill** 就是 Agent 可以按需加载的一个自包含文件夹。它的核心是一个 `SKILL.md`（YAML frontmatter + 指令），按需配上 reference 文档、脚本和素材：

```
<skill-name>/
├── SKILL.md      ← 必需：什么时候用 + 怎么用
├── README.md     ← 给人看的文档
├── references/   ← 可选：Agent 按需加载的扩展文档
├── scripts/      ← 可选：确定性的可执行代码
└── assets/       ← 可选：模板、字体、图标等
```

Agent 会根据 frontmatter 里的 `description` 决定要不要激活这个 Skill。

---

## 贡献

欢迎提 issue、贡献新的 Skill、或者改进发版工具链。

---

## 许可证

MIT