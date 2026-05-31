# CycleCoach Agent Engineering Guide

这份文档用于两件事：

1. 让开发者能独立理解并复刻一个类似的生产级 Web + AI Agent 产品。
2. 让你在面试中能清楚讲出产品目标、前端、后端、Agent、数据、安全、测试、CI/CD、云架构与未来演进。

当前产品是一个 local-first cycling coach AI agent：

```text
注册/登录 -> 连接 Strava -> 同步最近骑行 -> Dashboard 查看地图和指标 -> AI 分析活动 -> Planner 根据近期训练和路线历史推荐下一次骑行
```

核心工程原则：

- MVP 先跑通真实闭环，不提前上重架构。
- TypeScript deterministic logic 负责运动指标和路线匹配。
- LLM 负责解释、总结、自然语言表达，不负责编造数据。
- Strava token 只留在服务端。
- SQLite 支撑 MVP；PostgreSQL/PostGIS 留给 Beta/Production。
- 本地 Ollama 优先，云端 LLM 后续可选。

---

## 1. Product And User Flow

### 1.1 产品定位

CycleCoach Agent 是一个面向骑行用户的 AI 教练产品。它不是简单聊天机器人，而是结合用户真实 Strava activities、路线轨迹、训练负荷和本地 LLM 的骑行教练。

核心能力：

- 连接 Strava。
- 同步最近 cycling activities。
- 展示 activity list、地图 route、指标卡。
- 对单次骑行做 AI 分析。
- 根据最近训练记忆和路线历史规划下一次骑行。
- 支持普通 sports coach chat，并自动注入最近训练记忆。

### 1.2 MVP 主路径

```text
Home
  -> Register/Login
  -> My Page: Connect Strava
  -> Dashboard: Sync latest 30 cycling activities
  -> Select activity
  -> Inspect metrics + route map
  -> Ask AI to analyze
  -> Planner: Plan next ride based on recent activities/routes
```

### 1.3 页面职责

| Page | Route | Primary Goal |
|---|---|---|
| Home | `/` | 产品状态和主入口 |
| Coach | `/coach` | 普通 sports/cycling chat，自动带近期训练记忆 |
| Dashboard | `/dashboard` | 唯一训练数据中心，activity list + map + analysis |
| Planner | `/planner` | 下一次骑行计划，结合近期训练和路线历史 |
| My Page | `/me` | 账号、Strava、语言、Ollama、隐私 |
| Activity detail | `/activities/[id]` | 单活动深度详情入口 |

面试表达：

> 我把产品的信息架构收敛成几个明确入口，避免 Home 和 Dashboard 重复。Dashboard 是唯一数据中心，Planner 是独立的下一次训练决策页，Coach 是通用问答页，My Page 管理外部连接和设置。这样用户路径短，页面职责也清晰。

---

## 2. Repository And Dependency Management

### 2.1 包管理

项目使用 `pnpm`：

```json
"packageManager": "pnpm@9.15.0"
```

原因：

- 安装快。
- lockfile 稳定。
- 适合未来 monorepo。
- 工作区和依赖去重能力强。

不使用 npm/yarn/bun，是为了降低团队协作中的命令分裂。

### 2.2 核心依赖

| Category | Dependency | Purpose |
|---|---|---|
| Framework | `next`, `react`, `react-dom` | App Router 全栈应用 |
| DB/ORM | `prisma`, `@prisma/client` | SQLite MVP 数据访问 |
| State | `@tanstack/react-query`, `zustand` | Server state + UI state |
| Validation | `zod` | API input/output schema |
| Forms | `react-hook-form` | 设置页复杂表单预留 |
| Maps | `leaflet` | 免费 OSM 地图 |
| Charts | `recharts` | 数据图表预留 |
| Lint/Format | `@biomejs/biome` | 统一代码风格 |
| Tests | `vitest`, Testing Library, Playwright, axe | unit/component/e2e/a11y |
| Dead code | `knip` | 未用依赖/导出审计 |

### 2.3 命令设计

开发：

```bash
pnpm dev
pnpm dev:turbo
```

质量：

```bash
pnpm lint
pnpm format
pnpm format:check
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm quality:unused
pnpm build
pnpm verify
```

数据库：

```bash
pnpm db:generate
pnpm db:push
pnpm db:seed
pnpm db:studio
```

Ollama：

