er# UI Analysis → User Stories → Sitemap/Journey → Database (Prisma) → API Map

Tài liệu này được rút ra từ source frontend hiện có (HTML/CSS/JS) của project. Frontend hiện mô phỏng **Auth/Cart/Order** bằng `localStorage`; backend đề xuất bên dưới nhằm thay thế các luồng mô phỏng đó bằng API thật.

---

## Bước 1) Phân tích UI & Viết User Story

### 1. Browse & tìm hiểu sản phẩm
1. **Là một người dùng, tôi muốn xem danh sách sản phẩm theo bộ sưu tập (Collection) để tìm được mùi hương/phong cách phù hợp.**
2. **Là một người dùng, tôi muốn lọc sản phẩm theo Hương (scent), Giá (price range) và Tìm kiếm tên để thu hẹp lựa chọn nhanh.**
3. **Là một người dùng, tôi muốn phân trang (pagination) trong Collection để xem nhiều sản phẩm mà không làm chậm trang.**
4. **Là một người dùng, tôi muốn mở trang Chi tiết sản phẩm để xem mô tả, thành phần và hướng dẫn sử dụng.**

### 2. Tùy biến (Configurator)
5. **Là một người dùng, tôi muốn tùy chọn Hương thơm (scent) để tạo trải nghiệm cá nhân hóa.**
6. **Là một người dùng, tôi muốn tùy chọn Màu sáp (color) để đồng bộ thẩm mỹ của sản phẩm.**
7. **Là một người dùng, tôi muốn tùy chọn Kích thước (size) để chọn dung lượng phù hợp.**
8. **Là một người dùng, tôi muốn tùy chọn Bao bì (pack) để chọn phong cách đóng gói mong muốn.**
9. **Là một người dùng, tôi muốn tùy chọn Topping để tăng trải nghiệm cá nhân hóa (và ảnh hưởng giá).**
10. **Là một người dùng, tôi muốn xem preview hiển thị tên/mô tả/kích thước/màu/bảo bì/toppings để chắc chắn lựa chọn đúng.**
11. **Là một người dùng, tôi muốn xem breakdown giá theo từng thành phần cấu hình để ra quyết định mua nhanh.**
12. **Là một người dùng, tôi muốn bấm “Thêm vào giỏ” từ trang Tùy chỉnh để lưu cấu hình vào cart.**

### 3. Sản phẩm chi tiết → chọn option → add to cart
13. **Là một người dùng, tôi muốn chọn Size/Color/Packaging trên trang Product Detail để thêm đúng phiên bản vào giỏ.**
14. **Là một người dùng, tôi muốn điều chỉnh số lượng (quantity) trên trang Product Detail để mua nhiều hơn một sản phẩm.**
15. **Là một người dùng, tôi muốn bấm “Thêm vào giỏ” để chuyển lựa chọn thành item trong cart.**
16. **Là một người dùng, tôi muốn chuyển qua trang Cart sau khi thêm sản phẩm để quản lý đơn hàng trước khi thanh toán.**

### 4. Auth (Register/Login)
17. **Là một người dùng, tôi muốn đăng ký tài khoản bằng thông tin cá nhân để có thể checkout.**
18. **Là một người dùng, tôi muốn đăng nhập bằng email và mật khẩu để xác thực trước khi đặt hàng.**
19. **Là một người dùng, tôi muốn đăng nhập có tùy chọn “Ghi nhớ” (remember) để giảm thao tác lần sau (nếu backend hỗ trợ cookie/token).**
20. **Là một người dùng, tôi muốn được chuyển đến trang Cart/Checkout sau khi đăng nhập để tiếp tục mua sắm.**

### 5. Cart management
21. **Là một người dùng, tôi muốn xem danh sách sản phẩm trong cart để kiểm tra lựa chọn trước khi thanh toán.**
22. **Là một người dùng, tôi muốn tăng/giảm số lượng (quantity) trong cart để tối ưu số lượng mua.**
23. **Là một người dùng, tôi muốn xóa sản phẩm khỏi cart để loại bỏ lựa chọn không mong muốn.**
24. **Là một người dùng, tôi muốn nhập mã khuyến mãi (promo code) để nhận ưu đãi (dù hiện là alert mô phỏng).**
25. **Là một người dùng, tôi muốn bấm “Thanh Toán” để đi đến trang checkout kể cả khi chưa đăng nhập (tư cách khách).**
26. **Là một người dùng chưa đăng nhập, tôi muốn được chọn tiếp tục với tư cách khách hoặc đăng nhập để nhận ưu đãi thành viên.**


