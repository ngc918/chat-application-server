const User = require("../models/user");
const filterObj = require("../utils/filterObj");

exports.updateMe = async (req, res, next) => {
	const { user } = req;

	const filteredBody = filterObj(
		req.body,
		"firstName",
		"lastName",
		"about",
		"avatar"
	);

	// update the existing user with new data from request body
	const updatedUser = await User.findByIdAndUpdate(user._id, filteredBody, {
		new: true,
		validateModifiedOnly: true,
	});

	res.status(200).json({
		status: "success",
		data: updatedUser,
		message: "Profile Updated successfully",
	});
};