```bash
pnpm ollama:up
pnpm ollama:list
pnpm ollama:pull
pnpm ollama:pull:3b
pnpm ollama:pull:7b
pnpm ollama:smoke
```

设计思路：

- `typecheck` 专门做 TS 静态检查。
- `lint` 专门做 Biome lint。
- `test` 专门跑 unit tests。
- `build` 做 production build。
- `verify` 聚合关键质量门禁。

面试表达：

> 我把命令分层成开发、质量、数据库、LLM 四类。这样团队成员能快速知道每个命令的职责，CI 也可以直接复用本地命令，避免本地和 CI 行为不一致。

---

## 3. Directory Architecture

当前目录结构采用“App Router + feature-first + shared lib”的轻量架构。

```text
app/
components/
features/
lib/
prisma/
tests/
scripts/
docs/
.github/workflows/
```

### 3.1 `app/`

职责：

- Next.js 路由组织。
- 页面入口。
- API route handler。
- 不承载复杂业务逻辑。

例子：

```text
app/page.tsx
app/dashboard/page.tsx
app/planner/page.tsx
app/api/planner/generate/route.ts
app/api/coach/chat/route.ts
```

设计原则：

- `page.tsx` 组合 feature/components。
- `route.ts` 做请求入口、auth、schema parse、service 调用、response。
- 不在 API route 里堆业务算法。

### 3.2 `components/`

职责：

- 跨 feature 复用 UI。
- layout/navigation。
- 通用 feedback。
- activity/map/coach 等已存在业务组件。

主要子目录：

```text
components/ui/
components/layout/
components/dashboard/
components/activity/
components/map/
components/coach/
components/settings/
components/ai/
```

### 3.3 `features/`

职责：

- 业务 feature-first 模块。
- 新功能优先放这里，而不是继续堆 `lib/`。

当前重要 feature：

```text
features/agent/
features/planner/
```

`features/agent/` 是本项目现在最核心的智能层：

```text
features/agent/
  data/
  memory/
  prompts/
  schemas/
  services/
  tools/
  types/
```

### 3.4 `lib/`

职责：

- 基础设施。
- provider。
- shared utility。
- API hooks。
- auth/session。
- Strava integration。

例子：

```text
lib/ai/
lib/api/
lib/auth/
lib/db/
lib/strava/
lib/query/
lib/stores/
```

### 3.5 `prisma/`

职责：

- `schema.prisma`
- seed
- SQLite dev DB

### 3.6 `tests/`

职责：

- unit tests。
- E2E tests。
- 未来 integration tests。

当前：

```text
tests/fitness/metrics.test.ts
tests/unit/agent/agent-tools.test.ts
tests/e2e/home.spec.ts
```

面试表达：

> 我没有一开始做 monorepo，因为 MVP 是单应用闭环。目录上先用 App Router 做路由入口，用 features 管业务模块，用 lib 放基础设施。这样比“所有东西都塞 lib”更清晰，也比过早 monorepo 更轻。

---

## 4. Frontend Architecture

### 4.1 App Router 页面设计

页面入口都在 `app/`：

```text
app/page.tsx
app/dashboard/page.tsx
app/coach/page.tsx
app/planner/page.tsx
app/me/page.tsx
```

页面职责：

- Server Component 负责 auth/i18n/server data 初始化。
- Client Component 负责用户交互、TanStack Query、Zustand state。
- 页面本身尽量薄。

例子：

`app/planner/page.tsx` 只加载 Planner page component，不把 planner 规则写进 route。

### 4.2 Component Design

组件分层：

1. UI primitives
2. Layout components
3. Feature components
4. Data-aware client components

UI primitives：

```text
components/ui/button.tsx
components/ui/status-pill.tsx
components/ui/action-card.tsx
components/ui/empty-state.tsx
components/ui/error-state.tsx
components/ui/loading-card.tsx
components/ui/icons.tsx
```

Layout：

```text
components/layout/app-shell.tsx
components/layout/top-nav.tsx
components/layout/mobile-tab-nav.tsx
components/layout/nav-links.tsx
```

Feature UI：

```text
components/dashboard/*
components/coach/*
features/planner/components/*
```

设计原则：

- UI primitive 不知道业务。
- Feature component 可以知道业务 schema。
- Page 只组合组件。
- 有 loading/empty/error/fallback。

### 4.3 Styling System

使用 Tailwind CSS + 本地 design tokens。

主要配置：

```text
tailwind.config.ts
app/globals.css
```

