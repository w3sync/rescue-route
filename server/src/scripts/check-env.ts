import { config } from "dotenv";

config();

try {
  const {
    MONGODB_URI,
    CORS_ORIGIN,
    PORT,
    NODE_ENV,

    ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRY,

    REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIRY,
  } = process.env;

  const envVariables = Object.values([
    MONGODB_URI,
    CORS_ORIGIN,
    PORT,
    NODE_ENV,
    ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIRY,
  ]);

  if (envVariables.some(val => val === null || val === undefined)) {
    throw new Error("You haven't set the ENV VARIABLES");
    process.exit(1);
  }
}
catch (error: any) {
  console.error(`
                    
                    UNSET ENV VARIABLES
                
                    ERROR :: MESSAGE ::  ${error.message as Error}
                `);
  process.exit(1);
}
