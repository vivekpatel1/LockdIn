import { StatusBar as ExpoStatusBar, setStatusBarHidden } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View, StatusBar } from 'react-native';
import { useState, useEffect } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';

// Hide status bar immediately and aggressively
// StatusBar.setHidden(true, 'none');
// setStatusBarHidden(true, 'none');

import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import CreateTaskScreen from './src/screens/CreateTaskScreen';
import ActiveTaskScreen from './src/screens/ActiveTaskScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import IntroAnimation from './src/components/IntroAnimation'; // We'll need to refactor this too or pass props
import { TaskProvider } from './src/context/TaskContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { requestNotificationPermissions } from './src/utils/notifications';

const Stack = createNativeStackNavigator();

const AppContent = () => {
    const { theme, isDark } = useTheme();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Enforce portrait mode globally by default
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        requestNotificationPermissions();
    }, []);

    const navigationTheme = {
        dark: isDark,
        colors: {
            // We can map our custom theme colors to React Navigation's expected structure
            primary: theme.colors.primary,
            background: theme.colors.background,
            card: theme.colors.background,
            text: theme.colors.text,
            border: theme.colors.border,
            notification: theme.colors.danger,
        },
        fonts: DefaultTheme.fonts,
    };

    if (!isReady) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <StatusBar hidden />
                <IntroAnimation onComplete={() => setIsReady(true)} theme={theme} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <NavigationContainer theme={navigationTheme}>
                <StatusBar hidden />
                <Stack.Navigator
                    screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: theme.colors.background },
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
    );
};

export default function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <TaskProvider>
                <ThemeProvider>
                    <AppContent />
                </ThemeProvider>
            </TaskProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
