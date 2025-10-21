/**
 * Email Testing Script
 * Tests Resend email service integration
 */

// Load environment variables
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../.env.local') });

import { sendEmail } from '../src/lib/emails';

async function testEmail() {
  console.log('🧪 Testing email service...\n');

  try {
    // Test 1: Simple welcome email
    console.log('1️⃣ Testing welcome email...');
    const result1 = await sendEmail({
      to: 'test@example.com',
      subject: 'Test Email - Welcome',
      html: `
        <h1>Welcome to Haguenau.pro!</h1>
        <p>This is a test email from the email service.</p>
        <p>If you receive this, the email integration is working correctly.</p>
      `,
    });

    if (result1.success) {
      console.log('✅ Welcome email sent successfully!');
      console.log('   Email ID:', result1.data?.id);
    } else {
      console.log('❌ Welcome email failed:', result1.error);
    }

    console.log('\n---\n');

    // Test 2: Email with template
    console.log('2️⃣ Testing template email...');
    const result2 = await sendEmail({
      to: 'test@example.com',
      subject: 'Test Email - Verification',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Email Verification</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Please verify your email address by clicking the button below:</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="#" class="button">Verify Email</a>
              </p>
              <p>This is a test email. The verification link is not functional.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (result2.success) {
      console.log('✅ Template email sent successfully!');
      console.log('   Email ID:', result2.data?.id);
    } else {
      console.log('❌ Template email failed:', result2.error);
    }

    console.log('\n---\n');
    console.log('📊 Email Testing Summary:');
    console.log(`   Total tests: 2`);
    console.log(`   Successful: ${(result1.success ? 1 : 0) + (result2.success ? 1 : 0)}`);
    console.log(`   Failed: ${(!result1.success ? 1 : 0) + (!result2.success ? 1 : 0)}`);

  } catch (error) {
    console.error('❌ Email testing error:', error);
    process.exit(1);
  }
}

// Run test
testEmail()
  .then(() => {
    console.log('\n✅ Email testing completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Email testing failed:', error);
    process.exit(1);
  });

