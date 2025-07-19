document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');

    // Elementos del contador
    const totalTasksSpan = document.getElementById('totalTasks');
    const pendingTasksSpan = document.getElementById('pendingTasks');

    // Botones de filtro
    const filterAllBtn = document.getElementById('filterAll');
    const filterPendingBtn = document.getElementById('filterPending');
    const filterCompletedBtn = document.getElementById('filterCompleted');

    let currentFilter = 'all';

    // --- Funciones de LocalStorage ---
    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => {
            createTaskElement(task.text, task.completed, false);
        });
        updateTaskCount();
        applyFilter(currentFilter);
    }

    function saveTasks() {
        const tasks = [];
        taskList.querySelectorAll('li').forEach(listItem => {
            const taskTextElement = listItem.querySelector('span');
            const taskText = taskTextElement.textContent || taskTextElement.value;
            const isCompleted = listItem.classList.contains('completed');
            tasks.push({ text: taskText, completed: isCompleted });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
        updateTaskCount();
    }

    // --- Función para crear un nuevo elemento de tarea ---
    function createTaskElement(taskText, isCompleted = false, save = true) {
        const listItem = document.createElement('li');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = isCompleted;
        checkbox.addEventListener('change', () => {
            listItem.classList.toggle('completed', checkbox.checked);
            saveTasks();
            applyFilter(currentFilter);
        });
        listItem.appendChild(checkbox);

        const taskContent = document.createElement('span');
        taskContent.textContent = taskText;
        listItem.appendChild(taskContent);

        taskContent.addEventListener('dblclick', () => {
            if (listItem.classList.contains('completed')) {
                return;
            }

            const currentText = taskContent.textContent;
            const editInput = document.createElement('input');
            editInput.type = 'text';
            editInput.value = currentText;
            editInput.classList.add('edit-input');

            listItem.replaceChild(editInput, taskContent);
            editInput.focus();

            const saveEditedTask = () => {
                const newText = editInput.value.trim();
                if (newText === '') {
                    // Restablecer el texto original si se borró
                    taskContent.textContent = currentText;
                    listItem.replaceChild(taskContent, editInput);
                } else {
                    taskContent.textContent = newText;
                    listItem.replaceChild(taskContent, editInput);
                }
                saveTasks();
                applyFilter(currentFilter);
            };

            editInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    saveEditedTask();
                }
            });

            editInput.addEventListener('blur', () => {
                saveEditedTask();
            });
        });

        if (isCompleted) {
            listItem.classList.add('completed');
        }

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Eliminar';
        deleteButton.addEventListener('click', () => {
            // --- CÓDIGO MODIFICADO AQUÍ: Eliminamos la confirmación ---
            taskList.removeChild(listItem); // Elimina directamente el elemento de la lista
            saveTasks(); // Guarda los cambios en LocalStorage
            applyFilter(currentFilter); // Reaplica el filtro actual
        });

        listItem.appendChild(deleteButton);
        taskList.appendChild(listItem);

        if (save) {
            saveTasks();
        }
    }

    // --- Función para actualizar el contador de tareas ---
    function updateTaskCount() {
        const allTasks = taskList.querySelectorAll('li').length;
        const pendingTasks = taskList.querySelectorAll('li:not(.completed)').length;
        totalTasksSpan.textContent = allTasks;
        pendingTasksSpan.textContent = pendingTasks;
    }

    // --- Función para aplicar el filtro ---
    function applyFilter(filterType) {
        currentFilter = filterType;

        filterAllBtn.classList.remove('active');
        filterPendingBtn.classList.remove('active');
        filterCompletedBtn.classList.remove('active');

        if (filterType === 'all') {
            filterAllBtn.classList.add('active');
        } else if (filterType === 'pending') {
            filterPendingBtn.classList.add('active');
        } else { // 'completed'
            filterCompletedBtn.classList.add('active');
        }

        taskList.querySelectorAll('li').forEach(listItem => {
            const isCompleted = listItem.classList.contains('completed');

            if (filterType === 'all') {
                listItem.style.display = 'flex';
            } else if (filterType === 'pending') {
                if (isCompleted) {
                    listItem.style.display = 'none';
                } else {
                    listItem.style.display = 'flex';
                }
            } else { // filterType === 'completed'
                if (isCompleted) {
                    listItem.style.display = 'flex';
                } else {
                    listItem.style.display = 'none';
                }
            }
        });
    }

    // --- Eventos de los botones de filtro ---
    filterAllBtn.addEventListener('click', () => applyFilter('all'));
    filterPendingBtn.addEventListener('click', () => applyFilter('pending'));
    filterCompletedBtn.addEventListener('click', () => applyFilter('completed'));

    // --- Evento al hacer clic en Añadir Tarea ---
    addTaskBtn.addEventListener('click', () => {
        const taskText = taskInput.value.trim();
        if (taskText !== '') {
            createTaskElement(taskText, false, true);
            taskInput.value = '';
            applyFilter(currentFilter);
        }
    });

    // --- Opcional: Permitir añadir tarea con la tecla Enter ---
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTaskBtn.click();
        }
    });

    // --- Cargar las tareas al iniciar la página ---
    loadTasks();
});