"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { updateCategoryAction } from "../../lib/action/category.action";
import type {
  AdminCategoryFormValues,
  AdminModalEditCategoryProps,
} from "../../lib/types/admin";
import styles from "../../styles/adminModal.module.css";

export default function ModalEditCategory({
  category,
  onClose,
  onSave,
  open,
}: AdminModalEditCategoryProps) {
  const [formValues, setFormValues] = useState<AdminCategoryFormValues>({
    description: "",
    name: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && category) {
      setFormValues({
        description: category.description ?? "",
        name: category.name,
      });
    }
  }, [open, category]);

  const updateField = (field: keyof AdminCategoryFormValues, value: string) => {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!category) return;
    const categoryName = formValues.name.trim();

    if (!categoryName) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }

    setIsSubmitting(true);

    const result = await updateCategoryAction(category.id, {
      name: categoryName,
      description: formValues.description.trim() || undefined,
    });

    if ("error" in result && result.error) {
      toast.error(result.error);
      setIsSubmitting(false);
      return;
    }

    if ("success" in result && result.success) {
      toast.success("Đã cập nhật danh mục thành công");
      await onSave?.();
      onClose();
    }

    setIsSubmitting(false);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="edit-category-modal-title"
      aria-describedby="edit-category-modal-description"
    >
      <Box className={`${styles.modalPaper} ${styles.productPaper}`}>
        <Box className={styles.header}>
          <Typography
            id="edit-category-modal-title"
            component="h3"
            className={styles.title}
          >
            Chỉnh sửa danh mục
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
          id="edit-category-modal-description"
          component="form"
          className={styles.form}
        >
          <TextField
            label="Tên danh mục"
            placeholder="Nhập tên danh mục..."
            value={formValues.name}
            onChange={(event) => updateField("name", event.target.value)}
            fullWidth
            className={styles.field}
          />

          <TextField
            label="Mô tả"
            placeholder="Nhập mô tả danh mục..."
            multiline
            minRows={3}
            value={formValues.description}
            onChange={(event) => updateField("description", event.target.value)}
            fullWidth
            className={styles.field}
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
            {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
