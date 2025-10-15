import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string;
  from: string;
  replyTo?: string;
  subject: string;
  html: string;
}

export async function sendEmail({
  to,
  from,
  replyTo,
  subject,
  html,
}: EmailOptions) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY not configured. Email not sent.');
      return { success: false, error: 'Email service not configured' };
    }

    const data = await resend.emails.send({
      from: from || process.env.RESEND_FROM_EMAIL || 'noreply@example.com',
      to,
      replyTo: replyTo || from,
      subject,
      html,
    });

    console.log('✅ Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Email error:', error);
    return { success: false, error };
  }
}

export async function sendContactEmail({
  name,
  email,
  phone,
  subject,
  message,
  companyName,
  companyEmail,
}: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  companyName: string;
  companyEmail: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f6f9fc;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background-color: #3B82F6; padding: 30px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
            Nouveau message de contact
          </h1>
          <p style="color: #E0E7FF; margin: 10px 0 0 0; font-size: 14px;">
            Pour ${companyName}
          </p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <!-- Contact Info -->
          <div style="background-color: #F3F4F6; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <h2 style="color: #374151; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
              Informations du contact
            </h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Nom :</td>
                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Email :</td>
                <td style="padding: 8px 0;">
                  <a href="mailto:${email}" style="color: #3B82F6; text-decoration: none; font-size: 14px;">${email}</a>
                </td>
              </tr>
              ${phone ? `
              <tr>
                <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Téléphone :</td>
                <td style="padding: 8px 0;">
                  <a href="tel:${phone}" style="color: #3B82F6; text-decoration: none; font-size: 14px;">${phone}</a>
                </td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Objet :</td>
                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">${subject}</td>
              </tr>
            </table>
          </div>
          
          <!-- Message -->
          <div style="margin-bottom: 30px;">
            <h2 style="color: #374151; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
              Message
            </h2>
            <div style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px;">
              <p style="color: #374151; margin: 0; font-size: 14px; white-space: pre-wrap;">${message}</p>
            </div>
          </div>
          
          <!-- CTA -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" 
               style="display: inline-block; background-color: #3B82F6; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; font-size: 14px;">
              Répondre au message
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #F9FAFB; padding: 20px 30px; border-top: 1px solid #E5E7EB;">
          <p style="color: #6B7280; margin: 0; font-size: 12px; text-align: center;">
            Ce message a été envoyé depuis le formulaire de contact de votre fiche entreprise.
          </p>
          <p style="color: #6B7280; margin: 10px 0 0 0; font-size: 12px; text-align: center;">
            ${new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: companyEmail,
    from: process.env.RESEND_FROM_EMAIL || 'noreply@example.com',
    replyTo: email,
    subject: `[Contact Pro] ${subject}`,
    html,
  });
}

export async function sendVerificationEmail({
  to,
  verificationUrl,
  firstName,
}: {
  to: string;
  verificationUrl: string;
  firstName?: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f6f9fc;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background-color: #3B82F6; padding: 40px 20px; text-align: center;">
          <div style="margin-bottom: 20px;">
            <div style="display: inline-block; background-color: #ffffff; border-radius: 50%; padding: 20px;">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z" fill="#3B82F6"/>
              </svg>
            </div>
          </div>
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
            Vérifiez votre email
          </h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
            ${firstName ? `Bonjour ${firstName},` : 'Bonjour,'}
          </p>
          
          <p style="color: #374151; font-size: 16px; margin: 0 0 30px 0;">
            Merci de vous être inscrit ! Pour activer votre compte et accéder à votre espace professionnel, 
            veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :
          </p>
          
          <!-- CTA Button -->
          <div style="text-align: center; margin: 40px 0;">
            <a href="${verificationUrl}" 
               style="display: inline-block; background-color: #3B82F6; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              Vérifier mon email
            </a>
          </div>
          
          <!-- Alternative link -->
          <div style="background-color: #F9FAFB; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <p style="color: #6B7280; font-size: 14px; margin: 0 0 10px 0;">
              Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
            </p>
            <p style="word-break: break-all; color: #3B82F6; font-size: 14px; margin: 0;">
              ${verificationUrl}
            </p>
          </div>
          
          <!-- Security note -->
          <div style="border-left: 4px solid #FCD34D; background-color: #FFFBEB; padding: 15px 20px; margin: 20px 0;">
            <p style="color: #92400E; font-size: 14px; margin: 0;">
              <strong>Note de sécurité :</strong> Ce lien expire dans 24 heures. 
              Si vous n'avez pas demandé cette vérification, vous pouvez ignorer cet email.
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #F9FAFB; padding: 30px; border-top: 1px solid #E5E7EB;">
          <p style="color: #6B7280; margin: 0 0 10px 0; font-size: 14px; text-align: center;">
            Besoin d'aide ? Contactez notre support
          </p>
          <p style="text-align: center; margin: 0;">
            <a href="mailto:support@example.com" style="color: #3B82F6; text-decoration: none; font-size: 14px;">
              support@example.com
            </a>
          </p>
          <p style="color: #9CA3AF; margin: 20px 0 0 0; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} Multi-Tenant Directory. Tous droits réservés.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    from: process.env.RESEND_FROM_EMAIL || 'noreply@example.com',
    subject: 'Vérifiez votre adresse email',
    html,
  });
}

export async function sendPasswordResetEmail({
  to,
  resetUrl,
  firstName,
}: {
  to: string;
  resetUrl: string;
  firstName?: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f6f9fc;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background-color: #EF4444; padding: 40px 20px; text-align: center;">
          <div style="margin-bottom: 20px;">
            <div style="display: inline-block; background-color: #ffffff; border-radius: 50%; padding: 20px;">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" fill="#EF4444"/>
              </svg>
            </div>
          </div>
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
            Réinitialisation du mot de passe
          </h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
            ${firstName ? `Bonjour ${firstName},` : 'Bonjour,'}
          </p>
          
          <p style="color: #374151; font-size: 16px; margin: 0 0 30px 0;">
            Vous avez demandé la réinitialisation de votre mot de passe. 
            Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
          </p>
          
          <!-- CTA Button -->
          <div style="text-align: center; margin: 40px 0;">
            <a href="${resetUrl}" 
               style="display: inline-block; background-color: #EF4444; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              Réinitialiser mon mot de passe
            </a>
          </div>
          
          <!-- Alternative link -->
          <div style="background-color: #F9FAFB; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <p style="color: #6B7280; font-size: 14px; margin: 0 0 10px 0;">
              Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
            </p>
            <p style="word-break: break-all; color: #EF4444; font-size: 14px; margin: 0;">
              ${resetUrl}
            </p>
          </div>
          
          <!-- Security note -->
          <div style="border-left: 4px solid #FCD34D; background-color: #FFFBEB; padding: 15px 20px; margin: 20px 0;">
            <p style="color: #92400E; font-size: 14px; margin: 0;">
              <strong>Important :</strong> Ce lien expire dans 1 heure. 
              Si vous n'avez pas demandé cette réinitialisation, changez immédiatement votre mot de passe 
              et contactez notre support.
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #F9FAFB; padding: 30px; border-top: 1px solid #E5E7EB;">
          <p style="color: #6B7280; margin: 0 0 10px 0; font-size: 14px; text-align: center;">
            Besoin d'aide ? Contactez notre support
          </p>
          <p style="text-align: center; margin: 0;">
            <a href="mailto:support@example.com" style="color: #EF4444; text-decoration: none; font-size: 14px;">
              support@example.com
            </a>
          </p>
          <p style="color: #9CA3AF; margin: 20px 0 0 0; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} Multi-Tenant Directory. Tous droits réservés.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    from: process.env.RESEND_FROM_EMAIL || 'noreply@example.com',
    subject: 'Réinitialisation de votre mot de passe',
    html,
  });
}