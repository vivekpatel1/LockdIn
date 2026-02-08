import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TaskContext = createContext();
const TASKS_STORAGE_KEY = '@lockdin_tasks';

export function TaskProvider({ children }) {
    const [tasks, setTasks] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false); // Track if initial load is done
    const [autoArchive, setAutoArchive] = useState(true); // Default to auto-archive

    // 1. Load tasks and settings on startup
    useEffect(() => {
        const loadData = async () => {
            try {
                // Load Tasks
                const storedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
                if (storedTasks) {
                    setTasks(JSON.parse(storedTasks));
                }

                // Load Settings
                const storedAutoArchive = await AsyncStorage.getItem('lockdin_setting_auto_archive');
                if (storedAutoArchive !== null) {
                    setAutoArchive(JSON.parse(storedAutoArchive));
                }
            } catch (error) {
                console.error("Failed to load data:", error);
            } finally {
                setIsLoaded(true);
            }
        };
        loadData();
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

    // 3. Save settings on change
    useEffect(() => {
        if (isLoaded) {
            AsyncStorage.setItem('lockdin_setting_auto_archive', JSON.stringify(autoArchive));
        }
    }, [autoArchive, isLoaded]);

    // 4. Auto-Archive Logic (Run once on load or when tasks/setting change? Better on load or specific trigger)
    // Running it on every task change might be aggressive. Let's run it once isLoaded is true.
    useEffect(() => {
        if (isLoaded && autoArchive) {
            performAutoArchive();
        }
    }, [isLoaded, autoArchive]); // If user turns ON auto-archive, it should run immediately.

    const performAutoArchive = async () => {
        // Find completed tasks from BEFORE today
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const tasksToArchive = tasks.filter(task => {
            if (!task.completed) return false;
            const taskDate = new Date(task.timestamp || task.createdAt);
            return taskDate < startOfToday; // Strictly before today
        });

        if (tasksToArchive.length === 0) return;

        try {
            // 1. Get existing archive
            const storedArchive = await AsyncStorage.getItem('lockdin_archive');
            let currentArchive = storedArchive ? JSON.parse(storedArchive) : [];

            // 2. Add new tasks (avoid duplicates if any)
            // Using Map to ensure uniqueness by ID
            const archiveMap = new Map(currentArchive.map(t => [t.id, t]));
            tasksToArchive.forEach(t => archiveMap.set(t.id, t));
            const newArchive = Array.from(archiveMap.values());

            // 3. Save Archive
            await AsyncStorage.setItem('lockdin_archive', JSON.stringify(newArchive));

            // 4. Remove from active tasks
            const idsToRemove = new Set(tasksToArchive.map(t => t.id));
            setTasks(prev => prev.filter(t => !idsToRemove.has(t.id)));

            console.log(`Auto-archived ${tasksToArchive.length} tasks.`);
        } catch (error) {
            console.error("Auto-archive failed:", error);
        }
    };

    const manualArchive = async () => {
        // Archive ALL completed tasks immediately, regardless of date?
        // Usually "Archive" means clear out the completed ones.
        // Let's archive ALL completed tasks.
        const tasksToArchive = tasks.filter(task => task.completed);

        if (tasksToArchive.length === 0) return;

        try {
            const storedArchive = await AsyncStorage.getItem('lockdin_archive');
            let currentArchive = storedArchive ? JSON.parse(storedArchive) : [];
            const archiveMap = new Map(currentArchive.map(t => [t.id, t]));
            tasksToArchive.forEach(t => archiveMap.set(t.id, t));
            const newArchive = Array.from(archiveMap.values());
            await AsyncStorage.setItem('lockdin_archive', JSON.stringify(newArchive));

            const idsToRemove = new Set(tasksToArchive.map(t => t.id));
            setTasks(prev => prev.filter(t => !idsToRemove.has(t.id)));
        } catch (error) {
            console.error("Manual archive failed:", error);
        }
    };

    const toggleAutoArchive = () => {
        setAutoArchive(prev => !prev);
    };

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

    // Fix: deleteTask was defined twice in original code, removing duplicate
    const deleteTask = (id) => {
        setTasks(prev => prev.filter(task => task.id !== id));
    };

    const deleteMultipleTasks = (ids) => {
        const idsSet = new Set(ids);
        setTasks(prev => prev.filter(task => !idsSet.has(task.id)));
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
                deleteMultipleTasks,
                updateTask,
                clearTasks,
                autoArchive,
                toggleAutoArchive,
                manualArchive
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