全局视觉原则：

- bright
- clean
- athletic
- mobile-first
- card-based but not admin-heavy
- 用少量 orange/green 表达运动能量

全局 class：

```css
.cc-container
.cc-card
.cc-card-muted
.cc-section-label
.cc-icon-tile
.cc-kinetic-bg
.cc-interactive
```

为什么不直接上 shadcn：

- MVP 已经有轻量 UI primitives。
- `shadcn init` 会引入新的组件规范和配置变动。
- 在 design system 稳定前，先保持轻量更可控。

面试表达：

> UI 上我没有把所有东西套进大型组件库，而是抽了一套轻量 primitives。这样一方面保持视觉统一，另一方面避免 MVP 被组件库迁移成本拖住。未来如果要上 shadcn，可以按组件逐步迁移。

### 4.4 Form Validation

当前复杂表单不多，主要输入来自：

- login/register HTML form
- planner controls
- settings cards
- API JSON body

验证策略：

- API 层使用 Zod。
- 前端表单简单时用 HTML constraints。
- 设置页复杂化后使用 React Hook Form + Zod。

例子：

```ts
const RidePlanInputSchema = z.object({
  durationMinutes: z.number().int().min(20).max(360),
  goal: PlannerGoalSchema,
  readiness: ReadinessSchema,
  routePreference: RoutePreferenceSchema.default("not_sure"),
  useLatestRideContext: z.boolean().default(true)
});
```

设计原则：

- 关键安全边界一定在后端验证。
- 前端验证主要改善 UX。
- 不信任浏览器传入的数据。

### 4.5 State Management

状态分三类：

| State Type | Tool | Examples |
|---|---|---|
| Server/API state | TanStack Query | activities, settings, Strava status, LLM health |
| UI state | Zustand | selectedActivityId, chat draft, selected activity |
| Form state | HTML / React Hook Form | login/settings/planner input |

TanStack Query：

```text
lib/query/query-provider.tsx
lib/query/keys.ts
lib/api/*.ts
features/planner/api/planner.ts
```

Zustand：

```text
lib/stores/use-dashboard-store.ts
lib/stores/use-chat-store.ts
lib/stores/use-app-store.ts
```

为什么这样分：

- Server state 需要 caching、refetch、mutation invalidation。
- UI state 不应该被 TanStack Query 持久缓存。
- Form state 不应该放进 Zustand。

面试表达：

> 我没有把所有状态都塞进 useState 或 Zustand。服务端数据用 TanStack Query，因为它需要缓存、失效和重试；UI 暂态用 Zustand；表单校验用 Zod/React Hook Form。这个分层能避免状态污染。

### 4.6 API Hooks

浏览器侧不直接到处写 `fetch`，而是封装：

```text
lib/api/client.ts
lib/api/activities.ts
lib/api/coach.ts
lib/api/settings.ts
lib/api/strava.ts
lib/api/agent.ts
features/planner/api/planner.ts
```

例子：

```ts
export function useCoachChatMutation() {
  return useMutation({
    mutationFn: (input: CoachChatRequest) =>
      apiPost<CoachChatResponse>("/api/coach/chat", input)
  });
}
```

好处：

- 统一 error parsing。
- UI 组件不散落 fetch。
- hooks 命名清楚。
- 后续 API 迁移成本低。

### 4.7 Route And Navigation Design

主导航：

```text
Home
Coach
Rides/Dashboard
Plan
Me
```

移动端：

- bottom nav。
- 5 个入口。
- icon + label。

桌面端：

- top nav。
- auth buttons。

设计原则：

- 不重复概念。
- 不把所有动作塞进 nav。
- 重要动作放页面内部 CTA。

### 4.8 Map Frontend

当前地图方案：

- Leaflet。
- OpenStreetMap tile。
- route 来源：
  1. streams latlng
  2. `summaryPolyline`
  3. no route data state

相关文件：

```text
components/map/activity-map.tsx
components/map/leaflet-activity-map.tsx
lib/map/polyline.ts
lib/map/route-points.ts
```

Next.js 注意点：

- Leaflet 是 browser-only，需要 client component / dynamic import。
- 地图容器必须有明确高度。
- polyline decode 必须在前端地图渲染前完成。

### 4.9 Frontend Testing

Unit/component：

```bash
pnpm test
```

E2E：

```bash
pnpm playwright:install
pnpm test:e2e
```

当前 E2E：

