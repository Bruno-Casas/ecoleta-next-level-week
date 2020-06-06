import express from 'express';

import itensController from './controllers/itensController'
import pointController from './controllers/pointsController'
import pointsController from './controllers/pointsController';

const routes = express.Router();

routes.get('/itens', itensController.index);
routes.get('/points', pointController.index);
routes.get('/points/:id', pointsController.show);
routes.post('/points', pointController.create);

export default routes;