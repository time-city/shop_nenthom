# 🚀 QUY CHUẨN CẤU TRÚC & DATABASE DỰ ÁN CHAMCHAM STUDIO

Dự án áp dụng kiến trúc **Monorepo** (Next.js 14/15 App Router, FE và BE nằm chung). Để tối ưu hiệu suất và tốc độ phát triển, hệ thống giao tiếp giữa Frontend (FE) và Backend (BE) sẽ thông qua **Next.js Server Actions** thay vì gọi API truyền thống. Toàn bộ thành viên (FE, BE và AI Agents) **BẮT BUỘC** tuân thủ các quy tắc phân chia thư mục và thao tác Database dưới đây.

---

## PHẦN 1: BẢN ĐỒ THƯ MỤC (NƠI ĐẶT CODE)

Tuyệt đối không vứt file lộn xộn ra ngoài root. Cấu trúc chuẩn của dự án được quy định như sau:

### 1. Thư mục `src/` (Mã nguồn cốt lõi)
* **`app/`**: Chứa toàn bộ Routing (Chuẩn App Router).
  * `app/(client)/`: Trải nghiệm khách hàng (Trang chủ, Chi tiết SP, Giỏ hàng, Checkout...).
  * `app/admin/`: Trang dành cho Quản trị viên (Dashboard, Kho, Đơn hàng...). Cần bọc layout kiểm tra quyền (Role = ADMIN).
  * `app/api/`: **(Hạn chế sử dụng)** Chỉ dùng cho các Webhook bên ngoài (ví dụ: SePay callback) hoặc các Route Handlers bắt buộc phải cung cấp API ra ngoài.
* **`actions/`**: **Lãnh địa của Backend (Next.js Server Actions)**. Đây là nơi BE viết các logic xử lý, dùng **Prisma Engine** để query Database trực tiếp. FE sẽ gọi thẳng các Action này như những hàm bình thường (ví dụ: `await getProducts()`) thay vì fetch API.
  * `actions/client/`: Server Actions phục vụ người dùng cuối (thêm giỏ hàng, đặt hàng, lấy danh sách SP).
  * `actions/admin/`: Server Actions phục vụ quản trị (duyệt đơn, cập nhật tồn kho, thêm SP).
* **`components/`**: Giao diện tái sử dụng.
  * `components/ui/`: Component nguyên thủy (Shadcn UI). **Không chứa logic Server Action ở đây.**
  * `components/client/`: Component phức tạp của khách hàng (Ví dụ: `ProductCard`, `CandleConfigurator`).
  * `components/admin/`: Component của riêng Admin (Ví dụ: `Sidebar`, `ImageUploader`).
* **`hooks/`**: Chứa Custom Hooks (Ví dụ: `useRealtimeOrder.ts` để lắng nghe Supabase nếu cần).
* **`lib/`**: Cấu hình & Tiện ích.
  * `lib/prisma.ts`: Khởi tạo Prisma Client. Backend **bắt buộc** import Prisma từ đây, KHÔNG tự tạo `new PrismaClient()`.
  * `lib/utils.ts`: Chứa hàm dùng chung (Format tiền VNĐ, class merge tailwind...).
* **`store/`**: Quản lý State Toàn cục (Zustand) cho FE. Chứa `useCartStore`, `useConfigStore`...
* **`types/`**: Chứa các Interface / Type định nghĩa chung cho TypeScript, dùng chung cho cả Action và Component.

### 2. Các thư mục & file ở Root
* **`prisma/`**: Chứa file `schema.prisma`. Nơi duy nhất định nghĩa Database. Thư mục này cũng chứa file `seed.ts` để nạp dữ liệu mẫu.
* **`public/`**: Chứa tài nguyên tĩnh (Images, Favicon, Fonts).
* **`.env`**: File chứa các biến môi trường (Ví dụ: `DATABASE_URL`). **Không bao giờ được push file này lên GitHub.**
* **`AGENTS.md` / `CLAUDE.md`**: Chứa prompt/context hướng dẫn riêng cho AI (Cursor/Claude). Các Dev khi yêu cầu AI viết code hãy bảo nó đọc kỹ các file này trước.
* **`eslint.config.*` / `next.config.*`**: File cấu hình lõi của hệ thống (Không tự ý sửa nếu không báo trước với team).

---

## PHẦN 2: QUY TRÌNH LÀM VIỆC (FRONTEND & BACKEND)

Sự thay đổi quan trọng nhất: **Giao tiếp qua Next.js Server Actions**.

* **Backend Dev:** 
  - Tập trung viết logic tại `src/actions/`.
  - Sử dụng `lib/prisma.ts` để tương tác trực tiếp với Database.
  - Phải có `'use server'` ở đầu file hoặc đầu hàm. 
  - Validate dữ liệu truyền vào (bằng Zod) và trả về định dạng chuẩn (ví dụ: `{ success: boolean, data?: any, error?: string }`).

* **Frontend Dev:** 
  - Không viết logic `fetch('/api/...')` trong các Component.
  - Khai báo và gọi thẳng Server Actions từ thư mục `src/actions/`.
  - Kết hợp với form HTML native (như `useActionState`, `<form action={...}>`) hoặc các event handler của React để gọi Actions.
  - Sử dụng Server Components tối đa có thể để fetch data thông qua Actions ngay trên server (giảm loading time).

---

## PHẦN 3: QUY TRÌNH THAO TÁC DATABASE (PRISMA + SUPABASE)

Team Backend và Frontend cần nắm rõ các lệnh Prisma sau để không làm hỏng Database:

### Lệnh 1: Đồng bộ Cấu trúc (Schema) lên Supabase
Khi có thay đổi trong file `prisma/schema.prisma`, hãy đảm bảo file `.env` đã có `DATABASE_URL`, sau đó chạy lệnh này để ép DB cập nhật theo cấu trúc mới:
```bash
npx prisma db push
```

### Lệnh 2: Khởi tạo/Cập nhật dữ liệu mẫu (Seed Data)
Để nạp dữ liệu mẫu vào DB sau khi đã đồng bộ schema (ví dụ: tạo tài khoản admin, thêm sản phẩm ban đầu):
```bash
npx tsx prisma/seed.ts
```

---

## PHẦN 4: HƯỚNG DẪN QUẢN LÝ STATE VỚI ZUSTAND

Dự án này sử dụng **Zustand** cho Client State thay vì Redux. Chỉ lưu các state thực sự cần thiết toàn cục (ví dụ: Giỏ hàng tạm, Trạng thái UI, Configurator) vào Zustand.

### Cách tạo và sử dụng Store chuẩn:
1. **Tạo Store trong `src/store/`** (Ví dụ `useCartStore.ts`):
```typescript
import { create } from 'zustand'

interface CartState {
  items: any[]
  addItem: (item: any) => void
  removeItem: (id: string) => void
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (id) => set((state) => ({ 
    items: state.items.filter((i) => i.id !== id) 
  })),
}))
```

2. **Gọi và sử dụng trong Component**:
```tsx
'use client' // Zustand chỉ hoạt động ở Client Component
import { useCartStore } from '@/store/useCartStore'

export default function CartButton() {
  // Lấy ra đúng state/action cần dùng để tránh re-render không cần thiết
  const items = useCartStore((state) => state.items)
  const addItem = useCartStore((state) => state.addItem)

  return (
    <button onClick={() => addItem({ id: '1', name: 'Nến' })}>
      Thêm vào giỏ ({items.length})
    </button>
  )
}
```

```bash
set -a && source .env && set +a && npx tsx prisma/seed.ts
```
