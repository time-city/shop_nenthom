"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Modal from "@mui/material/Modal";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

export type IngredientType = "scent" | "color" | "size" | "topping" | "type";

type ModalIngredientProps = {
  ingredientType: IngredientType;
  onClose: () => void;
  onSave?: () => void;
  open: boolean;
};

const ingredientLabels: Record<IngredientType, string> = {
  color: "Màu sáp",
  scent: "Mùi hương",
  size: "Kích thước",
  topping: "Topping",
  type: "Loại nến",
};

const burgundy = "#6B1218";
const burgundyDark = "#4A0C10";
const cream = "#F8F0E4";
const text = "#2C1810";
const muted = "#6B4C35";

const modalStyle = {
  bgcolor: cream,
  border: "1px solid rgba(107, 78, 53, 0.14)",
  borderRadius: "16px",
  boxShadow: "0 16px 48px rgba(44, 24, 16, 0.16)",
  left: "50%",
  maxHeight: "88vh",
  maxWidth: 560,
  outline: "none",
  overflowY: "auto",
  position: "absolute",
  top: "50%",
  transform: "translate(-50%, -50%)",
  width: "calc(100% - 32px)",
};

const fieldSx = {
  "& .MuiInputBase-input": {
    color: text,
    fontFamily: "var(--admin-font-body)",
    fontSize: "0.88rem",
  },
  "& .MuiInputLabel-root": {
    color: muted,
    fontFamily: "var(--admin-font-body)",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: burgundy,
  },
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#fff",
    borderRadius: "8px",
    "& fieldset": {
      borderColor: "rgba(107, 78, 53, 0.18)",
      borderWidth: "1.5px",
    },
    "&:hover fieldset": {
      borderColor: "rgba(107, 18, 24, 0.45)",
    },
    "&.Mui-focused fieldset": {
      borderColor: burgundy,
      boxShadow: "0 0 0 3px rgba(107, 18, 24, 0.08)",
    },
  },
};

export default function ModalIngredient({
  ingredientType,
  onClose,
  onSave,
  open,
}: ModalIngredientProps) {
  const label = ingredientLabels[ingredientType];
  const nameLabel =
    ingredientType === "color"
      ? "Tên màu"
      : ingredientType === "type"
        ? "Loại nến"
        : ingredientType === "size"
          ? "Kích thước"
          : ingredientType === "topping"
            ? "Tên topping"
            : "Tên mùi hương";

  const handleSave = () => {
    onSave?.();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="ingredient-modal-title"
      aria-describedby="ingredient-modal-description"
    >
      <Box sx={modalStyle}>
        <Box className="flex items-center justify-between px-6 py-5">
          <Typography
            id="ingredient-modal-title"
            component="h3"
            sx={{
              color: text,
              fontFamily: "var(--admin-font-display)",
              fontSize: "1.25rem",
              fontWeight: 700,
            }}
          >
            Thêm nguyên liệu
          </Typography>

          <Button
            type="button"
            onClick={onClose}
            aria-label="Đóng modal"
            sx={{
              borderRadius: "8px",
              color: muted,
              fontSize: "1.25rem",
              height: 34,
              minWidth: 34,
              width: 34,
              "&:hover": {
                bgcolor: "rgba(185, 28, 28, 0.08)",
                color: "#B91C1C",
              },
            }}
          >
            ×
          </Button>
        </Box>

        <Divider sx={{ borderColor: "rgba(107, 78, 53, 0.14)" }} />

        <Box
          id="ingredient-modal-description"
          component="form"
          className="grid gap-5 px-6 py-6"
        >
          <TextField
            label={nameLabel}
            placeholder="Nhập tên..."
            fullWidth
            sx={fieldSx}
          />

          <TextField
            label="Giá cộng thêm (VND)"
            placeholder="Ví dụ: 15000"
            type="number"
            fullWidth
            sx={fieldSx}
          />

          {ingredientType === "color" ? (
            <Box>
              <Typography
                component="label"
                sx={{
                  color: muted,
                  display: "block",
                  fontFamily: "var(--admin-font-body)",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  mb: 1,
                  textTransform: "uppercase",
                }}
              >
                Mã màu hex
              </Typography>
              <Box className="flex items-center gap-3">
                <TextField
                  type="color"
                  defaultValue="#F5E6D3"
                  sx={{
                    ...fieldSx,
                    maxWidth: 64,
                    "& .MuiInputBase-input": {
                      cursor: "pointer",
                      height: 44,
                      padding: "4px",
                    },
                  }}
                />
              <TextField
                placeholder="#F5E6D3"
                fullWidth
                slotProps={{ htmlInput: { maxLength: 7 } }}
                sx={fieldSx}
              />
              </Box>
            </Box>
          ) : null}

          {ingredientType === "topping" ? (
            <Box>
              <Typography
                component="label"
                sx={{
                  color: muted,
                  display: "block",
                  fontFamily: "var(--admin-font-body)",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  mb: 1,
                  textTransform: "uppercase",
                }}
              >
                Trạng thái tồn kho
              </Typography>
              <Box className="flex items-center gap-3">
                <Switch
                  defaultChecked
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "#1F6B3A",
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "#1F6B3A",
                    },
                  }}
                />
                <span className="text-sm text-[#2C1810]">Còn hàng</span>
              </Box>
            </Box>
          ) : null}
        </Box>

        <Divider sx={{ borderColor: "rgba(107, 78, 53, 0.14)" }} />

        <Box className="flex flex-col-reverse gap-3 px-6 py-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            onClick={onClose}
            sx={{
              borderRadius: "8px",
              color: muted,
              fontFamily: "var(--admin-font-body)",
              fontWeight: 600,
              px: 2.5,
              py: 1,
              "&:hover": {
                bgcolor: "rgba(107, 78, 53, 0.06)",
                color: text,
              },
            }}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="contained"
            onClick={handleSave}
            sx={{
              bgcolor: burgundy,
              borderRadius: "8px",
              boxShadow: "0 8px 18px rgba(107, 18, 24, 0.18)",
              color: "#F5F0E8",
              fontFamily: "var(--admin-font-body)",
              fontWeight: 700,
              px: 2.5,
              py: 1,
              "&:hover": {
                bgcolor: burgundyDark,
                boxShadow: "0 12px 24px rgba(107, 18, 24, 0.25)",
              },
            }}
          >
            Lưu
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