```text
tests/e2e/home.spec.ts
```

包含：

- Home 主入口可见。
- axe accessibility smoke test。

未来应补：

- login/register flow。
- Strava mock sync。
- dashboard select activity。
- planner generate plan。
- coach chat fallback。

---

## 5. Backend API Architecture

### 5.1 Route Handler Design

API 在 `app/api/**/route.ts`。

原则：

- route handler 不写复杂业务逻辑。
- route handler 只做：
  - parse request
  - auth/session
  - call service
  - response

例子：

```ts
export async function POST(request: Request) {
  const user = await getCurrentUser();
  const response = await runPlannerAgent(await request.json(), user?.id);
  return NextResponse.json(response);
}
```

这样 Planner 的复杂逻辑不在 route 里，而在：

```text
features/agent/services/planner-agent.ts
```

### 5.2 API List

| API | Purpose |
|---|---|
| `GET /api/health` | App health |
| `GET /api/llm/health` | Ollama health |
| `GET /api/settings` | User settings |
| `PATCH /api/settings` | Update settings |
| `GET /api/auth/strava` | Start Strava OAuth |
| `GET /api/auth/strava/callback` | OAuth callback |
| `POST /api/auth/strava/disconnect` | Disconnect Strava |
| `GET /api/strava/status` | Strava connection status |
| `POST /api/strava/sync` | Sync latest activities |
| `GET /api/strava/activities` | Activity list |
| `GET /api/strava/activities/[id]` | Activity detail |
| `POST /api/strava/activities/[id]` | Refresh detail/streams |
| `POST /api/activities/[id]/analyze` | AI activity analysis |
| `GET /api/activities/[id]/analysis` | Latest analysis |
| `POST /api/coach/chat` | Coach chat |
| `POST /api/planner/generate` | Planner agent |
| `GET /api/agent/training-memory` | Debug compact training memory |

### 5.3 Request Validation

使用 Zod。

Planner：

```ts
RidePlanInputSchema.parse(input)
```

Chat：

```ts
CoachChatInputSchema.parse(input)
```

好处：

- 防止非法 goal/readiness。
- 避免 API 逻辑处理 unknown shape。
- 输出 schema 可配合 LLM JSON parse 做安全 fallback。

### 5.4 Error Handling

当前策略：

- Strava client 对 HTTP status 转换成明确错误：
  - `STRAVA_RATE_LIMITED`
  - `STRAVA_UNAUTHORIZED`
  - `STRAVA_FORBIDDEN_OR_INSUFFICIENT_SCOPE`
- API client 统一 parse response。
- Ollama fail 时 fallback rule-based output。

未来生产化：

- API error class。
- request id。
- structured logs。
- Sentry error capture。
- OpenTelemetry trace。

---

## 6. Database And Schema Design

### 6.1 Why SQLite For MVP

当前使用：

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

原因：

- 本地开发零成本。
- 不需要 Docker Postgres 才能跑。
- 数据规模小。
- 当前主要需求是缓存 Strava activity 和 local settings。
- 路线只是展示和简单候选匹配，不做空间查询。

面试表达：

> 我没有为了“企业级”一开始上 PostgreSQL/PostGIS。MVP 需要验证的是 Strava -> activity -> map -> analysis -> planner 闭环，SQLite 足够。等到需要空间查询、附近路线、风险区域叠加、多用户部署，再迁移 PostgreSQL/PostGIS。

### 6.2 Main Models

#### User

本地账号：

```prisma
model User {
  id
  email
  passwordHash
  name
  accounts
  activities
  analyses
  settings
}
```

#### ConnectedAccount

外部账号连接：

```prisma
provider = "strava"
providerUserId
status
lastSyncedAt
```

#### OAuthToken

服务器侧 token：

```prisma
accessToken
refreshToken
expiresAt
scope
```

MVP 是 SQLite 明文存储。Production 必须加密 refresh token。

#### StravaActivity

核心活动缓存：

```prisma
stravaId
name
sportType
startDate
distanceMeters
movingTimeSec
totalElevationGain
averageHeartrate
averageWatts
summaryPolyline
rawSummaryJson
rawDetailJson
computedMetrics
```

#### StravaActivityStream

按需拉取 streams：

```prisma
streamsJson
availableKeys
latlngCount
```

#### ActivityAnalysis

AI activity analysis：

```prisma
deterministicResult
aiResult
analysisJson
model
confidence
fallbackUsed
```

