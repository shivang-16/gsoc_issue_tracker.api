import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let db: mongoose.Connection;

const ConnectToDB = async () => {
  const DatabaseUrl = process.env.DB_URL as string;
  console.log(DatabaseUrl, "here is the database url");
  try {
    await mongoose.connect(DatabaseUrl);
    db = mongoose.connection;
    console.log("DB Connected.");

  } catch (error) {
    console.log("Error connecting to databases:", error);
  }
};

export { db };
export default ConnectToDB;