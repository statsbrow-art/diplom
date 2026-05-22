import nodemailer from 'nodemailer';

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: Number(process.env.SMTP_PORT || 587),
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

export async function sendWaitlistNotification(
  to: string,
  userName: string,
  eventTitle: string,
  eventDate: string,
) {
  const info = await transport.sendMail({
    from: process.env.SMTP_FROM || '"SPT Arena" <noreply@sptarena.local>',
    to,
    subject: `Уведомление о мероприятии: ${eventTitle}`,
    html: `
      <h2>Здравствуйте, ${userName}!</h2>
      <p>Рады сообщить, что мероприятие <strong>«${eventTitle}»</strong> (${eventDate}) теперь доступно для покупки билетов.</p>
      <p>Перейдите на сайт SPT Arena, чтобы приобрести билеты.</p>
      <br/>
      <p>С уважением,<br/>Команда SPT Arena</p>
    `,
  });

  console.log(`Email sent to ${to}, messageId: ${info.messageId}`);
  if (process.env.SMTP_HOST === 'smtp.ethereal.email' || !process.env.SMTP_HOST) {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`Preview URL: ${previewUrl}`);
    }
  }

  return info;
}
