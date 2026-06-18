# Bàn giao thay đổi Backend cho Frontend

Tài liệu này mô tả các thay đổi backend hiện tại mà FE cần biết. Không có file FE nào được sửa trong quá trình tối ưu backend.

## 1. Các thay đổi FE bắt buộc cập nhật

### 1.1. Lịch sử đơn hàng của khách hàng

Function:

```ts
getMyOrdersAction(params?: { page?: number; limit?: number })
```

Giá trị mặc định:

- `page = 1`
- `limit = 10`
- `limit` tối đa là `50`

Response thành công mới:

```ts
{
  success: true,
  data: Array<{
    id: string
    date: string
    total: number
    status: string
    items: Array<{
      name: string
      detail?: string
      price: number
      quantity: number
    }>
  }>,
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
```

Response lỗi:

```ts
{
  success: false,
  error: string
}
```

Thay đổi quan trọng:

- Trước đây action không nhận tham số phân trang và trả danh sách qua `result.data`.
- Hiện tại FE cần truyền `page`, `limit` khi đổi trang.
- FE cần đọc thêm `result.meta.totalPages`, `result.meta.total`, `result.meta.page`.
- Mỗi item đơn hàng giờ chỉ lấy các trường cần hiển thị và vẫn giữ `detail` gồm mùi hương, kích thước, màu, bao bì và topping.

Flow đề xuất:

```ts
const result = await getMyOrdersAction({ page, limit: 10 })

if (!result.success) {
  // Hiển thị result.error
  return
}

setOrders(result.data)
setPagination(result.meta)
```

### 1.2. Danh sách khách hàng trong Admin

Function:

```ts
getAllUsersAction(params?: { page?: number; limit?: number })
```

Giá trị mặc định:

- `page = 1`
- `limit = 100`
- `limit` tối đa là `100`

Response thành công:

```ts
{
  success: true,
  data: Array<{
    id: string
    name: string
    email: string
    phone: string
    role: string
    isActive: boolean
    createdAt: string
  }>,
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
```

FE cần:

- Truyền `page` và `limit` khi tải bảng hoặc đổi trang.
- Không coi toàn bộ response là mảng.
- Dùng `result.data` cho bảng và `result.meta` cho pagination.

### 1.3. Danh sách đơn hàng của một khách trong Admin

Function:

```ts
getUserOrdersAction(
  userId: string,
  params?: { page?: number; limit?: number },
)
```

Giá trị mặc định:

- `page = 1`
- `limit = 10`
- `limit` tối đa là `50`

Response thành công:

```ts
{
  success: true,
  data: Array<{
    id: string
    date: string
    total: string
    status: string
    items: string
  }>,
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
```

Flow đề xuất:

```ts
const result = await getUserOrdersAction(userId, {
  page,
  limit: 10,
})

if ("error" in result) {
  // Hiển thị result.error
  return
}

setOrders(result.data)
setPagination(result.meta)
```

## 2. Thay đổi có thể ảnh hưởng cách hiển thị

### 2.1. Tên Category và Scent được chuẩn hóa chữ thường

Các schema đã sửa:

- `createCategorySchema`
- `updateCategorySchema`
- `scentSchema`
- `updateScentSchema`

Flow backend:

```text
FE nhập tên
  -> trim khoảng trắng đầu/cuối
  -> chuyển thành chữ thường
  -> kiểm tra trùng không phân biệt hoa/thường bằng equals
  -> lưu DB
```

Ví dụ:

```text
"  Hoa HỒNG  " -> "hoa hồng"
"NẾN Thơm"    -> "nến thơm"
```

FE không cần tự chuyển chữ thường trước khi gửi. Nếu thiết kế muốn tên hiển thị viết hoa chữ cái đầu, FE có thể format khi render; dữ liệu backend trả về sẽ giữ dạng đã chuẩn hóa.

Các function liên quan:

```ts
createCategoryAction(params)
updateCategoryAction(id, params)
createScentAction(params)
updateScentAction(id, params)
```

Thông báo lỗi trùng tên vẫn giữ nguyên:

```text
Tên danh mục đã tồn tại
Tên mùi hương đã tồn tại
```

## 3. Các thay đổi không yêu cầu FE sửa contract

### 3.1. Dashboard được cache theo kỳ

Function:

