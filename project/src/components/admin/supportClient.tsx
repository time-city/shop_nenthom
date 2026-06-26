"use client";

import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/src/components/ui/toast-provider";
import ModalSupport from "@/src/components/admin/modalSupport";
import LoadingState from "@/src/components/ui/loadingState";
import { useSupportStore } from "@/src/store/useSupportStore";
import TableResponsiveWrapper from "./TableResponsiveWrapper";
import AdminHeader from "./AdminHeader";
import type {
  AdminContactItemInterface,
  AdminContactsSuccessResponseInterface,
} from "@/src/interface/adminInterface";
import {
  getContactsAction,
  updateContactStatusAction,
} from "@/src/lib/action/contact.action";
import { getFriendlyResponseError } from "@/src/lib/utils/errorMessage";
import type {
  AdminSupportFilter,
  AdminSupportMessage,
  AdminSupportStatus,
} from "@/src/lib/types/admin";
import { callAction } from "@/src/lib/utils/callAction";

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

export default function SupportClient() {
  const { toast } = useToast();
  const { setUnreadCount, decrementUnread } = useSupportStore();
  const [activeFilter, setActiveFilter] = useState<AdminSupportFilter>("all");
  const [contacts, setContacts] = useState<AdminSupportMessage[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMarkingReplied, setIsMarkingReplied] = useState(false);
  const [selectedContact, setSelectedContact] =
    useState<AdminSupportMessage | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadContacts = async () => {
      setIsLoadingContacts(true);
      setError(null);

      const result = await callAction(() => getContactsAction({
        limit: 100,
        page: 1,
        ...(filterStatusMap[activeFilter]
          ? { status: filterStatusMap[activeFilter] }
          : {}),
      }), "Không thể tải danh sách liên hệ. Vui lòng thử lại sau.");
      if (cancelled) return;

      if ("error" in result && result.error) {
        const friendlyErr = getFriendlyResponseError(result.error);
        setError(friendlyErr);
        toast.error(friendlyErr);
        setContacts([]);
        setIsLoadingContacts(false);
        return;
      }

      if ("success" in result && result.success) {
        const contactResult = result as AdminContactsSuccessResponseInterface;
        setError(null);
        const normalized = contactResult.data.map(normalizeContact);
        setContacts(normalized);
        // Sync số unread thực từ DB vào store — chỉ khi lấy all/unread
        if (activeFilter === "all" || activeFilter === "unread") {
          const realUnread = normalized.filter((c) => c.status === "unread").length;
          setUnreadCount(realUnread);
        }
      }

      setIsLoadingContacts(false);
    };

    void loadContacts();
    return () => {
      cancelled = true;
    };
  }, [activeFilter, setUnreadCount, toast]);

  const filteredContacts = useMemo(() => {
    if (activeFilter === "all") return contacts;

    return contacts.filter((contact) => contact.status === activeFilter);
  }, [activeFilter, contacts]);

  const markAsReplied = async (contactId: number | string) => {
    if (isMarkingReplied) return;

    setIsMarkingReplied(true);

    try {
      const result = await callAction(() => updateContactStatusAction({
        id: String(contactId),
        status: "REPLIED",
      }), "Không thể cập nhật trạng thái liên hệ. Vui lòng thử lại sau.");

      if ("error" in result && result.error) {
        toast.error(getFriendlyResponseError(result.error));
        return;
      }

      toast.success("Đã đánh dấu phản hồi");
      // Giảm badge khi đánh dấu đã phản hồi
      decrementUnread();
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
      <AdminHeader
        title="Hỗ trợ / Liên hệ"
        subtitle="Tin nhắn từ khách hàng"
      >
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
      </AdminHeader>

      <div className="dashboard-page-content">
        {/* Mobile filter chips */}
        <div className="flex lg:hidden justify-center mb-6">
          <div className="dashboard-filter-chips w-full justify-center">
            {[
              { label: "Tất cả", value: "all" },
              { label: "Chưa phản hồi", value: "unread" },
              { label: "Đã phản hồi", value: "replied" },
            ].map((filter) => (
              <button
                key={filter.value}
                className={`dashboard-filter-chip flex-1 text-center ${
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
        <section className="dashboard-card">
          <div className="dashboard-card-body no-padding">
            <div className="dashboard-table-wrapper">
              <TableResponsiveWrapper minWidth={800}>
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

                    {!isLoadingContacts && error ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-5 py-8 text-center text-sm text-[#8A1119]"
                        >
                          {error}
                        </td>
                      </tr>
                    ) : null}

                    {!isLoadingContacts && !error && filteredContacts.map((contact) => (
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

                    {!isLoadingContacts && !error && filteredContacts.length === 0 ? (
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
              </TableResponsiveWrapper>
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