### 6. Checkout & đặt hàng
27. **Là một người dùng, tôi muốn điền thông tin thanh toán và giao hàng để đơn được giao đến đúng địa chỉ.**
28. **Là một người dùng, tôi muốn chọn phương thức thanh toán (COD hoặc Transfer) để phù hợp với nhu cầu.**
29. **Là một người dùng, tôi muốn thấy tổng tiền (subtotal/shipping/tax/total) trước khi đặt hàng để tránh nhầm lẫn chi phí.**
30. **Là một người dùng, tôi muốn bấm “Hoàn Thành Đơn Hàng” để tạo đơn và nhận xác nhận đặt hàng.**
31. **Là một người dùng, tôi muốn hệ thống hiển thị mã đơn và chi tiết đơn hàng trong trang xác nhận để lưu lại thông tin mua.**

### 7. Order confirmation & tiếp tục
32. **Là một người dùng, tôi muốn xem dự kiến ngày giao hàng và phương thức thanh toán để biết trạng thái đơn.**
33. **Là một người dùng, tôi muốn xem “các bước tiếp theo” sau khi đặt hàng để biết quy trình xử lý đơn.**
34. **Là một người dùng, tôi muốn quay lại mua sắm hoặc liên hệ hỗ trợ từ trang xác nhận để xử lý các nhu cầu phát sinh.**

### 8. Contact
35. **Là một người dùng, tôi muốn gửi lời nhắn qua form Contact để phản hồi/nhận hỗ trợ.**
36. **Là một người dùng, tôi muốn cung cấp tên, email, chủ đề (subject) và nội dung (message) để đội ngũ phản hồi đúng vấn đề.**

---

## Bước 2) Xây dựng Map

### 2.1 Sitemap (cấu trúc trang)
```text
/ (index.html)
  ├─ #home
  ├─ #collection (danh sách sản phẩm)
  │    └─ Product Detail (đi qua product-detail.html?id=...)
  ├─ #customize (configurator)
  ├─ #story
  ├─ #contact (contact section embedded)

/login.html
/register.html

/product-detail.html?id={id}
/cart.html
/checkout.html
/order-confirmation.html

/contact.html (component-driven)
/contact-lumiere.html (trang contact khác)
/about.html, /about-lumiere.html (giới thiệu)
```

### 2.2 User Journey map (cơ bản cho các luồng chính)

#### Journey A: Browse → Product Detail → Cart → Checkout → Confirmation
1. User vào **Home/Collection** trên `index.html`.
2. User filter/tìm kiếm sản phẩm → chọn sản phẩm.
3. User mở **Product Detail** → chọn Size/Color/Packaging → chọn quantity → Add to cart.
4. User mở **Cart** → update quantity / remove items.
5. User bấm **Thanh Toán**.
6. Nếu chưa login: user được yêu cầu **Login**.
7. User điền **Checkout form** (billing + shipping + payment method) → Hoàn thành đơn.
8. User xem **Order Confirmation**: mã đơn, chi tiết, dự kiến giao hàng, next steps.

#### Journey B: Customize → Add to Cart → Checkout → Confirmation
1. User scroll/tới **Tùy chỉnh** (`#customize`).
2. User chọn scent → màu sáp → size → bao bì → toppings.
3. User quan sát preview & breakdown giá.
4. User bấm **Thêm vào giỏ**.
5. User vào **Cart** → Thanh toán.
6. User điền checkout → chọn COD/Transfer → hoàn thành đơn.
7. User xem xác nhận đơn.

#### Journey C: Auth gating (bắt đăng nhập khi checkout)
1. User thêm item vào cart.
2. User bấm checkout mà chưa có user:
   - Redirect sang **Login**.
3. Sau login: user quay lại tiếp tục checkout → đặt hàng.

---

## Bước 3) Thiết kế Database (Prisma Schema)

> Ghi chú: Frontend hiện lưu snapshot cấu hình vào cart/order. Trong backend thật, nên lưu **snapshot tại OrderItem** để đơn luôn đúng với cấu hình lúc mua.

