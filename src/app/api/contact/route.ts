import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

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

    // TODO: Send email via Resend, SendGrid, or other email service
    // For now, just log the contact request
    console.log('📧 Contact Form Submission:');
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Phone:', phone || 'N/A');
    console.log('Subject:', subject);
    console.log('Message:', message);

    // In production, you would send an email here:
    /*
    await sendEmail({
      to: 'contact@domain.pro',
      from: 'noreply@domain.pro',
      replyTo: email,
      subject: `Contact Form: ${subject}`,
      html: `
        <h2>Nouveau message de contact</h2>
        <p><strong>Nom:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Téléphone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Sujet:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });
    */

    return NextResponse.json({
      success: true,
      message: 'Message envoyé avec succès',
    });
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du message' },
      { status: 500 }
    );
  }
}

