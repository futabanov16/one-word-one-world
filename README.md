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
