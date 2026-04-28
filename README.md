# 🔒 Locket QQ

<div align="center">
  <p>
    <img src="./assets/locket-qq-logo.png" alt="Locket QQ Logo" width="180" />
  </p>

Ứng dụng web chia sẻ ảnh/video cho cộng đồng Locket Widget, kèm bộ self-hosted đầy đủ API + Storage + Web.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Website](https://img.shields.io/badge/website-locketqq.online-2ea44f)](https://locketqq.online)
[![Repo](https://img.shields.io/badge/repo-lvquyen15506%2Flocket--qq-0969da)](https://github.com/lvquyen15506/locket-qq)
</div>

---

## 📋 Mục lục

- [Tổng quan](#-tổng-quan)
- [Liên kết quan trọng](#-liên-kết-quan-trọng)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Chạy local nhanh](#-chạy-local-nhanh)
- [Self-hosted bằng Docker](#-self-hosted-bằng-docker)
- [Deploy](#-deploy)
- [Tài liệu liên quan](#-tài-liệu-liên-quan)
- [Đóng góp](#-đóng-góp)

---

## 🌐 Tổng quan

Repo hiện tại gồm 2 nhóm chính:

| Thư mục | Mô tả |
|---------|--------|
| `apps/main` | Web client chính (Vite + React), deploy production |
| `apps/self-hosted` | Bộ stack tự host gồm `api`, `storage`, `web` |

---

## 🔗 Liên kết quan trọng

### Public

| Kênh | Link |
|------|------|
| 🌍 Website chính | https://locketqq.online |
| 📦 Repository | https://github.com/lvquyen15506/locket-qq |
| 💬 Telegram cộng đồng | https://t.me/+KWZ84cH7JxBkYWJl |

### Endpoint mặc định (tham khảo từ `apps/main/.env.example`)

| Service | URL |
|---------|-----|
| Base API | `https://api.locketqq.online` |
| Auth API | `https://auth.locketqq.online` |
| Data API | `https://data.locketqq.online` |
| Payment API | `https://payment.locketqq.online` |
| Storage API | `https://storage.locketqq.online` |
| Media API | `https://media.locketqq.online` |
| CDN | `https://cdn.locketqq.online` |

### Self-hosted local ports (docker-compose)

| Service | URL |
|---------|-----|
| Web | `http://localhost:5173` |
| API | `http://localhost:5001` |
| Storage | `http://localhost:5003` |

---

## 🗂 Cấu trúc dự án

```text
locket-qq/
├── README.md
├── CONTRIBUTING.md
├── vercel.json
├── apps/
│   ├── README.md
│   ├── main/                    # Web client chính (production)
│   │   ├── src/
│   │   ├── public/
│   │   ├── .env.example
│   │   ├── firebase.json
│   │   └── package.json
│   └── self-hosted/             # Bộ tự host đầy đủ
│       ├── README.md
│       ├── docker-compose.yml
│       ├── api/                 # Backend API (Express.js, port 5001)
│       ├── storage/             # Storage server (Cloudflare R2, port 5003)
│       └── web/                 # Frontend client (Vite + React, port 5173)
└── assets/
```

---

## 🚀 Chạy local nhanh

### 1) Chạy web chính (`apps/main`)

```bash
cd apps/main
npm install
cp .env.example .env
npm run dev
```

Windows PowerShell:

```powershell
cd apps/main
npm install
Copy-Item .env.example .env
npm run dev
```

---

## 🐳 Self-hosted bằng Docker

```bash
cd apps/self-hosted
cp api/.env.example api/.env.production
cp storage/.env.example storage/.env.production
cp web/.env.example web/.env.production
docker compose up -d --build
```

Windows PowerShell:

```powershell
cd apps/self-hosted
Copy-Item api/.env.example api/.env.production
Copy-Item storage/.env.example storage/.env.production
Copy-Item web/.env.example web/.env.production
docker compose up -d --build
```

> 📖 Xem hướng dẫn chi tiết tại [apps/self-hosted/README.md](./apps/self-hosted/README.md)

---

## 🌍 Deploy

| Nền tảng | Mô tả |
|----------|--------|
| **Firebase Hosting** | Dùng cho `apps/main` – xem `apps/main/firebase.json` |
| **Vercel** | Config ở root, trỏ đến build self-hosted web |

Vercel build config:
- **Build command**: `cd apps/self-hosted/web && npm install && npm run build`
- **Output**: `apps/self-hosted/web/dist`

---

## 📚 Tài liệu liên quan

| Tài liệu | Đường dẫn |
|-----------|-----------|
| Hướng dẫn apps | [apps/README.md](./apps/README.md) |
| Hướng dẫn self-hosted | [apps/self-hosted/README.md](./apps/self-hosted/README.md) |
| API docs self-hosted | [apps/self-hosted/api/API_DOCS.md](./apps/self-hosted/api/API_DOCS.md) |
| Hướng dẫn đóng góp | [CONTRIBUTING.md](./CONTRIBUTING.md) |

---

## 🤝 Đóng góp

PR và issue đều được chào đón. Trước khi gửi PR, vui lòng:

- Tạo issue/discussion nếu thay đổi lớn
- Chạy build/lint ở phần đã sửa
- Đặt commit theo [Conventional Commits](https://www.conventionalcommits.org/)

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/lvquyen15506">lvquyen15506</a>
</div>