```ts
getDashboardOverviewAction({
  period: "today" | "week" | "month"
})
```

Response không đổi:

```ts
{
  success: true,
  data: {
    period: "today" | "week" | "month",
    stats: {
      customerCount: number
      orderCount: number
      revenueCents: number
      soldProductCount: number
    },
    latestOrders: Array<{
      createdAt: string
      customer: string
      orderNumber: string
      status: string
      totalCents: number
    }>,
    topProducts: Array<{
      productId: string
      name: string
      soldQuantity: number
      revenueCents: number
    }>
  }
}
```

Backend cache riêng cho từng `period` trong 10 phút. FE vẫn gọi action như cũ; F5 liên tục có thể nhận dữ liệu cache tối đa khoảng 10 phút.

### 3.2. Danh sách Contacts dùng Promise.all

Function:

```ts
getContactsAction({
  page?: number
  limit?: number
  status?: "PENDING" | "REPLIED"
  search?: string
})
```

Contract không đổi:

```ts
{
  success: true,
  data: Contact[],
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
```

Chỉ thay `$transaction` đọc bằng `Promise.all` để query danh sách và count chạy song song.

### 3.3. `getCurrentUser()` dùng request-scoped cache

Function công khai không đổi:

```ts
getCurrentUser()
```

Response không đổi. Backend dùng `React.cache()` để các Server Component gọi lặp lại trong cùng một lượt render dùng chung kết quả.

Lưu ý:

- Đây không phải cache lâu dài giữa nhiều người dùng.
- Không làm stale user qua nhiều request.
- Các Client Component gọi Server Action ở những request riêng vẫn là các request riêng.
- FE không cần đổi cách gọi.

### 3.4. Tối ưu index database

Các thay đổi schema:

- Thêm index `OrderHistoryLog(order_id)`.
- Xóa index Cart thủ công trên `user_id` và `session_id` vì hai cột đã có `@unique`.
- Giữ unique constraint của Cart, nên cách tìm cart theo user/session không đổi.
- Index phục vụ danh sách đơn theo user và thời gian đã được bổ sung.

Không có thay đổi request/response phía FE.

## 4. Flow tổng quát sau thay đổi

### Màn lịch sử đơn hàng

```text
FE chọn trang
  -> getMyOrdersAction({ page, limit })
  -> kiểm tra session
  -> OrderService chạy findMany + count song song
  -> backend trả data + meta
  -> FE render danh sách và pagination
```

### Màn quản lý khách hàng

```text
FE chọn trang khách hàng
  -> getAllUsersAction({ page, limit })
  -> requireAdmin
  -> UserService chạy findMany + count song song
  -> backend trả data + meta
  -> FE render bảng và pagination
```

### Modal đơn hàng của khách

```text
FE mở khách hàng
  -> getUserOrdersAction(userId, { page, limit })
  -> requireAdmin
  -> UserService chạy findMany + count song song
  -> backend trả data + meta
  -> FE render modal và pagination riêng trong modal
```

### Dashboard

```text
FE chọn today/week/month
  -> getDashboardOverviewAction({ period })
  -> requireAdmin
  -> kiểm tra cache theo period
  -> cache hit: trả ngay
  -> cache miss: chạy CTE, lưu cache 10 phút, trả dữ liệu
```

## 5. Checklist FE

- [ ] Cập nhật lịch sử đơn hàng để gửi `page`, `limit`.
- [ ] Thêm pagination cho lịch sử đơn hàng và đọc `result.meta`.
- [ ] Cập nhật bảng khách hàng Admin để đọc `result.data` và `result.meta`.
- [ ] Cập nhật modal đơn hàng của khách để truyền tham số thứ hai `{ page, limit }`.
- [ ] Reset `page = 1` khi đổi khách hàng hoặc mở lại modal.
- [ ] Xử lý trạng thái trang rỗng khi `page > totalPages` sau khi dữ liệu thay đổi.
- [ ] Kiểm tra UI hiển thị Category/Scent dạng chữ thường; format khi render nếu thiết kế yêu cầu.
- [ ] Không cần sửa cách gọi Dashboard, Contacts hoặc `getCurrentUser`.

## 6. Cập nhật schema database

Sau khi nhận thay đổi schema:

```bash
npx prisma db push
npx prisma generate
```

