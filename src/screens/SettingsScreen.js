import React, { useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { useTasks } from '../context/TaskContext';

const CustomSwitch = ({ value, onValueChange }) => {
    const animValue = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(animValue, {
            toValue: value ? 1 : 0,
            duration: 250,
            useNativeDriver: false,
        }).start();
    }, [value]);

    const trackColor = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['#222222', '#FFFFFF']
    });

    const thumbColor = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['#666666', '#000000']
    });

    const translateX = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [2, 22] // 50 width - 26 thumb - 2 padding = 22
    });

    return (
        <TouchableOpacity
            onPress={onValueChange}
            activeOpacity={0.8}
            style={styles.switchContainer}
        >
            <Animated.View style={[styles.switchTrack, { backgroundColor: trackColor }]}>
                <Animated.View style={[
                    styles.switchThumb,
                    {
                        backgroundColor: thumbColor,
                        transform: [{ translateX }]
                    }
                ]} />
            </Animated.View>
        </TouchableOpacity>
    );
};

export default function SettingsScreen({ navigation }) {
    const { autoArchive, toggleAutoArchive } = useTasks();

    return (
        <View style={styles.container}>
            <StatusBar hidden />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Feather name="arrow-left" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>SETTINGS</Text>
            </View>

            <ScrollView style={styles.content}>
                {/* Section: General */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>GENERAL</Text>

                    {/* Auto Archive Toggle */}
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>Auto-Archive Wins</Text>
                        <CustomSwitch
                            value={autoArchive}
                            onValueChange={toggleAutoArchive}
                        />
                    </View>
                    <Text style={styles.helperText}>
                        Automatically move completed wins to the archive at the start of a new day.
                    </Text>



                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>Version</Text>
                        <Text style={styles.rowValue}>1.0.0</Text>
                    </View>
                </View>

                {/* Section: About */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>ABOUT</Text>
                    <Text style={styles.aboutText}>
                        LockdIn is designed to help you maintain deep focus.
                        No distractions. Pure productivity.
                    </Text>
                </View>
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
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 30,
        marginBottom: 40,
    },
    backButton: {
        marginRight: 20,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '900',
        letterSpacing: 2,
    },
    content: {
        flex: 1,
        paddingHorizontal: 30,
    },
    section: {
        marginBottom: 40,
    },
    sectionHeader: {
        color: '#666666',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 2,
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#111111',
    },
    rowLabel: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    rowValue: {
        color: '#888888',
        fontSize: 16,
    },
    // Switch Styles
    switchContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    switchTrack: {
        width: 50,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
    },
    switchThumb: {
        width: 26,
        height: 26,
        borderRadius: 13,
        position: 'absolute',
        top: 2,
        left: 0, // Animated via translateX
    },
    helperText: {
        color: '#444444',
        fontSize: 12,
        lineHeight: 18,
        marginTop: 10,
        marginBottom: 20,
    },
    actionButton: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
    },
    actionButtonText: {
        color: '#000000',
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 1,
    },
    divider: {
        height: 1,
        backgroundColor: '#111111',
        marginVertical: 10,
    },
    aboutText: {
        color: '#888888',
        fontSize: 14,
        lineHeight: 24,
    }
});
