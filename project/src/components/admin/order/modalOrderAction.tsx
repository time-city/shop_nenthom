"use client";
import { Box, Button, Divider, Modal, TextField, Typography } from "@/src/components/ui/mui-mock";


import { useState } from "react";

import styles from "../../../styles/adminModal.module.css";

type OrderActionType = "confirm" | "cancel";

export type ConfirmOrderData = {
  reason?: string;
  trackingCode?: string;
  shippingCarrier?: string;
};

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: ConfirmOrderData) => Promise<void> | void;
  type: OrderActionType | null;
  orderId: string | null;
  currentStatus: string | null;
  isSubmitting?: boolean;
}

const nextStatusLabels: Record<string, string> = {
  pending: "Đã xác nhận",
  cancel_requested: "Đã xác nhận (Bác bỏ yêu cầu huỷ)",
  confirmed: "Đang giao hàng",
  shipped: "Giao thành công",
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
  const [trackingCode, setTrackingCode] = useState("");

  const handleSubmit = async () => {
    if (type === "cancel" && currentStatus !== "cancel_requested") {
      if (!reason.trim()) {
        setError("Vui lòng nhập lý do hủy đơn hàng");
        return;
      }
    }
    if (type === "confirm" && currentStatus === "confirmed") {
      if (!trackingCode.trim()) {
        setError("Vui lòng nhập mã vận đơn SPX");
        return;
      }
    }
    setError("");
    await onConfirm({
      reason: reason.trim(),
      trackingCode: trackingCode.trim(),
      shippingCarrier: "SPX"
    });
  };

  if (!type) return null;

  const isCancel = type === "cancel";
  const isApproveCancelRequest = isCancel && currentStatus === "cancel_requested";
  const title = isCancel 
    ? (isApproveCancelRequest ? "Xác nhận duyệt yêu cầu huỷ đơn" : "Xác nhận huỷ đơn hàng") 
    : currentStatus === "confirmed" ? "Xác nhận giao hàng"
    : currentStatus === "shipped" ? "Xác nhận giao thành công"
    : "Xác nhận đơn hàng";
  
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
                  {isApproveCancelRequest 
                    ? "Bạn có chắc chắn muốn duyệt yêu cầu huỷ đơn hàng " 
                    : "Bạn có chắc chắn muốn hủy đơn hàng "}
                  <Box component="span" className={styles.highlight}>
                    {orderId}
                  </Box>
                  ? Hành động này sẽ hoàn trả lại lượt dùng mã giảm giá (nếu có) và không thể khôi phục.
                </>
              ) : (
                <>
                  Bạn có chắc muốn chuyển trạng thái đơn hàng{" "}
                  <strong style={{ color: "#E5C07B" }}>{orderId}</strong> sang{" "}
                  <strong style={{ color: "#4ade80" }}>{nextStatusLabel}</strong>?
                </>
              )}
            </Typography>

            {isCancel && !isApproveCancelRequest && (
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

            {!isCancel && currentStatus === "confirmed" && (
              <Box style={{ marginTop: "16px" }}>
                <TextField
                  fullWidth
                  label="Mã vận đơn (SPX) *"
                  variant="outlined"
                  placeholder="Nhập mã vận đơn SPX..."
                  value={trackingCode}
                  onChange={(e) => {
                    setTrackingCode(e.target.value);
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
            {isSubmitting 
              ? "Đang xử lý..." 
              : isCancel 
                ? (isApproveCancelRequest ? "Duyệt yêu cầu" : "Huỷ đơn hàng")
                : "Xác nhận"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
