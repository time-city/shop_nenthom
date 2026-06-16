"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Modal from "@mui/material/Modal";
import Select from "@mui/material/Select";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";
import { useToast } from "@/src/components/ui/toast-provider";
import type {
  AdminCategoriesSuccessResponseInterface,
  AdminProductCategoryInterface,
} from "../../interface/adminInterface";
import { getCategoriesAction } from "../../lib/action/category.action";
import { updateProductAction } from "../../lib/action/product.action";
import { getFriendlyError, getFriendlyResponseError } from "@/src/lib/utils/errorMessage";
import type {
  AdminModalEditProductProps,
  AdminProductFormValues,
} from "../../lib/types/admin";
import styles from "../../styles/adminModal.module.css";

const initialProductFormValues: AdminProductFormValues = {
  base_price_cents: "",
  category_id: "",
  description: "",
  image_data_url: "",
  image_file_name: "",
  is_active: true,
  name: "",
};

const getFirstImageUrl = (images: unknown) => {
  if (Array.isArray(images) && typeof images[0] === "string") {
    return images[0];
  }

  return "";
};

const getImageFileName = (imageUrl: string) => {
  if (!imageUrl) return "";

  if (imageUrl.startsWith("data:image/")) {
    return "Ảnh hiện tại";
  }

  return imageUrl.split("/").pop()?.split("?")[0] || "Ảnh hiện tại";
};

