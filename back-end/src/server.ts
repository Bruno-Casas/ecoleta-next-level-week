import express from 'express';
import cors from 'cors';
import path from 'path';
import routes from './routes';

const app = express();
app.use(cors());
app.use('/public/images', express.static(path.resolve(__dirname, '..', 'uploads')));

app.use(express.json());
app.use(routes);



app.listen(3333);