"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Modal from "@mui/material/Modal";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { AdminModalEditIngredientProps } from "../../lib/types/admin";
import styles from "../../styles/adminModal.module.css";

const toNumberValue = (value?: string) =>
  value ? value.replace(/[^\d-]/g, "") : "";

const formatPriceLabel = (value: string) => {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) return "0 đ";

  return `${new Intl.NumberFormat("vi-VN").format(numberValue)} đ`;
};

export default function ModalEditIngre({
  ingredientType,
  item,
  onClose,
  onSave,
  open,
}: AdminModalEditIngredientProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [hex, setHex] = useState("#F5E6D3");
  const [inStock, setInStock] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [weightGram, setWeightGram] = useState("");

  const nameLabel = useMemo(() => {
    if (ingredientType === "color") return "Tên màu";
    if (ingredientType === "type") return "Bao bì";
    if (ingredientType === "size") return "Kích thước";
    if (ingredientType === "topping") return "Tên topping";

    return "Tên mùi hương";
  }, [ingredientType]);

  useEffect(() => {
    if (!item) return;

    setName(item.name);
    setPrice(toNumberValue(item.price));
    setHex(item.hex ?? "#F5E6D3");
    setInStock(item.in_stock ?? true);
    setIsSaving(false);
    setWeightGram(String(item.weight_gram ?? ""));
  }, [item]);

  const handleSave = async () => {
    if (!item || isSaving) return;

    const values = {
      hex,
      in_stock: inStock,
      is_active: true,
      name: name.trim() || item.name,
      price_extra_cents: Number(price) || 0,
      weight_gram: Number(weightGram) || item.weight_gram || 0,
    };
    const updatedItem = {
      ...item,
      hex: ingredientType === "color" ? hex : item.hex,
      in_stock: ingredientType === "topping" ? values.in_stock : item.in_stock,
      name: values.name,
      price: formatPriceLabel(price),
      weight_gram:
        ingredientType === "size"
          ? values.weight_gram
          : item.weight_gram,
    };
    setIsSaving(true);

    try {
      const shouldClose = await onSave?.(updatedItem, values);

      if (shouldClose === false) return;

      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={isSaving ? undefined : onClose}
      aria-labelledby="edit-ingredient-modal-title"
      aria-describedby="edit-ingredient-modal-description"
    >
      <Box className={`${styles.modalPaper} ${styles.ingredientPaper}`}>
        <Box className={styles.header}>
          <Typography
            id="edit-ingredient-modal-title"
            component="h3"
            className={styles.title}
          >
            Chỉnh sửa nguyên liệu
          </Typography>

          <Button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Đóng modal"
            className={styles.closeButton}
          >
            ×
          </Button>
        </Box>

        <Divider className={styles.divider} />

        <Box
          id="edit-ingredient-modal-description"
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
              <Typography component="label" className={styles.sectionLabel}>
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
              <Typography component="label" className={styles.sectionLabel}>
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
            disabled={isSaving}
            className={styles.ghostButton}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="contained"
            onClick={handleSave}
            disabled={isSaving}
            className={styles.primaryButton}
          >
            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
