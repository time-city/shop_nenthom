'use server'
import { getPublicErrorMessage } from "../utils/publicError";

import { requireAdmin } from '../requireAdmin'
import { emitNewContactToAdmin } from '../events/adminContactEvents'
import { GetContactsParams, SubmitContactInput, UpdateContactStatusInput, getContactsSchema, submitContactSchema, updateContactStatusSchema, } from '../validations/contact.schema'
import { ContactService } from '../services/contact.service'

// Server Action gửi thông tin liên hệ mới từ trang Contact
export async function submitContactAction(params: SubmitContactInput) {
  const parsed = submitContactSchema.safeParse(params)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    const contact = await ContactService.submitContact(parsed.data)

    try {
      await emitNewContactToAdmin({
        contactId: contact.id,
        createdAt: contact.created_at.toISOString(),
        email: contact.email,
        name: contact.name,
        subject: contact.subject,
      })
    } catch (eventError) {
      console.error("[emitNewContactToAdmin] Không thể phát NEW_CONTACT:", eventError)
    }

    return { success: true, data: contact }
  } catch (err) {
    return { error: getPublicErrorMessage(err, "Có lỗi xảy ra. Vui lòng thử lại.") }
  }
}

// Server Action lấy danh sách liên hệ cho trang Admin Dashboard
export async function getContactsAction(params: Partial<GetContactsParams> = {}) {
  const authError = await requireAdmin()
  if ("error" in authError) return authError

  const parsed = getContactsSchema.safeParse(params)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    const contacts = await ContactService.getContacts(parsed.data)
    return { success: true, ...contacts }
  } catch (err) {
    return { error: getPublicErrorMessage(err, "Có lỗi xảy ra. Vui lòng thử lại.") }
  }
}

// Server Action cập nhật trạng thái liên hệ, chỉ cho phép ADMIN thao tác.
export async function updateContactStatusAction(params: UpdateContactStatusInput) {
  const authError = await requireAdmin()
  if ("error" in authError) return authError

  const parsed = updateContactStatusSchema.safeParse(params)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    const contact = await ContactService.updateContactStatus(parsed.data)
    return { success: true, data: contact }
  } catch (err) {
    return { error: getPublicErrorMessage(err, "Có lỗi xảy ra. Vui lòng thử lại.") }
  }
}
