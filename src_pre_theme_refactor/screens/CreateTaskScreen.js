import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Animated, Easing } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useTasks } from '../context/TaskContext';

export default function CreateTaskScreen({ navigation }) {
    // Lock to Portrait on Focus
    useFocusEffect(
        useCallback(() => {
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        }, [])
    );
    const [task, setTask] = useState('');
    const [duration, setDuration] = useState('');
    const [taskList, setTaskList] = useState([]);
    const { addMultipleTasks } = useTasks();

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                easing: Easing.out(Easing.exp),
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const handleAddTask = () => {
        if (task.trim() && duration.trim()) {
            const newTask = {
                id: Date.now().toString(),
                name: task.trim(),
                duration: parseInt(duration),
            };
            setTaskList(prev => [...prev, newTask]);
            setTask('');
            setDuration('');
        }
    };

    const handleRemoveTask = (id) => {
        setTaskList(prev => prev.filter(t => t.id !== id));
    };

    const handleSetTasks = () => {
        if (taskList.length > 0) {
            addMultipleTasks(taskList);
            navigation.goBack();
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar hidden />

            <View style={styles.header}>
                <Text style={styles.title}>COMMIT</Text>
                {taskList.length > 0 && (
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={handleSetTasks}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.headerButtonText}>SET</Text>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={{ paddingBottom: 220 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Task List */}
                {taskList.length > 0 && (
                    <View style={styles.taskListContainer}>
                        <Text style={styles.taskListTitle}>TODAY'S TASKS</Text>
                        {taskList.map(t => (
                            <View key={t.id} style={styles.taskItem}>
                                <View style={styles.taskInfo}>
                                    <Text style={styles.taskName}>{t.name}</Text>
                                    <Text style={styles.taskDuration}>{t.duration} MIN</Text>
                                </View>
                                <TouchableOpacity onPress={() => handleRemoveTask(t.id)}>
                                    <Text style={styles.removeButton}>✕</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}

                {/* Input Form (Animated) */}
                <Animated.View style={[
                    styles.inputContainer,
                    { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                ]}>
                    <Text style={styles.inputLabel}>ADD A NEW TASK</Text>

                    <View style={styles.inputRow}>
                        {/* Task Name Input */}
                        <TextInput
                            style={styles.taskInput}
                            placeholder="Type Task"
                            placeholderTextColor="#555555"
                            value={task}
                            onChangeText={setTask}
                            autoFocus={taskList.length === 0}
                        />

                        {/* Duration Input */}
                        <View style={styles.durationWrapper}>
                            <TextInput
                                style={styles.durationInput}
                                placeholder="00"
                                placeholderTextColor="#555555"
                                value={duration}
                                onChangeText={setDuration}
                                keyboardType="numeric"
                                maxLength={3}
                            />
                            <Text style={styles.minLabel}>MIN</Text>
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>

            <View style={styles.footer}>
                {/* Add Task Button */}
                <TouchableOpacity
                    style={[styles.addButton, (!task || !duration) && styles.disabledButton]}
                    onPress={handleAddTask}
                    disabled={!task || !duration}
                    activeOpacity={0.8}
                >
                    <Text style={styles.addButtonText}>+ ADD TASK</Text>
                </TouchableOpacity>


            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
        paddingTop: 60,
    },
    header: {
        paddingHorizontal: 30,
        marginBottom: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerButton: {
        backgroundColor: '#333333',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    headerButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 40,
        fontWeight: '900',
        letterSpacing: 4,
    },
    content: {
        flex: 1,
        paddingHorizontal: 30,
    },
    taskListContainer: {
        marginBottom: 40,
    },
    taskListTitle: {
        color: '#888888',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 2,
        marginBottom: 15,
    },
    taskItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#222222',
    },
    taskInfo: {
        flex: 1,
    },
    taskName: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 5,
    },
    taskDuration: {
        color: '#888888',
        fontSize: 12,
        fontWeight: '600',
    },
    removeButton: {
        color: '#888888',
        fontSize: 24,
        fontWeight: '300',
        paddingHorizontal: 15,
    },
    inputContainer: {
        marginBottom: 40,
    },
    inputLabel: {
        color: '#888888',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 2,
        marginBottom: 15,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end', // Align baseline
    },
    taskInput: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '700',
        borderBottomWidth: 1,
        borderBottomColor: '#555555',
        paddingVertical: 10,
        marginRight: 20,
    },
    durationWrapper: {
        width: 80,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#555555',
    },
    durationInput: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '700',
        paddingVertical: 10,
        textAlign: 'center',
    },
    minLabel: {
        color: '#555555',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8, // Align nicely with text
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 30,
        paddingBottom: 50,
        backgroundColor: '#000000',
    },
    addButton: {
        backgroundColor: '#FFFFFF',
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
    },
    disabledButton: {
        backgroundColor: '#333333',
    },
    addButtonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 3,
    },
});
