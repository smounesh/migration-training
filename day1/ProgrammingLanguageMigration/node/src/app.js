// app.js
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());

// File to store tasks
const TASKS_FILE = path.join(__dirname, 'tasks.json');

// Load tasks from the JSON file
function loadTasks() {
    if (fs.existsSync(TASKS_FILE)) {
        try {
            const data = fs.readFileSync(TASKS_FILE);
            return JSON.parse(data);
        } catch (error) {
            console.error(chalk.red('Failed to load tasks:', error.message));
            return []; // Return an empty array if JSON is invalid
        }
    }
    return [];
}

// Save tasks to the JSON file
function saveTasks(tasks) {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

// Initialize tasks from the JSON file
let tasks = loadTasks();

// GET /tasks
app.get('/tasks', (req, res) => {
    console.log(chalk.blue(`GET /tasks called, returning ${tasks.length} tasks.`));
    res.json(tasks);
});

// POST /tasks
app.post('/tasks', (req, res) => {
    const taskData = req.body;
    if (!taskData || !taskData.task) {
        console.error(chalk.yellow('Invalid task data received:', taskData));
        return res.status(400).json({ message: 'Invalid task data' });
    }

    const task = {
        id: tasks.length, // Assign an ID based on the current length of the tasks list
        task: taskData.task,
        completed: false // New tasks are not completed by default
    };
    tasks.push(task);
    saveTasks(tasks); // Save tasks to the JSON file
    console.log(chalk.green('Task added:', task));
    res.status(201).json({ task, message: 'Task added successfully' });
});

// DELETE /tasks/:task_id
app.delete('/tasks/:task_id', (req, res) => {
    const taskId = parseInt(req.params.task_id, 10);
    if (taskId < 0 || taskId >= tasks.length) {
        console.warn(chalk.red('Invalid task ID:', taskId));
        return res.status(404).json({ message: 'Invalid task ID' });
    }

    const removedTask = tasks.splice(taskId, 1)[0];
    saveTasks(tasks); // Save updated tasks to the JSON file
    console.log(chalk.green('Task removed:', removedTask));
    res.json({ task: removedTask, message: 'Task removed successfully' });
});

// PUT /tasks/:task_id/complete
app.put('/tasks/:task_id/complete', (req, res) => {
    const taskId = parseInt(req.params.task_id, 10);
    if (taskId < 0 || taskId >= tasks.length) {
        console.warn(chalk.red('Invalid task ID:', taskId));
        return res.status(404).json({ message: 'Invalid task ID' });
    }

    tasks[taskId].completed = true; // Mark the task as completed
    saveTasks(tasks); // Save updated tasks to the JSON file
    console.log(chalk.green('Task marked as completed:', tasks[taskId]));
    res.json({ task: tasks[taskId], message: 'Task marked as completed' });
});

// Start the server
app.listen(PORT, () => {
    console.log(chalk.blue(`Server is running on http://localhost:${PORT}`));
});