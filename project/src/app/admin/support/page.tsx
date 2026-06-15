"use client";

import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/src/components/ui/toast-provider";
import ModalSupport from "../../../components/admin/modalSupport";
import LoadingState from "../../../components/ui/loadingState";
import type {
  AdminContactItemInterface,
  AdminContactsSuccessResponseInterface,
} from "../../../interface/adminInterface";
import {
  getContactsAction,
  updateContactStatusAction,
} from "../../../lib/action/contact.action";
import type {
  AdminSupportFilter,
  AdminSupportMessage,
  AdminSupportStatus,
} from "../../../lib/types/admin";

const statusLabels: Record<AdminSupportStatus, string> = {
  replied: "Đã phản hồi",
  unread: "Chưa phản hồi",
};

const statusClassNames: Record<AdminSupportStatus, string> = {
  replied: "done",
  unread: "pending",
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));

const filterStatusMap: Partial<Record<AdminSupportFilter, "PENDING" | "REPLIED">> = {
  replied: "REPLIED",
  unread: "PENDING",
};

const normalizeContact = (
  contact: AdminContactItemInterface,
): AdminSupportMessage => ({
  date:
    contact.created_at instanceof Date
      ? contact.created_at.toISOString()
      : String(contact.created_at),
  email: contact.email,
  id: contact.id,
  message: contact.message,
  name: contact.name,
  status: contact.status === "REPLIED" ? "replied" : "unread",
  subject: contact.subject,
});

export default function SupportPage() {
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState<AdminSupportFilter>("all");
  const [contacts, setContacts] = useState<AdminSupportMessage[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [isMarkingReplied, setIsMarkingReplied] = useState(false);
  const [selectedContact, setSelectedContact] =
    useState<AdminSupportMessage | null>(null);

  useEffect(() => {
    const loadContacts = async () => {
      setIsLoadingContacts(true);

      // action-(lấy danh sách liên hệ)
      const result = await getContactsAction({
        limit: 100,
        page: 1,
        ...(filterStatusMap[activeFilter]
          ? { status: filterStatusMap[activeFilter] }
          : {}),
      });

      if ("error" in result && result.error) {
        toast.error(result.error);
        setContacts([]);
        setIsLoadingContacts(false);
        return;
      }

      if ("success" in result && result.success) {
        const contactResult = result as AdminContactsSuccessResponseInterface;
        setContacts(contactResult.data.map(normalizeContact));
      }

      setIsLoadingContacts(false);
    };

    void loadContacts();
  }, [activeFilter, toast]);

  const filteredContacts = useMemo(() => {
    if (activeFilter === "all") return contacts;

    return contacts.filter((contact) => contact.status === activeFilter);
  }, [activeFilter, contacts]);

  const markAsReplied = async (contactId: number | string) => {
    if (isMarkingReplied) return;

    setIsMarkingReplied(true);

    try {
      // action-(cập nhật trạng thái liên hệ)
      const result = await updateContactStatusAction({
        id: String(contactId),
        status: "REPLIED",
      });

      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Đã đánh dấu phản hồi");
      setContacts((currentContacts) =>
        currentContacts.map((contact) =>
          contact.id === contactId ? { ...contact, status: "replied" } : contact,
        ),
      );
      setSelectedContact((currentContact) =>
        currentContact?.id === contactId
          ? { ...currentContact, status: "replied" }
          : currentContact,
      );
    } finally {
      setIsMarkingReplied(false);
    }
  };

  return (
    <>
      <header className="dashboard-top-header">
        <div className="dashboard-top-header-left">
          <button className="dashboard-mobile-toggle" type="button" aria-label="Menu">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div>
            <h1 className="dashboard-page-title">Hỗ trợ / Liên hệ</h1>
            <p className="dashboard-page-subtitle">
              Tin nhắn từ khách hàng
            </p>
          </div>
        </div>

        <div className="dashboard-top-header-right">
          <div className="dashboard-filter-chips">
            {[
              { label: "Tất cả", value: "all" },
              { label: "Chưa phản hồi", value: "unread" },
              { label: "Đã phản hồi", value: "replied" },
            ].map((filter) => (
              <button
                key={filter.value}
                className={`dashboard-filter-chip ${
                  activeFilter === filter.value ? "active" : ""
                }`}
                type="button"
                disabled={isLoadingContacts}
                onClick={() => setActiveFilter(filter.value as AdminSupportFilter)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="dashboard-page-content">
        <section className="dashboard-card">
          <div className="dashboard-card-body no-padding">
            <div className="dashboard-table-wrapper">
              <table className="dashboard-admin-table">
                <thead>
                  <tr>
                    <th>Ngày gửi</th>
                    <th>Tên khách</th>
                    <th>Email</th>
                    <th>Chủ đề</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingContacts ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-5">
                        <LoadingState label="Đang tải tin nhắn hỗ trợ..." />
                      </td>
                    </tr>
                  ) : null}

                  {filteredContacts.map((contact) => (
                    <tr
                      key={contact.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedContact(contact)}
                    >
                      <td>{formatDateTime(contact.date)}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          {contact.status === "unread" ? (
                            <span
                              className="size-2 shrink-0 rounded-full bg-[#6B1218]"
                              aria-hidden="true"
                            />
                          ) : null}
                          {contact.name}
                        </div>
                      </td>
                      <td className="text-sm text-[#6B4C35]">{contact.email}</td>
                      <td>{contact.subject}</td>
                      <td>
                        <span
                          className={`dashboard-status ${
                            statusClassNames[contact.status]
                          }`}
                        >
                          {statusLabels[contact.status]}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {!isLoadingContacts && filteredContacts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-8 text-center text-sm text-[#6B4C35]"
                      >
                        Chưa có tin nhắn hỗ trợ
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      <ModalSupport
        open={Boolean(selectedContact)}
        contact={selectedContact}
        isMarkingReplied={isMarkingReplied}
        onClose={() => setSelectedContact(null)}
        onMarkReplied={markAsReplied}
      />
    </>
  );
}
