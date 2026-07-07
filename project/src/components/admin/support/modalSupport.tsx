"use client";
import { Box, Button, Divider, Modal, Typography } from "@/src/components/ui/mui-mock";


import type { AdminModalSupportProps } from "../../../lib/types/admin";
import styles from "../../../styles/adminModal.module.css";

const getInitial = (name?: string) => name?.trim().charAt(0).toUpperCase() || "C";

const formatDateTime = (value?: string) => {
  if (!value) return "";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
};

export default function ModalSupport({
  contact,
  isMarkingReplied = false,
  onClose,
  onMarkReplied,
  open,
}: AdminModalSupportProps) {
  const isReplied = contact?.status === "replied";

  const handleMarkReplied = () => {
    if (!contact) return;

    onMarkReplied?.(contact.id);
  };

  return (
    <Modal
      open={open}
      onClose={isMarkingReplied ? undefined : onClose}
      aria-labelledby="support-modal-title"
      aria-describedby="support-modal-description"
    >
      <Box className={`${styles.modalPaper} ${styles.supportPaper}`}>
        <Box className={styles.header}>
          <Typography
            id="support-modal-title"
            component="h3"
            className={styles.title}
          >
            {contact?.subject || "Chi tiết hỗ trợ"}
          </Typography>

          <Button
            type="button"
            onClick={onClose}
            disabled={isMarkingReplied}
            aria-label="Đóng modal"
            className={styles.closeButton}
          >
            ×
          </Button>
        </Box>

        <Divider className={styles.divider} />

        <Box id="support-modal-description" className={styles.supportBody}>
          <div className={styles.supportContactHeader}>
            <div className={styles.supportAvatar} aria-hidden="true">
              {getInitial(contact?.name)}
            </div>
            <div className={styles.supportContactInfo}>
              <div className={styles.supportContactName}>
                {contact?.name || "Khách hàng"}
              </div>
              {contact?.email ? (
                <div className={styles.supportContactEmail}>{contact.email}</div>
              ) : null}
            </div>
            <span
              className={`${styles.supportStatusBadge} ${
                isReplied ? styles.supportStatusReplied : styles.supportStatusUnread
              }`}
            >
              {isReplied ? "Đã phản hồi" : "Chưa phản hồi"}
            </span>
          </div>

          {contact?.date ? (
            <div className={styles.supportDate}>
              Gửi lúc: {formatDateTime(contact.date)}
            </div>
          ) : null}

          <div className={styles.supportMessage}>
            {contact?.message || "Không có nội dung tin nhắn"}
          </div>
        </Box>

        <Divider className={styles.divider} />

        <Box className={styles.footer}>
          <Button
            type="button"
            onClick={onClose}
            disabled={isMarkingReplied}
            className={styles.ghostButton}
          >
            Đóng
          </Button>
          {!isReplied && contact ? (
            <Button
              type="button"
              variant="contained"
              onClick={handleMarkReplied}
              disabled={isMarkingReplied}
              className={styles.primaryButton}
            >
              {isMarkingReplied ? "Đang lưu..." : "Đánh dấu đã phản hồi"}
            </Button>
          ) : null}
        </Box>
      </Box>
    </Modal>
  );
}
