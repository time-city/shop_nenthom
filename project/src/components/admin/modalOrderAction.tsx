"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import styles from "../../styles/adminModal.module.css";

type OrderActionType = "confirm" | "cancel";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<void> | void;
  type: OrderActionType | null;
  orderId: string | null;
  currentStatus: string | null;
  isSubmitting?: boolean;
}

const nextStatusLabels: Record<string, string> = {
  pending: "Đã xác nhận",
};

export default function ModalOrderAction({
  open,
  onClose,
  onConfirm,
  type,
  orderId,
  currentStatus,
  isSubmitting = false,
}: Props) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (type === "cancel") {
      if (!reason.trim()) {
        setError("Vui lòng nhập lý do hủy đơn hàng");
        return;
      }
    }
    setError("");
    await onConfirm(reason.trim());
  };

  if (!type) return null;

  const isCancel = type === "cancel";
  const title = isCancel ? "Xác nhận huỷ đơn hàng" : "Xác nhận đơn hàng";
  
  let nextStatusLabel = "";
  if (currentStatus) {
    nextStatusLabel = nextStatusLabels[currentStatus] || "";
  }

  return (
    <Modal
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      aria-labelledby="order-action-title"
    >
      <Box className={`${styles.modalPaper} ${styles.deletePaper}`}>
        <Box className={styles.deleteBody}>
          <Box 
            className={isCancel ? styles.dangerIcon : undefined} 
            aria-hidden="true"
            style={!isCancel ? {
              display: "flex",
              width: "48px",
              height: "48px",
              borderRadius: "999px",
              background: "rgba(46, 90, 68, 0.08)",
              color: "#2E5A44",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            } : undefined}
          >
            {isCancel ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20,6 9,17 4,12" />
              </svg>
            )}
          </Box>

          <Box className={styles.deleteContent}>
            <Typography id="order-action-title" component="h3" className={styles.deleteTitle}>
              {title}
            </Typography>

            <Typography className={styles.description} style={{ marginTop: "12px", color: "#2C1810" }}>
              {isCancel ? (
                <>
                  Bạn có chắc chắn muốn hủy đơn hàng{" "}
                  <Box component="span" className={styles.highlight}>
                    {orderId}
                  </Box>
                  ? Hành động này sẽ hoàn trả lại lượt dùng mã giảm giá (nếu có) và không thể khôi phục.
                </>
              ) : (
                <>
                  Bạn có chắc muốn chuyển trạng thái đơn hàng{" "}
                  <strong style={{ color: "#6B1218" }}>{orderId}</strong> sang{" "}
                  <strong style={{ color: "#2E5A44" }}>{nextStatusLabel}</strong>?
                </>
              )}
            </Typography>

            {isCancel && (
              <Box style={{ marginTop: "16px" }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Lý do hủy đơn hàng *"
                  variant="outlined"
                  placeholder="Vui lòng nhập lý do hủy đơn hàng..."
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    if (e.target.value.trim()) setError("");
                  }}
                  error={Boolean(error)}
                  helperText={error}
                  disabled={isSubmitting}
                  className={styles.field}
                />
              </Box>
            )}
          </Box>
        </Box>

        <Divider className={styles.divider} />

        <Box className={styles.footer}>
          <Button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className={styles.ghostButton}
          >
            Hủy bỏ
          </Button>

          <Button
            type="button"
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={isCancel ? styles.dangerButton : styles.primaryButton}
            style={!isCancel ? { background: "#2E5A44 !important", boxShadow: "0 8px 18px rgba(46, 90, 68, 0.18) !important" } : undefined}
          >
            {isSubmitting ? "Đang xử lý..." : isCancel ? "Huỷ đơn hàng" : "Xác nhận"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
