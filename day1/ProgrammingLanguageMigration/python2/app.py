# app.py
import json
import os
import logging
from flask import Flask, jsonify, request

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# File to store tasks
TASKS_FILE = 'tasks.json'

# Load tasks from the JSON file
def load_tasks():
    if os.path.exists(TASKS_FILE):
        try:
            with open(TASKS_FILE, 'r') as file:
                return json.load(file)
        except ValueError as e:
            logging.error('Failed to load tasks: %s' % e)
            return []  # Return an empty list if JSON is invalid
    return []

# Save tasks to the JSON file
def save_tasks(tasks):
    with open(TASKS_FILE, 'w') as file:
        json.dump(tasks, file)

# Initialize tasks from the JSON file
tasks = load_tasks()

@app.route('/tasks', methods=['GET'])
def get_tasks():
    logging.debug('GET /tasks called, returning %d tasks.' % len(tasks))
    return jsonify(tasks)

@app.route('/tasks', methods=['POST'])
def add_task():
    task_data = request.json
    if not task_data or 'task' not in task_data:
        logging.error('Invalid task data received: %s' % task_data)
        return jsonify({'message': 'Invalid task data'}), 400
    
    task = {
        'id': len(tasks),  # Assign an ID based on the current length of the tasks list
        'task': task_data['task'],
        'completed': False  # New tasks are not completed by default
    }
    tasks.append(task)
    save_tasks(tasks)  # Save tasks to the JSON file
    logging.debug('Task added: %s' % task)
    return jsonify({'task': task, 'message': 'Task added successfully'}), 201

@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    if task_id < 0 or task_id >= len(tasks):
        logging.warning('Invalid task ID: %d' % task_id)
        return jsonify({'message': 'Invalid task ID'}), 404
    
    removed_task = tasks.pop(task_id)
    save_tasks(tasks)  # Save updated tasks to the JSON file
    logging.debug('Task removed: %s' % removed_task)
    return jsonify({'task': removed_task, 'message': 'Task removed successfully'})

@app.route('/tasks/<int:task_id>/complete', methods=['PUT'])
def complete_task(task_id):
    if task_id < 0 or task_id >= len(tasks):
        logging.warning('Invalid task ID: %d' % task_id)
        return jsonify({'message': 'Invalid task ID'}), 404
    
    tasks[task_id]['completed'] = True  # Mark the task as completed
    save_tasks(tasks)  # Save updated tasks to the JSON file
    logging.debug('Task marked as completed: %s' % tasks[task_id])
    return jsonify({'task': tasks[task_id], 'message': 'Task marked as completed'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')  # Allow access from outside the container