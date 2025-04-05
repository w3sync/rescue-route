import mongoose from "mongoose";

export async function connectToDb(): Promise<mongoose.Connection> {
  console.log("Connection to db ...");
  const db = mongoose.connection;

  db.on("connected", () => {
    console.log("DB is Connected Successfully");
  });

  db.on("error", (err) => {
    console.log("DB connection failed", err);
    process.exit(0);
  });

  db.on("disconnected", () => {
    console.log("Mongoose disconnected");
  });

  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    return db;
  }
  catch (error) {
    throw new Error("DB Connection Failed");
  }
}
