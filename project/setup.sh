#!/bin/bash

# Dừng script nếu có lỗi xảy ra
set -e

echo "🚀 Bắt đầu cài đặt môi trường cho dự án..."

# 1. Cài đặt các thư viện Node.js (dựa trên package.json và package-lock.json)
echo "📦 Đang cài đặt các thư viện NPM..."
npm install

# 2. Tạo Prisma Client (Bắt buộc để TypeScript không bị lỗi type khi code và Next.js build được)
echo "🗄️  Đang tạo Prisma Client..."
npx prisma generate

# 3. Thông báo thành công
echo "✅ Cài đặt hoàn tất! Bạn có thể bắt đầu chạy dự án bằng lệnh:"
echo "   npm run dev"
