Hello muse

---

# Muse Prompt Studio

专门为 AI 助手 Muse 生成高质量提示词的应用：一句话想法 → 引导式补齐参数 → 拼装出可直接粘贴给 Muse 的结构化提示词（中英双版本）。

完整的项目开发提示词见 [VIBE_CODING_PROMPT.md](./VIBE_CODING_PROMPT.md)。

## 本地启动

前置：Node.js 20+，pnpm 9（可用 `corepack enable` 启用）。

```bash
pnpm install
cp .env.example .env.local   # 按需填写 LLM 与 Supabase 配置，骨架阶段可留空
pnpm dev                     # 打开 http://localhost:3000
```

## 常用命令

```bash
pnpm test        # 单元测试（拼装与时间轴校验）
pnpm build       # 生产构建
pnpm lint        # 代码检查
```

## 结构一览

- `app/` 页面与 API 路由（首页、创作、模板库、历史）
- `components/` UI 组件（场景选择、分步表单、分镜编辑器、预览）
- `lib/` 纯逻辑：参数 schema、提示词拼装（builders）、时间轴校验、Muse 能力参数库
- `stores/` Zustand 状态（草稿自动保存到 localStorage）
- `templates/` 内置模板
- `locales/` 中英文案