#### UserSettings

```prisma
language
llmProvider
ollamaBaseUrl
ollamaModel
preferredUnits
```

#### CoachConversation / CoachMessage

保存 chat history。

### 6.3 Future PostgreSQL/PostGIS Migration

何时迁移：

- 生产多用户。
- OAuth token encryption。
- spatial route search。
- risk zones。
- route overlap query。
- performance/backup 需求。

迁移路线：

```text
SQLite String JSON -> PostgreSQL jsonb
summaryPolyline -> decoded LineString geometry
StravaActivityStream latlng -> route_points
simple route cards -> spatial route recommendation
```

未来表草案：

```prisma
model Route {
  id
  userId
  sourceActivityId
  name
  distanceM
  elevationM
  geometry LineString
  raw Json
}

model RiskZone {
  id
  type
  severity
  geometry Polygon
  source
  updatedAt
}
```

---

## 7. Authentication And Security

### 7.1 Local Auth

当前 flow：

```text
Register/Login -> session cookie -> Connect Strava
```

关键文件：

```text
lib/auth/password.ts
lib/auth/session.ts
app/api/auth/login/route.ts
app/api/auth/register/route.ts
app/api/auth/logout/route.ts
```

基本策略：

- password hash。
- session cookie 存 user id。
- server route 使用 `getCurrentUser()`。
- 未登录时不能访问他人数据。

### 7.2 Strava OAuth Security

关键 flow：

```text
GET /api/auth/strava
  -> generate state
  -> set oauth state cookie
  -> redirect Strava

GET /api/auth/strava/callback
  -> verify code/state
  -> exchange token
  -> upsert account/token
```

安全点：

- 使用 OAuth state 防 CSRF。
- token 不返回前端。
- Strava data scope by `userId`。
- refresh token 存 server DB。

Production 必做：

- refresh token encryption。
- cookie secure/sameSite/httpOnly。
- audit logs。
- rate limit。
- secret manager。

### 7.3 LLM Data Privacy

当前默认：

- local Ollama。
- 不发送到第三方 LLM。
- Prompt 使用 compact summary。
- 不传 raw streams。
- 不传 OAuth tokens。

面试表达：

> 我把 LLM 放在解释层，不把它当数据库或计算引擎。传给模型的是经过压缩和脱敏的训练记忆，而不是完整 Strava 原始数据或 token。这样既降低隐私风险，也降低 prompt token 成本。

---

## 8. Strava Integration

### 8.1 Client

关键文件：

```text
lib/strava/client.ts
```

方法：

```ts
listActivities(page, perPage)
getActivity(stravaId)
getActivityStreams(stravaId)
```

Streams keys：

```text
time
latlng
distance
altitude
velocity_smooth
heartrate
cadence
watts
temp
moving
grade_smooth
```

### 8.2 Sync Strategy

关键文件：

```text
lib/strava/sync.ts
```

策略：

- 首次同步最近 30 条。
- 只保留 cycling-like activities。
- detail/streams 按需拉取。
- access token 过期自动 refresh。
- 更新 `lastSyncedAt`。

为什么按需拉 streams：

- Strava rate limit。
- streams 数据量大。
- 只有用户选择分析/查看某 ride 时才需要。

### 8.3 Activity Mapping

Strava payload 映射为本地字段：

```ts
distance -> distanceMeters
moving_time -> movingTimeSec
total_elevation_gain -> totalElevationGain
map.summary_polyline -> summaryPolyline
```

这样 UI 和 Agent 不依赖 Strava 原始字段命名。

---

## 9. Activity Analysis Architecture

Activity analysis 分两层：

```text
deterministic metrics -> LLM rewrite/structure -> UI cards
```

关键文件：

```text
lib/fitness/metrics.ts
lib/analysis/deterministic.ts
lib/analysis/activity-analysis.ts
lib/ai/prompts.ts
lib/ai/parse-analysis.ts
components/ai/*
components/activity/analysis-panel.tsx
```

原则：

- TS 计算距离、时间、强度、分类、confidence。
- LLM 只负责解释。
- LLM JSON parse 失败时 fallback。
- 缺 HR/power 不编造。

面试表达：

> 我把运动科学计算和 LLM 解释分离。这样即使本地小模型输出不稳定，基础分析仍可用，而且不会让模型编造 FTP、心率区间或功率区间。

---

## 10. Agent Architecture

### 10.1 Why Agent Layer

