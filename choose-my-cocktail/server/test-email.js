require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('Testing email configuration...');
  console.log(`Service: ${process.env.EMAIL_SERVICE}`);
  console.log(`User: ${process.env.EMAIL_USER}`);

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('ERROR: EMAIL_USER or EMAIL_PASSWORD is missing in .env');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // Send to yourself for testing
    subject: 'Test ChooseMyCocktail Email Configuration',
    text: 'Si vous recevez ce message, votre configuration email fonctionne correctement ! 🎉'
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log(`Check your inbox at ${process.env.EMAIL_USER}`);
  } catch (error) {
    console.error('❌ Error sending email:', error);
    if (error.code === 'EAUTH') {
      console.log('Hint: Check your email and app password. Make sure you are using an App Password, not your login password.');
    }
  }
}

testEmail();
