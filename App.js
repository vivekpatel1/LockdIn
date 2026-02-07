import { StatusBar as ExpoStatusBar, setStatusBarHidden } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View, Image, StatusBar } from 'react-native';
import { useState, useEffect } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';

// Hide status bar immediately and aggressively
StatusBar.setHidden(true, 'none');
setStatusBarHidden(true, 'none');

import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import CreateTaskScreen from './src/screens/CreateTaskScreen';
import ActiveTaskScreen from './src/screens/ActiveTaskScreen';
import PauseScreen from './src/screens/PauseScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import IntroAnimation from './src/components/IntroAnimation';
import { TaskProvider } from './src/context/TaskContext';

const Stack = createNativeStackNavigator();

// Custom Theme to force absolute black
const PureBlackTheme = {
    ...DarkTheme,
    colors: {
        ...DarkTheme.colors,
        background: '#000000',
        card: '#000000',
        border: '#000000',
    },
};

export default function App() {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Enforce portrait mode globally by default
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    }, []);

    if (!isReady) {
        return (
            <View style={styles.container}>
                <StatusBar hidden />
                <IntroAnimation onComplete={() => setIsReady(true)} />
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <TaskProvider>
                <View style={{ flex: 1, backgroundColor: '#000000' }}>
                    <NavigationContainer theme={PureBlackTheme}>
                        <StatusBar hidden />
                        <Stack.Navigator
                            screenOptions={{
                                headerShown: false,
                                contentStyle: { backgroundColor: '#000000' },
                                animation: 'fade', // Smooth cross-fade
                            }}
                        >
                            <Stack.Screen name="Home" component={HomeScreen} />
                            <Stack.Screen name="History" component={HistoryScreen} />
                            <Stack.Screen name="Calendar" component={CalendarScreen} />
                            <Stack.Screen name="Settings" component={SettingsScreen} />
                            <Stack.Screen name="CreateTask" component={CreateTaskScreen} />
                            <Stack.Screen
                                name="ActiveTask"
                                component={ActiveTaskScreen}
                                options={{ gestureEnabled: false }}
                            />
                        </Stack.Navigator>
                    </NavigationContainer>
                </View>
            </TaskProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    }
});
