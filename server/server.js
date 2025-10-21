const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const UserRouter = require('./routes/user.routes');
const ProjectRouter = require('./routes/project.routes');


const connectDB = require('./config/mongoose');
const dotenv = require('dotenv');
dotenv.config();


const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/', (req, res) => {
    res.send('Hello from sketchdb!');
});

connectDB()
app.use('/api/users', UserRouter);
app.use('/api/projects', ProjectRouter);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});