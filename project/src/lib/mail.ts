import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const Mail = {
  async send({
    to,
    subject,
    html,
  }: {
    to: string
    subject: string
    html: string
  }) {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to,
      subject,
      html,
    })

    if (error) throw new Error(error.message)

    return data
  },
}