const { Router } = require('express');

const routes = new Router();

const HomeController = require('./app/controllers/HomeController');
const UserController = require('./app/controllers/UserController');

routes.get('/', HomeController.index);

routes.get('/users', UserController.index);
routes.post('/users', UserController.store);
routes.get('/users/:id', UserController.show);
routes.put('/users/:id', UserController.update);
routes.delete('/users/:id', UserController.destroy);

module.exports = routes;
