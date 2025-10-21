const Project = require("../model/project.mode");
const User = require("../model/User.model");


// Create a new project
const createProject = async (req, res) => {
  try {
    const { name, description, owner } = req.body;

    if (!name || !owner) {
      return res.status(400).json({ message: 'Name and owner are required' });
    }

    const user = await User.findById(owner);
    if (!user) {
      return res.status(404).json({ message: 'Owner user not found' });
    }

    const project = new Project({
      name,
      description,
      owner,
    });

    await project.save();
    return res.status(201).json({ message: 'Project created', project });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Add a collaborator to a project
const addCollaborator = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { collaboratorId } = req.body;

    if (!collaboratorId) {
      return res.status(400).json({ message: 'Collaborator ID is required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if collaborator exists
    const collaborator = await User.findById(collaboratorId);
    if (!collaborator) {
      return res.status(404).json({ message: 'Collaborator user not found' });
    }

    // Check if already a collaborator
    if (project.collaborators.includes(collaboratorId)) {
      return res.status(400).json({ message: 'User is already a collaborator' });
    }

    project.collaborators.push(collaboratorId);
    await project.save();

    return res.status(200).json({ message: 'Collaborator added', project });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all projects for a specific user (owner or collaborator)
const getUserProjects = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const projects = await Project.find({
      $or: [
        { owner: userId },
        { collaborators: userId }
      ]
    }).populate('owner', 'username email') 
      .populate('collaborators', 'username email');

    return res.status(200).json({ projects });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  createProject,
  addCollaborator,
  getUserProjects,
};
