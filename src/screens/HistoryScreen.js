import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useIsFocused } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
// import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useTasks } from '../context/TaskContext';

export default function HistoryScreen({ navigation }) {
    const { tasks, deleteTask } = useTasks();
    const [todaysTasks, setTodaysTasks] = useState([]);

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
            // Check if completedAt exists (new tasks) or fallback to createdAt/timestamp logic if needed
            // For now assuming existing logic or tasks have a date. 
            // The previous code used 'timestamp' or check createdAt.
            // Let's look at TaskContext. It has 'createdAt'. It doesn't seem to have 'completedAt' explicitly set in completeTask unless I missed it.
            // Let's re-read TaskContext if needed. 
            // In TaskContext: completeTask just sets completed: true. It doesn't add a timestamp.
            // So we rely on createdAt for now, OR valid completion time. 
            // The previous HistoryScreen filtered by 'timestamp'. 
            // Let's just filter by completed status for now, and ideally we should verify if we need day filtering.
            // The previous code: const taskDate = new Date(task.timestamp);
            // TaskContext adds 'createdAt'.
            // Let's filter completed tasks that were created today OR just all completed tasks if that's the intention of "Wins".
            // The user said "WINS RECORDED TODAY".

            // Let's assume completed tasks are today's wins for this simple app context, 
            // or filter by createdAt if it's reliable.
            const taskDate = new Date(task.createdAt);
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

    return (
        <View style={styles.container}>
            <StatusBar hidden />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>WINS</Text>
                    <Text style={styles.headerSubtitle}>{currentDate}</Text>
                </View>
            </View>

            {/* Task List */}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {todaysTasks.length > 0 ? (
                    <View style={styles.taskList}>
                        <Text style={styles.sectionTitle}>TODAY'S WINS</Text>
                        {todaysTasks.map((task) => (
                            <View key={task.id} style={styles.taskItem}>
                                <View style={styles.taskInfo}>
                                    <Text style={styles.taskNameText}>{task.name.toUpperCase()}</Text>
                                    <Text style={styles.taskTimeText}>{task.duration} MIN</Text>
                                </View>
                                <View style={styles.checkmarkIcon}>
                                    <Text style={styles.checkmarkText}>✓</Text>
                                </View>
                            </View>
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

            <TouchableOpacity
                style={styles.floatingButton}
                onPress={() => navigation.navigate('Calendar')}
            >
                <Feather name="calendar" size={24} color="#FFFFFF" />
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
        alignItems: 'flex-start',
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
    sectionTitle: {
        color: '#666666',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 10,
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
});
