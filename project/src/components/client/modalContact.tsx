"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useToast } from "@/src/components/ui/toast-provider";
import { getCurrentUser } from "../../lib/action/auth.action";
import { submitContactAction } from "../../lib/action/contact.action";
import type { ClientContactFormValues } from "../../lib/types/client";

const initialValues: ClientContactFormValues = {
  email: "",
  message: "",
  name: "",
  subject: "",
};

export default function ModalContact() {
  const { toast } = useToast();
  const [formValues, setFormValues] =
    useState<ClientContactFormValues>(initialValues);
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

  const updateField = (
    field: keyof ClientContactFormValues,
    value: string,
  ) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;

    const values: ClientContactFormValues = {
      email: formValues.email.trim(),
      message: formValues.message.trim(),
      name: formValues.name.trim(),
      subject: formValues.subject.trim(),
    };

    if (!values.name || !values.email || !values.subject || !values.message) {
      toast.error("Vui lòng điền đầy đủ thông tin liên hệ");
      return;
    }

    setIsSubmitting(true);

    try {
      // action-(gửi liên hệ)
      const result = await submitContactAction(values);

      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }

      if ("success" in result && result.success) {
        toast.success("Đã gửi lời nhắn, ChamCham sẽ phản hồi sớm");
        setFormValues((currentValues) => ({
          ...currentValues,
          message: "",
          subject: "",
        }));
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
          onChange={(event) => updateField("name", event.target.value)}
          required
          className="w-full rounded-md border border-[#2c1810]/15 bg-[#F8F0E4] px-4 py-3 text-sm text-[#2C1810] outline-none transition placeholder:text-[#2c1810]/38 focus:border-[#7A1218] focus:ring-4 focus:ring-[#6B1218]/10"
        />
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
          type="email"
          placeholder="your@email.com"
          value={formValues.email}
          onChange={(event) => updateField("email", event.target.value)}
          required
          className="w-full rounded-md border border-[#2c1810]/15 bg-[#F8F0E4] px-4 py-3 text-sm text-[#2C1810] outline-none transition placeholder:text-[#2c1810]/38 focus:border-[#7A1218] focus:ring-4 focus:ring-[#6B1218]/10"
        />
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
          onChange={(event) => updateField("subject", event.target.value)}
          required
          className="w-full rounded-md border border-[#2c1810]/15 bg-[#F8F0E4] px-4 py-3 text-sm text-[#2C1810] outline-none transition placeholder:text-[#2c1810]/38 focus:border-[#7A1218] focus:ring-4 focus:ring-[#6B1218]/10"
        />
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
          onChange={(event) => updateField("message", event.target.value)}
          required
          rows={6}
          className="min-h-36 w-full resize-y rounded-md border border-[#2c1810]/15 bg-[#F8F0E4] px-4 py-3 text-sm text-[#2C1810] outline-none transition placeholder:text-[#2c1810]/38 focus:border-[#7A1218] focus:ring-4 focus:ring-[#6B1218]/10"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="submit-btn w-full rounded-full bg-[#7A1218] px-6 py-3.5 text-[0.78rem] font-medium uppercase tracking-[0.14em] text-[#F5F0E8] transition hover:-translate-y-0.5 hover:bg-[#6B1218] disabled:cursor-not-allowed disabled:opacity-65 sm:w-auto sm:px-10"
      >
        {isSubmitting ? "Đang gửi..." : "Gửi Tin Nhắn"}
      </button>
    </form>
  );
}
