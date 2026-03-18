# Pulse — あなたの情報参謀

パーソナル情報キュレーター PWA。気になるキーワード（人物・企業・テーマ）を検索すると、AIが過去から現在までの情報を時系列タイムラインで生成・保存します。

## 機能

- **AI タイムライン生成** — Claude API がキーワードの歴史・背景を自動生成
- **ジャンル分類** — 人物 / 企業 / テクノロジー / スキル / 社会・事件 / ニュース
- **タブ保存 & グループ管理** — 調べた情報をタブとして保存・整理
- **ニュース統合** — NewsAPI でリアルタイムニュースを取得・要約
- **Wikipedia 連携** — 基本情報の自動補完
- **PWA 対応** — オフライン閲覧・ホーム画面追加

## 技術スタック

| 分類 | 技術 |
|---|---|
| フレームワーク | React 18 + TypeScript |
| ビルドツール | Vite 8 |
| スタイリング | Tailwind CSS 3 |
| 状態管理 | Zustand |
| ルーティング | React Router v6 |
| アニメーション | Framer Motion |
| ローカル DB | Dexie.js (IndexedDB) |
| PWA | vite-plugin-pwa + Workbox |

---

## 事前準備

### 必要な環境

- **Node.js** v18 以上（推奨: v20 LTS）
- **npm** v9 以上

```bash
# バージョン確認
node -v   # v18.x.x 以上
npm -v    # v9.x.x 以上
```

### API キーの取得

Pulse は以下の 2 つの API キーを使用します。どちらもブラウザ上のローカルストレージにのみ保存され、外部サーバーには送信されません。

#### 1. Anthropic（Claude）API キー ― **必須**

タイムライン生成・ジャンル判定・AI 洞察に使用します。

1. [console.anthropic.com](https://console.anthropic.com) にアクセスしてアカウントを作成
2. 「API Keys」メニューから新しいキーを発行
3. `sk-ant-api03-...` で始まる文字列をコピーして保管

> 利用料金: Claude Sonnet の API 従量課金（1 回の検索あたり約 $0.01〜0.05 程度）

#### 2. NewsAPI キー ― **任意**

最新ニュース記事の取得に使用します。なくても AI タイムラインは動作します。

1. [newsapi.org](https://newsapi.org) にアクセスして無料登録
2. ダッシュボードから API キーをコピー

> 無料プランは開発用（1,000 リクエスト/日）。商用利用は有料プランが必要です。

---

## インストールから起動まで

### 1. リポジトリをクローン

```bash
git clone <repository-url>
cd Pulse
```

### 2. 依存パッケージをインストール

```bash
npm install
```

### 3. 開発サーバーを起動

```bash
npm run dev
```

ブラウザで [http://localhost:5173](http://localhost:5173) が自動的に開きます。

### 4. API キーをアプリに設定

1. アプリ下部のタブバーから **設定**（⚙️）を開く
2. **「APIキー設定」** セクションをタップして展開
3. **Anthropic (Claude) API Key** に取得したキーを貼り付け
4. 必要であれば **NewsAPI Key** も入力
5. 入力は自動保存されます（ページリロード後も保持）

### 5. 検索して使う

1. タブバーの **検索**（🔍）をタップ
2. 気になるキーワードを入力して「調べる」ボタンを押す
3. AI がタイムラインを生成します（10〜30 秒程度）
4. 「保存」ボタンでライブラリに追加

---

## ビルド・本番デプロイ

### プロダクションビルド

```bash
npm run build
```

`dist/` ディレクトリに静的ファイルが生成されます。

### ローカルでビルド結果を確認

```bash
npm run preview
```

### デプロイ先の例

生成された `dist/` を以下のような静的ホスティングサービスにそのままデプロイできます。

| サービス | コマンド例 |
|---|---|
| Vercel | `vercel --prod` |
| Netlify | `netlify deploy --prod` |
| Firebase Hosting | `firebase deploy` |
| GitHub Pages | `gh-pages -d dist` |

> **注意**: SPA ルーティングのため、すべてのパスを `index.html` にリダイレクトする設定が必要です。

---

## ディレクトリ構成

```
src/
├── App.tsx                  # ルーティング設定
├── components/
│   ├── layout/              # TabBar, NavBar, BottomSheet
│   ├── library/             # ライブラリ画面（グループ・タブ管理）
│   ├── timeline/            # タイムライン画面（AI カード表示）
│   ├── search/              # 検索画面
│   ├── settings/            # 設定画面（APIキー入力）
│   └── ui/                  # 共通 UI（Tag, Badge, Toast など）
├── hooks/
│   ├── useSearch.ts         # 検索 & タブ保存ロジック
│   └── useTimeline.ts       # タイムライン取得 & キャッシュ管理
├── services/
│   ├── claude.ts            # Claude API 呼び出し
│   ├── newsapi.ts           # NewsAPI 呼び出し
│   └── wikipedia.ts         # Wikipedia API 呼び出し
├── stores/
│   ├── settingsStore.ts     # アプリ設定（APIキー含む）
│   └── uiStore.ts           # UI 状態（トースト・開閉状態）
├── db/
│   └── index.ts             # Dexie.js DB スキーマ定義
└── types/
    └── index.ts             # 全型定義・定数
```

---

## よくある質問

**Q. APIキーはどこに保存されますか？**
ブラウザのローカルストレージ（`localStorage`）にのみ保存されます。サーバーや外部には一切送信されません。

**Q. ニュースが表示されない**
NewsAPI キーが未設定の場合、ニュース取得はスキップされます。タイムライン自体は Claude の学習データのみで生成されます（`no_news` 警告バナーが表示されます）。

**Q. タイムラインの生成に時間がかかる**
Claude API の応答に 10〜30 秒かかることがあります。生成中はスケルトンアニメーションが表示されます。

**Q. オフラインでも見られますか？**
一度生成・保存したタブはキャッシュされ、オフラインでも閲覧できます（ニュースのキャッシュ期限は 6 時間、人物・企業は 7 日間）。
