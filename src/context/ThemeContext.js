import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

const ThemeContext = createContext();

export const lightTheme = {
    mode: 'light',
    colors: {
        background: '#FFFFFF',
        containerBackground: '#F2F2F7', // Slightly off-white for main screen backgrounds if desired, or just White
        backgroundSecondary: '#FFFFFF', // Cards
        text: '#000000',
        textSecondary: '#666666',
        textTertiary: '#8E8E93',
        border: '#000000', // Black borders
        primary: '#000000', // Black for buttons
        onPrimary: '#FFFFFF',
        secondary: '#F2F2F7',
        onSecondary: '#000000',
        icon: '#000000',
        iconSecondary: '#8E8E93',
        success: '#34C759',
        danger: '#FF3B30',
        modalOverlay: 'rgba(0, 0, 0, 0.5)',
        cardBackground: '#FFFFFF',
        selectedItem: '#E5E5EA',
        selectedItemBorder: '#000000',
        shadow: '#000000',
        divider: '#E5E5EA',
        headerSubtitle: '#8E8E93',
        sectionHeader: '#8E8E93',
        taskItemBorder: '#000000', // Black borders
        inputBackground: '#F2F2F7',
    },
    fonts: {
        regular: 'System',
        medium: 'System',
        light: 'System',
        thin: 'System',
    },
    statusBarStyle: 'dark',
};

export const darkTheme = {
    mode: 'dark',
    colors: {
        background: '#000000',
        containerBackground: '#000000',
        backgroundSecondary: '#111111',
        text: '#FFFFFF',
        textSecondary: '#888888',
        textTertiary: '#444444',
        border: '#222222',
        primary: '#FFFFFF',
        onPrimary: '#000000',
        secondary: '#111111',
        onSecondary: '#FFFFFF',
        icon: '#FFFFFF',
        iconSecondary: '#666666',
        success: '#34C759',
        danger: '#FF3B30',
        modalOverlay: 'rgba(0, 0, 0, 0.85)',
        cardBackground: '#0A0A0A', // Matches taskItem in HistoryScreen (was #0A0A0A with border #111111)
        cardBackgroundSecondary: '#111111', // Matches some other cards
        selectedItem: '#222222',
        selectedItemBorder: '#FFFFFF',
        shadow: '#000000',
        divider: '#222222',
        headerSubtitle: '#888888',
        sectionHeader: '#666666',
        taskItemBorder: '#111111',
        inputBackground: '#111111',
    },
    fonts: {
        regular: 'System',
        medium: 'System',
        light: 'System',
        thin: 'System',
    },
    statusBarStyle: 'light',
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(darkTheme);

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const storedTheme = await AsyncStorage.getItem('APP_THEME');
            if (storedTheme === 'light') {
                setTheme(lightTheme);
            } else {
                setTheme(darkTheme);
            }
        } catch (e) {
            console.log('Failed to load theme', e);
        }
    };

    const toggleTheme = async () => {
        const newTheme = theme.mode === 'dark' ? lightTheme : darkTheme;
        setTheme(newTheme);
        try {
            await AsyncStorage.setItem('APP_THEME', newTheme.mode);
        } catch (e) {
            console.log('Failed to save theme', e);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, colors: theme.colors, isDark: theme.mode === 'dark' }}>
            <StatusBar style={theme.statusBarStyle} />
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
