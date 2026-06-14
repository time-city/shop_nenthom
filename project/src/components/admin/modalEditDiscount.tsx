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
import { useEffect, useState } from "react";
import { useToast } from "@/src/components/ui/toast-provider";
import { updateDiscountAction } from "../../lib/action/discount.action";
import type {
  AdminDiscountFormValues,
  AdminModalEditDiscountProps,
} from "../../lib/types/admin";
import styles from "../../styles/adminModal.module.css";

export default function ModalEditDiscount({
  discount,
  onClose,
  onSave,
  open,
}: AdminModalEditDiscountProps) {
  const { toast } = useToast();
  const [formValues, setFormValues] = useState<AdminDiscountFormValues>({
    code: "",
    discount_amount_cents: "",
    expires_at: "",
    max_uses: "",
    type: "PERCENTAGE",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && discount) {
      const expiresAt = discount.expires_at
        ? new Date(discount.expires_at).toISOString().split("T")[0]
        : "";

      setFormValues({
        code: discount.code,
        discount_amount_cents: String(discount.discount_amount_cents),
        expires_at: expiresAt,
        max_uses: String(discount.max_uses),
        type: discount.type,
      });
      setIsSubmitting(false);
    }
  }, [open, discount]);

  const updateField = (field: keyof AdminDiscountFormValues, value: string) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!discount || isSubmitting) return;

    const code = formValues.code.trim().toUpperCase();
    const discountAmount = Number(formValues.discount_amount_cents);
    const maxUses = Number(formValues.max_uses);

    if (!code) {
      toast.error("Vui lòng nhập mã giảm giá");
      return;
    }

    if (!Number.isFinite(discountAmount) || discountAmount <= 0) {
      toast.error("Giá trị giảm không hợp lệ");
      return;
    }

    if (formValues.type === "PERCENTAGE" && discountAmount > 100) {
      toast.error("Phần trăm giảm giá không được vượt quá 100");
      return;
    }

    if (!Number.isInteger(maxUses) || maxUses <= 0) {
      toast.error("Số lượt tối đa không hợp lệ");
      return;
    }

    setIsSubmitting(true);

    try {
      // action-(cập nhật mã giảm giá)
      const result = await updateDiscountAction(discount.id, {
        code,
        discount_amount_cents: discountAmount,
        expires_at: formValues.expires_at
          ? new Date(`${formValues.expires_at}T23:59:59`)
          : undefined,
        max_uses: maxUses,
        type: formValues.type,
      });

      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }

      if ("success" in result && result.success) {
        toast.success("Đã cập nhật mã giảm giá");
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
      aria-labelledby="edit-discount-modal-title"
      aria-describedby="edit-discount-modal-description"
    >
      <Box className={`${styles.modalPaper} ${styles.discountPaper}`}>
        <Box className={styles.header}>
          <Typography
            id="edit-discount-modal-title"
            component="h3"
            className={styles.title}
          >
            Chỉnh sửa mã giảm giá
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
          id="edit-discount-modal-description"
          component="form"
          className={styles.form}
        >
          <TextField
            label="Mã code"
            placeholder="Nhập mã giảm giá"
            value={formValues.code}
            onChange={(event) => updateField("code", event.target.value)}
            fullWidth
            className={`${styles.field} ${styles.uppercaseField}`}
          />

          <Box>
            <Typography className={styles.sectionLabel}>
              Loại giảm giá
            </Typography>
            <RadioGroup
              value={formValues.type}
              name="edit-discount-type"
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
              fullWidth
              className={styles.field}
            />
            <TextField
              label="Số lượt tối đa"
              placeholder="Ví dụ: 100"
              type="number"
              value={formValues.max_uses}
              onChange={(event) => updateField("max_uses", event.target.value)}
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
            {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
