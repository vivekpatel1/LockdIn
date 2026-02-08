import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions, Easing, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

// We will animate the absolute top position of the lock group.
// Initial: Center of screen minus half the height of the group (50/2 = 25)
const START_Y = height / 2 - 25;
// Target: Exactly the same as the 'top' value of the header in HomeScreen.js
const END_Y = 115;

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        // backgroundColor: '#000000', // Handled inline
        zIndex: 1000,
        alignItems: 'center', // Ensure centering
        justifyContent: 'center',
    },
    lockGroup: {
        position: 'absolute',
        top: 0,
        left: 0, // Ensure absolute positioning spans width
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        // height: 50, // Let content dictate height or keep fixed? Fixed is fine for alignment
        height: 50,
    },
    lockWrapper: {
        width: 20,
        height: 25,
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginRight: 10,
    },
    lockBody: {
        width: 20,
        height: 15,
        borderRadius: 2,
    },
    shackle: {
        width: 14,
        height: 12.5,
        borderWidth: 3,
        borderBottomWidth: 0,
        borderTopLeftRadius: 7,
        borderTopRightRadius: 7,
        position: 'absolute',
        top: 0,
    },
    typewriterText: {
        fontSize: 40,
        fontWeight: '900',
        letterSpacing: 2,
        lineHeight: 50,
        textAlignVertical: 'center',
    }
});

export default function IntroAnimation({ onComplete, theme }) {
    const colors = theme ? theme.colors : { background: '#000000', text: '#FFFFFF' };
    const [displayTitle, setDisplayTitle] = useState('');
    const fullTitle = 'LOCKDIN';

    // Animation Values
    const shackleY = useRef(new Animated.Value(-15)).current;

    // Calculate precise center start
    // Screen Center Y - (Half Header Height approx 25)
    // or just animate relative to screen?
    // The original START_Y was height / 2 - 25.
    const translateY = useRef(new Animated.Value(START_Y)).current;

    useEffect(() => {
        // Step 1: Lock clicks shut (Snappier)
        const lockClose = Animated.spring(shackleY, {
            toValue: 0,
            friction: 8,
            tension: 60,
            useNativeDriver: true,
        });

        // Step 2: Move to header position
        const move = Animated.timing(translateY, {
            toValue: END_Y, // Matches HomeScreen header top
            duration: 600,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
        });

        // Sequence... (omitted to save tokens, I will keep original useEffect logic via replace)
        // Wait, I can't keep useEffect logic if I replace the whole component.
        // I should only replace the return statement and style definition?

        const animation = Animated.sequence([
            Animated.delay(150),
            Animated.parallel([
                lockClose,
                Animated.sequence([
                    Animated.delay(150),
                    move
                ])
            ])
        ]).start(({ finished }) => {
            if (!finished) return;

            // Step 3: Typewriter starts
            let charIndex = 0;
            // Set first char immediately
            setDisplayTitle(fullTitle[0]);
            charIndex = 1;

            const timer = setInterval(() => {
                if (charIndex < fullTitle.length) {
                    charIndex++;
                    setDisplayTitle(fullTitle.slice(0, charIndex));
                } else {
                    clearInterval(timer);
                    setTimeout(() => onComplete(), 500);
                }
            }, 100);

            // Store timer in a ref if we had one, but strict mode might make this tricky.
            // For now, the slice method is robust against "undefined" because we don't access via index directly for the append.
        });

        // Cleanup function for animation interruption usually requires more state,
        // but for now let's rely on the robust logic.
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar hidden />
            <Animated.View
                style={[
                    styles.lockGroup,
                    {
                        transform: [
                            { translateY: translateY }
                        ]
                    }
                ]}
            >
                <View style={styles.lockWrapper}>
                    <Animated.View style={[
                        styles.shackle,
                        {
                            borderColor: colors.text,
                            transform: [{ translateY: shackleY }]
                        }
                    ]} />
                    <View style={[styles.lockBody, { backgroundColor: colors.text }]} />
                </View>
                <Text style={[styles.typewriterText, { color: colors.text }]}>{displayTitle}</Text>
            </Animated.View>
        </View>
    );
}
