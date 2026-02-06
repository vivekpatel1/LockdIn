import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, FlatList, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '../context/TaskContext';

const { height } = Dimensions.get('window');
const CARD_HEIGHT = 220;
const CARD_MARGIN = 20;
const SNAP_INTERVAL = CARD_HEIGHT + CARD_MARGIN;

export default function HomeScreen({ navigation }) {
    const isFocused = useIsFocused();
    const [displayTitle, setDisplayTitle] = useState('LOCKDIN');
    const { tasks, deleteTask } = useTasks();

    // Animation Values (Strict initial states)
    const fadeAnim = useRef(new Animated.Value(1)).current;      // Keep header visible for hand-off
    const scaleAnim = useRef(new Animated.Value(1)).current;     // Start at full scale
    const fabYAnim = useRef(new Animated.Value(20)).current;     // Translation for buttons
    const contentFadeAnim = useRef(new Animated.Value(0)).current; // For buttons/content

    useEffect(() => {
        if (isFocused) {
            // Reset state
            fabYAnim.setValue(20);
            contentFadeAnim.setValue(0);

            // Start entrance animation sequence
            Animated.parallel([
                // Fade in buttons and other content
                Animated.timing(contentFadeAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                // Slide buttons up
                Animated.timing(fabYAnim, {
                    toValue: 0,
                    duration: 600,
                    delay: 200,
                    useNativeDriver: true,
                })
            ]).start();
        }
    }, [isFocused]);

    const handleStartTask = (task) => {
        navigation.navigate('ActiveTask', {
            task: task.name,
            initialDuration: task.duration,
            taskId: task.id,
            initialRemainingTime: task.remainingTime, // Pass remaining time if paused
        });
    };

    const activeTasks = tasks.filter(t => !t.completed);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const renderItem = ({ item }) => (
        <View style={styles.taskCard}>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteTask(item.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Ionicons name="trash-outline" size={20} color="#666666" />
            </TouchableOpacity>

            <View style={styles.taskCardInner}>
                <Text style={styles.taskCardName}>{item.name}</Text>
                <Text style={styles.taskCardDuration}>
                    {item.remainingTime ? `${formatTime(item.remainingTime)} LEFT` : `${item.duration} MIN`}
                </Text>
            </View>
            <TouchableOpacity
                style={styles.startButton}
                onPress={() => handleStartTask(item)}
                activeOpacity={0.8}
            >
                <Text style={styles.startButtonText}>
                    {item.remainingTime ? 'RESUME' : 'START'}
                </Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar hidden />

            {/* Header */}
            <Animated.View style={[
                styles.header,
                { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
            ]}>
                <View style={styles.headerLockRow}>
                    <View style={styles.lockWrapperSmall}>
                        <View style={styles.shackleSmall} />
                        <View style={styles.lockBodySmall} />
                    </View>
                    <Text style={styles.headerTitle}>{displayTitle}</Text>
                </View>
                <Text style={styles.headerSubtitle}>STAY FOCUSED.</Text>
            </Animated.View>

            {/* Main Content (Vertical Carousel) */}
            <Animated.View style={[styles.mainContainer, { opacity: contentFadeAnim }]}>
                {activeTasks.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>NO TASKS FOR TODAY</Text>
                        <Text style={styles.emptySubtext}>Tap + to add your first task</Text>
                    </View>
                ) : (
                    <FlatList
                        data={activeTasks}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        showsVerticalScrollIndicator={false}
                        snapToInterval={SNAP_INTERVAL}
                        snapToAlignment="start" // Align to top of list container
                        decelerationRate="fast"
                        contentContainerStyle={styles.listContent}
                    />
                )}
            </Animated.View>

            {/* History Button (Bottom Left) */}
            <Animated.View style={[
                styles.historyFabContainer,
                { opacity: contentFadeAnim, transform: [{ translateY: fabYAnim }] }
            ]}>
                <TouchableOpacity
                    style={styles.historyFab}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('History')}
                >
                    <Text style={styles.historyFabText}>✓</Text>
                </TouchableOpacity>
            </Animated.View>

            {/* Create Task Button (Bottom Right) */}
            <Animated.View style={[
                styles.fabContainer,
                { opacity: contentFadeAnim, transform: [{ translateY: fabYAnim }] }
            ]}>
                <TouchableOpacity
                    style={styles.fab}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('CreateTask')}
                >
                    <Text style={styles.fabText}>+</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    header: {
        position: 'absolute',
        top: 115,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 10,
    },
    headerLockRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        marginBottom: 5,
    },
    lockWrapperSmall: {
        width: 20,
        height: 25,
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginRight: 10,
    },
    lockBodySmall: {
        width: 20,
        height: 15,
        backgroundColor: '#FFFFFF',
        borderRadius: 2,
    },
    shackleSmall: {
        width: 14,
        height: 12.5,
        borderWidth: 3,
        borderColor: '#FFFFFF',
        borderBottomWidth: 0,
        borderTopLeftRadius: 7,
        borderTopRightRadius: 7,
        position: 'absolute',
        top: 0,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 40,
        fontWeight: '900',
        letterSpacing: 2,
        lineHeight: 50,
        textAlignVertical: 'center',
    },
    headerSubtitle: {
        color: '#888888',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 4,
    },
    mainContainer: {
        flex: 1,
        marginTop: 280, // Keep layout starting below header
        paddingHorizontal: 30, // Keep padding for FlatList
    },
    listContent: {
        paddingBottom: 200, // Space at bottom
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        color: '#555555',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 3,
        marginBottom: 10,
    },
    emptySubtext: {
        color: '#333333',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 2,
    },
    taskCard: {
        height: CARD_HEIGHT,
        marginBottom: CARD_MARGIN,
        backgroundColor: '#111111',
        borderRadius: 20,
        padding: 30,
        justifyContent: 'center',
        alignItems: 'center', // Center content horizontally
        borderWidth: 1,
        borderColor: '#222222',
    },
    taskCardInner: {
        alignItems: 'center',
        marginBottom: 20,
    },
    taskCardName: {
        color: '#FFFFFF',
        fontSize: 28, // Larger font
        fontWeight: '700',
        marginBottom: 10,
        textAlign: 'center',
    },
    taskCardDuration: {
        color: '#888888',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 2,
    },
    deleteButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 10,
        padding: 5,
    },
    startButton: {
        backgroundColor: '#FFFFFF',
        width: 120, // Larger button
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    startButtonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 2,
    },
    historyFabContainer: {
        position: 'absolute',
        left: 30,
        bottom: 40,
    },
    historyFab: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    historyFabText: {
        color: '#000000',
        fontSize: 24,
        fontWeight: '300',
    },
    fabContainer: {
        position: 'absolute',
        right: 30,
        bottom: 40,
    },
    fab: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    fabText: {
        color: '#000000',
        fontSize: 32,
        fontWeight: '300',
        marginTop: -4,
    },
});
