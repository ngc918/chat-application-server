const nodemailer = require("nodemailer");

// Create a transporter
const transporter = nodemailer.createTransport({
	service: "Gmail",
	auth: {
		user: "nicolas.g9182@gmail.com", // Replace with your email
		pass: "@Canas9182", // Replace with your email password
	},
});

// Function to send OTP email
const sendOTPEmail = (recipientEmail, otp) => {
	const mailOptions = {
		from: "your.email@gmail.com", // Sender's email
		to: recipientEmail,
		subject: "Verification OTP",
		text: `Your verification OTP is: ${otp}`,
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.error("Error sending OTP email:", error);
		} else {
			console.log("OTP email sent:", info.response);
		}
	});
};

module.exports = sendOTPEmail;
