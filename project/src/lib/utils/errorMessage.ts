export function getFriendlyError(error: unknown): string {
  if (typeof error === "string") return mapMessage(error);
  if (error instanceof Error) return mapMessage(error.message);
  return "Đã có lỗi xảy ra, vui lòng thử lại sau";
}

export function getFriendlyResponseError(message?: string): string {
  if (!message) return "Đã có lỗi xảy ra, vui lòng thử lại sau";
  return mapMessage(message);
}

export function getFriendlyErrorByStatus(status: number | string): string {
  const code = String(status);
  if (code === "404") return "Không tìm thấy dữ liệu";
  if (code === "403") return "Bạn không có quyền thực hiện thao tác này";
  if (code === "500") return "Máy chủ đang gặp sự cố, vui lòng thử lại sau";
  return "Đã có lỗi xảy ra, vui lòng thử lại sau";
}

function mapMessage(msg: string): string {
  // Nếu là câu thông báo tiếng Việt có dấu tự định nghĩa từ BE, ta giữ nguyên để hiển thị cho thân thiện
  if (/[àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(msg)) {
    return msg;
  }

  const m = msg.toLowerCase();

  // Auth
  if (m.includes("password") || m.includes("credentials") || m.includes("unauthorized"))
    return "Email hoặc mật khẩu không đúng";
  if ((m.includes("email") && m.includes("exist")) || m.includes("unique"))
    return "Email này đã được sử dụng";
  if (m.includes("session") || m.includes("token") || m.includes("expired"))
    return "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại";
  if (m.includes("not found") || m.includes("p2025"))
    return "Không tìm thấy dữ liệu";
  if (m.includes("forbidden") || m.includes("permission") || m.includes("role"))
    return "Bạn không có quyền thực hiện thao tác này";
  if (m.includes("duplicate") || m.includes("p2002") || m.includes("already exist"))
    return "Dữ liệu đã tồn tại";
  if (m.includes("upload") || m.includes("image") || m.includes("file"))
    return "Tải ảnh thất bại, vui lòng thử lại";
  if (m.includes("order"))
    return "Không thể xử lý đơn hàng, vui lòng thử lại";
  if (m.includes("network") || m.includes("fetch") || m.includes("econnrefused"))
    return "Không thể kết nối, vui lòng kiểm tra mạng";
  if (m.includes("validation") || m.includes("invalid") || m.includes("required"))
    return "Vui lòng kiểm tra lại thông tin";

  // Generic fallback
  return "Đã có lỗi xảy ra, vui lòng thử lại sau";
}
