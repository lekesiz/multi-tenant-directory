import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  companyId?: string;
  companyName?: string;
  companyEmail?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();
    const { name, email, phone, subject, message, companyId, companyName, companyEmail } = body;

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Adresse email invalide' },
        { status: 400 }
      );
    }

    // Name validation (min 2 characters)
    if (name.length < 2) {
      return NextResponse.json(
        { error: 'Le nom doit contenir au moins 2 caractères' },
        { status: 400 }
      );
    }

    // Subject validation (min 5 characters)
    if (subject.length < 5) {
      return NextResponse.json(
        { error: 'Le sujet doit contenir au moins 5 caractères' },
        { status: 400 }
      );
    }

    // Message validation (min 20 characters)
    if (message.length < 20) {
      return NextResponse.json(
        { error: 'Le message doit contenir au moins 20 caractères' },
        { status: 400 }
      );
    }

    // Phone validation (optional, but if provided must be valid)
    if (phone && phone.length < 10) {
      return NextResponse.json(
        { error: 'Numéro de téléphone invalide' },
        { status: 400 }
      );
    }

    // Log contact request (for now)
    console.log('📧 Contact Form Submission:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('From:', name, `<${email}>`);
    if (phone) console.log('Phone:', phone);
    console.log('Subject:', subject);
    if (companyName) console.log('To Company:', companyName);
    if (companyEmail) console.log('Company Email:', companyEmail);
    console.log('Message:', message);
    console.log('Timestamp:', new Date().toISOString());
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Track contact analytics (if companyId provided)
    if (companyId) {
      try {
        const company = await prisma.company.findUnique({
          where: { id: parseInt(companyId) },
        });

        if (company) {
          // TODO: Track contact event in CompanyAnalytics
          // This will be implemented when analytics tracking is ready
          console.log('📊 Analytics: Contact form submitted for company:', company.name);
        }
      } catch (error) {
        // Non-critical error, don't fail the request
        console.error('Error tracking analytics:', error);
      }
    }

    // TODO: Send email notification
    // This will be implemented with Resend, SendGrid, or other email service
    /*
    const emailService = process.env.EMAIL_SERVICE; // 'resend' | 'sendgrid' | 'smtp'
    
    if (emailService === 'resend') {
      await sendEmailWithResend({
        to: companyEmail || 'contact@domain.pro',
        from: 'noreply@domain.pro',
        replyTo: email,
        subject: `Nouveau contact: ${subject}`,
        html: generateEmailTemplate({
          name,
          email,
          phone,
          subject,
          message,
          companyName,
        }),
      });
    }
    */

    return NextResponse.json({
      success: true,
      message: 'Message envoyé avec succès',
    });
  } catch (error) {
    console.error('❌ Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du message' },
      { status: 500 }
    );
  }
}

// Email template generator (for future use)
function generateEmailTemplate(data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  companyName?: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3B82F6; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .field { margin-bottom: 20px; }
        .label { font-weight: bold; color: #4b5563; }
        .value { margin-top: 5px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>📧 Nouveau message de contact</h2>
          ${data.companyName ? `<p>Pour: ${data.companyName}</p>` : ''}
        </div>
        <div class="content">
          <div class="field">
            <div class="label">Nom:</div>
            <div class="value">${data.name}</div>
          </div>
          <div class="field">
            <div class="label">Email:</div>
            <div class="value"><a href="mailto:${data.email}">${data.email}</a></div>
          </div>
          ${data.phone ? `
          <div class="field">
            <div class="label">Téléphone:</div>
            <div class="value"><a href="tel:${data.phone}">${data.phone}</a></div>
          </div>
          ` : ''}
          <div class="field">
            <div class="label">Sujet:</div>
            <div class="value">${data.subject}</div>
          </div>
          <div class="field">
            <div class="label">Message:</div>
            <div class="value">${data.message.replace(/\n/g, '<br>')}</div>
          </div>
        </div>
        <div class="footer">
          <p>Ce message a été envoyé via le formulaire de contact</p>
          <p>Répondez directement à cet email pour contacter l'expéditeur</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

