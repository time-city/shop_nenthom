"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useToast } from "@/src/components/ui/toast-provider";
import { getCurrentUser } from "../../lib/action/user.action";
import { submitContactAction } from "../../lib/action/contact.action";
import { getFriendlyResponseError } from "@/src/lib/utils/errorMessage";
import { useSupportStore } from "@/src/store/useSupportStore";
import type { ClientContactFormValues } from "../../lib/types/client";

const initialValues: ClientContactFormValues = {
  email: "",
  message: "",
  name: "",
  subject: "",
};

export default function ModalContact() {
  const { toast } = useToast();
  const { incrementUnread } = useSupportStore();
  const [formValues, setFormValues] =
    useState<ClientContactFormValues>(initialValues);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ClientContactFormValues | "form", string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadCurrentUser = async () => {
      // action-(lấy user liên hệ)
      const user = await getCurrentUser();

      if (!isMounted || !user) return;

      setFormValues((currentValues) => ({
        ...currentValues,
        email: currentValues.email || user.email || "",
        name: currentValues.name || user.fullname || "",
      }));
    };

    void loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const validateField = (field: keyof ClientContactFormValues, value: string): string => {
    const trimmed = value.trim();

    if (!trimmed) {
      if (field === "message") {
        return "Vui lòng nhập nội dung tin nhắn";
      }
      return "Vui lòng không để trống";
    }

    if (field === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.(com|vn|net|org|edu|gov|io|co|info|biz|me|cc|us|uk|jp|kr|tw|sg|live|store|shop|online|xyz|pro|work|tech|dev|app|asia|eu|ca|fr|de|au)(?:\.[a-z]{2,})?$/i;
      if (!emailRegex.test(trimmed)) {
        return "Email không đúng định dạng";
      }
    }

    return "";
  };

  const handleChange = (field: keyof ClientContactFormValues, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      const errorMsg = validateField(field, value);
      setErrors((prev) => {
        const next = { ...prev };
        if (errorMsg) {
          next[field] = errorMsg;
        } else {
          delete next[field];
        }
        return next;
      });
    }
  };

  const getInputClass = (fieldName: keyof ClientContactFormValues) => {
    const hasError = Boolean(errors[fieldName]);
    return `w-full rounded-md border ${
      hasError
        ? "border-[#6B1218] focus:ring-[#6B1218]/10"
        : "border-[#2c1810]/15 focus:border-[#7A1218] focus:ring-[#6B1218]/10"
    } bg-[#F8F0E4] px-4 py-3 text-sm text-[#2C1810] outline-none transition placeholder:text-[#2c1810]/38 focus:ring-4`;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;

    const newErrors: Partial<Record<keyof ClientContactFormValues, string>> = {};
    const fieldsToValidate: Array<keyof ClientContactFormValues> = ["name", "email", "subject", "message"];

    fieldsToValidate.forEach((field) => {
      const errorMsg = validateField(field, formValues[field]);
      if (errorMsg) {
        newErrors[field] = errorMsg;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstErrorField = Object.keys(newErrors)[0] as keyof ClientContactFormValues;
      const element = document.getElementById(`contact-${firstErrorField}`);
      if (element) {
        element.focus();
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const values: ClientContactFormValues = {
        email: formValues.email.trim(),
        message: formValues.message.trim(),
        name: formValues.name.trim(),
        subject: formValues.subject.trim(),
      };

      // action-(gửi liên hệ)
      const result = await submitContactAction(values);

      if ("error" in result && result.error) {
        setErrors((currentErrors) => ({
          ...currentErrors,
          form: getFriendlyResponseError(result.error),
        }));
        return;
      }

      if ("success" in result && result.success) {
        toast.success("Đã gửi lời nhắn, ChamCham sẽ phản hồi sớm");
        // Tăng số tin chưa phản hồi để badge navbar admin cập nhật
        incrementUnread();
        setFormValues((currentValues) => ({
          ...currentValues,
          message: "",
          subject: "",
        }));
        setErrors({});
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form id="contactForm" className="mt-8 space-y-5" onSubmit={handleSubmit}>
      <div className="form-group">
        <label
          htmlFor="contact-name"
          className="mb-2 block text-[0.72rem] uppercase tracking-[0.14em] text-[#6B4C35]"
        >
          Tên của bạn
        </label>
        <input
          id="contact-name"
          type="text"
          placeholder="Nhập tên"
          value={formValues.name}
          onChange={(event) => handleChange("name", event.target.value)}
          className={getInputClass("name")}
        />
        {errors.name && (
          <span className="text-xs text-[#6B1218] mt-1 normal-case tracking-normal font-medium">
            {errors.name}
          </span>
        )}
      </div>

      <div className="form-group">
        <label
          htmlFor="contact-email"
          className="mb-2 block text-[0.72rem] uppercase tracking-[0.14em] text-[#6B4C35]"
        >
          Email
        </label>
        <input
          id="contact-email"
          type="text"
          placeholder="your@email.com"
          value={formValues.email}
          onChange={(event) => handleChange("email", event.target.value)}
          className={getInputClass("email")}
        />
        {errors.email && (
          <span className="text-xs text-[#6B1218] mt-1 normal-case tracking-normal font-medium">
            {errors.email}
          </span>
        )}
      </div>

      <div className="form-group">
        <label
          htmlFor="contact-subject"
          className="mb-2 block text-[0.72rem] uppercase tracking-[0.14em] text-[#6B4C35]"
        >
          Chủ đề
        </label>
        <input
          id="contact-subject"
          type="text"
          placeholder="Chủ đề của bạn"
          value={formValues.subject}
          onChange={(event) => handleChange("subject", event.target.value)}
          className={getInputClass("subject")}
        />
        {errors.subject && (
          <span className="text-xs text-[#6B1218] mt-1 normal-case tracking-normal font-medium">
            {errors.subject}
          </span>
        )}
      </div>

      <div className="form-group">
        <label
          htmlFor="contact-message"
          className="mb-2 block text-[0.72rem] uppercase tracking-[0.14em] text-[#6B4C35]"
        >
          Tin nhắn
        </label>
        <textarea
          id="contact-message"
          placeholder="Nội dung tin nhắn..."
          value={formValues.message}
          onChange={(event) => handleChange("message", event.target.value)}
          rows={6}
          className={`${getInputClass("message")} min-h-36 w-full resize-y rounded-md border outline-none transition placeholder:text-[#2c1810]/38 focus:ring-4`}
        />
        {errors.message && (
          <span className="text-xs text-[#6B1218] mt-1 normal-case tracking-normal font-medium">
            {errors.message}
          </span>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="submit-btn w-full rounded-full bg-[#7A1218] px-6 py-3.5 text-[0.78rem] font-medium uppercase tracking-[0.14em] text-[#F5F0E8] transition hover:-translate-y-0.5 hover:bg-[#6B1218] disabled:cursor-not-allowed disabled:opacity-65 sm:w-auto sm:px-10"
      >
        {isSubmitting ? "Đang gửi..." : "Gửi Tin Nhắn"}
      </button>
      {errors.form && (
        <p className="text-xs font-medium text-[#6B1218]">{errors.form}</p>
      )}
    </form>
  );
}
