# Muse Prompt Studio — Vibe Coding 项目开发提示词 / Project Development Prompt

本文件包含两个版本：先中文，后英文。两个版本内容一致，可任选其一粘贴给 AI 编程工具（如 Cursor、Claude Code、Windsurf 等）使用。
This file contains two equivalent versions: Chinese first, English second. Paste either one into an AI coding tool (Cursor, Claude Code, Windsurf, etc.).

---

# 中文版

你是一名资深全栈工程师。请从零开发一个名为 **Muse Prompt Studio** 的 Web 应用，严格按以下规格执行。开发过程中先输出项目结构规划，得到确认后再逐模块实现；每完成一个模块，说明改了哪些文件、如何运行验证。

## 一、项目概述

Muse Prompt Studio 是一个专门为 AI 助手 Muse 生成高质量提示词的应用。

背景：Muse 是 Meta 的个人 AI 助手，能生成视频、图片、文档，能查资料、订行程、购物等。用户发现，给 Muse 的提示词写得越结构化、越具体（时长、画幅、分镜、负面提示词等），产出质量越稳定。本应用把这套经验产品化：用户只需用大白话说出想要什么，应用通过引导式问答补齐关键参数，最终拼装出一份可以直接粘贴给 Muse 的、结构完整的提示词。

目标用户：经常使用 Muse 生成视频、图片和文档的创作者与普通用户，中英文双语人群。

核心价值：一句话想法 → 结构化专业提示词，全程不超过 1 分钟。

## 二、技术栈

- 前端：Next.js 14（App Router）+ React 18 + TypeScript（strict 模式）
- 样式：Tailwind CSS + shadcn/ui 组件库
- 状态管理：Zustand（轻量，管理多步表单与生成状态）
- 表单与校验：React Hook Form + Zod
- 后端：Next.js API Routes（同仓全栈），不单独起服务
- 数据库：Supabase（PostgreSQL），存用户、提示词模板、生成历史；本地开发可用 SQLite 替代
- AI 能力：通过服务端 API 调用大语言模型（接口层做抽象，模型可配置切换），API Key 只放服务端环境变量，禁止暴露到前端
- 国际化：next-intl，支持中文 / 英文界面切换
- 部署：Vercel 一键部署，提供 `.env.example` 说明全部环境变量
- 包管理：pnpm

## 三、核心功能

1. **场景选择**：首页提供场景卡片，首批场景包括：
   - AI 视频生成（本应用的旗舰场景，字段最完整）
   - AI 图片生成
   - 文档 / 报告写作
   - 行程规划
   - 通用任务（兜底场景，自由字段）
2. **引导式问答**：选定场景后进入分步表单，每步只问一件事，带进度条、可回退。视频场景的字段包括：时长、画幅（16:9 / 9:16 / 1:1）、风格（写实 / 电影感 / 纪录片等）、镜头运动、主体、环境、光线、分镜与时间轴、音频、负面提示词。
3. **分镜编辑器（视频场景专属）**：可视化增删分镜段，每段含起止时间、机位、画面内容；自动校验时间段连续、无重叠、总时长与目标时长一致，不一致时给出明确提示。
4. **智能补全**：用户只填必填项时，系统按场景最佳实践自动补齐可选项（如写实视频默认补上“无文字、无水印、无塑料质感”等负面提示词），补全内容在结果页明确标出，用户可逐项删除或修改。
5. **提示词拼装与预览**：按固定模板把表单拼成最终提示词，实时预览；提供中英文双版本输出（结构一致、内容互译）；一键复制；支持导出为 .md / .txt 文件。
6. **参数真实性校验**：内置 Muse 的能力参数库（例如：单段视频约 10 秒、生成文件实际为 720p——16:9 为 1280×720、9:16 为 720×1280、更长视频需分段拼接）。用户填了超出能力的参数时，在预览区给出醒目说明，避免提示词写了也实现不了。
7. **模板库**：内置常用模板（如“火车车窗一镜到底”“手机随手拍 POV”“产品展示短片”），用户可一键套用再改；支持把自己的成品存为个人模板。
8. **历史记录**：保存每次生成的提示词（含场景、参数、时间），可搜索、复用、删除；未登录用户存本地（localStorage），登录后同步到云端。
9. **用户系统**：邮箱 + 验证码 / 第三方登录（Supabase Auth），未登录可完整使用核心生成流程，登录只影响云端同步与个人模板。

## 四、交互逻辑

