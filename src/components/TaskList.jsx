import React, { useState, useEffect } from 'react';

function TaskList() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // Carrega as tarefas do localStorage ao iniciar
    const savedTasksState = JSON.parse(localStorage.getItem('tasks')) || {};
    
    setTasks(prevTasks => 
      prevTasks.map(task => ({
        ...task,
        completed: savedTasksState[task.id] ?? task.completed
      }))
    );
  }, []);

  const toggleTask = (taskId, forcedState) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, completed: forcedState ?? !task.completed }
          : task
      )
    );
  };

  const clearSavedStates = () => {
    localStorage.removeItem('tasks');
    setTasks(prevTasks =>
      prevTasks.map(task => ({
        ...task,
        completed: false
      }))
    );
  };


} 