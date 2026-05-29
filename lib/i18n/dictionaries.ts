export const supportedLocales = ["en", "zh", "ja"] as const;
export type Locale = (typeof supportedLocales)[number];

export const dictionaries = {
  en: {
    nav: {
      home: "Home",
      coach: "Coach",
      dashboard: "Dashboard",
      me: "My Page",
      login: "Log in",
      signup: "Sign up",
      logout: "Log out"
    },
    home: {
      badgeLocal: "Local-first MVP",
      stravaConnected: "Strava connected",
      stravaDisconnected: "Strava disconnected",
      ollamaReady: "Ollama ready",
      ollamaAttention: "Ollama needs attention",
      title: "Your Strava rides, explained by a local AI coach.",
      subtitle: "Sync recent cycling activities, inspect the route, and get structured training feedback without sending ride data to a cloud LLM.",
      createAccount: "Create account",
      analyzeLatest: "Analyze latest ride",
      openDashboard: "Open dashboard",
      askCoach: "Ask Coach",
      localStatus: "Local status",
      model: "Model",
      latestRide: "Latest ride",
      noneCached: "none cached",
      actionTalk: "Let’s Talk",
      actionTalkDesc: "Ask training, recovery, nutrition, equipment, or ride planning questions.",
      actionDashboard: "Ride Dashboard",
      actionDashboardDesc: "Your single training data center for activities, maps, metrics, and analysis.",
      actionLatest: "Analyze Latest Ride",
      actionLatestDesc: "Jump straight into the most recent synced ride and ask the coach to review it.",
      actionMe: "My Page",
      actionMeDesc: "Manage Strava, language, local Ollama model, privacy, and local cache settings."
    }
  },
  zh: {
    nav: {
      home: "首页",
      coach: "教练",
      dashboard: "骑行中心",
      me: "我的",
      login: "登录",
      signup: "注册",
      logout: "退出"
    },
    home: {
      badgeLocal: "本地优先 MVP",
      stravaConnected: "Strava 已连接",
      stravaDisconnected: "Strava 未连接",
      ollamaReady: "Ollama 可用",
      ollamaAttention: "Ollama 需要检查",
      title: "用本地 AI 教练读懂你的 Strava 骑行。",
      subtitle: "同步最近骑行，查看路线和关键指标，并在不发送到云端 LLM 的前提下获得结构化训练建议。",
      createAccount: "创建账号",
      analyzeLatest: "分析最近骑行",
      openDashboard: "打开骑行中心",
      askCoach: "询问教练",
      localStatus: "本地状态",
      model: "模型",
      latestRide: "最近骑行",
      noneCached: "暂无缓存",
      actionTalk: "Let’s Talk",
      actionTalkDesc: "直接询问训练、恢复、补给、装备或路线问题。",
      actionDashboard: "Ride Dashboard",
      actionDashboardDesc: "活动列表、地图、指标和 AI 分析的统一训练数据中心。",
      actionLatest: "Analyze Latest Ride",
      actionLatestDesc: "直接进入最近一次同步骑行，并让 AI 教练分析。",
      actionMe: "My Page",
      actionMeDesc: "管理 Strava、语言、本地 Ollama 模型、隐私和缓存。"
    }
  },
  ja: {
    nav: {
      home: "ホーム",
      coach: "コーチ",
      dashboard: "ライド",
      me: "マイページ",
      login: "ログイン",
      signup: "登録",
      logout: "ログアウト"
    },
    home: {
      badgeLocal: "ローカル優先 MVP",
      stravaConnected: "Strava 接続済み",
      stravaDisconnected: "Strava 未接続",
      ollamaReady: "Ollama 利用可能",
      ollamaAttention: "Ollama 要確認",
      title: "Strava のライドをローカル AI コーチが読み解きます。",
      subtitle: "最近のライドを同期し、ルートと指標を確認し、クラウド LLM に送らずに構造化された助言を受け取れます。",
      createAccount: "アカウント作成",
      analyzeLatest: "最新ライドを分析",
      openDashboard: "ダッシュボードを開く",
      askCoach: "コーチに聞く",
      localStatus: "ローカル状態",
      model: "モデル",
      latestRide: "最新ライド",
      noneCached: "未同期",
      actionTalk: "Let’s Talk",
      actionTalkDesc: "トレーニング、回復、補給、機材、ルートについて質問できます。",
      actionDashboard: "Ride Dashboard",
      actionDashboardDesc: "アクティビティ、地図、指標、AI 分析をまとめた中心画面です。",
      actionLatest: "Analyze Latest Ride",
      actionLatestDesc: "最新の同期済みライドを開き、AI コーチに分析させます。",
      actionMe: "My Page",
      actionMeDesc: "Strava、言語、Ollama モデル、プライバシー、キャッシュを管理します。"
    }
  }
};

export type Dictionary = (typeof dictionaries)["en"];

export function normalizeLocale(value: string | null | undefined): Locale {
  if (value === "zh" || value === "ja" || value === "en") return value;
  return "en";
}

export function getDictionary(locale: string | null | undefined) {
  return dictionaries[normalizeLocale(locale)];
}
