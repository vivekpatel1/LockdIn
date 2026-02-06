import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TaskContext = createContext();
const TASKS_STORAGE_KEY = '@lockdin_tasks';

export function TaskProvider({ children }) {
    const [tasks, setTasks] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false); // Track if initial load is done

    // 1. Load tasks on startup
    useEffect(() => {
        const loadTasks = async () => {
            try {
                const storedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
                if (storedTasks) {
                    setTasks(JSON.parse(storedTasks));
                }
            } catch (error) {
                console.error("Failed to load tasks:", error);
            } finally {
                setIsLoaded(true);
            }
        };
        loadTasks();
    }, []);

    // 2. Save tasks on every change (only after initial load)
    useEffect(() => {
        if (isLoaded) {
            const saveTasks = async () => {
                try {
                    await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
                } catch (error) {
                    console.error("Failed to save tasks:", error);
                }
            };
            saveTasks();
        }
    }, [tasks, isLoaded]);

    const addTask = (name, duration) => {
        const newTask = {
            id: Date.now().toString(),
            name,
            duration,
            completed: false,
            createdAt: new Date().toISOString(),
        };
        setTasks(prev => [...prev, newTask]);
    };

    const addMultipleTasks = (taskList) => {
        const newTasks = taskList.map(task => ({
            id: Date.now().toString() + Math.random(),
            name: task.name,
            duration: task.duration,
            completed: false,
            createdAt: new Date().toISOString(),
        }));
        setTasks(prev => [...prev, ...newTasks]);
    };

    const completeTask = (id) => {
        setTasks(prev =>
            prev.map(task =>
                task.id === id ? { ...task, completed: true } : task
            )
        );
    };

    const deleteTask = (id) => {
        setTasks(prev => prev.filter(task => task.id !== id));
    };

    const updateTask = (id, updates) => {
        setTasks(prev =>
            prev.map(task =>
                task.id === id ? { ...task, ...updates } : task
            )
        );
    };

    const clearTasks = () => {
        setTasks([]);
    };

    return (
        <TaskContext.Provider
            value={{
                tasks,
                addTask,
                addMultipleTasks,
                completeTask,
                deleteTask,
                completeTask,
                deleteTask,
                updateTask,
                clearTasks,
            }}
        >
            {children}
        </TaskContext.Provider>
    );
}

export function useTasks() {
    const context = useContext(TaskContext);
    if (!context) {
        throw new Error('useTasks must be used within a TaskProvider');
    }
    return context;
}
