# 桌面布局保护点（2026-10-24）

- 冻结提交：`6bf38bb3fc436e338cd4515fdb6b1594da47db43`
- 独立存档分支：`checkpoint/home-layout-2026-10-24`
- 用户确认：当前主屏幕 App 网格布局暂时 OK，后续微信 UI 改动不可改变主屏幕图标、标签、顶部间距、搜索、分页、Dock、横向翻页和上滑退出逻辑。
- 后续微信调整优先修改 `src/WeChat.tsx` 和 `src/WeChat.css`；如必须修改 `src/App.module.css`，仅调整微信应用容器相关选择器，禁止影响 `.home`, `.grid`, `.appTile`, `.dock`。
- 说明：此保护点是 Git 提交/分支，不代表线上部署验证。