最初 Planner 只是根据表单输出模板，比如 “Z2 ride”。这不够像教练。

现在 Agent 需要：

- 读取最近 activities。
- 构建训练记忆。
- 提取路线历史。
- 匹配具体 route candidates。
- 生成 deterministic plan。
- 再让 LLM refine。

因此新增：

```text
features/agent/
```

### 10.2 Agent Structure

```text
features/agent/
  data/
    route-catalog.ts
  memory/
    build-training-memory.ts
    compact-activity-memory.ts
  prompts/
    coach-system.prompt.ts
    planner.prompt.ts
    chat.prompt.ts
  schemas/
    ride-plan.schema.ts
    route-candidate.schema.ts
    training-memory.schema.ts
  services/
    planner-agent.ts
    coach-chat-agent.ts
    tool-registry.ts
  tools/
    extract-route-history.ts
    generate-deterministic-ride-plan.ts
    get-latest-activity.ts
    get-recent-activities.ts
    match-route-candidates.ts
    summarize-training-load.ts
```

### 10.3 Agent Flow

Planner:

```text
validate input
  -> buildTrainingMemory
  -> getRecentActivities
  -> extractRouteHistory
  -> getRouteCatalog
  -> matchRouteCandidates
  -> generateDeterministicRidePlan
  -> buildPlannerPrompt
  -> call Ollama
  -> parse RidePlanSchema
  -> fallback if invalid
```

Chat:

```text
validate input
  -> buildTrainingMemory
  -> optional selected activity context
  -> buildCoachChatPrompt
  -> call Ollama
  -> fallback rule-based response
  -> save conversation
```

### 10.4 Tools

Tools are deterministic:

- They fetch data.
- They calculate summaries.
- They score routes.
- They do not call LLM.

Examples:

```text
getRecentActivities
summarizeTrainingLoad
extractRouteHistory
matchRouteCandidates
generateDeterministicRidePlan
```

Why this matters:

- Easy to test.
- No hidden model reasoning.
- Reproducible output.
- Better debugging.

### 10.5 Memory

`TrainingMemory`:

```ts
{
  latestRide,
  last7Days,
  last30Days,
  routeMemory,
  fatigueSignals,
  missingData
}
```

This is compact by design.

Not included:

- raw streams
- raw Strava JSON
- tokens
- full activity history

### 10.6 Route Candidates

Source priority:

1. Previous Strava route with polyline.
2. Built-in Tokyo/Kanto route catalog.
3. Manual fallback.

Catalog examples:

- Tamagawa Endurance Course
- Arakawa Flat Endurance Course
- Oi Futo Loop
- Tomin no Mori Climb
- Yabitsu Pass Climb
- Wada Pass Climb
- Tama Hills Rolling Route

Route scoring considers:

- goal fit
- duration fit
- readiness
- fatigue signals
- recent elevation load
- route preference
- previous route familiarity
- polyline availability

面试表达：

> Planner 不是让模型凭空推荐路线，而是先用 deterministic tools 从历史 rides 和 catalog 里生成候选，再打分，再让 LLM 解释为什么。这样输出更具体、更安全，也更可控。

---

## 11. Planner Feature

### 11.1 Input

```ts
durationMinutes
goal
readiness
routePreference
useLatestRideContext
```

Route preference：

```text
previous_route
known_route
flat
climbing
recovery
not_sure
```

### 11.2 Output

Planner 输出结构化 `RidePlan`：

```ts
{
  title,
  summary,
  recommendedRoute,
  trainingPurpose,
  intensity,
  workoutStructure,
  whyThisFitsToday,
  avoidToday,
  nutrition,
  recovery,
  safetyNotes,
  confidence,
  missingData
}
```

### 11.3 UI

Planner UI 展示：

- Ride Intent panel。
- Recent Training Context。
- Recommended Route。
- Workout Structure Timeline。
- Why this fits today。
- Avoid today。
- Nutrition/Recovery/Safety。
- Missing data。
- Other candidates considered。

### 11.4 Fallback

如果 Ollama fail：

- deterministic plan 仍可返回。
- `fallbackUsed = true`。
- UI 显示 rule fallback。

---

## 12. Coach Chat Feature

### 12.1 Current Behavior

Chat 不只是普通问答，现在会自动使用 compact recent training memory。

Chat API：

```text
POST /api/coach/chat
```

Request：

```ts
{
  message: string,
  activityId?: string | null
}
```