1. **主流程**：选场景 → 分步填写 → 实时预览 → 复制 / 导出。全程单页完成，不跳转丢失状态。
2. **表单行为**：每步自动保存草稿（刷新不丢）；必填项未填时“下一步”禁用并指出缺什么；分镜时间轴冲突时在对应段落标红并给出修正建议。
3. **预览区**：桌面端右侧常驻、移动端底部抽屉；表单任一字段变化，预览 300ms 内更新；中英文版本用标签页切换，两个版本内容保持同步（改一版，另一版标记为“待重新生成”而不是静默不一致）。
4. **生成状态**：智能补全调用 AI 时显示骨架屏与“正在补全”状态；失败时保留用户已填内容，提供重试，不整页报错。
5. **复制反馈**：复制成功显示 Toast“已复制，去粘贴给 Muse 吧”；导出文件命名格式：`muse-prompt-<场景>-<日期>.md`。
6. **空状态与引导**：首次进入显示 3 个示例想法（如“拍一段雨夜江南水乡的散步视频”），点一下即预填表单，让用户 10 秒内理解这个应用怎么用。
7. **移动优先**：竖屏手机是主要使用场景，所有流程在 375px 宽度下完整可用，按钮触达区不小于 44px。

## 五、开发规范

1. **代码规范**：TypeScript strict，禁止 `any`（特殊情况需注释理由）；ESLint + Prettier 统一风格；组件、函数使用有意义的英文命名；注释只写“为什么”，不写“是什么”。
2. **目录结构**：`app/`（路由与页面）、`components/`（UI 组件，按场景分子目录）、`lib/`（提示词拼装、校验、AI 调用等纯逻辑）、`stores/`（Zustand 状态）、`templates/`（内置模板数据）、`locales/`（双语文案）。业务逻辑禁止写进页面组件，必须沉到 `lib/` 并可单测。
3. **提示词拼装层**：每个场景一个独立的 builder 函数，输入是 Zod 校验过的参数对象，输出是 `{ zh: string, en: string }`；builder 必须是纯函数，配单元测试，覆盖时间轴校验和默认值补全。
4. **数据与安全**：所有 API Key、数据库密钥只走环境变量；API Routes 做参数校验和频率限制；用户数据按 user_id 隔离；不记录用户提示词全文到日志。
5. **测试**：核心逻辑（拼装、校验、模板套用）单元测试覆盖率不低于 80%；主流程（选场景→生成→复制）有一条端到端测试（Playwright）。
6. **提交规范**：Conventional Commits（feat / fix / docs / refactor…）；每个功能一个 PR 级别的完整提交，不提交半成品；`.env`、密钥文件进 `.gitignore`。
7. **交付要求**：README 写清本地启动步骤（安装、环境变量、运行、测试命令）；`pnpm build` 必须无报错无警告地通过；交付时逐项对照本提示词的“三、核心功能”自查并汇报完成情况，未实现的明确说明原因。

请先回复你对本项目的理解、项目结构规划和开发顺序（按模块拆分），等我确认后再开始写代码。

---

# English Version

You are a senior full-stack engineer. Build a web application called **Muse Prompt Studio** from scratch, strictly following the specification below. Before writing code, first present your understanding of the project, the folder structure, and a module-by-module build order; start implementing only after confirmation. After each module, report which files changed and how to run and verify it.

## 1. Project Overview

Muse Prompt Studio is an app that generates high-quality prompts specifically for Muse, Meta's personal AI assistant.

Background: Muse can generate videos and images, write documents, research topics, plan trips, shop, and more. In practice, the more structured and specific a prompt is (duration, aspect ratio, shot-by-shot timing, negative prompts), the more consistent Muse's output quality becomes. This app productizes that know-how: the user describes what they want in plain language, the app fills in the missing key parameters through a guided flow, and assembles a complete, structured prompt the user can paste straight into Muse.

Target users: creators and everyday users who regularly ask Muse to generate videos, images, and documents; bilingual (Chinese/English) audience.

Core value: one plain-language idea → a professional, structured prompt, in under a minute.

## 2. Tech Stack

- Frontend: Next.js 14 (App Router) + React 18 + TypeScript (strict mode)
- Styling: Tailwind CSS + shadcn/ui
- State management: Zustand (multi-step form and generation state)
- Forms & validation: React Hook Form + Zod
- Backend: Next.js API Routes (single-repo full stack, no separate service)
- Database: Supabase (PostgreSQL) for users, prompt templates, and generation history; SQLite acceptable for local development
- AI: server-side LLM API calls behind an abstraction layer (model configurable); API keys live only in server environment variables, never exposed to the client
- i18n: next-intl, Chinese / English UI switch
- Deployment: one-click Vercel deploy; provide `.env.example` documenting every environment variable
- Package manager: pnpm

## 3. Core Features

1. **Scenario picker**: home screen with scenario cards. Launch scenarios:
   - AI video generation (flagship scenario, richest field set)
   - AI image generation
   - Document / report writing
   - Trip planning
   - General task (fallback scenario with free-form fields)
