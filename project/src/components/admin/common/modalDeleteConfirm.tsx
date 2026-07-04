"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import type { AdminDeleteConfirmModalProps } from "../../../lib/types/admin";
import styles from "../../../styles/adminModal.module.css";

export default function ModalDeleteConfirm({
  confirmLabel = "Xóa",
  description,
  isDeleting,
  itemName,
  loadingLabel = "Đang xóa...",
  onClose,
  onConfirm,
  open,
  productName,
  title = "Xác nhận xóa?",
}: AdminDeleteConfirmModalProps) {
  const handleConfirm = async () => {
    await onConfirm?.();
  };
  const targetName = itemName ?? productName ?? "mục này";
  const modalDescription =
    description ??
    `Bạn có chắc muốn xóa "${targetName}"? Thao tác này không thể hoàn tác.`;

  return (
    <Modal
      open={open}
      onClose={isDeleting ? undefined : onClose}
      aria-labelledby="delete-confirm-title"
      aria-describedby="delete-confirm-description"
    >
      <Box className={`${styles.modalPaper} ${styles.deletePaper}`}>
        <Box className={styles.deleteBody}>
          <Box className={styles.dangerIcon} aria-hidden="true">
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

          <Box className={styles.deleteContent}>
            <Typography
              id="delete-confirm-title"
              component="h3"
              className={styles.deleteTitle}
            >
              {title}
            </Typography>

            <Typography
              id="delete-confirm-description"
              className={styles.description}
            >
              {description ? (
                modalDescription
              ) : (
                <>
                  Bạn có chắc muốn xóa{" "}
                  <Box component="span" className={styles.highlight}>
                    {targetName}
                  </Box>
                  ? Thao tác này không thể hoàn tác.
                </>
              )}
            </Typography>
          </Box>
        </Box>

        <Divider className={styles.divider} />

        <Box className={styles.footer}>
          <Button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className={styles.ghostButton}
          >
            Hủy
          </Button>

          <Button
            type="button"
            variant="contained"
            onClick={handleConfirm}
            disabled={isDeleting}
            className={styles.dangerButton}
          >
            {isDeleting ? loadingLabel : confirmLabel}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
