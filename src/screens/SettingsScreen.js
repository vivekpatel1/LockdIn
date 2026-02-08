import React, { useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { useTasks } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';

const CustomSwitch = ({ value, onValueChange, activeTrackColor, inactiveTrackColor, activeThumbColor, inactiveThumbColor }) => {
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
        outputRange: [inactiveTrackColor || '#222222', activeTrackColor || '#FFFFFF']
    });

    const thumbColor = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [inactiveThumbColor || '#666666', activeThumbColor || '#000000']
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
    const { theme, toggleTheme, isDark } = useTheme();
    const colors = theme.colors;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar hidden />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Feather name="arrow-left" size={24} color={colors.icon} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>SETTINGS</Text>
            </View>

            <ScrollView style={styles.content}>
                {/* Section: General */}
                <View style={[styles.section, { borderBottomColor: colors.divider }]}>
                    <Text style={[styles.sectionHeader, { color: colors.sectionHeader }]}>GENERAL</Text>

                    {/* Auto Archive Toggle */}
                    <View style={[styles.row, { borderBottomColor: colors.divider }]}>
                        <Text style={[styles.rowLabel, { color: colors.text }]}>Auto-Archive Wins</Text>
                        <CustomSwitch
                            value={autoArchive}
                            onValueChange={toggleAutoArchive}
                            activeTrackColor={colors.primary}
                            inactiveTrackColor={colors.border}
                            activeThumbColor={colors.onPrimary}
                            inactiveThumbColor={colors.textSecondary}
                        />
                    </View>
                    <Text style={[styles.helperText, { color: colors.textTertiary }]}>
                        Automatically move completed wins to the archive at the start of a new day.
                    </Text>

                    {/* Theme Toggle */}
                    <View style={[styles.row, { borderBottomColor: colors.divider, marginTop: 20 }]}>
                        <Text style={[styles.rowLabel, { color: colors.text }]}>Dark Mode</Text>
                        <CustomSwitch
                            value={isDark}
                            onValueChange={toggleTheme}
                            activeTrackColor={colors.primary}
                            inactiveTrackColor={colors.border}
                            activeThumbColor={colors.onPrimary}
                            inactiveThumbColor={colors.textSecondary}
                        />
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.divider }]} />

                    <View style={styles.row}>
                        <Text style={[styles.rowLabel, { color: colors.text }]}>Version</Text>
                        <Text style={[styles.rowValue, { color: colors.textSecondary }]}>1.0.0</Text>
                    </View>
                </View>

                {/* Section: Focus Mode (Spotify) */}
                <View style={[styles.section, { borderBottomColor: colors.divider }]}>
                    <Text style={[styles.sectionHeader, { color: colors.sectionHeader }]}>FOCUS MODE</Text>

                    <View style={[styles.row, { borderBottomColor: colors.divider }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.rowLabel, { color: colors.text }]}>Spotify Integration</Text>
                            <Text style={[styles.helperText, { color: colors.textTertiary, marginBottom: 0 }]}>
                                Play music automatically when focused.
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.connectButton, { backgroundColor: colors.secondary }]}
                            activeOpacity={0.7}
                        >
                            <Feather name="music" size={16} color={colors.primary} style={{ marginRight: 8 }} />
                            <Text style={[styles.connectButtonText, { color: colors.primary }]}>CONNECT</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.row, { borderBottomColor: colors.divider }]}>
                        <Text style={[styles.rowLabel, { color: colors.text }]}>Focus Playlist</Text>
                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={[styles.rowValue, { color: colors.textSecondary, marginRight: 8 }]}>None Selected</Text>
                            <Feather name="chevron-right" size={16} color={colors.textTertiary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Section: About */}
                <View style={styles.section}>
                    <Text style={[styles.sectionHeader, { color: colors.sectionHeader }]}>ABOUT</Text>
                    <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
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
    },
    rowLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    rowValue: {
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
        borderWidth: 1, // Optional: add border for light mode visibility if track is light
        borderColor: 'transparent', // Or colors.border
    },
    switchThumb: {
        width: 26,
        height: 26,
        borderRadius: 13,
        position: 'absolute',
        top: 1, // Adjusted for border
        left: 0,
    },
    helperText: {
        fontSize: 12,
        lineHeight: 18,
        marginTop: 10,
        marginBottom: 20,
    },
    divider: {
        height: 1,
        marginVertical: 10,
    },
    aboutText: {
        fontSize: 14,
        lineHeight: 24,
    },
    connectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    connectButtonText: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    }
});
