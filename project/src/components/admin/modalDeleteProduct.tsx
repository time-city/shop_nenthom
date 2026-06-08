"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";

type ModalDeleteProductProps = {
  onClose: () => void;
  onConfirm?: () => void;
  open: boolean;
  productName?: string;
};

const burgundy = "#6B1218";
const burgundyDark = "#4A0C10";
const cream = "#F8F0E4";
const danger = "#B91C1C";
const text = "#2C1810";
const muted = "#6B4C35";

const modalStyle = {
  bgcolor: cream,
  border: "1px solid rgba(107, 78, 53, 0.14)",
  borderRadius: "16px",
  boxShadow: "0 16px 48px rgba(44, 24, 16, 0.16)",
  left: "50%",
  maxWidth: 460,
  outline: "none",
  overflow: "hidden",
  position: "absolute",
  top: "50%",
  transform: "translate(-50%, -50%)",
  width: "calc(100% - 32px)",
};

export default function ModalDeleteProduct({
  onClose,
  onConfirm,
  open,
  productName,
}: ModalDeleteProductProps) {
  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="delete-product-title"
      aria-describedby="delete-product-description"
    >
      <Box sx={modalStyle}>
        <Box className="flex items-start gap-4 px-6 py-6">
          <Box
            className="flex size-12 shrink-0 items-center justify-center rounded-full"
            sx={{
              bgcolor: "rgba(185, 28, 28, 0.08)",
              color: danger,
            }}
            aria-hidden="true"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </Box>

          <Box className="min-w-0 flex-1">
            <Typography
              id="delete-product-title"
              component="h3"
              sx={{
                color: text,
                fontFamily: "var(--admin-font-display)",
                fontSize: "1.35rem",
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              Xóa sản phẩm?
            </Typography>

            <Typography
              id="delete-product-description"
              sx={{
                color: muted,
                fontFamily: "var(--admin-font-body)",
                fontSize: "0.9rem",
                lineHeight: 1.65,
                mt: 1,
              }}
            >
              Bạn có chắc muốn xóa{" "}
              <Box component="span" sx={{ color: burgundy, fontWeight: 700 }}>
                {productName || "sản phẩm này"}
              </Box>
              ? Thao tác này không thể hoàn tác.
            </Typography>
          </Box>
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
            onClick={handleConfirm}
            sx={{
              bgcolor: danger,
              borderRadius: "8px",
              boxShadow: "0 8px 18px rgba(185, 28, 28, 0.18)",
              color: "#fff",
              fontFamily: "var(--admin-font-body)",
              fontWeight: 700,
              px: 2.5,
              py: 1,
              "&:hover": {
                bgcolor: burgundyDark,
                boxShadow: "0 12px 24px rgba(185, 28, 28, 0.25)",
              },
            }}
          >
            Xóa sản phẩm
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
