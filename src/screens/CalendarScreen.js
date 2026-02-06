import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

export default function CalendarScreen({ navigation }) {
    const [archivedTasks, setArchivedTasks] = useState({});
    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) {
            loadArchive();
        }
    }, [isFocused]);

    const loadArchive = async () => {
        try {
            const storedArchive = await AsyncStorage.getItem('lockdin_archive');
            if (storedArchive) {
                const parsedArchive = JSON.parse(storedArchive);

                // Group tasks by date
                const grouped = parsedArchive.reduce((acc, task) => {
                    const date = new Date(task.timestamp).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    });
                    if (!acc[date]) acc[date] = [];
                    acc[date].push(task);
                    return acc;
                }, {});

                setArchivedTasks(grouped);
            }
        } catch (error) {
            console.error("Failed to load archive:", error);
        }
    };

    const dates = Object.keys(archivedTasks).sort((a, b) => new Date(b) - new Date(a));

    return (
        <View style={styles.container}>
            <StatusBar hidden />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>ARCHIVE</Text>
                <Text style={styles.headerSubtitle}>YOUR PRODUCTIVITY LEGACY.</Text>
            </View>

            {/* Archive List */}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {dates.length > 0 ? (
                    dates.map((date) => (
                        <View key={date} style={styles.dateSection}>
                            <Text style={styles.dateHeader}>{date.toUpperCase()}</Text>
                            {archivedTasks[date].map((task) => (
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
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>THE ARCHIVE IS EMPTY</Text>
                        <View style={styles.divider} />
                        <Text style={styles.emptyHint}>SWEEP YOUR DAILY WINS TO SAVE THEM HERE.</Text>
                    </View>
                )}
            </ScrollView>
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
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 30,
        paddingBottom: 40,
    },
    dateSection: {
        marginBottom: 30,
    },
    dateHeader: {
        color: '#666666',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 15,
        marginLeft: 5,
    },
    taskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#0A0A0A',
        padding: 20,
        borderRadius: 15,
        marginBottom: 10,
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
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#111111',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#222222',
    },
    checkmarkText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '900',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
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
        textAlign: 'center',
    },
    divider: {
        width: 40,
        height: 1,
        backgroundColor: '#222222',
    },
});
