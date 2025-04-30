import nodemailer from 'nodemailer';

// Configure email transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendWelcomeEmail(name: string, email: string) {
  const mailOptions = {
    from: '"The Blended Circle" <noreply@theblendedfamily.com>',
    to: email,
    subject: 'Welcome to The Blended Circle',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hello ${name},</h2>
        <p>Welcome to The Blended Circle — we're so glad you're here!</p>
        <p>Created by The Fashionable Stepmum, this is a bold, beautiful, and safe space for navigating the unique journey of blended families. Whether you're a stepparent, bio parent, co-parent, loving partner, or part of a bonus family ecosystem — you belong here.</p>
        <p>At The Blended Circle, we're about:</p>
        <ul>
          <li>✔ Support, strength & stability</li>
          <li>✔ Real conversations that heal</li>
          <li>✔ Celebrating chosen family</li>
          <li>✔ And of course — style that empowers 🌿</li>
        </ul>
        <p>No filters. No perfection. Just authenticity, radiance, and resilience.</p>
        <p>Get ready to feel seen, heard, and supported.</p>
        <p>With love,<br>The Blended Circle Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
