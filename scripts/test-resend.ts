/**
 * Simple Resend Email Test
 */

// Load environment variables FIRST
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env.local') });

// Then import Resend
import { Resend } from 'resend';

async function testResend() {
  console.log('🧪 Testing Resend email service...\n');
  
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@haguenau.pro';
  
  console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');
  console.log('From Email:', fromEmail);
  console.log('');
  
  if (!apiKey) {
    console.error('❌ RESEND_API_KEY not found in environment variables');
    process.exit(1);
  }
  
  const resend = new Resend(apiKey);
  
  try {
    console.log('📧 Sending test email...');
    
    const result = await resend.emails.send({
      from: fromEmail,
      to: 'test@resend.dev', // Resend test email
      subject: 'Test Email from Haguenau.pro',
      html: `
        <h1>Email Test Successful!</h1>
        <p>This is a test email from the Haguenau.pro platform.</p>
        <p>If you receive this, the Resend integration is working correctly.</p>
        <hr>
        <p><small>Sent at: ${new Date().toISOString()}</small></p>
      `,
    });
    
    console.log('✅ Email sent successfully!');
    console.log('   Email ID:', result.data?.id);
    console.log('   Result:', JSON.stringify(result, null, 2));
    
  } catch (error: any) {
    console.error('❌ Email sending failed:');
    console.error('   Error:', error.message);
    console.error('   Details:', error);
    process.exit(1);
  }
}

testResend()
  .then(() => {
    console.log('\n✅ Resend test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Resend test failed:', error);
    process.exit(1);
  });

