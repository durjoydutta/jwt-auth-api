import mongoose, {connect} from 'mongoose';
import { MONGO_URI } from '../../config/env.config.js';

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI, clientOptions);
        await mongoose.connection.db.admin().command({ ping: 1 });
        console.log("Pinged the deployment. Successfully connected to MongoDB!");

        // Set up event listeners for connection events
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', async () => {
            console.log('MongoDB disconnected');
            process.exit(1);
        });

        // Handle process termination
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed due to app termination');
            process.exit(0);
        });

    } catch (error) {
        console.error('DATABASE ERROR: ', error.message);
        process.exit(1);
    }
}

export default connectDB;