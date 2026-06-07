"use client";

import Modal from "@mui/material/Modal";
import {
  type ChangeEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

type ModalOTPProps = {
  email: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: (otp: string) => void;
  onResend: () => void;
  open: boolean;
};

export default function ModalOTP({
  email,
  isSubmitting = false,
  onClose,
  onConfirm,
  onResend,
  open,
}: ModalOTPProps) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const otpValue = digits.join("");

  useEffect(() => {
    if (!open) {
      setDigits(["", "", "", "", "", ""]);
      return;
    }

    window.setTimeout(() => inputRefs.current[0]?.focus(), 120);
  }, [open]);

  const updateDigit = (index: number, value: string) => {
    const nextDigit = value.replace(/\D/g, "").slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = nextDigit;
    setDigits(nextDigits);

    if (nextDigit && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleChange =
    (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
      updateDigit(index, event.target.value);
    };

  const handleKeyDown =
    (index: number) => (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Backspace" && !digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    };

  return (
    <Modal
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      aria-labelledby="otp-modal-title"
      aria-describedby="otp-modal-description"
    >
      <div className="absolute left-1/2 top-1/2 w-[calc(100vw-2rem)] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#2c1810]/10 bg-[#F5F0E8] p-6 text-[#2C1810] shadow-[0_24px_70px_rgba(44,24,16,0.35)] outline-none sm:p-8">
        <h2
          id="otp-modal-title"
          className="text-center font-serif text-[2rem] font-light leading-tight text-[#2C1810] sm:text-[2.2rem]"
        >
          Xác Thực OTP
        </h2>

        <p
          id="otp-modal-description"
          className="mx-auto mt-3 max-w-[320px] text-center text-[0.86rem] leading-relaxed text-[#2c1810]/70 sm:text-[0.88rem]"
        >
          Nhập mã 6 số đã gửi đến {email}
        </p>

        <div className="mt-7 flex justify-center gap-2 sm:gap-3">
          {digits.map((digit, index) => (
            <input
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              ref={(element) => {
                inputRefs.current[index] = element;
              }}
              value={digit}
              onChange={handleChange(index)}
              onKeyDown={handleKeyDown(index)}
              inputMode="numeric"
              maxLength={1}
              disabled={isSubmitting}
              className="size-11 rounded-md border border-[#2c1810]/20 bg-[#F2E8D9] text-center text-xl font-medium text-[#2C1810] outline-none transition focus:border-[#7A1218] focus:ring-4 focus:ring-[#6B1218]/10 disabled:opacity-60 sm:size-12"
            />
          ))}
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            disabled={otpValue.length !== 6 || isSubmitting}
            onClick={() => onConfirm(otpValue)}
            className="w-full rounded-full bg-[#7A1218] px-5 py-3 text-[0.76rem] font-medium uppercase tracking-[0.12em] text-[#F5F0E8] transition hover:bg-[#6B1218] disabled:cursor-not-allowed disabled:opacity-60 sm:text-[0.8rem]"
          >
            {isSubmitting ? "Đang xác thực..." : "Xác Nhận"}
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={onResend}
            className="w-full rounded-full border-[1.5px] border-[#7A1218] bg-transparent px-5 py-3 text-[0.76rem] font-medium uppercase tracking-[0.12em] text-[#7A1218] transition hover:bg-[#7A1218] hover:text-[#F5F0E8] disabled:cursor-not-allowed disabled:opacity-60 sm:text-[0.8rem]"
          >
            Gửi Lại
          </button>
        </div>
      </div>
    </Modal>
  );
}
