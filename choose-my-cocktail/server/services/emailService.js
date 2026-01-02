const nodemailer = require('nodemailer');

// Configuration du transporteur email
// Utilisation explicite du port 587 (STARTTLS) pour éviter les blocages sur le port 465
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true pour 465, false pour les autres ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Fonction pour envoyer l'email de vérification
const sendVerificationEmail = async (to, token) => {
  const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}&email=${encodeURIComponent(to)}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"ChooseMyCocktail" <noreply@choosemycocktail.com>',
    to: to,
    subject: 'Vérifiez votre adresse email - ChooseMyCocktail',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e11d48;">Bienvenue sur ChooseMyCocktail !</h2>
        <p>Merci de vous être inscrit. Pour activer votre compte, veuillez cliquer sur le lien ci-dessous :</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" style="background-color: #e11d48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Vérifier mon email</a>
        </div>
        <p>Si le bouton ne fonctionne pas, vous pouvez copier-coller ce lien dans votre navigateur :</p>
        <p><a href="${verificationLink}">${verificationLink}</a></p>
        <p>Ce lien est valide pendant 24 heures.</p>
      </div>
    `
  };

  // Si pas de configuration email, on log le lien dans la console pour le développement
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('=================================================');
    console.log('EMAIL SERVICE NOT CONFIGURED - DEV MODE');
    console.log(`To: ${to}`);
    console.log(`Verification Link: ${verificationLink}`);
    console.log('=================================================');
    return true;
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email de vérification envoyé à ${to}`);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return false;
  }
};

module.exports = {
  sendVerificationEmail
};
