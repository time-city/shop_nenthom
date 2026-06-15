'use server'

import { getSession } from '../session'
import { GetContactsParams,SubmitContactInput,UpdateContactStatusInput,getContactsSchema,submitContactSchema,updateContactStatusSchema, } from '../validations/contact.schema'
import { ContactService } from '../services/contact.service'

async function requireAdmin() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return { error: 'Không có quyền truy cập' }

  return null
}

// Server Action gửi thông tin liên hệ mới từ trang Contact
export async function submitContactAction(params: SubmitContactInput) {
  const parsed = submitContactSchema.safeParse(params)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    const contact = await ContactService.submitContact(parsed.data)
    return { success: true, data: contact }
  } catch (err) {
    return { error: (err as Error).message }
  }
}

// Server Action lấy danh sách liên hệ cho trang Admin Dashboard
export async function getContactsAction(params: Partial<GetContactsParams> = {}) {
  const authError = await requireAdmin()
  if (authError) return authError

  const parsed = getContactsSchema.safeParse(params)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    const contacts = await ContactService.getContacts(parsed.data)
    return { success: true, ...contacts }
  } catch (err) {
    return { error: (err as Error).message }
  }
}

// Server Action cập nhật trạng thái liên hệ, chỉ cho phép ADMIN thao tác.
export async function updateContactStatusAction(params: UpdateContactStatusInput) {
  const authError = await requireAdmin()
  if (authError) return authError

  const parsed = updateContactStatusSchema.safeParse(params)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    const contact = await ContactService.updateContactStatus(parsed.data)
    return { success: true, data: contact }
  } catch (err) {
    return { error: (err as Error).message }
  }
}
