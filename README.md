# 同频 · one-word-one-world

一个简约手绘风的 2–4 人在线词语默契游戏。

网站：https://futabanov16.github.io/one-word-one-world/

## 开发

```sh
cd web
npm ci
npm run dev
```

需要 Node.js 22.13+。`npm run build` 构建静态网页，`npx tsc --noEmit` 检查类型。

`web/` 是 GitHub Pages 前端。推送到 `main` 后，GitHub Actions 自动构建并发布。部署路径配置在 `web/vite.config.ts`，邀请链接保留该路径。

## 联机服务

房间与游戏状态保存在独立的 Sites / Cloudflare D1 后台，前端通过 HTTPS API 连接。服务地址配置在 `web/src/App.tsx`。后台仅允许本站 GitHub Pages 来源及自身来源的跨站访问，玩家身份仍通过每人独立的随机座位凭证验证。

无需登录。支持房间链接或六位房间号、全员准备、隐藏提交与统一揭晓、十轮上限、全员一致获胜、原房间再来一局。房间保留七天。

后台源码在本地 `tongpin/`，由其独立 Sites 源码仓库管理，不作为 Git 子模块提交到本仓库。域名更换后浏览器存储隔离，旧网站的座位凭证不会自动迁移，请在新网站创建房间并重新邀请。

## 每轮纪念卡

每轮全员提交并揭晓后，自动弹出本轮总结 PNG，包含局数、轮次、所有玩家昵称与词语。可选择下载、手机长按保存或关闭继续游戏；历史记录的「纪念卡」可再次打开。当前标签页内已展示的轮次不会因同步或刷新重复弹出。图片只使用已揭晓的历史记录，在本地浏览器生成，不上传图片或私密词语。

验证：`cd web && node --experimental-strip-types --test tests/round-summary.test.mjs`。
