import sendEmail from "../utils/sendEmail.js";
import AppError from "../utils/error.util.js";

const sendContactMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return next(new AppError("All fields are required", 400));
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      cleanName.length < 2 ||
      cleanName.length > 60 ||
      !emailRegex.test(cleanEmail) ||
      cleanSubject.length < 3 ||
      cleanSubject.length > 100 ||
      cleanMessage.length < 10 ||
      cleanMessage.length > 3000
    ) {
      return next(new AppError("Please provide valid contact details", 400));
    }

    const emailMessage = `
      <h2>New Contact Message</h2>

      <p><strong>Name:</strong> ${cleanName}</p>
      <p><strong>Email:</strong> ${cleanEmail}</p>
      <p><strong>Subject:</strong> ${cleanSubject}</p>

      <h3>Message:</h3>
      <p>${cleanMessage.replace(/\n/g, "<br>")}</p>
    `;

    await sendEmail(
      process.env.ADMIN_EMAIL,
      `Contact Form: ${cleanSubject}`,
      emailMessage
    );

    return res.status(200).json({
      success: true,
      message: "Your message has been sent successfully!",
    });

  } catch (error) {
    return next(
      new AppError("Unable to send your message. Please try again later.", 500)
    );
  }
};

export { sendContactMessage };
