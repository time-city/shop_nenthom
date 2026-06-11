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
import type { AdminModalProductProps } from "../../lib/types/admin";
import styles from "../../styles/adminModal.module.css";

export default function ModalProduct({
  onClose,
  onSave,
  open,
}: AdminModalProductProps) {
  const handleSave = () => {
    onSave?.();
    onClose();
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
              fullWidth
              className={styles.field}
            />

            <FormControl fullWidth className={styles.field}>
              <InputLabel id="product-category-label">Danh mục</InputLabel>
              <Select
                labelId="product-category-label"
                label="Danh mục"
                defaultValue=""
              >
                <MenuItem value="">Chọn danh mục</MenuItem>
                <MenuItem value="Nến hũ">Nến hũ</MenuItem>
                <MenuItem value="Nến cốc">Nến cốc</MenuItem>
                <MenuItem value="Nến trụ">Nến trụ</MenuItem>
                <MenuItem value="Nến tealight">Nến tealight</MenuItem>
                <MenuItem value="Nến nổi">Nến nổi</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TextField
            label="Giá (VND)"
            placeholder="Ví dụ: 180000"
            type="number"
            fullWidth
            className={styles.field}
          />

          <TextField
            label="Mô tả"
            placeholder="Mô tả chi tiết về sản phẩm..."
            multiline
            minRows={4}
            fullWidth
            className={styles.field}
          />

          <Box>
            <Typography
              component="label"
              htmlFor="pImage"
              className={styles.sectionLabel}
            >
              Ảnh sản phẩm
            </Typography>
            <Box
              component="label"
              htmlFor="pImage"
              className={styles.uploadArea}
            >
              <svg
                className={styles.uploadIcon}
                width="34"
                height="34"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
              <span className={styles.uploadText}>
                Kéo thả ảnh hoặc{" "}
                <strong>chọn file</strong>
              </span>
              <span className={styles.uploadHint}>
                PNG, JPG tối đa 5MB
              </span>
              <input id="pImage" type="file" accept="image/*" hidden />
            </Box>
          </Box>

          <FormControlLabel
            control={
              <Switch
                defaultChecked
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
            className={styles.primaryButton}
          >
            Lưu sản phẩm
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
