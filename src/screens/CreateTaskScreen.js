import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Animated, Easing } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useTasks } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';

export default function CreateTaskScreen({ navigation }) {
    const { theme } = useTheme();
    const colors = theme.colors;

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
            setTaskList(prev => [newTask, ...prev]);
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
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar hidden />

            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>COMMIT</Text>
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={{ paddingBottom: 220 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Input Form (Animated) */}
                <Animated.View style={[
                    styles.inputContainer,
                    { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                ]}>
                    <Text style={[styles.inputLabel, { color: colors.sectionHeader }]}>ADD A NEW TASK</Text>

                    <View style={styles.inputRow}>
                        {/* Task Name Input */}
                        <TextInput
                            style={[styles.taskInput, { color: colors.text, borderBottomColor: colors.textTertiary }]}
                            placeholder="Type Task"
                            placeholderTextColor={colors.textTertiary}
                            value={task}
                            onChangeText={setTask}
                            autoFocus={taskList.length === 0}
                        />

                        {/* Duration Input */}
                        <View style={[styles.durationWrapper, { borderBottomColor: colors.textTertiary }]}>
                            <TextInput
                                style={[styles.durationInput, { color: colors.text }]}
                                placeholder="00"
                                placeholderTextColor={colors.textTertiary}
                                value={duration}
                                onChangeText={setDuration}
                                keyboardType="numeric"
                                maxLength={3}
                            />
                            <Text style={[styles.minLabel, { color: colors.textTertiary }]}>MIN</Text>
                        </View>

                        {/* Inline Add Button */}
                        <TouchableOpacity
                            style={[
                                styles.inlineAddButton,
                                { backgroundColor: colors.primary, opacity: (!task || !duration) ? 0.3 : 1 }
                            ]}
                            onPress={handleAddTask}
                            disabled={!task || !duration}
                        >
                            <Feather name="plus" size={24} color={colors.onPrimary} />
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* Task List */}
                {taskList.length > 0 && (
                    <View style={styles.taskListContainer}>
                        <Text style={[styles.taskListTitle, { color: colors.sectionHeader }]}>TODAY'S TASKS</Text>
                        {taskList.map(t => (
                            <View key={t.id} style={[styles.taskItem, { borderBottomColor: colors.divider }]}>
                                <View style={styles.taskInfo}>
                                    <Text style={[styles.taskName, { color: colors.text }]}>{t.name}</Text>
                                    <Text style={[styles.taskDuration, { color: colors.textSecondary }]}>{t.duration} MIN</Text>
                                </View>
                                <TouchableOpacity onPress={() => handleRemoveTask(t.id)}>
                                    <Text style={[styles.removeButton, { color: colors.textTertiary }]}>✕</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: colors.background }]}>
                {/* Set Tasks Button (Primary Footer Action) */}
                {taskList.length > 0 && (
                    <TouchableOpacity
                        style={[
                            styles.addButton, // Keep big style
                            { backgroundColor: colors.primary }
                        ]}
                        onPress={handleSetTasks}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.addButtonText, { color: colors.onPrimary }]}>SET TASKS</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    headerButtonText: {
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1,
    },
    title: {
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
    },
    taskInfo: {
        flex: 1,
    },
    taskName: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 5,
    },
    taskDuration: {
        fontSize: 12,
        fontWeight: '600',
    },
    removeButton: {
        fontSize: 24,
        fontWeight: '300',
        paddingHorizontal: 15,
    },
    inputContainer: {
        marginBottom: 40,
    },
    inputLabel: {
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
        fontSize: 24,
        fontWeight: '700',
        borderBottomWidth: 1,
        paddingVertical: 10,
        marginRight: 20,
    },
    durationWrapper: {
        width: 80,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
    },
    durationInput: {
        flex: 1,
        fontSize: 24,
        fontWeight: '700',
        paddingVertical: 10,
        textAlign: 'center',
    },
    minLabel: {
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
    },
    addButton: {
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 3,
    },
    inlineAddButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 15,
        marginBottom: 5, // Align with input
    },
});
