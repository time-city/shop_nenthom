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
import type { AdminModalDiscountProps } from "../../lib/types/admin";
import styles from "../../styles/adminModal.module.css";

export default function ModalDiscount({
  onClose,
  onSave,
  open,
}: AdminModalDiscountProps) {
  const handleSave = () => {
    onSave?.();
    onClose();
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
            fullWidth
            className={`${styles.field} ${styles.uppercaseField}`}
          />

          <Box>
            <Typography className={styles.sectionLabel}>
              Loại giảm giá
            </Typography>
            <RadioGroup defaultValue="percent" name="discount-type" row>
              <FormControlLabel
                value="percent"
                control={<Radio className={styles.radio} />}
                label="Phần trăm (%)"
                className={styles.formControlLabel}
              />
              <FormControlLabel
                value="fixed"
                control={<Radio className={styles.radio} />}
                label="Cố định (VND)"
                className={styles.formControlLabel}
              />
            </RadioGroup>
          </Box>

          <Box className={styles.twoColumnGrid}>
            <TextField
              label="Mức giảm (%)"
              placeholder="Ví dụ: 10"
              type="number"
              fullWidth
              className={styles.field}
            />
            <TextField
              label="Số lượt tối đa"
              placeholder="Ví dụ: 100"
              type="number"
              fullWidth
              className={styles.field}
            />
          </Box>

          <TextField
            label="Ngày hết hạn"
            type="date"
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
            className={styles.primaryButton}
          >
            Lưu mã giảm giá
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
