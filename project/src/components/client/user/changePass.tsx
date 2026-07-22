"use client";

import { startTransition, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useToast } from "@/src/components/ui/toastProvider";
import { changePassword } from "@/src/lib/action/auth.action";
import { getFriendlyResponseError } from "@/src/lib/utils/errorMessage";
import { callAction } from "@/src/lib/utils/callAction";

interface ModalChangePasswordProps {
  open: boolean;
  onClose: () => void;
}

export default function ModalChangePassword({ open, onClose }: ModalChangePasswordProps) {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      startTransition(() => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setErrors({});
      });
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!currentPassword) {
      newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    }
    if (!newPassword) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu nhập lại chưa khớp";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await callAction(() => changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      }), "Không thể đổi mật khẩu. Vui lòng thử lại sau.");

      if ("error" in result && result.error) {
        const message = getFriendlyResponseError(result.error);
        if (message.toLowerCase().includes("mật khẩu hiện tại")) {
          setErrors({ currentPassword: message });
        } else {
          setErrors({ form: message });
        }
      } else {
        toast.success("Mật khẩu đã được cập nhật thành công!");
        onClose();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Đổi mật khẩu thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-[#F5F0E8]/5 backdrop-blur-md border border-[#F5F0E8]/10 p-6 sm:p-8 shadow-[0_16px_36px_rgba(0,0,0,0.5)] text-[#F5F0E8]">
        <h3 className="relative mb-6 pb-3 font-serif text-[1.35rem] font-bold text-[#F5F0E8] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-14 after:bg-[#D6A15F]">
          Đổi Mật Khẩu
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.7rem] font-normal uppercase tracking-[0.1em] text-[#F5F0E8]/70 sm:text-xs">
              Mật khẩu hiện tại
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={`w-full rounded-[10px] border-[1.5px] ${
                errors.currentPassword ? "border-red-500 focus:ring-red-500/10" : "border-[#F5F0E8]/20 focus:border-[#D6A15F] focus:ring-[#D6A15F]/10"
              } bg-black/40 px-4 py-3 text-[0.95rem] text-[#F5F0E8] outline-none transition focus:ring-4 placeholder:text-[#F5F0E8]/30`}
            />
            {errors.currentPassword && (
              <span className="text-xs font-medium text-red-400 mt-1">{errors.currentPassword}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[0.7rem] font-normal uppercase tracking-[0.1em] text-[#F5F0E8]/70 sm:text-xs">
              Mật khẩu mới
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={`w-full rounded-[10px] border-[1.5px] ${
                errors.newPassword ? "border-red-500 focus:ring-red-500/10" : "border-[#F5F0E8]/20 focus:border-[#D6A15F] focus:ring-[#D6A15F]/10"
              } bg-black/40 px-4 py-3 text-[0.95rem] text-[#F5F0E8] outline-none transition focus:ring-4 placeholder:text-[#F5F0E8]/30`}
            />
            {errors.newPassword && (
              <span className="text-xs font-medium text-red-400 mt-1">{errors.newPassword}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[0.7rem] font-normal uppercase tracking-[0.1em] text-[#F5F0E8]/70 sm:text-xs">
              Nhập lại mật khẩu mới
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full rounded-[10px] border-[1.5px] ${
                errors.confirmPassword ? "border-red-500 focus:ring-red-500/10" : "border-[#F5F0E8]/20 focus:border-[#D6A15F] focus:ring-[#D6A15F]/10"
              } bg-black/40 px-4 py-3 text-[0.95rem] text-[#F5F0E8] outline-none transition focus:ring-4 placeholder:text-[#F5F0E8]/30`}
            />
            {errors.confirmPassword && (
              <span className="text-xs font-medium text-red-400 mt-1">{errors.confirmPassword}</span>
            )}
          </div>

          {errors.form && (
            <p className="text-xs font-medium text-red-400 mt-1">{errors.form}</p>
          )}

          <div className="mt-5 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-full border border-[#F5F0E8]/20 bg-black/20 px-6 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-[#F5F0E8] transition hover:bg-[#F5F0E8]/10 hover:border-[#F5F0E8]/30 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#D6A15F] to-[#E5C07B] px-6 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-[#2C1810] shadow-[0_4px_12px_rgba(214,161,95,0.2)] transition hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(214,161,95,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin text-[#2C1810]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang lưu...
                </>
              ) : "Xác nhận"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
