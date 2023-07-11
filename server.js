const mongoose = require("mongoose");
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

const http = require("http");
const server = http.createServer(app);

const DB = process.env.DBURI.replace("<PASSWORD>", process.env.DBPASSWORD);

mongoose
	.connect(DB, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false,
		useUnifiedTopology: true,
	})
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
