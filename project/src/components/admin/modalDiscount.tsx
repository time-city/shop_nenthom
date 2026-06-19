"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Modal from "@mui/material/Modal";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { startTransition, useEffect, useState } from "react";
import { useToast } from "@/src/components/ui/toast-provider";
import { createDiscountAction } from "../../lib/action/discount.action";
import {
  getFriendlyResponseError,
  isUserInputError,
} from "@/src/lib/utils/errorMessage";
import type {
  AdminDiscountFormValues,
  AdminModalDiscountProps,
} from "../../lib/types/admin";
import styles from "../../styles/adminModal.module.css";

const initialDiscountFormValues: AdminDiscountFormValues = {
  code: "",
  discount_amount_cents: "",
  expires_at: "",
  max_uses: "",
  type: "PERCENTAGE",
};

export default function ModalDiscount({
  onClose,
  onSave,
  open,
}: AdminModalDiscountProps) {
  const { toast } = useToast();
  const [formValues, setFormValues] = useState<AdminDiscountFormValues>(
    initialDiscountFormValues,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    startTransition(() => {
      setFormValues(initialDiscountFormValues);
      setErrors({});
      setIsSubmitting(false);
    });
  }, [open]);

  const updateField = (
    field: keyof AdminDiscountFormValues,
    value: string,
  ) => {
    setFormValues((currentValues) => ({
      ...currentValues,
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

    const code = formValues.code.trim().toUpperCase();
    const discountAmount = Number(formValues.discount_amount_cents);
    const maxUses = Number(formValues.max_uses);

    const validationErrors: Record<string, string> = {};

    if (!code) {
      validationErrors.code = "Vui lòng nhập mã giảm giá";
    }

    if (!formValues.discount_amount_cents || !Number.isFinite(discountAmount) || discountAmount <= 0) {
      validationErrors.discount_amount_cents = "Giá trị giảm không hợp lệ";
    } else if (formValues.type === "PERCENTAGE" && discountAmount > 100) {
      validationErrors.discount_amount_cents = "Phần trăm giảm giá không được vượt quá 100";
    }

    if (!formValues.max_uses || !Number.isInteger(maxUses) || maxUses <= 0) {
      validationErrors.max_uses = "Số lượt tối đa không hợp lệ";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      // action-(tạo mã giảm giá)
      const result = await createDiscountAction({
        code,
        discount_amount_cents: discountAmount,
        expires_at: formValues.expires_at
          ? new Date(`${formValues.expires_at}T23:59:59`)
          : undefined,
        is_active: true,
        max_uses: maxUses,
        type: formValues.type,
      });

      if ("error" in result && result.error) {
        const message = getFriendlyResponseError(result.error);
        if (isUserInputError(message)) {
          setErrors({ code: message });
        } else {
          toast.error(message);
        }
        return;
      }

      if ("success" in result && result.success) {
        toast.success("Đã tạo mã giảm giá");
        await onSave?.();
        setFormValues(initialDiscountFormValues);
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
      aria-labelledby="discount-modal-title"
      aria-describedby="discount-modal-description"
    >
      <Box className={`${styles.modalPaper} ${styles.discountPaper}`}>
        <Box className={styles.header}>
          <Typography
            id="discount-modal-title"
            component="h3"
            className={styles.title}
          >
            Thêm mã giảm giá
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
          id="discount-modal-description"
          component="form"
          className={styles.form}
        >
          <TextField
            label="Mã code"
            placeholder="Nhập mã giảm giá"
            value={formValues.code}
            onChange={(event) => updateField("code", event.target.value)}
            error={Boolean(errors.code)}
            helperText={errors.code}
            fullWidth
            className={`${styles.field} ${styles.uppercaseField}`}
          />

          <Box>
            <Typography className={styles.sectionLabel}>
              Loại giảm giá
            </Typography>
            <RadioGroup
              value={formValues.type}
              name="discount-type"
              row
              onChange={(event) => updateField("type", event.target.value)}
            >
              <FormControlLabel
                value="PERCENTAGE"
                control={<Radio className={styles.radio} />}
                label="Phần trăm (%)"
                className={styles.formControlLabel}
              />
              <FormControlLabel
                value="FIXED"
                control={<Radio className={styles.radio} />}
                label="Cố định (VND)"
                className={styles.formControlLabel}
              />
            </RadioGroup>
          </Box>

          <Box className={styles.twoColumnGrid}>
            <TextField
              label={
                formValues.type === "PERCENTAGE"
                  ? "Mức giảm (%)"
                  : "Mức giảm (VND)"
              }
              placeholder={formValues.type === "PERCENTAGE" ? "Ví dụ: 10" : "Ví dụ: 50000"}
              type="number"
              value={formValues.discount_amount_cents}
              onChange={(event) =>
                updateField("discount_amount_cents", event.target.value)
              }
              error={Boolean(errors.discount_amount_cents)}
              helperText={errors.discount_amount_cents}
              fullWidth
              className={styles.field}
            />
            <TextField
              label="Số lượt tối đa"
              placeholder="Ví dụ: 100"
              type="number"
              value={formValues.max_uses}
              onChange={(event) => updateField("max_uses", event.target.value)}
              error={Boolean(errors.max_uses)}
              helperText={errors.max_uses}
              fullWidth
              className={styles.field}
            />
          </Box>

          <TextField
            label="Ngày hết hạn"
            type="date"
            value={formValues.expires_at}
            onChange={(event) => updateField("expires_at", event.target.value)}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
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
            {isSubmitting ? "Đang lưu..." : "Lưu mã giảm giá"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
