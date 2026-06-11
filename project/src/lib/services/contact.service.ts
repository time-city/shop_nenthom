import { Prisma } from '@prisma/client'
import prisma from '../prisma'
import { GetContactsParams, SubmitContactInput, UpdateContactStatusInput } from '../validations/contact.schema'

export const ContactService = {
  async submitContact(data: SubmitContactInput) {
    return prisma.contact.create({ data })
  },

  async getContacts(params: GetContactsParams) {
    const { page, limit, status, search } = params
    const skip = (page - 1) * limit
    const keyword = search?.trim()

    const where: Prisma.ContactWhereInput = {
      ...(status && { status }),
      ...(keyword && {
        OR: [
          { name: { contains: keyword, mode: 'insensitive' } },
          { email: { contains: keyword, mode: 'insensitive' } },
          { subject: { contains: keyword, mode: 'insensitive' } },
          { message: { contains: keyword, mode: 'insensitive' } },
        ],
      }),
    }

    const [contacts, total] = await prisma.$transaction([
      prisma.contact.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.contact.count({ where }),
    ])

    return {
      data: contacts,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  },

  async updateContactStatus(data: UpdateContactStatusInput) {
    const contact = await prisma.contact.findUnique({
      where: { id: data.id },
      select: { id: true },
    })
    if (!contact) throw new Error('Liên hệ không tồn tại')

    return prisma.contact.update({
      where: { id: data.id },
      data: { status: data.status },
    })
  },
}
