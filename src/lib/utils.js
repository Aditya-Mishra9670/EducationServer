import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

//Transporter for mail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS  // Your email password or app-specific password
  }
});

//For Cookies
export const generateAuthToken = async (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_KEY, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  });
};

//For sending mails

export const sendWelcomeMail = async (email, name) => {
  const mailContent = {
    from: "StudyTube <no-reply@studytube.com>",
    to: email,
    subject: "Welcome to StudyTube!",
    html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://res.cloudinary.com/dzitsseoz/image/upload/v1736671628/vcgq9rhodhvrs6dcridx.png" alt="StudyTube Logo" style="width: 150px; height: auto;">
            </div>
            <h2 style="text-align: center; color: #333;">Welcome to StudyTube!</h2>
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              Hi ${name},
            </p>
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              We're thrilled to have you join our learning community! Whether you're here to acquire new skills, explore exciting courses, or enhance your knowledge, StudyTube is the perfect platform for your educational journey.
            </p>
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              Here's a quick start guide:
            </p>
            <ul style="font-size: 16px; color: #555; line-height: 1.6; margin-left: 20px;">
              <li>Browse courses tailored to your interests.</li>
              <li>Learn at your own pace with our flexible video lessons.</li>
              <li>Get certified knowledge</li>
            </ul>
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              Ready to dive in? Click the button below to explore courses and start learning today!
            </p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="https://studytube.com/courses" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px; font-size: 16px;">
                Explore Courses
              </a>
            </div>
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              If you have any questions or need assistance, feel free to reach out to our support team. We're here to help you every step of the way.
            </p>
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              Happy learning,<br>
              The StudyTube Team
            </p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="font-size: 12px; color: #888; text-align: center;">
              This email was sent to you as a registered user of StudyTube. If you did not sign up, please ignore this email.
            </p>
          </div>
        `,
  };

  await transporter.sendMail(mailContent);
};

export const sendLoginActivityMail = async (email, name) => {
  const mailContent = {
    from: "StudyTube <no-reply@studytube.com>",
    to: email,
    subject: "Login Activity Detected",
    html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://res.cloudinary.com/dzitsseoz/image/upload/v1736671628/vcgq9rhodhvrs6dcridx.png" alt="StudyTube Logo" style="width: 150px; height: auto;">
            </div>
            <h2 style="text-align: center; color: #333;">Login Activity Detected</h2>
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              Hi ${name},
            </p>
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              A login to your StudyTube account was detected. If this was you, no action is needed.
            </p>
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              If you did not authorize this activity, please secure your account immediately.
            </p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="https://studytube.com/reset-password" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #dc3545; color: #fff; text-decoration: none; border-radius: 5px; font-size: 16px;">
                Secure Your Account
              </a>
            </div>
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              If you need further assistance, please contact our support team.
            </p>
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              Best regards,<br>
              The StudyTube Team
            </p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="font-size: 12px; color: #888; text-align: center;">
              This email was sent to you as a registered user of StudyTube. If you did not sign up, please ignore this email.
            </p>
          </div>
        `,
  };

  await transporter.sendMail(mailContent);
};

export const sendPasswordResetMail = async (email, name, token) => {
  const encodedToken = encodeURIComponent(token);
  const mailContent = {
    from: "StudyTube <no-reply@studytube.com>",
    to: email,
    subject: "Password Reset Request",
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://res.cloudinary.com/dzitsseoz/image/upload/v1736671628/vcgq9rhodhvrs6dcridx.png" alt="StudyTube Logo" style="width: 150px; height: auto;">
      </div>
      <h2 style="text-align: center; color: #333;">Reset Your Password</h2>
      <p style="font-size: 16px; color: #555; line-height: 1.6;">
        Hi ${name},
      </p>
      <p style="font-size: 16px; color: #555; line-height: 1.6;">
        We received a request to reset the password for your StudyTube account. If you made this request, please click the button below to reset your password.
      </p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="http://studytube.com/reset-password/${encodedToken}" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: #fff; text-decoration: none; border-radius: 5px; font-size: 16px;">
          Reset Password
        </a>
      </div>
      <p style="font-size: 16px; color: #555; line-height: 1.6;">
        If you didn't request a password reset, you can ignore this email. Your password will remain unchanged.
      </p>
      <p style="font-size: 16px; color: #555; line-height: 1.6;">
        Please note that the reset link will expire in 30 minutes.
      </p>
      <p style="font-size: 16px; color: #555; line-height: 1.6;">
        Best regards,<br>
        The StudyTube Team
      </p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="font-size: 12px; color: #888; text-align: center;">
        This email was sent to you as a registered user of StudyTube. If you did not sign up, please ignore this email.
      </p>
    </div>
  `,
  };

  await transporter.sendMail(mailContent);
};

export const sendSuspensionMail = async (email, name, reason) => {
  const mailContent = {
    from: "StudyTube <no-reply@studytube.com>",
    to: email,
    subject: "Account Suspension Notification",
    html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://res.cloudinary.com/dzitsseoz/image/upload/v1736671628/vcgq9rhodhvrs6dcridx.png" alt="StudyTube Logo" style="width: 150px; height: auto;">
            </div>
            <h2 style="text-align: center; color: #333;">Account Suspension Notification</h2>
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              Hi ${name},
            </p>
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              We regret to inform you that your StudyTube account has been suspended due to the following reason:
            </p>
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              <strong>${reason}</strong>
            </p>
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              If you believe this suspension was made in error, please contact our support team immediately.
            </p>
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              Best regards,<br>
              The StudyTube Team
            </p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="font-size: 12px; color: #888; text-align: center;">
              This email was sent to you as a registered user of StudyTube. If you did not sign up, please ignore this email.
            </p>
          </div>
        `,
  };
  await transporter.sendMail(mailContent);
};
