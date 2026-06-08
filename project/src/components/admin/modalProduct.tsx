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

type ModalProductProps = {
  onClose: () => void;
  onSave?: () => void;
  open: boolean;
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
  maxWidth: 620,
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

export default function ModalProduct({ onClose, onSave, open }: ModalProductProps) {
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
      <Box sx={modalStyle}>
        <Box className="flex items-center justify-between px-6 py-5">
          <Typography
            id="product-modal-title"
            component="h3"
            sx={{
              color: text,
              fontFamily: "var(--admin-font-display)",
              fontSize: "1.25rem",
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            Thêm sản phẩm mới
          </Typography>

          <Button
            type="button"
            onClick={onClose}
            aria-label="Đóng modal"
            sx={{
              borderRadius: "8px",
              color: muted,
              minWidth: 34,
              width: 34,
              height: 34,
              fontSize: "1.25rem",
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
          id="product-modal-description"
          component="form"
          className="grid gap-5 px-6 py-6"
        >
          <Box className="grid gap-4 md:grid-cols-2">
            <TextField
              label="Tên sản phẩm"
              placeholder="Nhập tên sản phẩm..."
              fullWidth
              sx={fieldSx}
            />

            <FormControl fullWidth sx={fieldSx}>
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
            sx={fieldSx}
          />

          <TextField
            label="Mô tả"
            placeholder="Mô tả chi tiết về sản phẩm..."
            multiline
            minRows={4}
            fullWidth
            sx={fieldSx}
          />

          <Box>
            <Typography
              component="label"
              htmlFor="pImage"
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
              Ảnh sản phẩm
            </Typography>
            <Box
              component="label"
              htmlFor="pImage"
              className="flex min-h-[132px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-5 text-center transition-colors"
              sx={{
                bgcolor: "rgba(107, 78, 53, 0.025)",
                borderColor: "rgba(107, 78, 53, 0.2)",
                color: muted,
                "&:hover": {
                  bgcolor: "rgba(107, 18, 24, 0.08)",
                  borderColor: burgundy,
                },
              }}
            >
              <svg
                width="34"
                height="34"
                viewBox="0 0 24 24"
                fill="none"
                stroke={burgundy}
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
              <span className="mt-2 text-sm text-[#6B4C35]">
                Kéo thả ảnh hoặc{" "}
                <strong className="font-bold text-[#6B1218]">chọn file</strong>
              </span>
              <span className="mt-1 text-xs text-[#6B4C35]/85">
                PNG, JPG tối đa 5MB
              </span>
              <input id="pImage" type="file" accept="image/*" hidden />
            </Box>
          </Box>

          <FormControlLabel
            control={
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
            }
            label="Hiển thị sản phẩm trên website"
            sx={{
              color: text,
              fontFamily: "var(--admin-font-body)",
              "& .MuiFormControlLabel-label": {
                fontFamily: "var(--admin-font-body)",
                fontSize: "0.88rem",
              },
            }}
          />
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
            Lưu sản phẩm
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
