export async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cấu hình Cloudinary thiếu NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME hoặc NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("transformation", "q_auto,f_auto");

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Upload thất bại");
  }

  const data = await res.json();
  const secureUrl = data.secure_url;
  if (secureUrl && secureUrl.includes("/upload/")) {
    return secureUrl.replace("/upload/", "/upload/q_auto,f_auto/");
  }
  return secureUrl;
}
