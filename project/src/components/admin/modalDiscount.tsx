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
import { toast } from "react-toastify";
import { createDiscountAction } from "../../lib/action/discount.action";
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
  const [formValues, setFormValues] = useState<AdminDiscountFormValues>(
    initialDiscountFormValues,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Reset only when modal opens to satisfy eslint react-hooks rule.
    if (!open) return;

    setFormValues(initialDiscountFormValues);
  }, [open]);

  const updateField = (
    field: keyof AdminDiscountFormValues,
    value: string,
  ) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  };

  const handleSave = async () => {
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
      toast.error(result.error);
      setIsSubmitting(false);
      return;
    }

    if ("success" in result && result.success) {
      toast.success("Đã tạo mã giảm giá");
      await onSave?.();
      setFormValues(initialDiscountFormValues);
      onClose();
    }

    setIsSubmitting(false);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
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
