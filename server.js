const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const sendOTPEmail = require("./services/mailer");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

process.on("uncaughtException", (err) => {
	console.log(err);
	process.exit(1);
});

process.on("unhandledRejection", (err) => {
	console.log(err);
	server.close(() => {
		process.exit(1);
	});
});

const app = require("./app");
app.use(bodyParser.json());

const http = require("http");
const server = http.createServer(app);

// const DB = process.env.DBURI.replace("<PASSWORD>", process.env.DBPASSWORD);
const DB = process.env.DBURI.replace("<PASSWORD>", process.env.DBPASSWORD);

mongoose
	.connect(DB, {})
	.then((con) => {
		console.log("DB connection is successful");
	})
	.catch((error) => {
		console.log(error);
	});

const port = process.env.PORT || 8000;

server.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});

app.post("/send-otp", (req, res) => {
	const { recipientEmail, otp } = req.body;

	sendOTPEmail(recipientEmail, otp);

	res.status(200).send("OTP email sent successfully");
});

app.listen(3001, () => {
	console.log("Server is running on port 3001");
});
