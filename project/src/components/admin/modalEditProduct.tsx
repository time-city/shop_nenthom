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
import { updateProductAction } from "../../lib/action/product.action";
import { getFriendlyResponseError } from "@/src/lib/utils/errorMessage";
import { uploadToCloudinary } from "@/src/lib/utils/uploadImage";
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

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const getProductImages = (images: unknown) => {
  if (!Array.isArray(images)) return [];

  return images
    .filter((image): image is string => typeof image === "string" && image.length > 0)
    .slice(0, 4);
};

export default function ModalEditProduct({
  onClose,
  onSave,
  open,
  product,
  categories: propCategories,
}: AdminModalEditProductProps & { categories?: AdminProductCategoryInterface[] }) {
  const { toast } = useToast();
  const [categories, setCategories] = useState<AdminProductCategoryInterface[]>([]);
  const [formValues, setFormValues] = useState<AdminProductFormValues>(
    initialProductFormValues,
  );
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [subImageUrls, setSubImageUrls] = useState<string[]>([]);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingSubImages, setIsUploadingSubImages] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open || !product) {
      setTimeout(() => {
        setIsUploadingAvatar(false);
        setIsUploadingSubImages(false);
      }, 0);
      return;
    }

    const currentImages = getProductImages(product.images);

    setTimeout(() => {
      setFormValues({
        base_price_cents: String(product.base_price_cents),
        category_id: String(product.category_id),
        description: product.description ?? "",
        image_data_url: "",
        image_file_name: "",
        is_active: product.is_active,
        name: product.name,
      });
      setAvatarUrl(currentImages[0] ?? "");
      setSubImageUrls(currentImages.slice(1, 4));
      setIsSubmitting(false);
      setIsUploadingAvatar(false);
      setIsUploadingSubImages(false);
      setErrors({});
    }, 0);

    if (propCategories && propCategories.length > 0) {
      setCategories(propCategories);
      return;
    }

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
  }, [open, product, toast, propCategories]);

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
    } catch {
      toast.error("Tải ảnh đại diện thất bại");
      setErrors((prev) => ({ ...prev, avatar: "Upload thất bại" }));
    } finally {
      setIsUploadingAvatar(false);
      event.target.value = "";
    }
  };

  const handleSubImagesChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (isSubmitting || isUploadingSubImages) return;

    const files = event.target.files;
    if (!files?.length) return;

    const fileList = Array.from(files);

    if (fileList.length > 3) {
      setErrors((prev) => ({
        ...prev,
        sub_images: "Chỉ được chọn tối đa 3 ảnh phụ",
      }));
      event.target.value = "";
      return;
    }

    const invalidFile = fileList.find((file) => !file.type.startsWith("image/"));
    if (invalidFile) {
      setErrors((prev) => ({
        ...prev,
        sub_images: "Vui lòng chọn đúng file ảnh",
      }));
      event.target.value = "";
      return;
    }

    const oversizedFile = fileList.find(
      (file) => file.size > MAX_IMAGE_SIZE_BYTES,
    );
    if (oversizedFile) {
      setErrors((prev) => ({
        ...prev,
        sub_images: "Mỗi ảnh phụ tối đa 5MB",
      }));
      event.target.value = "";
      return;
    }

    setIsUploadingSubImages(true);
    setErrors((prev) => ({ ...prev, sub_images: "" }));

    try {
      const urls = await Promise.all(fileList.map(uploadToCloudinary));
      setSubImageUrls(urls);
    } catch {
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
    if (isUploadingAvatar || isUploadingSubImages) return;
    if (!product || isSubmitting) return;

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

    if (!avatarUrl) {
      newErrors.avatar = "Vui lòng chọn ảnh đại diện sản phẩm";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // action-(cập nhật sản phẩm)
      const result = await updateProductAction(product.id, {
        base_price_cents: productPrice,
        category_id: categoryId,
        description: formValues.description.trim() || undefined,
        images: [avatarUrl, ...subImageUrls.slice(0, 3)],
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
      <Box className={`${styles.modalPaper} ${styles.editProductPaper}`}>
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
              error={Boolean(errors.name)}
              helperText={errors.name}
            />

            <FormControl fullWidth className={styles.field} error={Boolean(errors.category_id)}>
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

          <Box>
            <Typography
              component="label"
              htmlFor="edit-product-avatar-upload"
              className={styles.sectionLabel}
            >
              Ảnh đại diện (Avatar)
            </Typography>
            <label
              htmlFor="edit-product-avatar-upload"
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
                  <span className={styles.uploadHint}>Bấm để chọn ảnh khác</span>
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
                id="edit-product-avatar-upload"
                type="file"
                accept="image/*"
                hidden
                onChange={handleAvatarChange}
                disabled={isUploadingAvatar || isSubmitting}
              />
            </label>
            {errors.avatar && (
              <p style={{ color: "#6B1218", fontSize: 12, marginTop: 4 }}>
                {errors.avatar}
              </p>
            )}
          </Box>

          <Box>
            <Typography
              component="label"
              htmlFor="edit-product-sub-images-upload"
              className={styles.sectionLabel}
            >
              Ảnh phụ (Chọn tối đa 3 ảnh)
            </Typography>
            <label
              htmlFor="edit-product-sub-images-upload"
              className={styles.uploadArea}
              style={{
                borderColor: errors.sub_images ? "#6B1218" : undefined,
              }}
            >
              {isUploadingSubImages ? (
                <span className={styles.uploadText}>Đang tải ảnh phụ...</span>
              ) : subImageUrls.length > 0 ? (
                <>
                  <Box className={styles.subImagesPreview}>
                    {subImageUrls.map((url, index) => (
                      <Box
                        key={`${url}-${index}`}
                        className={styles.imagePreviewWrapper}
                      >
                        <Box
                          component="img"
                          src={url}
                          alt={`Ảnh phụ ${index + 1}`}
                          className="h-20 w-20 rounded-xl object-cover shadow-[0_8px_20px_rgba(44,24,16,0.12)]"
                        />
                        <button
                          type="button"
                          className={styles.removeImageButton}
                          onClick={(event) =>
                            handleRemoveSubImage(event, index)
                          }
                          aria-label={`Xóa ảnh phụ ${index + 1}`}
                          title="Xóa ảnh"
                        >
                          ×
                        </button>
                      </Box>
                    ))}
                  </Box>
                  <span className={styles.uploadText}>
                    Đang có <strong>{subImageUrls.length} ảnh phụ</strong>
                  </span>
                  <span className={styles.uploadHint}>
                    Bấm để chọn lại các ảnh phụ khác
                  </span>
                </>
              ) : (
                <>
                  <span className={styles.uploadIcon}>📷</span>
                  <span className={styles.uploadText}>
                    Chọn các ảnh phụ cho sản phẩm
                  </span>
                  <span className={styles.uploadHint}>
                    Tối đa 3 ảnh, mỗi ảnh không quá 5MB
                  </span>
                </>
              )}
              <input
                id="edit-product-sub-images-upload"
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handleSubImagesChange}
                disabled={isUploadingSubImages || isSubmitting}
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
            disabled={
              isSubmitting || isUploadingAvatar || isUploadingSubImages
            }
            className={styles.primaryButton}
          >
            {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
