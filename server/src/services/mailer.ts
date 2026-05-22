import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

async function getTransporter(): Promise<Transporter> {
  if (transporter) return transporter;

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: Number(process.env.SMTP_PORT || 587),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    const testAccount = await nodemailer.createTestAccount();
    console.log('Ethereal test account created:');
    console.log(`  User: ${testAccount.user}`);
    console.log(`  Pass: ${testAccount.pass}`);
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  return transporter;
}

export async function sendWaitlistNotification(
  to: string,
  userName: string,
  eventTitle: string,
  eventDate: string,
) {
  const transport = await getTransporter();

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
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`Preview URL: ${previewUrl}`);
  }

  return { messageId: info.messageId, previewUrl: previewUrl || null };
}
