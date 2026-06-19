"use client";

import React from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import styles from "../../styles/detailCardProduct.module.css";

interface DetailCardProductModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function DetailCardProductModal({
  open,
  onClose,
  children,
}: DetailCardProductModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="product-detail-title"
      aria-describedby="product-detail-description"
      className="px-4"
    >
      <Box component="section" className={styles.modalShell}>
        {children}
      </Box>
    </Modal>
  );
}
