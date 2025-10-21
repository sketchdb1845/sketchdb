const express = require('express');
const { createProject, addCollaborator, getUserProjects } = require('../controllers/project.controller');

const ProjectRouter = express.Router();

ProjectRouter.post('/create', createProject);
ProjectRouter.post('/:projectId/addcollaborator', addCollaborator);
ProjectRouter.get('/user/:userId', getUserProjects); 

module.exports = ProjectRouter;