"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { startTransition, useEffect, useState } from "react";
import { useToast } from "@/src/components/ui/toast-provider";
import { updateCategoryAction } from "../../lib/action/category.action";
import {
  getFriendlyResponseError,
  isUserInputError,
} from "@/src/lib/utils/errorMessage";
import type {
  AdminCategoryFormValues,
  AdminModalEditCategoryProps,
} from "../../lib/types/admin";
import styles from "../../styles/adminModal.module.css";
import { callAction } from "@/src/lib/utils/callAction";

export default function ModalEditCategory({
  category,
  onClose,
  onSave,
  open,
}: AdminModalEditCategoryProps) {
  const { toast } = useToast();
  const [formValues, setFormValues] = useState<AdminCategoryFormValues>({
    description: "",
    name: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && category) {
      startTransition(() => {
        setFormValues({
          description: category.description ?? "",
          name: category.name,
        });
        setErrors({});
        setIsSubmitting(false);
      });
    }
  }, [open, category]);

  const updateField = (field: keyof AdminCategoryFormValues, value: string) => {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        [field]: "",
      }));
    }
  };

  const handleSave = async () => {
    if (!category || isSubmitting) return;

    const categoryName = formValues.name.trim();

    if (!categoryName) {
      setErrors({ name: "Vui lòng nhập tên danh mục" });
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const result = await callAction(() => updateCategoryAction(category.id, {
        name: categoryName,
        description: formValues.description.trim() || undefined,
      }), "Không thể cập nhật danh mục. Vui lòng thử lại sau.");

      if ("error" in result && result.error) {
        const message = getFriendlyResponseError(result.error);
        if (isUserInputError(message)) {
          setErrors({ name: message });
        } else {
          toast.error(message);
        }
        return;
      }

      if ("success" in result && result.success) {
        toast.success("Đã cập nhật danh mục thành công");
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
      aria-labelledby="edit-category-modal-title"
      aria-describedby="edit-category-modal-description"
    >
      <Box className={`${styles.modalPaper} ${styles.categoryPaper}`}>
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
            disabled={isSubmitting}
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
            error={Boolean(errors.name)}
            helperText={errors.name}
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
            {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
