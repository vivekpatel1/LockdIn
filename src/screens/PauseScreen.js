import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function PauseScreen({ route, navigation }) {
    const { task } = route.params;

    return (
        <View style={styles.container}>
            <StatusBar hidden />

            <View style={styles.layout}>
                <View style={styles.infoSection}>
                    <Text style={styles.message}>
                        YOU COMMITTED TO:{"\n"}
                        <Text style={styles.taskName}>{task.toUpperCase()}</Text>
                    </Text>

                    <Text style={styles.subtext}>
                        DISTRACTION IS THE ENEMY.{"\n"}
                        DO NOT GIVE IN.
                    </Text>

                    <TouchableOpacity
                        style={styles.continueButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.continueText}>RESUME</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.abandonButton}
                        onPress={() => {
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Home' }],
                            });
                        }}
                    >
                        <Text style={styles.abandonText}>ABANDON</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.warningSection}>
                    <Text style={styles.warning}>WAIT.</Text>
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
        flex: 1.2,
        justifyContent: 'center',
        paddingHorizontal: 60,
        backgroundColor: '#050505',
    },
    warningSection: {
        flex: 1.8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    warning: {
        color: '#FFFFFF',
        fontSize: 120,
        fontWeight: '900',
        letterSpacing: 10,
    },
    message: {
        color: '#888888',
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 24,
        letterSpacing: 1,
        marginBottom: 30,
    },
    taskName: {
        color: '#FFFFFF',
        fontWeight: '900',
    },
    subtext: {
        color: '#333333',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginBottom: 40,
    },
    continueButton: {
        backgroundColor: '#FFFFFF',
        height: 70,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    continueText: {
        color: '#000000',
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 4,
    },
    abandonButton: {
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    abandonText: {
        color: '#1a1a1a',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 2,
    },
});
