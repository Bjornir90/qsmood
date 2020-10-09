import express from 'express'
import router from './routes.js'

const PORT = process.env.PORT || 8080;

const app = express();

app.use(express.json());
app.use('/api', router);

app.set('port', PORT);

export default app;