Response：

```ts
{
  message,
  fallbackUsed,
  model,
  memoryUsed
}
```

### 12.2 Memory Injection

`runCoachChatAgent` 会：

- 查询 user。
- buildTrainingMemory。
- optional selected activity context。
- buildCoachChatPrompt。
- call Ollama。
- fallback。

### 12.3 UI

Coach sidebar 显示：

- model ready/offline。
- model name。
- recent memory on/no ride memory。
- latest ride + 7d summary。

面试表达：

> Chat 不是每次都要求用户手动贴上下文，而是自动注入 recent training memory。这样用户问“我最近状态怎么样”时，Agent 可以基于最近 7/30 天和路线历史回答。

---

## 13. Frontend-Backend Interaction

### 13.1 Request Flow Example: Planner

```text
RidePlanForm
  -> useGenerateRidePlanMutation
  -> POST /api/planner/generate
  -> runPlannerAgent
  -> Prisma reads StravaActivity
  -> deterministic tools
  -> Ollama optional refinement
  -> Zod validate
  -> JSON response
  -> RidePlanResult renders cards
```

### 13.2 Request Flow Example: Chat

```text
CoachChat input
  -> useCoachChatMutation
  -> POST /api/coach/chat
  -> runCoachChatAgent
  -> buildTrainingMemory
  -> Ollama
  -> save CoachConversation
  -> response
  -> ChatMessage render
```

### 13.3 Request Flow Example: Dashboard Sync

```text
Sync button
  -> POST /api/strava/sync
  -> getValidStravaAccessToken
  -> StravaClient.listActivities
  -> filter cycling activities
  -> upsert StravaActivity
  -> invalidate TanStack Query
  -> activity list refreshes
```

---

## 14. Testing Strategy

### 14.1 Unit Tests

Current:

```text
tests/fitness/metrics.test.ts
tests/unit/agent/agent-tools.test.ts
```

Covered:

- ride metrics classification。
- training memory summary。
- route memory extraction。
- route candidate preference。
- tired climbing request -> recovery plan。

Future unit tests:

- prompt builders。
- parser fallback。
- Strava response mapper。
- polyline decode。

### 14.2 Integration Tests

Future:

- mock Strava sync route。
- planner API with seeded activities。
- coach chat fallback with Ollama unavailable。

### 14.3 E2E Tests

Current:

```text
tests/e2e/home.spec.ts
```

Future:

- login/register。
- My Page connect state mock。
- Dashboard sync/list/select。
- Planner generate。
- a11y smoke for primary pages。

### 14.4 Build/Test Commands

Recommended before PR:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Full local:

```bash
pnpm playwright:install
pnpm test:e2e
```

面试表达：

> 我优先测 deterministic logic，因为它是产品可信度的核心。LLM 部分更多测 parser 和 fallback，而不是 snapshot 模型输出。

---

## 15. CI/CD

Current workflow:

```text
.github/workflows/ci.yml
```

Pipeline:

```text
checkout
pnpm setup
node setup
pnpm install --frozen-lockfile
pnpm db:generate
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Why this order:

1. install
2. generate Prisma client
3. type safety
4. lint
5. unit tests
6. production build

Future CI:

- Add Playwright smoke test.
- Add Knip non-blocking audit.
- Add Docker build.
- Add deploy preview.
- Add release workflow.

---

## 16. Infrastructure Roadmap

### 16.1 Current Local Infra

Current:

- Next.js local server。
- SQLite。
- Docker Compose Ollama。
- No cloud dependency。

Why:

- zero cost。
- fast iteration。
- no production ops burden。

### 16.2 Beta Deployment Options

Low-cost Beta:

- Vercel / Fly.io / Render for Next.js。
- Managed Postgres。
- Ollama remains local or use optional cloud LLM provider。
- Sentry for error monitoring。

### 16.3 AWS Production Architecture

Target:

```text
Route53
ACM
CloudFront or ALB
ECS Fargate
ECR
RDS PostgreSQL
ElastiCache Redis if queues/cache needed
S3 if file upload/export needed
Secrets Manager
CloudWatch Logs
Sentry/OpenTelemetry
```

### 16.4 Terraform Strategy

Do not add Terraform before deployment shape is stable.

Migration sequence:

1. Dockerize runtime。
2. Move SQLite -> PostgreSQL。
3. Encrypt OAuth tokens。
4. Add Secrets Manager。
5. Add ECR build。
6. Add ECS Fargate service。
7. Add ALB/CloudFront/Route53。
8. Encode stable infra in Terraform modules。

Terraform module sketch:

```text
infra/terraform/
  envs/
    dev/
    prod/
  modules/
    network/
    ecs-service/
    rds/
    secrets/
    observability/
