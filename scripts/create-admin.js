import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./src/models/user.model.js";

dotenv.config();

const createAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("MONGO_URI is required in .env");
      process.exit(1);
    }

    await mongoose.connect(mongoUri);

    const adminEmail = process.env.ADMIN_EMAIL || "admin@academy.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "adminPASS123!";
    const adminName = process.env.ADMIN_NAME || "Super Admin";

    const userExists = await User.findOne({ email: adminEmail });

    if (userExists) {
      console.log(`Admin user with email ${adminEmail} already exists.`);
      process.exit(0);
    }

    const adminUser = new User({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: "admin",
      resetPasswordOnLogin: true,
    });

    await adminUser.save();
    console.log("First admin user created successfully.");
    console.log(`Email: ${adminEmail}`);
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error.message);
    process.exit(1);
  }
};

createAdmin();
