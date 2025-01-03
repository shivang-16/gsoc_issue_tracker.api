import { app } from "./app";
import ConnectToDB from "./db/db";

const PORT = process.env.PORT || 7000;

ConnectToDB()

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});