```

CI/CD with AWS:

```text
GitHub Actions
  -> OIDC assume AWS role
  -> docker build
  -> push ECR
  -> run migrations
  -> deploy ECS
  -> smoke test
  -> rollback if unhealthy
```

Do not use long-lived AWS access keys.

---

## 17. Observability

MVP:

- console logs。
- API errors returned safely。
- local health endpoints。

Next:

- Sentry for frontend/backend exceptions。
- OpenTelemetry traces。
- CloudWatch logs。
- AI cost/latency dashboard。
- Strava sync success/failure dashboard。
- Route recommendation failure dashboard。

Important product metrics:

- activation。
- Strava connected rate。
- sync success rate。
- activity analyzed rate。
- planner generated rate。
- route recommendation accepted/saved rate。
- AI helpfulness rating。

---

## 18. Security And Compliance Checklist

Current:

- Strava token server-side only。
- OAuth state check。
- user data scoped by `userId`。
- local Ollama default。
- no model training。
- no raw tokens in prompt。
- no raw streams in chat/planner prompt。

Production must add:

- encrypted refresh tokens。
- stronger session cookies。
- CSRF hardening for all mutating forms。
- rate limit。
- audit logs。
- secret manager。
- deletion/export flow。
- privacy policy。
- Strava/Garmin API policy review。

Interview phrasing:

> The most sensitive data here is OAuth token and activity privacy. I keep token handling in server routes, never expose it to client components, scope every query by userId, and default to local Ollama so activity data does not leave the user's machine in the MVP.

---

## 19. How To Explain This Project In Interviews

### 19.1 30-second version

> CycleCoach Agent is a local-first AI cycling coach built with Next.js, TypeScript, Prisma SQLite, Strava OAuth, Leaflet maps, and local Ollama. The core flow is: users log in, connect Strava, sync recent rides, inspect metrics and route maps, ask AI to analyze a ride, and use a context-aware Planner Agent to choose the next concrete ride based on recent training load and route history.

### 19.2 Architecture version

> I designed it as a lightweight full-stack monolith. App Router owns routes and API handlers, shared UI lives in components, feature logic lives in features, infrastructure clients live in lib, and data is handled by Prisma. Server state uses TanStack Query, UI state uses Zustand, validation uses Zod, and deterministic sport logic is separated from LLM prompts.

### 19.3 Agent version

> The Agent architecture is tool-based but lightweight. Tools deterministically fetch recent activities, summarize training load, extract route history, score route candidates, and generate a rule-based plan. The LLM only refines and explains the deterministic output. This avoids hallucinated metrics and keeps the system robust even when Ollama is offline.

### 19.4 Security version

> I treat Strava data and tokens as sensitive. OAuth tokens stay server-side, API reads are scoped by userId, prompts receive compact summaries instead of raw data, and cloud LLM is not enabled by default. For production I would encrypt refresh tokens, add audit logs, rate limiting, Sentry, and managed secrets.

### 19.5 Tradeoff version

> I intentionally kept SQLite and a single Next.js app for MVP because the product risk was workflow validation, not infrastructure scale. The architecture still leaves a clear path to PostgreSQL/PostGIS, ECS, Terraform, and more formal observability when the product needs spatial search, production multi-user deployment, or route risk overlays.

---

## 20. How To Build A Similar Product From Scratch

Recommended sequence:

1. Define one vertical slice.
2. Create Next.js App Router project.
3. Add TypeScript strict mode.
4. Add Tailwind and local UI primitives.
5. Add Prisma + SQLite.
6. Add local auth.
7. Add third-party OAuth integration.
8. Cache external API data locally.
9. Build Dashboard list/detail view.
10. Add maps and route decode.
11. Add deterministic analytics.
12. Add local LLM provider.
13. Add structured prompt + parser + fallback.
14. Add Planner/Agent memory.
15. Add tests for deterministic logic.
16. Add CI.
17. Only then consider cloud deployment.

The key lesson:

> Start with a real user workflow, keep the stack boring, isolate risky AI behavior behind deterministic logic and schemas, then progressively harden the system.

