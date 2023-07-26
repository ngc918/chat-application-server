const jwt = require("jsonwebtoken");
const filterObj = require("../utils/filterObj");
const otpGenerator = require("otp-generator");
const crypto = require("crypto");

const mailService = require("../services/mailer");

//
const User = require("../models/user");
const { promisify } = require("util");

// provides JWT token
const signToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET);

// Signup => register - sendOTP - verifyOTP

// https://api.ims.com/auth/register

// Register User
exports.register = async (req, res, next) => {
	const { firstName, lastName, email, password } = req.body;

	const filteredBody = filterObj(
		req.body,
		"firstName",
		"lastName",
		"email",
		"password"
	);

	// check if email is associated with a user

	const existingUser = await User.findOne({ email: email });

	if (existingUser && existingUser.verified) {
		res.status(400).json({
			status: "error",
			message:
				"This email is already in use. Please choose a different email or login.",
		});
	} else if (existingUser) {
		await User.findOneAndUpdate({ email: email }, filteredBody, {
			new: true,
			validateModifiedOnly: true,
		});

		//
		req.userId = existingUser._id;
		next();
	} else {
		// if user not in DB

		const newUser = await User.create(filteredBody);

		req.userId = newUser._id;
		next();
	}
};

exports.login = async (req, res, next) => {
	const { userId } = req;
	const new_otp = otpGenerator.generate(6, {
		lowerCaseAlphabets: false,
		upperCaseAlphabets: false,
		specialChars: false,
	});

	const otp_expiry_time = Date.now() + 10 * 60 * 1000; //10 min after otp sends

	await User.findByIdAndUpdate(userId, {
		otp: new_otp,
		otp_expiry_time,
	});

	// Send Mail

	mailService.sendEmail({
		from: "contact@ims.com",
		to: "user@gmail.com",
		subject: "OTP for IMS",
		text: `Your OTP is ${new_otp}. This is valid for 10 minutes.`,
	});

	res.status(200).json({
		status: "success",
		message: "OTP sent successfully",
	});
};

exports.verifyOTP = async (req, res, next) => {
	// verifyy OTP and update user record

	const { email, otp } = req.body;

	const user = await User.findOne({
		email,
		otp_expiry_time: { $gt: Date.now() },
	});

	if (!user) {
		res.status(400).json({
			status: "error",
			message: "Invalid Email/Otp",
		});
	}

	if (!(await user.correctOTP(otp, user.otp))) {
		res.status(400).json({
			status: "error",
			message: "OTP incorrect",
		});
	}

	user.verified = true;
	user.otp = undefined;

	await user.save({ new: true, validateModifiedOnly: true });

	const token = signToken(user._id);

	res.status(200).json({
		status: "success",
		message: "OTP verified successfully!",
		token,
	});
};

exports.login = async (req, res, next) => {
	const { email, password } = req.body;

	if (!email || !password) {
		res.status(400).json({
			status: "error",
			message: "Both email and password are required",
		});
	}

	const user = await User.findOne({ email: email }).select("+password");

	if (!user || !(await user.correctPassword(password, user.password))) {
		res.status(400).json({
			status: "error",
			message: "Email or password are incorrect",
		});
	}

	const token = signToken(user._id);

	res.status(200).json({
		status: "success",
		message: "Successfully logged in",
		token,
	});
};

exports.protect = async (req, res, next) => {
	// 1) Getting token (JWT) and check if it's there
	let token;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		token = req.headers.authorization.split(" ")[1];
	} else if (req.cookies.jwt) {
		token = req.cookies.jwt;
	} else {
		req.status(400).json({
			status: "error",
			message: "You are not logged in. Please log in with an account",
		});
		return;
	}

	// Verficiation of token

	const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

	// Check if user still exist
	const this_user = await User.findByIdAndUpdate(decoded.userId);

	if (!this_user) {
		res.status(400).json({
			status: "error",
			message: "The user doesn't exist",
		});
	}

	// check if password was changed after token was issued
	if (this_user.changedPasswordAfter(decoded.iat)) {
		res.status(400).json({
			status: "error",
			message: "User updated password. Please try again.",
		});
	}
	req.user = this_user;
	next();
};

// Types of routes -> Protected (Only logged in users can access these)

exports.forgotPassword = async (req, res, next) => {
	// Get users email
	const user = await User.findOne({ email: req.body.email });
	if (!user) {
		res.status(400).json({
			status: "error",
			message: "There is no user associated with this email address",
		});

		return;
	}

	// Generate random token
	const resetToken = user.createPasswordResetToken();

	const resetUrl = `https://ims.com/auth/reset-password/?code=${resetToken}`;

	try {
		// TODO => Send Email With Reset URL

		res.status(200).json({
			status: "success",
			message: "Reset Password link sent to your email",
		});
	} catch (error) {
		user.passwordResetToken = undefined;
		user.passwordResetExpires = undefined;

		await user.save({ validateBeforeSave: false });

		res.status(500).json({
			status: "error",
			message: "There was an error sending the email. Please try again later.",
		});
	}
};

exports.resetPassword = async (req, res, next) => {
	// Get user based on token
	const hashedToken = crypto
		.createHash("sha256")
		.update(req.params.token)
		.digest("hex");

	const user = await User.findOne({
		passwordResetToken: hashedToken,
		passwordResetExpires: { $gt: Date.now() },
	});

	//  If token has expired or submission expires

	if (!user) {
		res.status(400).json({
			status: "error",
			message: "Token is expired or invalid",
		});
	}

	// Update users password and set resetToken

	user.password = req.body.password;
	user.passwordConfirm = req.body.passwordConfirm;
	user.passwordResetToken = undefined;
	user.passwordResetExpires = undefined;

	await user.save();

	// Log in the user and send JWT

	// TODO => send email to users regarding password change

	const token = signToken(userDoc._id);
	res.status(200).json({
		status: "success",
		message: "Password changed successfully",
		token,
	});
};