2. **Guided flow**: after picking a scenario, a step-by-step form asks one thing at a time, with a progress bar and back navigation. Video-scenario fields: duration, aspect ratio (16:9 / 9:16 / 1:1), style (realistic / cinematic / documentary, etc.), camera movement, subject, environment, lighting, shot list with timeline, audio, negative prompt.
3. **Shot-list editor (video scenario)**: visually add/remove shot segments, each with start/end time, camera position, and visual content. Automatically validate that segments are continuous, non-overlapping, and sum to the target duration; show a clear message when they don't.
4. **Smart completion**: when the user fills only required fields, the system completes optional ones from scenario best practices (e.g., realistic video defaults to negative prompts like "no text, no watermark, no plastic look"). Completed items are clearly marked in the result and can be individually edited or removed.
5. **Prompt assembly & preview**: assemble the form into the final prompt using a fixed template, with live preview. Output in both Chinese and English (same structure, mutually translated). One-click copy; export as .md / .txt.
6. **Capability validation**: ship a built-in capability profile of Muse (e.g., each generated video clip is ~10 seconds; delivered files are 720p — 1280×720 for 16:9, 720×1280 for 9:16; longer videos must be generated in segments and stitched). When the user enters parameters beyond these capabilities, show a prominent note in the preview so the prompt never promises something Muse cannot deliver.
7. **Template library**: built-in templates (e.g., "train-window one-take", "handheld phone POV", "product showcase clip") that users can apply and modify; users can save their own results as personal templates.
8. **History**: save every generated prompt (scenario, parameters, timestamp); searchable, reusable, deletable. Guests store locally (localStorage); signed-in users sync to the cloud.
9. **Accounts**: email code / social login via Supabase Auth. The full generation flow works without an account; login only affects cloud sync and personal templates.

## 4. Interaction Logic

1. **Main flow**: pick scenario → step-by-step form → live preview → copy / export. Everything happens on a single page; no navigation may lose state.
2. **Form behavior**: auto-save drafts at every step (refresh-safe). The Next button is disabled until required fields are filled, with a hint naming what's missing. Timeline conflicts highlight the offending segment in red with a suggested fix.
3. **Preview pane**: persistent on the right on desktop, bottom drawer on mobile. Any field change updates the preview within 300ms. Chinese and English outputs are tabs and must stay in sync — editing one marks the other as "needs regeneration" rather than silently diverging.
4. **Generation states**: while smart completion calls the AI, show a skeleton with a "completing…" state. On failure, keep everything the user entered, offer retry, never error out the whole page.
5. **Copy feedback**: on successful copy, show a toast: "Copied — go paste it to Muse". Export filename format: `muse-prompt-<scenario>-<date>.md`.
6. **Empty state & onboarding**: on first visit, show three example ideas (e.g., "a walking video through a rainy Jiangnan water town") that pre-fill the form in one tap, so users understand the app within 10 seconds.
7. **Mobile first**: phones in portrait are the primary device. Every flow must work fully at 375px width; tap targets at least 44px.

## 5. Development Standards

1. **Code standards**: TypeScript strict; no `any` (exceptions require a comment explaining why). ESLint + Prettier enforced. Meaningful English names for components and functions. Comments explain "why", never "what".
2. **Structure**: `app/` (routes and pages), `components/` (UI, subfoldered by scenario), `lib/` (pure logic: prompt assembly, validation, AI calls), `stores/` (Zustand state), `templates/` (built-in template data), `locales/` (bilingual copy). No business logic inside page components — it belongs in `lib/` and must be unit-testable.
3. **Prompt assembly layer**: one builder function per scenario. Input is a Zod-validated parameter object; output is `{ zh: string, en: string }`. Builders must be pure functions with unit tests covering timeline validation and default completion.
4. **Data & security**: all API keys and database secrets via environment variables only. API routes validate input and rate-limit. User data isolated by user_id. Never log the full text of user prompts.
5. **Testing**: at least 80% unit-test coverage on core logic (assembly, validation, template application). One end-to-end test (Playwright) for the main flow: pick scenario → generate → copy.
6. **Commits**: Conventional Commits (feat / fix / docs / refactor…). One complete feature per PR-sized commit; no half-finished commits. `.env` and secret files in `.gitignore`.
7. **Delivery**: README documents local setup (install, environment variables, run, test commands). `pnpm build` must pass with zero errors and zero warnings. On delivery, self-check against every item in "3. Core Features" and report completion status; explicitly explain anything not implemented.

First reply with your understanding of the project, the proposed folder structure, and the module-by-module build order. Wait for my confirmation before writing code.