export default function ModalEditProduct({
  onClose,
  onSave,
  open,
  product,
}: AdminModalEditProductProps) {
  const { toast } = useToast();
  const [categories, setCategories] = useState<AdminProductCategoryInterface[]>([]);
  const [formValues, setFormValues] = useState<AdminProductFormValues>(
    initialProductFormValues,
  );
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // CHANGED: Thêm 2 state để quản lý tải ảnh lên Cloudinary
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploaded, setImageUploaded] = useState(false);

  useEffect(() => {
    if (!open || !product) {
      // CHANGED: reset state khi modal đóng
      setImageUploaded(false);
      setIsUploadingImage(false);
      return;
    }

    const currentImage = getFirstImageUrl(product.images);

    setFormValues({
      base_price_cents: String(product.base_price_cents),
      category_id: String(product.category_id),
      description: product.description ?? "",
      image_data_url: currentImage,
      image_file_name: getImageFileName(currentImage),
      is_active: product.is_active,
      name: product.name,
    });
    setIsSubmitting(false);
    // CHANGED: reset state khi modal mở
    setImageUploaded(false);
    setIsUploadingImage(false);

    const loadCategories = async () => {
      setIsLoadingCategories(true);

      // action-(lấy danh sách category cho edit product)
      const result = await getCategoriesAction();

      if ("error" in result && result.error) {
        toast.error(getFriendlyResponseError(result.error));
        setCategories([]);
        setIsLoadingCategories(false);
        return;
      }

      if ("success" in result && result.success) {
        const categoryResult = result as AdminCategoriesSuccessResponseInterface;
        setCategories(categoryResult.categories);
      }

      setIsLoadingCategories(false);
    };

    void loadCategories();
  }, [open, product]);

  const updateField = (
    field: keyof AdminProductFormValues,
    value: boolean | string,
  ) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  };

  // CHANGED: Sửa handleImageChange — bỏ hoàn toàn FileReader, tải trực tiếp lên Cloudinary
  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  console.log("Cloudinary cloudName:", cloudName);
  console.log("Cloudinary uploadPreset:", uploadPreset);
  console.log("Selected file:", {
    name: file.name,
    type: file.type,
    size: file.size,
  });

  if (!cloudName || !uploadPreset) {
    toast.error("Thiếu cấu hình Cloudinary trong .env.local");
    return;
  }

  if (!file.type.startsWith("image/")) {
    toast.error("File được chọn không phải ảnh");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    toast.error("Ảnh vượt quá 5MB");
    return;
  }

  setIsUploadingImage(true);
  setImageUploaded(false);

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    console.log("Cloudinary status:", res.status);
    console.log("Cloudinary full response:", data);
    console.log("Cloudinary error message:", data?.error?.message);

    if (!res.ok) {
      throw new Error(data?.error?.message || "Upload ảnh thất bại");
    }

    if (!data.secure_url) {
      throw new Error("Cloudinary không trả về secure_url");
    }

    setFormValues((prev) => ({
      ...prev,
      image_data_url: data.secure_url,
      image_file_name: file.name,
    }));

    setImageUploaded(true);
    toast.success("Tải ảnh lên thành công");
  } catch (err) {
    console.error("Cloudinary Upload Error:", err);

    const message =
      err instanceof Error ? err.message : "Tải ảnh thất bại, vui lòng thử lại";

    toast.error(message);
  } finally {
    setIsUploadingImage(false);
    event.target.value = "";
  }
};

  // CHANGED: Hàm xoá ảnh đã chọn và ghi log debug
  const handleRemoveImage = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    console.log("Xoá ảnh hiện tại. URL cũ:", formValues.image_data_url);
    setFormValues((prev) => ({
      ...prev,
      image_data_url: "",
      image_file_name: "",
    }));
    setImageUploaded(false);
  };

  // CHANGED: Thêm guard chặn lưu khi ảnh đang tải lên Cloudinary
  const handleSave = async () => {
    if (isUploadingImage) return;
    if (!product || isSubmitting) return;

    const productName = formValues.name.trim();
    const productPrice = Number(formValues.base_price_cents);
    const categoryId = Number(formValues.category_id);
    const imageDataUrl = formValues.image_data_url.trim();

    if (!productName) {
      toast.error("Vui lòng nhập tên sản phẩm");
      return;
    }

    if (!Number.isFinite(categoryId) || categoryId <= 0) {
      toast.error("Vui lòng chọn danh mục");
      return;
    }

    if (!Number.isFinite(productPrice) || productPrice < 0) {
      toast.error("Giá sản phẩm không hợp lệ");
      return;
    }

    setIsSubmitting(true);

    try {
      // action-(cập nhật sản phẩm)
      const result = await updateProductAction(product.id, {
        base_price_cents: productPrice,
        category_id: categoryId,
        description: formValues.description.trim() || undefined,
        ...(imageDataUrl ? { images: [imageDataUrl] } : {}),
        is_active: formValues.is_active,
        name: productName,
      });

      if ("error" in result && result.error) {
        toast.error(getFriendlyResponseError(result.error));
        return;
      }

      if ("success" in result && result.success) {
        toast.success("Đã cập nhật sản phẩm");
        await onSave?.();
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      aria-labelledby="edit-product-modal-title"
      aria-describedby="edit-product-modal-description"
    >
      <Box className={`${styles.modalPaper} ${styles.productPaper}`}>
        <Box className={styles.header}>
          <Typography
            id="edit-product-modal-title"
            component="h3"
            className={styles.title}
          >
            Chỉnh sửa sản phẩm
          </Typography>

          <Button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Đóng modal"
            className={styles.closeButton}
          >
            ×
          </Button>
        </Box>

        <Divider className={styles.divider} />

        <Box
          id="edit-product-modal-description"
          component="form"
          className={styles.form}
        >
          <Box className={styles.twoColumnGrid}>
            <TextField
              label="Tên sản phẩm"
              placeholder="Nhập tên sản phẩm..."
              value={formValues.name}
              onChange={(event) => updateField("name", event.target.value)}
              fullWidth
              className={styles.field}
            />

            <FormControl fullWidth className={styles.field}>
              <InputLabel id="edit-product-category-label">Danh mục</InputLabel>
              <Select
                labelId="edit-product-category-label"
                label="Danh mục"
                value={formValues.category_id}
                onChange={(event) =>
                  updateField("category_id", event.target.value)
                }
                disabled={isLoadingCategories}
              >
                <MenuItem value="">
                  {isLoadingCategories ? "Đang tải danh mục..." : "Chọn danh mục"}
                </MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <TextField
            label="Giá (VND)"
            placeholder="Ví dụ: 180000"
            type="number"
            value={formValues.base_price_cents}
            onChange={(event) =>
              updateField("base_price_cents", event.target.value)
            }
            fullWidth
            className={styles.field}
          />

          <TextField
            label="Mô tả"
            placeholder="Mô tả chi tiết về sản phẩm..."
            multiline
            minRows={4}
            value={formValues.description}
            onChange={(event) => updateField("description", event.target.value)}
            fullWidth
            className={styles.field}
          />

          <Box>
            <Typography
              component="label"
              htmlFor="edit-product-image-upload"
              className={styles.sectionLabel}
            >
              Ảnh sản phẩm
            </Typography>
            <label
              htmlFor="edit-product-image-upload"
              className={styles.uploadArea}
            >
              {formValues.image_data_url ? (
                <>
                  {/* CHANGED: hiển thị ảnh preview kèm badge nếu đã tải lên Cloudinary thành công và nút xoá ảnh */}
                  <div
                    style={{ position: "relative", display: "inline-block" }}
                  >
                    <Box
                      component="img"
                      src={formValues.image_data_url}
                      alt={formValues.image_file_name || "Ảnh sản phẩm"}
                      className="mb-3 h-32 w-32 rounded-xl object-cover shadow-[0_14px_34px_rgba(44,24,16,0.16)]"
                    />
                    {imageUploaded && (
                      <span style={{
                        position: "absolute", top: 4, right: 4,
                        background: "#22c55e", borderRadius: "50%",
                        color: "white", fontSize: 11, padding: "2px 5px",
                        fontWeight: "bold"
                      }}>✓</span>
                    )}
                    {/* CHANGED: nút X ở góc trên bên trái để xoá ảnh (chữ đen nền trắng) */}
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      style={{
                        position: "absolute", top: 4, left: 4,
                        background: "white", borderRadius: "50%",
                        color: "black", border: "1px solid rgba(0,0,0,0.15)", width: 20, height: 20,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, cursor: "pointer", fontWeight: "bold",
                        lineHeight: 1,
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                      }}
                      title="Xoá ảnh"
                    >
                      ✕
                    </button>
                  </div>
                  <span className={styles.uploadText}>
                    Đã chọn <strong>{formValues.image_file_name}</strong>
                  </span>
                  <span className={styles.uploadHint}>
                    {isUploadingImage
                      ? "Đang tải ảnh lên..."
                      : imageUploaded
                      ? "✅ Đã tải lên thành công"
                      : "Bấm để chọn ảnh khác"}
                  </span>
                </>
              ) : (
                <>
                  <span className={styles.uploadIcon}>📷</span>
                  <span className={styles.uploadText}>
                    Kéo thả ảnh hoặc <strong>chọn file từ máy</strong>
                  </span>
                  <span className={styles.uploadHint}>
                    {isUploadingImage
                      ? "Đang tải ảnh lên..."
                      : imageUploaded
                      ? "✅ Đã tải lên thành công"
                      : "PNG, JPG tối đa 5MB"}
                  </span>
                </>
              )}
              {/* CHANGED: disabled input khi đang upload ảnh hoặc đang submit */}
              <input
                id="edit-product-image-upload"
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
                disabled={isUploadingImage || isSubmitting}
              />
            </label>
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={formValues.is_active}
                onChange={(event) =>
                  updateField("is_active", event.target.checked)
                }
                className={styles.greenSwitch}
              />
            }
            label="Hiển thị sản phẩm trên website"
            className={styles.formControlLabel}
          />
        </Box>

        <Divider className={styles.divider} />

        <Box className={styles.footer}>
          <Button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className={styles.ghostButton}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="contained"
            onClick={handleSave}
            disabled={isSubmitting || isUploadingImage}
            className={styles.primaryButton}
          >
            {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
