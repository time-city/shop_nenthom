"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Modal from "@mui/material/Modal";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import FormHelperText from "@mui/material/FormHelperText";
import type { ChangeEvent, MouseEvent } from "react";
import { useEffect, useState } from "react";
import { useToast } from "@/src/components/ui/toast-provider";
import type {
  AdminCategoriesSuccessResponseInterface,
  AdminProductCategoryInterface,
} from "../../interface/adminInterface";
import { getCategoriesAction } from "../../lib/action/category.action";
import { createProductAction } from "../../lib/action/product.action";
import { getFriendlyError, getFriendlyResponseError } from "@/src/lib/utils/errorMessage";
import { uploadToCloudinary } from "@/src/lib/utils/uploadImage"; // CHANGED: Import uploadToCloudinary
import type {
  AdminModalProductProps,
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

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

// CHANGED: Removed readImageFile as it is replaced by Cloudinary uploads

export default function ModalProduct({
  onClose,
  onSave,
  open,
}: AdminModalProductProps) {
  const { toast } = useToast();
  const [categories, setCategories] = useState<AdminProductCategoryInterface[]>([]);
  const [formValues, setFormValues] = useState<AdminProductFormValues>(
    initialProductFormValues,
  );
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // CHANGED: State for avatar and sub images
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false);
  const [subImageUrls, setSubImageUrls] = useState<string[]>([]);
  const [isUploadingSubImages, setIsUploadingSubImages] = useState<boolean>(false);

  // CHANGED: Reset avatar and sub images states on open
  useEffect(() => {
    if (!open) return;

    setFormValues(initialProductFormValues);
    setAvatarUrl("");
    setSubImageUrls([]);
    setIsSubmitting(false);
    setErrors({});

    const loadCategories = async () => {
      setIsLoadingCategories(true);

      // action-(lấy danh sách category cho product)
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
  }, [open, toast]);

  const updateField = (
    field: keyof AdminProductFormValues,
    value: boolean | string,
  ) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // CHANGED: Avatar file upload handler
  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (isSubmitting || isUploadingAvatar) return;

    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, avatar: "Vui lòng chọn đúng file ảnh" }));
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setErrors((prev) => ({ ...prev, avatar: "Ảnh tối đa 5MB" }));
      event.target.value = "";
      return;
    }

    setIsUploadingAvatar(true);
    setErrors((prev) => ({ ...prev, avatar: "" }));

    try {
      const url = await uploadToCloudinary(file);
      setAvatarUrl(url);
    } catch (error) {
      toast.error("Tải ảnh đại diện thất bại");
      setErrors((prev) => ({ ...prev, avatar: "Upload thất bại" }));
    } finally {
      setIsUploadingAvatar(false);
      event.target.value = "";
    }
  };

  // CHANGED: Sub images file upload handler (multiple files at once)
  const handleSubImagesChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (isSubmitting || isUploadingSubImages) return;

    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);

    if (fileList.length > 3) {
      toast.error("Chỉ được chọn tối đa 3 ảnh phụ");
      event.target.value = "";
      return;
    }

    for (const file of fileList) {
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({ ...prev, sub_images: "Vui lòng chọn đúng file ảnh" }));
        event.target.value = "";
        return;
      }
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        setErrors((prev) => ({ ...prev, sub_images: "Ảnh phụ tối đa 5MB" }));
        event.target.value = "";
        return;
      }
    }

    setIsUploadingSubImages(true);
    setErrors((prev) => ({ ...prev, sub_images: "" }));

    try {
      const uploadPromises = fileList.map((file) => uploadToCloudinary(file));
      const urls = await Promise.all(uploadPromises);
      setSubImageUrls(urls);
    } catch (error) {
      toast.error("Tải ảnh phụ thất bại");
      setErrors((prev) => ({ ...prev, sub_images: "Upload thất bại" }));
    } finally {
      setIsUploadingSubImages(false);
      event.target.value = "";
    }
  };

  const handleRemoveAvatar = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setAvatarUrl("");
  };

  const handleRemoveSubImage = (
    event: MouseEvent<HTMLButtonElement>,
    imageIndex: number,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setSubImageUrls((currentImages) =>
      currentImages.filter((_, index) => index !== imageIndex),
    );
  };

  const handleSave = async () => {
    if (isSubmitting) return;

    const productName = formValues.name.trim();
    const productPrice = Number(formValues.base_price_cents);
    const categoryId = Number(formValues.category_id);

    const newErrors: Record<string, string> = {};

    if (!productName) {
      newErrors.name = "Vui lòng nhập tên sản phẩm";
    }

    if (!Number.isFinite(categoryId) || categoryId <= 0) {
      newErrors.category_id = "Vui lòng chọn danh mục";
    }

    if (!formValues.base_price_cents.trim()) {
      newErrors.base_price_cents = "Vui lòng nhập giá sản phẩm";
    } else if (!Number.isFinite(productPrice) || productPrice < 0) {
      newErrors.base_price_cents = "Giá sản phẩm không hợp lệ";
    }

    // CHANGED: Validate avatarUrl instead of imageDataUrl
    if (!avatarUrl) {
      newErrors.avatar = "Vui lòng chọn ảnh đại diện sản phẩm";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // action-(tạo sản phẩm)
      // CHANGED: Submit payload with avatar_url, sub_images, and images (for compatibility)
      const filteredSubImages = subImageUrls.filter((url) => url !== "");
      const result = await createProductAction({
        base_price_cents: productPrice,
        category_id: categoryId,
        description: formValues.description.trim() || undefined,
        images: [avatarUrl, ...filteredSubImages],
        avatar_url: avatarUrl,
        sub_images: filteredSubImages,
        is_active: formValues.is_active,
        name: productName,
      });

      if ("error" in result && result.error) {
        toast.error(getFriendlyResponseError(result.error));
        return;
      }

      if ("success" in result && result.success) {
        toast.success("Đã thêm sản phẩm");
        await onSave?.();
        // CHANGED: Reset avatar and sub images states on success
        setAvatarUrl("");
        setSubImageUrls([]);
        setFormValues(initialProductFormValues);
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
      aria-labelledby="product-modal-title"
      aria-describedby="product-modal-description"
    >
      <Box className={`${styles.modalPaper} ${styles.productPaper}`}>
        <Box className={styles.header}>
          <Typography
            id="product-modal-title"
            component="h3"
            className={styles.title}
          >
            Thêm sản phẩm mới
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
          id="product-modal-description"
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
              error={Boolean(errors.name)}
              helperText={errors.name}
            />

            <FormControl fullWidth className={styles.field} error={Boolean(errors.category_id)}>
              <InputLabel id="product-category-label">Danh mục</InputLabel>
              <Select
                labelId="product-category-label"
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
              {errors.category_id && <FormHelperText>{errors.category_id}</FormHelperText>}
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
            error={Boolean(errors.base_price_cents)}
            helperText={errors.base_price_cents}
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

          {/* CHANGED: Render avatar upload field */}
          <Box>
            <Typography
              component="label"
              htmlFor="product-avatar-upload"
              className={styles.sectionLabel}
            >
              Ảnh đại diện (Avatar)
            </Typography>
            <label
              htmlFor="product-avatar-upload"
              className={styles.uploadArea}
              style={{ borderColor: errors.avatar ? "#6B1218" : undefined }}
            >
              {isUploadingAvatar ? (
                <span className={styles.uploadText}>Đang tải ảnh đại diện...</span>
              ) : avatarUrl ? (
                <>
                  <Box className={styles.imagePreviewWrapper}>
                    <Box
                      component="img"
                      src={avatarUrl}
                      alt="Ảnh đại diện"
                      className="h-32 w-32 rounded-xl object-cover shadow-[0_14px_34px_rgba(44,24,16,0.16)]"
                    />
                    <button
                      type="button"
                      className={styles.removeImageButton}
                      onClick={handleRemoveAvatar}
                      aria-label="Xóa ảnh đại diện"
                      title="Xóa ảnh"
                    >
                      ×
                    </button>
                  </Box>
                  <span className={styles.uploadHint}>
                    Bấm để chọn ảnh khác
                  </span>
                </>
              ) : (
                <>
                  <span className={styles.uploadIcon}>📷</span>
                  <span className={styles.uploadText}>
                    Chọn ảnh đại diện cho sản phẩm
                  </span>
                  <span className={styles.uploadHint}>PNG, JPG tối đa 5MB</span>
                </>
              )}
              <input
                id="product-avatar-upload"
                type="file"
                accept="image/*"
                hidden
                onChange={handleAvatarChange}
                disabled={isSubmitting || isUploadingAvatar}
              />
            </label>
            {errors.avatar && (
              <p style={{ color: "#6B1218", fontSize: 12, marginTop: 4 }}>
                {errors.avatar}
              </p>
            )}
          </Box>

          {/* CHANGED: Render sub-images fields in a single box */}
          <Box>
            <Typography
              component="label"
              htmlFor="product-sub-images-upload"
              className={styles.sectionLabel}
            >
              Ảnh phụ (Chọn tối đa 3 ảnh)
            </Typography>
            <label
              htmlFor="product-sub-images-upload"
              className={styles.uploadArea}
              style={{ borderColor: errors.sub_images ? "#6B1218" : undefined }}
            >
              {isUploadingSubImages ? (
                <span className={styles.uploadText}>Đang tải ảnh phụ...</span>
              ) : subImageUrls.length > 0 ? (
                <>
                  <Box className={styles.subImagesPreview}>
                    {subImageUrls.map((url, idx) => (
                      <Box key={`${url}-${idx}`} className={styles.imagePreviewWrapper}>
                        <Box
                          component="img"
                          src={url}
                          alt={`Ảnh phụ ${idx + 1}`}
                          className="h-20 w-20 rounded-xl object-cover shadow-[0_8px_20px_rgba(44,24,16,0.12)]"
                        />
                        <button
                          type="button"
                          className={styles.removeImageButton}
                          onClick={(event) => handleRemoveSubImage(event, idx)}
                          aria-label={`Xóa ảnh phụ ${idx + 1}`}
                          title="Xóa ảnh"
                        >
                          ×
                        </button>
                      </Box>
                    ))}
                  </Box>
                  <span className={styles.uploadText}>
                    Đã chọn <strong>{subImageUrls.length} ảnh phụ</strong>
                  </span>
                  <span className={styles.uploadHint}>
                    Bấm để chọn lại các ảnh phụ khác (tối đa 3)
                  </span>
                </>
              ) : (
                <>
                  <span className={styles.uploadIcon}>📷</span>
                  <span className={styles.uploadText}>
                    Chọn các ảnh phụ (chọn tối đa 3 ảnh cùng lúc)
                  </span>
                  <span className={styles.uploadHint}>PNG, JPG tối đa 5MB</span>
                </>
              )}
              <input
                id="product-sub-images-upload"
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handleSubImagesChange}
                disabled={isSubmitting || isUploadingSubImages}
              />
            </label>
            {errors.sub_images && (
              <p style={{ color: "#6B1218", fontSize: 12, marginTop: 4 }}>
                {errors.sub_images}
              </p>
            )}
          </Box>
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
            disabled={isSubmitting}
            className={styles.primaryButton}
          >
            {isSubmitting ? "Đang lưu..." : "Lưu sản phẩm"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
