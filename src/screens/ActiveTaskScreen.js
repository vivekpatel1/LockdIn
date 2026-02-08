import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, BackHandler, StatusBar as RNStatusBar, AppState } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import { StatusBar, setStatusBarHidden } from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as NavigationBar from 'expo-navigation-bar';
import { Feather } from '@expo/vector-icons';
import { useTasks } from '../context/TaskContext';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { scheduleFocusNotification, schedulePausedNotification, cancelFocusNotification } from '../utils/notifications';

export default function ActiveTaskScreen({ route, navigation }) {
    const { task, initialDuration, taskId, initialRemainingTime } = route.params;
    const { tasks, updateTask, deleteTask } = useTasks();
    const { theme } = useTheme();
    const colors = theme.colors;

    const currentTask = tasks.find(t => t.id === taskId);

    // Use initialRemainingTime if available, otherwise calculate from duration
    // Keep screen awake
    useKeepAwake();

    const [secondsLeft, setSecondsLeft] = useState(initialRemainingTime !== undefined ? initialRemainingTime : initialDuration * 60);
    const [isActive, setIsActive] = useState(true);
    // Track elapsed time in this specific session (seconds)
    const [sessionElapsed, setSessionElapsed] = useState(0);

    // Use ref to track exiting state without triggering re-runs of effects
    const isExitingRef = React.useRef(false);
    const appState = React.useRef(AppState.currentState);

    // Force immersive mode
    const enforceImmersiveMode = useCallback(async () => {
        // await NavigationBar.setVisibilityAsync('hidden');
        // await NavigationBar.setBehaviorAsync('overlay-swipe');
        await setStatusBarHidden(true, 'none');
    }, []);

    // Handle App State changes (background -> foreground)
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                // App has come to the foreground!
                enforceImmersiveMode();
                cancelFocusNotification();
                // We DO NOT auto-resume. User must press play.
            } else if (nextAppState.match(/inactive|background/)) {
                // App is going to background
                if (isActive) {
                    setIsActive(false); // AUTO-PAUSE
                    schedulePausedNotification(task);
                }
            }

            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
            cancelFocusNotification(); // Clean up on unmount just in case
        };
    }, [enforceImmersiveMode, isActive, task]);

    useFocusEffect(
        useCallback(() => {
            enforceImmersiveMode();
        }, [enforceImmersiveMode])
    );

    useEffect(() => {
        const backAction = () => {
            if (!isExitingRef.current) {
                return true; // Always prevent default behavior (going back)
            }
            return false;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, []);

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
                elapsedSeconds: totalElapsed,
                paused: true // Mark as paused
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
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar hidden translucent backgroundColor="transparent" />

            <View style={styles.layout}>
                <View style={styles.infoSection}>
                    <Text style={[styles.taskTitle, { color: colors.text }]}>{task.toUpperCase()}</Text>

                    <View style={styles.footer}>
                        {/* Done Button */}
                        <TouchableOpacity
                            style={[
                                styles.smallButtonSecondary,
                                { backgroundColor: colors.secondary, borderColor: colors.border }
                            ]}
                            onPress={handleDone}
                        >
                            <Feather name="check" size={24} color={colors.icon} />
                        </TouchableOpacity>

                        {/* Pause Button (Exits to Home) */}
                        <TouchableOpacity
                            style={[
                                styles.smallButtonSecondary,
                                { backgroundColor: colors.secondary, borderColor: colors.border }
                            ]}
                            onPress={handlePause}
                        >
                            <Feather name="pause" size={24} color={colors.icon} />
                        </TouchableOpacity>

                        {/* Cancel Button */}
                        <TouchableOpacity
                            style={[
                                styles.smallButtonSecondary,
                                { backgroundColor: colors.secondary, borderColor: colors.border }
                            ]}
                            onPress={handleCancel}
                        >
                            <Feather name="x" size={24} color={colors.icon} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.timerSection}>
                    <View style={styles.timerTextContainer}>
                        <Text
                            style={[styles.timerText, { color: colors.text }]}
                            numberOfLines={1}
                        >
                            {formatTime(secondsLeft)}
                        </Text>

                        {secondsLeft < 120 && ( // Close to the timer
                            <View style={styles.textButtonContainer}>
                                <TouchableOpacity
                                    style={styles.textTimeButton}
                                    onPress={() => setSecondsLeft(prev => prev + 120)}
                                >
                                    <Text style={[styles.textTimeButtonText, { color: colors.textTertiary }]}>+2m</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.textTimeButton}
                                    onPress={() => setSecondsLeft(prev => prev + 300)}
                                >
                                    <Text style={[styles.textTimeButtonText, { color: colors.textTertiary }]}>+5m</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.textTimeButton}
                                    onPress={() => setSecondsLeft(prev => prev + 600)}
                                >
                                    <Text style={[styles.textTimeButtonText, { color: colors.textTertiary }]}>+10m</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>

                {/* Paused Overlay */}
                {!isActive && secondsLeft > 0 && (
                    <View style={styles.pausedOverlay} />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        zIndex: 200, // Make sure controls are above the overlay
        elevation: 200, // For Android
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
    taskTitle: {
        fontSize: 32, // Smaller to fit 30% width
        fontWeight: '800',
        marginBottom: 20,
        lineHeight: 38,
        textAlign: 'center',
    },
    timerText: {
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
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addTimeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 30, // Pill shape
        borderWidth: 1.5,
    },
    addTimeText: {
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 1,
    },
    textButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 30, // Good spacing
        marginTop: 10, // Close to timer
    },
    textTimeButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    textTimeButtonText: {
        fontSize: 20, // Nice and big but subtle
        fontWeight: '600',
        letterSpacing: 1,
        opacity: 0.6, // Minimal look
    },
    pausedOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 100,
        backgroundColor: 'rgba(0,0,0,0.85)', // Slightly darker for better contrast
    },
});
