import express from 'express';
import { PORT } from './config/env.config.js';


const app = express();

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
})

export default app;