### Prisma schema.prisma
```prisma
// schema.prisma

enum PaymentMethod {
  COD
  TRANSFER
}

enum OrderStatus {
  PENDING
  PAID
  FULFILLED
  CANCELLED
  REFUNDED
}

enum UserRole {
  CUSTOMER
  ADMIN
}

model User {
  id            String   @id @default(cuid())
  role          UserRole @default(CUSTOMER)

  fullname      String
  email         String   @unique
  phone         String?
  newsletter    Boolean  @default(false)

  passwordHash  String?  // backend thật: chỉ lưu hash
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  orders        Order[]  
}

model Product {
  id          Int      @id
  name        String
  scent       String
  category    String
  color       String
  note        String?
  priceCents  Int
  description String?
  ingredients String?
  usage       String?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  orderItems  OrderItem[]
}

model Topping {
  id        Int     @id @default(autoincrement())
  name      String  @unique
  priceCents Int
}

model Order {
  id            String       @id @default(cuid())
  orderNumber  String       @unique
  status        OrderStatus  @default(PENDING)

  paymentMethod PaymentMethod

  // Totals
  subtotalCents Int
  shippingCents Int
  taxCents      Int
  totalCents    Int

  // Shipping snapshot
  fullname      String
  email         String
  phone         String
  address       String
  city          String
  zip           String?
  notes         String?

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relationships
  userId        String?
  user          User?        @relation(fields: [userId], references: [id])

  items         OrderItem[]
}

model OrderItem {
  id        String  @id @default(cuid())

  orderId   String
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)

  // Product snapshot
  productId Int?
  product   Product? @relation(fields: [productId], references: [id])

  name      String
  unitPriceCents Int
  quantity  Int
  lineTotalCents Int

  // Customization snapshot fields (từ UI)
  scent     String
  color     String
  colorName String?
  size      String
  pack      String

  // Toppings snapshot stored as normalization + join
  toppings  OrderItemTopping[]
}

// n-n between OrderItem and Topping
model OrderItemTopping {
  orderItemId String
  orderItem   OrderItem @relation(fields: [orderItemId], references: [id], onDelete: Cascade)

  toppingId   Int
  topping     Topping   @relation(fields: [toppingId], references: [id])

  // Snapshot per order item (để giữ đúng giá tại thời điểm mua)
  toppingNameSnapshot String
  toppingUnitPriceCents Int

  @@id([orderItemId, toppingId])
}
```

### Relationship (nêu rõ)
- **User (1) — (n) Order**: `User.orders`
- **Order (1) — (n) OrderItem**: `Order.items`
- **Product (1) — (n) OrderItem** (nullable vì có thể orderItem chỉ snapshot từ configurator nếu không liên kết product): `Product.orderItems`
- **OrderItem (n) — (n) Topping** thông qua `OrderItemTopping`:
  - OrderItem ↔ OrderItemTopping (1-n)
  - Topping ↔ OrderItemTopping (1-n)

---

## Bước 4) Backend Functions & API Map

> RESTful endpoints phù hợp frontend flows. Request/response dưới đây là đề xuất contract.

### 4.1 Auth APIs

1) **POST** `/api/auth/register`
- Body request:
```json
{
  "fullname": "...",
  "email": "...",
  "phone": "...",
  "password": "...",
  "newsletter": true
}
```
- Response:
```json
{
  "user": {"id":"...","fullname":"...","email":"...","phone":"..."},
  "accessToken": "..."
}
```

2) **POST** `/api/auth/login`
- Body request:
```json
{ "email": "...", "password": "...", "remember": true }
```
- Response:
```json
{
  "user": {"id":"...","fullname":"...","email":"...","phone":"..."},
  "accessToken": "..."
}
```

3) **GET** `/api/auth/me`
- Response:
```json
{ "user": {"id":"...","fullname":"...","email":"...","phone":"..."} }
```

### 4.2 Catalog / Collection APIs

4) **GET** `/api/products`
- Query params:
  - `scent` (string)
  - `price` (under-300 | 300-500 | 500-800 | over-800)
  - `q` (search by name)
  - `page` (number)
  - `limit` (default 10)
- Response:
```json
{
  "items": [
    {
      "id": 1,
      "name": "Vanilla Elegance",
      "scent": "Vanilla",
      "category": "Sweet",
      "color": "cream",
      "priceCents": 250000,
      "note": "..."
    }
  ],
  "page": 1,
  "totalPages": 5,
  "totalItems": 46
}
```

