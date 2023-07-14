const jwt = require("jsonwebtoken");
const filterObj = require("../utils/filterObj");
const otpGenerator = require("otp-generator");

//
const User = require("../models/user");

// provides JWT token
const signToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET);

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

exports.forgotPassword = async (req, res, next) => {
	//
};

exports.resetPassword = async (req, res, next) => {
	//
};
