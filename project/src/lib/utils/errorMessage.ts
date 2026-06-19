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

export function isUserInputError(message?: string): boolean {
  if (!message) return false;

  const normalized = message.toLowerCase();
  const systemSignals = [
    "máy chủ",
    "server",
    "kết nối",
    "network",
    "fetch",
    "econnrefused",
    "sự cố",
    "upload thất bại",
    "tải ảnh thất bại",
  ];

  if (systemSignals.some((signal) => normalized.includes(signal))) {
    return false;
  }

  return [
    "vui lòng",
    "không hợp lệ",
    "không còn khả dụng",
    "không chính xác",
    "không đúng",
    "chưa đúng",
    "không khớp",
    "đã tồn tại",
    "đã được sử dụng",
    "đã hết hạn",
    "hết lượt",
    "đã sử dụng",
    "tối đa",
    "tối thiểu",
    "vượt quá",
    "không được để trống",
    "cần ít nhất",
    "email này chưa được đăng ký",
  ].some((signal) => normalized.includes(signal));
}

function mapMessage(msg: string): string {
  const m = msg.toLowerCase();

  if (
    (m.includes("unique constraint") || m.includes("p2002")) &&
    (m.includes("(`phone`)") || m.includes("fields: (`phone`)"))
  ) {
    return "Số điện thoại đã tồn tại";
  }
  if (
    (m.includes("unique constraint") || m.includes("p2002")) &&
    (m.includes("(`email`)") || m.includes("fields: (`email`)"))
  ) {
    return "Email đã tồn tại";
  }
  if (m.includes("email đã tồn tại")) return "Email đã tồn tại";
  if (m.includes("số điện thoại đã tồn tại")) {
    return "Số điện thoại đã tồn tại";
  }

  // Nếu là câu thông báo tiếng Việt có dấu tự định nghĩa từ BE, ta giữ nguyên để hiển thị cho thân thiện
  if (/[àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(msg)) {
    return msg;
  }

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
