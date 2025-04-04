import cookieParser from "cookie-parser";
import expresscors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { createServer } from "node:http";
import path from "node:path";
import { Server } from "socket.io";

import { errorHandler } from "@/middlewares/error-handler";

import { notFound } from "./middlewares/not-found.middleware";
import initRouter from "./routes";
import { userAuth } from "./ws/middleware/auth.middleware";

// App Inilization
const app = express();

app.use(helmet());

app.use(expresscors({
  origin: (process.env.CORS_ORIGIN)?.trim(),
  credentials: true,
}));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // limit each IP to 100 req / windowMs
  message: {
    error: "Too many Request, please try again later",
  },
});

app.use(express.json({
  limit: "30kb",
}));

app.use(express.urlencoded({
  limit: "30kb",
  extended: true,
}));

app.use(express.static(path.resolve("./public")));

app.use(cookieParser());

app.get("/", (req, res, next) => {
  res.json({
    message: "hello World",
    status: true,
  });
});

app.use("/api/v1", apiLimiter, initRouter);

app.use("*", notFound);

app.use(errorHandler);

// socket io initilization
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
  allowEIO3: true,
});

io.use(userAuth);

io.on("connection", (socket) => {
  console.log("user connected", socket.id);
  console.log("mongodb user :: ", socket.user);

  socket.on("message", (text) => {
    console.log(`Server :: Message :: ${text}`);
  });

  socket.on("location.live", (locationObj) => {
    console.log(`Server :: location ::`, locationObj);
  });

  socket.on("error", (err) => {
    console.error(`Socket ${socket.id} error: ${err}`);
  });
});

export default server;
