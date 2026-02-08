import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal, TouchableWithoutFeedback, LayoutAnimation, UIManager, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useIsFocused, useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';
// import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useTasks } from '../context/TaskContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return '0 MIN';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}S`;
    if (s === 0) return `${m}M`;
    return `${m}M ${s}S`;
};

export default function HistoryScreen({ navigation }) {
    // Lock to Portrait on Focus
    useFocusEffect(
        useCallback(() => {
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        }, [])
    );
    const { tasks, deleteTask, deleteMultipleTasks } = useTasks();
    const [todaysTasks, setTodaysTasks] = useState([]);
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedItems, setSelectedItems] = useState(new Set());

    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    }).toUpperCase();

    // Filter tasks for today's wins
    useEffect(() => {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const filtered = tasks.filter(task => {
            if (!task.completed) return false;
            // Check if completedAt exists (new tasks) or fallback to timestamp/createdAt
            const dateStr = task.timestamp || task.createdAt;
            if (!dateStr) return false;

            const taskDate = new Date(dateStr);
            return taskDate >= startOfToday;
        });
        setTodaysTasks(filtered);
    }, [tasks]);

    // Note: The user requested "Swipe Right" to delete.
    // In LTR, Swipe Right means pulling from Left -> Right.
    // "renderLeftActions" renders the view revealed when swiping from left to right.
    const renderLeftActions = (progress, dragX, id) => {
        return (
            <View style={styles.deleteActionContainer}>
                <TouchableOpacity
                    style={styles.deleteAction}
                    onPress={() => deleteTask(id)}
                >
                    <Feather name="trash-2" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        );
    };

    const [selectedTask, setSelectedTask] = useState(null);

    const toggleSelection = (id) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
                if (newSet.size === 0) setSelectionMode(false);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleTaskPress = (task) => {
        if (selectionMode) {
            toggleSelection(task.id);
        } else {
            setSelectedTask(task);
        }
    };

    const handleLongPress = (task) => {
        if (!selectionMode) {
            setSelectionMode(true);
            setSelectedItems(new Set([task.id]));
        }
    };

    const handleBulkDelete = () => {
        deleteMultipleTasks(Array.from(selectedItems));
        setSelectionMode(false);
        setSelectedItems(new Set());
    };

    const cancelSelection = () => {
        setSelectionMode(false);
        setSelectedItems(new Set());
    };

    const toggleSelectAll = () => {
        const taskIds = todaysTasks.map(t => t.id);
        const allSelected = taskIds.every(id => selectedItems.has(id));

        setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (allSelected) {
                taskIds.forEach(id => newSet.delete(id));
                if (newSet.size === 0) setSelectionMode(false);
            } else {
                taskIds.forEach(id => newSet.add(id));
            }
            return newSet;
        });
    };

    const handleDeleteTask = () => {
        if (selectedTask) {
            deleteTask(selectedTask.id);
            setSelectedTask(null);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar hidden />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>COMPLETED</Text>
                    <Text style={styles.headerSubtitle}>{currentDate}</Text>
                </View>
                {selectionMode && (
                    <TouchableOpacity onPress={cancelSelection} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={styles.cancelButton}>
                        <Feather name="x" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Task List */}
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {todaysTasks.length > 0 ? (
                    <View style={styles.taskList}>
                        <View style={styles.sectionHeaderRow}>
                            <Text style={styles.sectionTitle}>TODAY'S WINS</Text>
                            {selectionMode && (
                                <TouchableOpacity onPress={toggleSelectAll}>
                                    <Text style={styles.selectAllText}>SELECT ALL</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        {todaysTasks.map((task) => (
                            <TouchableOpacity
                                key={task.id}
                                style={[
                                    styles.taskItem,
                                    selectedItems.has(task.id) && styles.selectedTaskItem
                                ]}
                                onPress={() => handleTaskPress(task)}
                                onLongPress={() => handleLongPress(task)}
                                delayLongPress={300}
                            >
                                <View style={styles.taskInfo}>
                                    <Text style={styles.taskNameText}>{task.name.toUpperCase()}</Text>
                                    <Text style={styles.taskTimeText}>
                                        {task.elapsedSeconds ? formatDuration(task.elapsedSeconds) : `${task.duration} MIN`}
                                    </Text>
                                </View>
                                <View style={[
                                    styles.checkmarkIcon,
                                    selectedItems.has(task.id) && styles.selectedCheckmark
                                ]}>
                                    {selectedItems.has(task.id) ? (
                                        <Feather name="check" size={14} color="#000" />
                                    ) : (
                                        <Text style={styles.checkmarkText}>✓</Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>NO WINS RECORDED TODAY</Text>
                        <View style={styles.divider} />
                        <Text style={styles.emptyHint}>COMPLETE A TASK TO EARN A WIN.</Text>
                    </View>
                )}
            </ScrollView>

            {/* Details Modal */}
            <Modal
                visible={selectedTask !== null}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setSelectedTask(null)}
            >
                <TouchableWithoutFeedback onPress={() => setSelectedTask(null)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                {selectedTask && (
                                    <>
                                        <Text style={styles.modalTitle}>{selectedTask.name.toUpperCase()}</Text>

                                        <View style={styles.modalStatRow}>
                                            <View style={styles.modalStatItem}>
                                                <Text style={styles.modalStatLabel}>PLANNED</Text>
                                                <Text style={styles.modalStatValue}>{selectedTask.originalDuration || selectedTask.duration} MIN</Text>
                                            </View>
                                            <View style={styles.modalStatDivider} />
                                            <View style={styles.modalStatItem}>
                                                <Text style={styles.modalStatLabel}>ACTUAL</Text>
                                                <Text style={styles.modalStatValue}>
                                                    {selectedTask.elapsedSeconds !== undefined
                                                        ? formatDuration(selectedTask.elapsedSeconds)
                                                        : `${selectedTask.timeSpent !== undefined ? selectedTask.timeSpent : selectedTask.duration} MIN`}
                                                </Text>
                                            </View>
                                        </View>

                                        <TouchableOpacity
                                            style={styles.deleteButton}
                                            onPress={handleDeleteTask}
                                        >
                                            <Feather name="trash-2" size={20} color="#FF3B30" style={{ marginRight: 10 }} />
                                            <Text style={styles.deleteButtonText}>DELETE RECORD</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            <TouchableOpacity
                style={[styles.floatingButton, selectionMode && styles.deleteFab]}
                onPress={selectionMode ? handleBulkDelete : () => navigation.navigate('Calendar')}
            >
                <Feather
                    name={selectionMode ? "trash-2" : "calendar"}
                    size={24}
                    color={selectionMode ? "#FFFFFF" : "#FFFFFF"}
                />
            </TouchableOpacity>
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 30,
        marginBottom: 40,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 40,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 5,
    },
    headerSubtitle: {
        color: '#888888',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 4,
    },
    // calendarButton: {
    //     padding: 10,
    //     backgroundColor: '#111111',
    //     borderRadius: 12,
    //     borderWidth: 1,
    //     borderColor: '#222222',
    // },
    floatingButton: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#111111',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#222222',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 30,
        paddingBottom: 100,
    },
    taskList: {
        marginTop: 10,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    sectionTitle: {
        color: '#666666',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
    },
    selectAllText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
    },
    swipeHint: {
        color: '#444444',
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 1,
        marginBottom: 20,
    },
    taskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#0A0A0A',
        padding: 20,
        borderRadius: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#111111',
    },
    taskInfo: {
        flex: 1,
    },
    taskNameText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 1,
        marginBottom: 4,
    },
    taskTimeText: {
        color: '#777777',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
    },
    checkmarkIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#111111',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#222222',
    },
    checkmarkText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '900',
    },
    emptyState: {
        paddingTop: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        color: '#666666',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 2,
        marginBottom: 20,
    },
    emptyHint: {
        color: '#444444',
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 1,
        marginTop: 20,
    },
    divider: {
        width: 40,
        height: 1,
        backgroundColor: '#222222',
    },
    deleteActionContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        marginBottom: 15,
    },
    deleteAction: {
        backgroundColor: '#ff3b30',
        justifyContent: 'center',
        alignItems: 'center',
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        backgroundColor: '#111111',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#222222',
    },
    modalTitle: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '900',
        marginBottom: 30,
        textAlign: 'center',
        letterSpacing: 1,
    },
    modalStatRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 40,
    },
    modalStatItem: {
        alignItems: 'center',
    },
    modalStatDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#222222',
        marginHorizontal: 20,
    },
    modalStatLabel: {
        color: '#666666',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 2,
        marginBottom: 6,
    },
    modalStatValue: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '800',
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 30,
        marginTop: 10,
    },
    deleteButtonText: {
        color: '#FF3B30',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 1,
    },
    selectedTaskItem: {
        borderColor: '#FFFFFF',
        backgroundColor: '#222222',
    },
    selectedCheckmark: {
        backgroundColor: '#FFFFFF',
        borderColor: '#FFFFFF',
    },
    cancelText: {
        color: '#FFFFFF',
        fontWeight: '700',
        letterSpacing: 1,
        marginTop: 10,
    },
    cancelButton: {
        padding: 5,
        backgroundColor: '#222222',
        borderRadius: 15,
    },
    deleteFab: {
        backgroundColor: '#FF3B30',
        borderColor: '#FF3B30',
    },
});
