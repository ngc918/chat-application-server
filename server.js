const { configDotenv } = require("dotenv");
const app = require("./app");
configDotenv;

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

const http = require("http");

const server = http.createServer(app);

const port = process.env.PORT || 8000;

server.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
