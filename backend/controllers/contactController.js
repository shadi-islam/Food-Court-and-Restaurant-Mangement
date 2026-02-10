import nodemailer from "nodemailer";
import { validateEmail, validateName, sanitizeString } from "../utils/validators.js";

export const sendContactEmail = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // SECURITY: Input validation
    if (!name || !email || !subject || !message) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email address." });
    }

    // Validate name format
    if (!validateName(name)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid name format." });
    }

    // Sanitize inputs
    const sanitizedName = sanitizeString(name);
    const sanitizedSubject = sanitizeString(subject);
    const sanitizedMessage = sanitizeString(message);

    // Check length limits
    if (sanitizedSubject.length > 100 || sanitizedMessage.length > 5000) {
      return res
        .status(400)
        .json({ success: false, message: "Input exceeds maximum length." });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Restaurant Contact" <${process.env.EMAIL_FROM}>`,
      to: process.env.EMAIL_TO,
      replyTo: email, // so you can reply directly to the sender
      subject: `Contact Form: ${sanitizedSubject}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>New Contact Form Message</h2>
          <p><b>Name:</b> ${sanitizedName}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Subject:</b> ${sanitizedSubject}</p>
          <p><b>Message:</b></p>
          <p style="white-space: pre-wrap;">${sanitizedMessage}</p>
          <hr/>
          <small>Sent from your restaurant website contact form.</small>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "Message sent successfully!",
    });
  } catch (error) {
    console.log("CONTACT EMAIL ERROR:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to send message." });
  }
};
