"use client";

import { ToastContainer } from "react-toastify";

export default function ToastProvider() {
  return (
    <ToastContainer
      autoClose={3000}
      closeOnClick
      draggable
      newestOnTop
      pauseOnFocusLoss={false}
      position="top-right"
      theme="colored"
    />
  );
}
