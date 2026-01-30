/**
 * Kanban Board - Frontend
 * Handles drag-and-drop and API sync
 */

const API_BASE = '';
let boardData = {};
let columns = [];

// Status display
const statusEl = document.getElementById('status');
function setStatus(text, type = '') {
  statusEl.textContent = text;
  statusEl.className = 'status ' + type;
}

// Fetch board data from server
async function loadBoard() {
  try {
    const res = await fetch(`${API_BASE}/api/board`);
    const data = await res.json();
    columns = data.columns;
    boardData = data.board;
    renderBoard();
    setStatus('Synced', 'saved');
  } catch (err) {
    console.error('Failed to load board:', err);
    setStatus('Failed to load', 'error');
  }
}

// Save board data to server
async function saveBoard() {
  setStatus('Saving...', '');
  try {
    const res = await fetch(`${API_BASE}/api/board`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ board: boardData }),
    });
    const data = await res.json();
    if (data.success) {
      setStatus('Saved ✓', 'saved');
    } else {
      setStatus('Save failed', 'error');
    }
  } catch (err) {
    console.error('Failed to save board:', err);
    setStatus('Save failed', 'error');
  }
}

// Render the board
function renderBoard() {
  const boardEl = document.getElementById('board');
  boardEl.innerHTML = '';
  
  for (const colName of columns) {
    const tasks = boardData[colName] || [];
    
    const colEl = document.createElement('div');
    colEl.className = 'column';
    colEl.dataset.column = colName;
    
    colEl.innerHTML = `
      <div class="column-header">
        <span>${colName}</span>
        <span class="count">${tasks.length}</span>
      </div>
      <div class="column-tasks" data-column="${colName}"></div>
    `;
    
    const tasksEl = colEl.querySelector('.column-tasks');
    
    // Add drop zone events
    tasksEl.addEventListener('dragover', handleDragOver);
    tasksEl.addEventListener('dragleave', handleDragLeave);
    tasksEl.addEventListener('drop', handleDrop);
    
    // Render tasks
    for (const task of tasks) {
      const taskEl = createTaskElement(task, colName);
      tasksEl.appendChild(taskEl);
    }
    
    boardEl.appendChild(colEl);
  }
}

// Create a task element
function createTaskElement(task, column) {
  const el = document.createElement('div');
  el.className = 'task' + (task.done ? ' done' : '');
  el.draggable = true;
  el.dataset.id = task.id;
  el.dataset.column = column;
  
  el.innerHTML = `
    <div class="task-content">
      <div class="task-checkbox"></div>
      <div class="task-text">${escapeHtml(task.text)}</div>
    </div>
    <button class="task-delete" title="Delete task">×</button>
  `;
  
  // Drag events
  el.addEventListener('dragstart', handleDragStart);
  el.addEventListener('dragend', handleDragEnd);
  
  // Checkbox toggle
  el.querySelector('.task-checkbox').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleTask(task.id, column);
  });
  
  // Delete button
  el.querySelector('.task-delete').addEventListener('click', (e) => {
    e.stopPropagation();
    deleteTask(task.id, column);
  });
  
  return el;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Drag and drop handlers
let draggedEl = null;
let draggedData = null;

function handleDragStart(e) {
  draggedEl = e.target;
  draggedData = {
    id: e.target.dataset.id,
    fromColumn: e.target.dataset.column,
  };
  e.target.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
  e.target.classList.remove('dragging');
  document.querySelectorAll('.column-tasks').forEach(el => {
    el.classList.remove('drag-over');
  });
  draggedEl = null;
  draggedData = null;
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  
  if (!draggedData) return;
  
  const toColumn = e.currentTarget.dataset.column;
  const fromColumn = draggedData.fromColumn;
  const taskId = draggedData.id;
  
  if (fromColumn === toColumn) return;
  
  // Find and move the task
  const fromTasks = boardData[fromColumn];
  const taskIndex = fromTasks.findIndex(t => t.id === taskId);
  
  if (taskIndex === -1) return;
  
  const [task] = fromTasks.splice(taskIndex, 1);
  boardData[toColumn].push(task);
  
  // Update task's column reference
  task.column = toColumn;
  
  renderBoard();
  saveBoard();
}

// Toggle task done state
function toggleTask(taskId, column) {
  const tasks = boardData[column];
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.done = !task.done;
    renderBoard();
    saveBoard();
  }
}

// Delete a task
function deleteTask(taskId, column) {
  const tasks = boardData[column];
  const index = tasks.findIndex(t => t.id === taskId);
  if (index !== -1) {
    tasks.splice(index, 1);
    renderBoard();
    saveBoard();
  }
}

// Add new task
function addTask(text) {
  if (!text.trim()) return;
  
  const firstColumn = columns[0];
  if (!boardData[firstColumn]) {
    boardData[firstColumn] = [];
  }
  
  boardData[firstColumn].push({
    id: Math.random().toString(36).substring(2, 9),
    text: text.trim(),
    done: false,
  });
  
  renderBoard();
  saveBoard();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadBoard();
  
  // Add task form
  const input = document.getElementById('newTaskInput');
  const btn = document.getElementById('addTaskBtn');
  
  btn.addEventListener('click', () => {
    addTask(input.value);
    input.value = '';
  });
  
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addTask(input.value);
      input.value = '';
    }
  });
});
