const express = require('express');
const { registerUser, loginUser } = require('../controllers/user.controller');
const UserRouter = express.Router();

UserRouter.post('/register', registerUser);
UserRouter.post('/login', loginUser);

module.exports = UserRouter;
