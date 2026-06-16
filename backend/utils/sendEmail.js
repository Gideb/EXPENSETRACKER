/* const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    html,
  });
};

module.exports = sendEmail;
 */

const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });


    await transporter.verify();
    console.log("SMTP connection verified");

    
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      html,
    });

    console.log("Email sent successfully");
  } catch (error) {
    console.error("Email error:", error);
    throw error;
  }
};

module.exports = sendEmail;