"use client";
import { Box, Button, Divider, Modal, TextField, Typography } from "@/src/components/ui/mui-mock";


import { startTransition, useEffect, useState } from "react";
import { useToast } from "@/src/components/ui/toastProvider";
import { createCategoryAction } from "../../../lib/action/category.action";
import {
  getFriendlyResponseError,
  isUserInputError,
} from "@/src/lib/utils/errorMessage";
import type {
  AdminCategoryFormValues,
  AdminModalCategoryProps,
} from "../../../lib/types/admin";
import styles from "../../../styles/adminModal.module.css";
import { callAction } from "@/src/lib/utils/callAction";

const initialFormValues: AdminCategoryFormValues = {
  description: "",
  name: "",
};

export default function ModalCategory({
  onClose,
  onSave,
  open,
}: AdminModalCategoryProps) {
  const { toast } = useToast();
  const [formValues, setFormValues] =
    useState<AdminCategoryFormValues>(initialFormValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      startTransition(() => {
        setFormValues(initialFormValues);
        setErrors({});
        setIsSubmitting(false);
      });
    }
  }, [open]);

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
    if (isSubmitting) return;

    const categoryName = formValues.name.trim();

    if (!categoryName) {
      setErrors({ name: "Vui lòng nhập tên danh mục" });
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const result = await callAction(() => createCategoryAction({
        name: categoryName,
        description: formValues.description.trim() || undefined,
      }), "Không thể thêm danh mục. Vui lòng thử lại sau.");

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
        toast.success("Đã thêm danh mục thành công");
        await onSave?.(result.data);
        setFormValues(initialFormValues);
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
      aria-labelledby="category-modal-title"
      aria-describedby="category-modal-description"
    >
      <Box className={`${styles.modalPaper} ${styles.categoryPaper}`}>
        <Box className={styles.header}>
          <Typography
            id="category-modal-title"
            component="h3"
            className={styles.title}
          >
            Thêm danh mục mới
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
          id="category-modal-description"
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
            {isSubmitting ? "Đang lưu..." : "Lưu danh mục"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
