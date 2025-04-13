import app from './src/app.js';
import connectDB from './src/database/connect.db.js';
import {PORT} from './config/env.config.js';

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`JWT auth server is running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error(error);
        console.log('Server failed to start');
        process.exit(1);
    }
}

await startServer();