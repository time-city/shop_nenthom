"use client";

import { startTransition, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useToast } from "@/src/components/ui/toast-provider";
import { changePassword } from "@/src/lib/action/auth.action";
import { getFriendlyResponseError } from "@/src/lib/utils/errorMessage";

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
      const result = await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

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
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/25 p-4">
      <div className="w-full max-w-md rounded-2xl bg-[#F8F0E4] p-6 shadow-[0_16px_36px_rgba(44,24,16,0.25)] text-[#2C1810]">
        <h3 className="relative mb-6 pb-3 font-serif text-[1.35rem] font-bold text-[#6B1218] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-10 after:bg-[#6B1218]">
          Đổi Mật Khẩu
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[#6B4C35]">
              Mật khẩu hiện tại
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={`w-full rounded-[10px] border-[1.5px] ${
                errors.currentPassword ? "border-[#6B1218]" : "border-[#6b4e35]/20 focus:border-[#6B1218]"
              } bg-white px-4 py-2.5 text-sm text-[#2C1810] outline-none transition`}
            />
            {errors.currentPassword && (
              <span className="text-xs text-[#6B1218] font-medium">{errors.currentPassword}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[#6B4C35]">
              Mật khẩu mới
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={`w-full rounded-[10px] border-[1.5px] ${
                errors.newPassword ? "border-[#6B1218]" : "border-[#6b4e35]/20 focus:border-[#6B1218]"
              } bg-white px-4 py-2.5 text-sm text-[#2C1810] outline-none transition`}
            />
            {errors.newPassword && (
              <span className="text-xs text-[#6B1218] font-medium">{errors.newPassword}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[#6B4C35]">
              Nhập lại mật khẩu mới
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full rounded-[10px] border-[1.5px] ${
                errors.confirmPassword ? "border-[#6B1218]" : "border-[#6b4e35]/20 focus:border-[#6B1218]"
              } bg-white px-4 py-2.5 text-sm text-[#2C1810] outline-none transition`}
            />
            {errors.confirmPassword && (
              <span className="text-xs text-[#6B1218] font-medium">{errors.confirmPassword}</span>
            )}
          </div>

          {errors.form && (
            <p className="text-xs font-medium text-[#6B1218]">{errors.form}</p>
          )}

          <div className="mt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-full border-[1.5px] border-[#2C1810]/20 bg-transparent px-5 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#2C1810] transition hover:bg-[#2C1810]/5 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-[#6B1218] px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#F5F0E8] shadow-[0_4px_12px_rgba(107,18,24,0.2)] transition hover:bg-[#4A0C10] disabled:opacity-50"
            >
              {isSubmitting ? "Đang lưu..." : "Xác nhận"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
