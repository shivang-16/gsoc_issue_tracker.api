import { app } from "./app";
import ConnectToDB from "./db/db";
import { logger } from "./utils/winstonLogger";

const PORT = process.env.PORT || 7000;

ConnectToDB()

// Start the server
app.listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}`);
});