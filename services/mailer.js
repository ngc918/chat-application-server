// const nodemailer = require("nodemailer");

// const mail = async (req, res) => {
// 	let testAccount = await nodemailer.createTestAccount();

// 	let transporter = nodemailer.createTransport({
// 		host: "smtp.ethereal.email",
// 		port: 587,
// 		secure: false,
// 		auth: {
// 			user: testAccount.user,
// 			pass: testAccount.pass,
// 		},
// 	});

// 	let message = {
// 		from: '"Fred Foo 👻" <foo@example.com>', // sender address
// 		to: "bar@example.com, baz@example.com", // list of receivers
// 		subject: "Hello ✔", // Subject line
// 		text: "Hello world?", // plain text body
// 		html: "<b>Hello world?</b>", // html body
// 	};

// 	transporter
// 		.sendMail(message)
// 		.then(() => {
// 			return res.status(201).json({ msg: "email received" });
// 		})
// 		.catch((error) => {
// 			return res.status(500).json({ error });
// 		});

// 	// res.status(201).json("Mail sent!");
// };
