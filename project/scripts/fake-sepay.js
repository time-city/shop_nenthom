const crypto = require('crypto');

// Đọc thông tin từ tham số dòng lệnh
// node fake-sepay.js <Mã đơn hàng> <Số tiền> <URL Webhook>
const orderNumber = process.argv[2];
const amount = process.argv[3];
const url = process.argv[4] || 'http://localhost:3000/api/webhooks/sepay';

if (!orderNumber || !amount) {
  console.log('Cách dùng: node fake-sepay.js <Mã_Đơn_Hàng> <Số_Tiền> [URL_Webhook]');
  console.log('Ví dụ: node fake-sepay.js ORD12345 150000 http://localhost:3000/api/webhooks/sepay');
  process.exit(1);
}

// Khóa bí mật giống trong .env
const secretKey = 'whsec_SQCp4CkzEfxTM7MR6GGsQjtHH3CzCwFQ';

// Payload giả lập của SePay
const payload = {
  id: Math.floor(Math.random() * 100000),
  gateway: 'MBBank',
  transactionDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
  accountNumber: '0001118294755',
  subAccount: '',
  code: 'SEVN' + Math.random().toString(36).substring(2, 8).toUpperCase(),
  content: orderNumber, // Đổi thành nội dung chính xác mã đơn hàng giống mã QR
  transferType: 'in',
  description: 'TEST thanh toan',
  transferAmount: parseInt(amount, 10),
  accumulated: 10000000,
  referenceCode: 'FT' + Math.floor(Math.random() * 1000000000)
};

const rawBody = JSON.stringify(payload);

// Tạo chữ ký HMAC-SHA256
const signature = crypto.createHmac('sha256', secretKey).update(rawBody).digest('hex');

console.log('=============================================');
console.log('🚀 ĐANG GỬI GIẢ LẬP THANH TOÁN SEPAY...');
console.log('=============================================');
console.log('🔗 URL Webhook:', url);
console.log('📦 Mã đơn hàng (Nội dung CK):', orderNumber);
console.log('💵 Số tiền:', amount);
console.log('---------------------------------------------');
console.log('📝 PAYLOAD RAW BODY:');
console.log(rawBody);
console.log('---------------------------------------------');
console.log('🔑 HEADERS:');
console.log({
  'Content-Type': 'application/json',
  'x-sepay-signature': `sha256=${signature}`
});
console.log('=============================================');

fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-sepay-signature': `sha256=${signature}`
  },
  body: rawBody
})
.then(async res => {
  console.log('📥 HTTP STATUS TỪ SERVER:', res.status, res.statusText);
  const data = await res.json();
  console.log('---------------------------------------------');
  console.log('📦 KẾT QUẢ TRẢ VỀ (JSON):');
  console.log(JSON.stringify(data, null, 2));
  console.log('=============================================');
  
  if (data.success) {
    console.log('✅ Cập nhật thanh toán thành công! Hãy kiểm tra màn hình web (Pusher Socket sẽ tự động nhảy UI).');
  } else {
    console.log('❌ Lỗi xử lý:', data.message);
  }
})
.catch(err => {
  console.error('❌ KHÔNG THỂ KẾT NỐI ĐẾN SERVER:', err.message);
  console.log('Vui lòng đảm bảo server đang chạy ở', url);
});
