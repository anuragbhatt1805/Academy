import connectDB from "./src/configs/mongo.config.js";
import app from "./src/app.js";

import { PORT, NODE_ENV, APP_NAME } from "./src/constant.js";

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`${APP_NAME} ${NODE_ENV} server is running on port ${PORT}`);
      console.log(`App is accessible at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection error", error);
    process.exit(1);
  });
