const mongoose = require("mongoose");
const bcrypt = require("bycryptjs");
const { Schema, model } = mongoose;

const userSchema = new Schema({
	firstName: {
		type: String,
		unique: true,
		required: [true, "First name is required"],
	},
	lastName: {
		type: String,
		unique: true,
		required: [true, "Last name is required"],
	},
	about: { type: String },
	avatar: { type: String },
	email: {
		type: String,
		required: [true, "Email is required"],
		validate: {
			validator: function (email) {
				return String(email)
					.toLowerCase()
					.match(
						/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
					);
			},
			message: (props) => `Email ${props.value} is invalid`,
		},
	},
	password: {
		type: String,
	},
	passwordChangedAt: {
		type: Date,
	},
	passwordResetToken: {
		type: String,
	},
	passwordResetExpires: {
		type: Date,
	},
	createdAt: {
		type: Date,
	},
	updatedAt: {
		type: Date,
	},
});

userSchema.methods.correctPassword = async function (
	canditatePassword,
	userPassword
) {
	return await bcrypt.compare(canditatePassword, userPassword);
};

const User = model("User", userSchema);

module.exports = User;
