<!--
Sync Impact Report
- 版本變更: 模板占位值 -> 1.0.0
- 調整原則:
	- 原則一占位名稱 -> 一、簡潔優先，禁止過度設計
	- 原則二占位名稱 -> 二、變更紀錄最小化與文件節制
	- 原則三占位名稱 -> 三、TDD 為強制流程
	- 原則四占位名稱 -> 四、Git 流程健康檢查必須可驗證
	- 原則五占位名稱 -> 五、Implement 階段紀律與交付約束
- 新增章節:
	- 專案技術與交付約束
	- 開發流程與品質門檻
- 移除章節:
	- 無
- 模板同步狀態:
	- ✅ updated: .specify/templates/plan-template.md
	- ✅ updated: .specify/templates/spec-template.md
	- ✅ updated: .specify/templates/tasks-template.md
	- ✅ checked (no file): .specify/templates/commands/*.md
	- ✅ checked (no change needed): README.md
- 延後事項:
	- 無
-->

# 10000 專案憲章

## Core Principles

### 一、簡潔優先，禁止過度設計
所有實作 MUST 以可驗證的最小解法達成需求，禁止預先為未確認需求加入架構、抽象層或
流程。若必須引入額外複雜度，MUST 在 plan 與任務中明確記錄必要性與替代方案。
理由：控制複雜度可降低維護成本與回歸風險，並提升交付速度。

### 二、變更紀錄最小化與文件節制
除非使用者明確要求，流程執行 MUST NOT 新增僅用於記錄變更或總結工作的 Markdown
文件。必要文件更新 MUST 優先修改既有檔案，不得以新增平行文件取代。
理由：避免文件膨脹與資訊分裂，確保單一可信來源。

### 三、TDD 為強制流程
所有功能開發 MUST 遵循 TDD（Red -> Green -> Refactor）：先寫測試、確認失敗，再實作
使其通過，最後重構。若需求無法測試，MUST 先補足可驗證的驗收條件再實作。
理由：先測試可將需求具體化，降低誤解與回歸。

### 四、Git 流程健康檢查必須可驗證
每個主要階段（spec、plan、tasks、implement）開始與完成前，MUST 檢查並可追溯
`git status`、`git branch --show-current` 與 `git rev-parse --short HEAD`。
提交時 MUST 保持變更可解釋且粒度合理。
理由：持續確認版本狀態可降低協作衝突與遺漏風險。

### 五、Implement 階段紀律與交付約束
Implement 階段 MUST 維持 `tasks.md` 任務勾選狀態正確反映進度；MUST NOT 刪除、覆蓋
或以模板重置既有規格文件（特別是 `spec.md`、`plan.md`、`tasks.md`）。若為網站專案，
預設交付目標 MUST 為可部署至 GitHub Pages 的前端靜態網站，除非使用者另有要求。
理由：確保進度透明、保護規格資產，並維持可快速部署的預設路徑。

## 專案技術與交付約束

- 所有規格、計畫與任務定義 MUST 與本憲章一致，衝突時以本憲章為準。
- 文件與流程更新 MUST 以最小必要變更原則執行，避免無關重構。
- 若需偏離本憲章，MUST 在對應工作項目中記錄偏離原因、影響範圍與回復策略。

## 開發流程與品質門檻

- Constitution Check MUST 在 plan 階段前後各執行一次，並記錄是否通過。
- 任務拆解 MUST 讓每個使用者故事可獨立測試與交付，且測試任務優先於實作任務。
- 任何實作完成前 MUST 至少執行對應測試並確認結果可重現。

## Governance

- 本憲章優先於其他實務文件；若模板與本憲章衝突，MUST 先修正模板再進行開發。
- 修訂程序：提出修訂內容、影響分析、需同步檔案清單，經維護者核可後合併。
- 版本政策採語義化版本：
	- MAJOR：移除或重新定義既有原則，造成治理規則不相容。
	- MINOR：新增原則/章節或大幅擴充強制規範。
	- PATCH：文字澄清、錯字修正、非語意變更。
- 合規檢查：所有 PR 與實作流程審查 MUST 檢核 TDD、Git 健康檢查、任務勾選與文件保護
	規則。

**Version**: 1.0.0 | **Ratified**: 2026-03-06 | **Last Amended**: 2026-03-06
