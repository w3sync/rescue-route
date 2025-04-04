import { config } from "dotenv";

import app from "@/app";

import { connectToDb } from "./lib";

config();

connectToDb().then(() => {
  app.listen(process.env.PORT || 3000, () => {
    const addressInfo = app.address();

    if (addressInfo && typeof addressInfo === "object" && process.env.NODE_ENV !== "production") {
      const host = addressInfo.address === "::" ? "localhost" : addressInfo.address;
      const port = addressInfo.port;
      console.log(`Server is listening at http://${host}:${port}`);
    }
    else {
      console.log(`Server is listening`);
    }
  });
}).catch((err) => {
  if (process.env.NODE_ENV === "development") {
    console.error(`ERROR :: CONNECTING TO DB \n ${err}`);
  }
});
