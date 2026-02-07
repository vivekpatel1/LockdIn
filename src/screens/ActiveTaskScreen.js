import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, BackHandler, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar, setStatusBarHidden } from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as NavigationBar from 'expo-navigation-bar';
import { Feather } from '@expo/vector-icons';
import { useTasks } from '../context/TaskContext';
import { useFocusEffect } from '@react-navigation/native';

export default function ActiveTaskScreen({ route, navigation }) {
    const { task, initialDuration, taskId, initialRemainingTime } = route.params;
    const { tasks, updateTask, deleteTask } = useTasks();
    const currentTask = tasks.find(t => t.id === taskId);

    // Use initialRemainingTime if available, otherwise calculate from duration
    const [secondsLeft, setSecondsLeft] = useState(initialRemainingTime !== undefined ? initialRemainingTime : initialDuration * 60);
    const [isActive, setIsActive] = useState(true);
    // Track elapsed time in this specific session (seconds)
    const [sessionElapsed, setSessionElapsed] = useState(0);

    // Use ref to track exiting state without triggering re-runs of effects
    const isExitingRef = React.useRef(false);

    // Force immersive mode
    const enforceImmersiveMode = useCallback(async () => {
        await NavigationBar.setVisibilityAsync('hidden');
        await NavigationBar.setBehaviorAsync('overlay-swipe');
        await setStatusBarHidden(true, 'none');
    }, []);

    useFocusEffect(
        useCallback(() => {
            enforceImmersiveMode();
        }, [enforceImmersiveMode])
    );

    useEffect(() => {
        const backAction = () => {
            if (isActive && !isExitingRef.current) {
                return true; // Prevent default behavior (going back)
            }
            return false;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, [isActive]);

    // Orientation & Visibility Management
    useEffect(() => {
        const setOrientationAndMode = async () => {
            // Unlock first for clean slate
            await ScreenOrientation.unlockAsync();
            // Force Landscape
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
            // Hide UI
            await enforceImmersiveMode();
        };

        setOrientationAndMode();

        // Re-enforce periodically
        const interval = setInterval(enforceImmersiveMode, 2000);

        return () => {
            // Reset to Portrait on unmount
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
            clearInterval(interval);
        };
    }, [enforceImmersiveMode]);

    // Timer & Elapsed Logic
    useEffect(() => {
        let interval = null;
        if (isActive) {
            interval = setInterval(() => {
                setSecondsLeft((prev) => {
                    if (prev <= 0) return 0;
                    return prev - 1;
                });
                setSessionElapsed(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive]);

    useEffect(() => {
        if (secondsLeft === 0) {
            setIsActive(false);
        }
    }, [secondsLeft]);

    const handleDone = async () => {
        isExitingRef.current = true;
        try {
            if (taskId) {
                // Calculate total elapsed time across all sessions
                const previousElapsed = currentTask?.elapsedSeconds || 0;
                const totalElapsed = previousElapsed + sessionElapsed;
                const timeSpentMinutes = Math.max(1, Math.round(totalElapsed / 60));

                updateTask(taskId, {
                    completed: true,
                    timeSpent: timeSpentMinutes, // For display
                    elapsedSeconds: totalElapsed, // For precision
                    originalDuration: initialDuration,
                    timestamp: new Date().toISOString() // Completion time
                });
            }
        } catch (error) {
            console.error("Failed to save task:", error);
        }

        // Add a slight delay for a smoother transition
        await new Promise(resolve => setTimeout(resolve, 500));

        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    };





    const handlePause = async () => {
        isExitingRef.current = true;

        if (taskId) {
            const previousElapsed = currentTask?.elapsedSeconds || 0;
            const totalElapsed = previousElapsed + sessionElapsed;

            updateTask(taskId, {
                remainingTime: secondsLeft,
                elapsedSeconds: totalElapsed
            });
        }

        // Add a slight delay for a smoother transition
        await new Promise(resolve => setTimeout(resolve, 500));

        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    };

    const handleCancel = async () => {
        isExitingRef.current = true;
        deleteTask(taskId);
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <View style={styles.container}>
            <StatusBar hidden translucent backgroundColor="transparent" />

            <View style={styles.layout}>
                <View style={styles.infoSection}>
                    <Text style={styles.taskTitle}>{task.toUpperCase()}</Text>

                    <View style={styles.footer}>
                        {/* Done Button */}
                        <TouchableOpacity
                            style={styles.smallButtonSecondary}
                            onPress={handleDone}
                        >
                            <Feather name="check" size={24} color="#FFFFFF" />
                        </TouchableOpacity>

                        {/* Pause Button */}
                        <TouchableOpacity
                            style={styles.smallButtonSecondary}
                            onPress={handlePause}
                        >
                            <Feather name="pause" size={24} color="#FFFFFF" />
                        </TouchableOpacity>

                        {/* Cancel Button */}
                        <TouchableOpacity
                            style={styles.smallButtonSecondary}
                            onPress={handleCancel}
                        >
                            <Feather name="x" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.timerSection}>
                    <View style={styles.timerTextContainer}>
                        <Text
                            style={styles.timerText}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                        >
                            {formatTime(secondsLeft)}
                        </Text>
                    </View>

                    {secondsLeft < 120 && (
                        <View style={styles.floatingButtonContainer}>
                            <TouchableOpacity
                                style={styles.addTimeButton}
                                onPress={() => setSecondsLeft(prev => prev + 300)}
                            >
                                <Feather name="plus-circle" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                                <Text style={styles.addTimeText}>ADD 5 MINS</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    layout: {
        flex: 1,
        flexDirection: 'row',
    },
    infoSection: {
        flex: 3, // 30%
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    timerSection: {
        flex: 7, // 70%
        alignItems: 'center',
        paddingRight: 40,
        position: 'relative', // Ensure absolute children anchor here
    },
    timerTextContainer: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    // taskLabel removed as simplified
    taskTitle: {
        color: '#FFFFFF',
        fontSize: 32, // Smaller to fit 30% width
        fontWeight: '800',
        marginBottom: 20,
        lineHeight: 38,
        textAlign: 'center',
    },
    timerText: {
        color: '#FFFFFF',
        fontSize: 160,
        fontWeight: '900',
        letterSpacing: -5,
        textAlign: 'center',
        fontVariant: ['tabular-nums'],
        includeFontPadding: false,
    },
    footer: {
        marginTop: 20,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16, // Use tighter gap for narrower column
    },
    smallButtonSecondary: {
        width: 56, // Slightly smaller buttons
        height: 56,
        borderRadius: 28,
        backgroundColor: '#111111',
        borderWidth: 1.5,
        borderColor: '#222222',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addTimeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111111', // Match smallButtonSecondary
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 30, // Pill shape
        borderWidth: 1.5,
        borderColor: '#222222', // Match smallButtonSecondary
    },
    addTimeText: {
        color: '#FFFFFF', // White for visibility
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 1,
    },
    floatingButtonContainer: {
        position: 'absolute',
        bottom: 50, // Moved up significantly
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