5) **GET** `/api/products/:id`
- Response:
```json
{
  "id": 1,
  "name": "Vanilla Elegance",
  "scent": "Vanilla",
  "category": "Sweet",
  "color": "cream",
  "priceCents": 250000,
  "note": "Vanilla, Amber, Musk",
  "description": "...",
  "ingredients": "...",
  "usage": "..."
}
```

### 4.3 Cart APIs (khuyến nghị)

Vì frontend hiện dùng localStorage, backend có thể triển khai theo 2 kiểu:

**Option A (recommended cho MVP): Server-side cart không bắt buộc**
- Khi checkout, frontend gửi `items` snapshot → backend tạo order ngay.
- Khi đó cart APIs tối thiểu.

**Option B: Có cart API để lưu trước khi checkout**

6) **GET** `/api/cart`
- Response:
```json
{ "items": [ /* item snapshot + quantity */ ] }
```

7) **PUT** `/api/cart/items/:itemId`
- Body:
```json
{ "quantity": 2 }
```

8) **DELETE** `/api/cart/items/:itemId`
- Response:
```json
{ "ok": true }
```

### 4.4 Order APIs

9) **POST** `/api/orders`
- Headers: `Authorization: Bearer <token>` (nếu bắt đăng nhập)
- Body request (tương thích checkout.html):
```json
{
  "paymentMethod": "COD" ,
  "shipping": {
    "fullname": "...",
    "email": "...",
    "phone": "...",
    "company": "...",
    "address": "...",
    "city": "...",
    "zip": "...",
    "notes": "..."
  },
  "items": [
    {
      "productId": 1,
      "name": "Vanilla Elegance",
      "unitPriceCents": 250000,
      "quantity": 1,

      "customization": {
        "scent": "Vanilla",
        "color": "cream",
        "colorName": "Kem",
        "size": "S — 100g",
        "pack": "Hộp trắng"
      },
      "toppings": [
        { "toppingId": 1, "name": "Socola", "unitPriceCents": 15000 }
      ]
    }
  ],

  "totals": {
    "subtotalCents": 250000,
    "shippingCents": 30000,
    "taxCents": 0,
    "totalCents": 280000
  }
}
```
- Response:
```json
{
  "order": {
    "id": "...",
    "orderNumber": "ORD123456",
    "status": "PENDING",
    "createdAt": "..."
  }
}
```

10) **GET** `/api/orders/:orderNumber`
- Response:
```json
{
  "order": {
    "orderNumber": "ORD123456",
    "paymentMethod": "COD",
    "status": "PENDING",
    "totals": {"subtotalCents": 250000, "shippingCents": 30000, "taxCents": 0, "totalCents": 280000},
    "shipping": {"fullname":"...","address":"..."},
    "items": [ /* order items snapshot */]
  }
}
```

### 4.5 Contact APIs

11) **POST** `/api/contacts`
- Body:
```json
{
  "name": "...",
  "email": "...",
  "subject": "...",
  "message": "..."
}
```
- Response:
```json
{ "ok": true, "id": "..." }
```

---

## Đề xuất cấu trúc thư mục backend

```text
backend/
  src/
    app.ts
    server.ts

    routes/
      auth.routes.ts
      products.routes.ts
      cart.routes.ts
      orders.routes.ts
      contact.routes.ts

    controllers/
      auth.controller.ts
      products.controller.ts
      orders.controller.ts
      cart.controller.ts
      contact.controller.ts

    services/
      auth.service.ts
      catalog.service.ts
      orders.service.ts
      cart.service.ts
      contact.service.ts

    modules/
      auth/
      catalog/
      orders/
      cart/
      contact/

    middleware/
      auth.middleware.ts
      error.middleware.ts

    prisma/
      prisma.client.ts
      seed.ts

  prisma/
    schema.prisma

  package.json
  tsconfig.json
```

---

## Ghi chú quan trọng từ frontend hiện tại (để backend align)
- Checkout hiện **bắt login** khi cart không null.
- Payment toggle: `cod`/`transfer` → backend nên hỗ trợ đúng enum PaymentMethod.
- Cart là snapshot: **OrderItem phải lưu scent/color/size/pack/toppings theo config lúc mua**.
- Order confirmation hiện dự kiến giao trong +3 ngày: backend có thể tạo `estimatedDeliveryDate` hoặc tính ở client.

---

Kết luận: Tài liệu này cung cấp đầy đủ 4 deliverables theo yêu cầu (User Stories, Sitemap+Journey, Prisma schema, API map + structure backend) dựa trực tiếp vào source UI hiện có.

