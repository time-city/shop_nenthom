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
import { toast } from "react-toastify";
import type {
  AdminCategoriesSuccessResponseInterface,
  AdminProductCategoryInterface,
} from "../../interface/adminInterface";
import { getCategoriesAction } from "../../lib/action/category.action";
import { createProductAction } from "../../lib/action/product.action";
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

const readImageFile = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Không thể đọc file ảnh"));
    };
    reader.onerror = () => reject(new Error("Không thể đọc file ảnh"));
    reader.readAsDataURL(file);
  });

export default function ModalProduct({
  onClose,
  onSave,
  open,
}: AdminModalProductProps) {
  const [categories, setCategories] = useState<AdminProductCategoryInterface[]>([]);
  const [formValues, setFormValues] = useState<AdminProductFormValues>(
    initialProductFormValues,
  );
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    setFormValues(initialProductFormValues);

    const loadCategories = async () => {
      setIsLoadingCategories(true);

      // action-(lấy danh sách category cho product)
      const result = await getCategoriesAction();

      if ("error" in result && result.error) {
        toast.error(result.error);
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
  }, [open]);

  const updateField = (
    field: keyof AdminProductFormValues,
    value: boolean | string,
  ) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn đúng file ảnh");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error("Ảnh tối đa 5MB");
      event.target.value = "";
      return;
    }

    try {
      const imageDataUrl = await readImageFile(file);
      setFormValues((currentValues) => ({
        ...currentValues,
        image_data_url: imageDataUrl,
        image_file_name: file.name,
      }));
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      event.target.value = "";
    }
  };

  const handleSave = async () => {
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

    if (!imageDataUrl) {
      toast.error("Vui lòng chọn ảnh sản phẩm");
      return;
    }

    setIsSubmitting(true);

    // action-(tạo sản phẩm)
    const result = await createProductAction({
      base_price_cents: productPrice,
      category_id: categoryId,
      description: formValues.description.trim() || undefined,
      images: [imageDataUrl],
      is_active: formValues.is_active,
      name: productName,
    });

    if ("error" in result && result.error) {
      toast.error(result.error);
      setIsSubmitting(false);
      return;
    }

    if ("success" in result && result.success) {
      toast.success("Đã thêm sản phẩm");
      await onSave?.();
      setFormValues(initialProductFormValues);
      onClose();
    }

    setIsSubmitting(false);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
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
            />

            <FormControl fullWidth className={styles.field}>
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
              htmlFor="product-image-upload"
              className={styles.sectionLabel}
            >
              Ảnh sản phẩm
            </Typography>
            <label htmlFor="product-image-upload" className={styles.uploadArea}>
              {formValues.image_data_url ? (
                <>
                  <Box
                    component="img"
                    src={formValues.image_data_url}
                    alt={formValues.image_file_name || "Ảnh sản phẩm"}
                    className="mb-3 h-32 w-32 rounded-xl object-cover shadow-[0_14px_34px_rgba(44,24,16,0.16)]"
                  />
                  <span className={styles.uploadText}>
                    Đã chọn <strong>{formValues.image_file_name}</strong>
                  </span>
                  <span className={styles.uploadHint}>
                    Bấm để chọn ảnh khác
                  </span>
                </>
              ) : (
                <>
                  <span className={styles.uploadIcon}>📷</span>
                  <span className={styles.uploadText}>
                    Kéo thả ảnh hoặc <strong>chọn file từ máy</strong>
                  </span>
                  <span className={styles.uploadHint}>PNG, JPG tối đa 5MB</span>
                </>
              )}
              <input
                id="product-image-upload"
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
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
