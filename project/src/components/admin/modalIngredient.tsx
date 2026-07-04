"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Modal from "@mui/material/Modal";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { AdminModalIngredientProps } from "../../lib/types/admin";
import styles from "../../styles/adminModal.module.css";

export default function ModalIngredient({
  ingredientType,
  onClose,
  onSave,
  open,
}: AdminModalIngredientProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [hex, setHex] = useState("#F5E6D3");
  const [inStock, setInStock] = useState(true);
  const [weightGram, setWeightGram] = useState("");
  const nameLabel =
    ingredientType === "color"
      ? "Tên màu"
      : ingredientType === "type"
        ? "Bao bì"
        : ingredientType === "size"
          ? "Kích thước"
          : ingredientType === "topping"
            ? "Tên topping"
            : "Tên mùi hương";

  useEffect(() => {
    if (!open) return;

    const next = {
      name: "",
      price: "",
      hex: "#F5E6D3",
      inStock: true,
      weightGram: "",
    };

    setName(next.name);
    setPrice(next.price);
    setHex(next.hex);
    setInStock(next.inStock);
    setWeightGram(next.weightGram);
  }, [open, ingredientType]);

  const handleSave = async () => {
    const shouldClose = await onSave?.({
      hex,
      in_stock: inStock,
      is_active: true,
      name: name.trim(),
      price_extra_cents: Number(price) || 0,
      stock: inStock ? 1 : 0,
      weight_gram: Number(weightGram) || 0,
    });

    if (shouldClose === false) return;

    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="ingredient-modal-title"
      aria-describedby="ingredient-modal-description"
    >
      <Box className={`${styles.modalPaper} ${styles.ingredientPaper}`}>
        <Box className={styles.header}>
          <Typography
            id="ingredient-modal-title"
            component="h3"
            className={styles.title}
          >
            Thêm nguyên liệu
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
          id="ingredient-modal-description"
          component="form"
          className={styles.form}
        >
          <TextField
            label={nameLabel}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nhập tên..."
            fullWidth
            className={styles.field}
          />

          <TextField
            label="Giá cộng thêm (VND)"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="Ví dụ: 15000"
            type="number"
            fullWidth
            className={styles.field}
          />

          {ingredientType === "size" ? (
            <TextField
              label="Khối lượng (gram)"
              value={weightGram}
              onChange={(event) => setWeightGram(event.target.value)}
              placeholder="Ví dụ: 100"
              type="number"
              fullWidth
              className={styles.field}
            />
          ) : null}

          {ingredientType === "color" ? (
            <Box>
              <Typography
                component="label"
                className={styles.sectionLabel}
              >
                Mã màu hex
              </Typography>
              <Box className={styles.inlineRow}>
                <TextField
                  type="color"
                  value={hex}
                  onChange={(event) => setHex(event.target.value)}
                  className={`${styles.field} ${styles.colorPickerField}`}
                />
              <TextField
                value={hex}
                onChange={(event) => setHex(event.target.value)}
                placeholder="#F5E6D3"
                fullWidth
                slotProps={{ htmlInput: { maxLength: 7 } }}
                className={styles.field}
              />
              </Box>
            </Box>
          ) : null}

          {ingredientType === "topping" ? (
            <Box>
              <Typography
                component="label"
                className={styles.sectionLabel}
              >
                Trạng thái tồn kho
              </Typography>
              <Box className={styles.inlineRow}>
                <Switch
                  checked={inStock}
                  onChange={(event) => setInStock(event.target.checked)}
                  className={styles.greenSwitch}
                />
                <span className={styles.switchText}>
                  {inStock ? "Còn hàng" : "Hết hàng"}
                </span>
              </Box>
            </Box>
          ) : null}
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
            Lưu
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
