import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions, Easing, Text } from 'react-native';

const { width, height } = Dimensions.get('window');

// We will animate the absolute top position of the lock group.
// Initial: Center of screen minus half the height of the group (50/2 = 25)
const START_Y = height / 2 - 25;
// Target: Exactly the same as the 'top' value of the header in HomeScreen.js
const END_Y = 115;

export default function IntroAnimation({ onComplete }) {
    const [displayTitle, setDisplayTitle] = useState('');
    const [isMoving, setIsMoving] = useState(false);
    const fullTitle = 'LOCKDIN';

    // Animation Values
    const shackleY = useRef(new Animated.Value(-15)).current;
    const translateY = useRef(new Animated.Value(START_Y)).current;

    useEffect(() => {
        // Step 1: Lock clicks shut (Snappier)
        const lockClose = Animated.spring(shackleY, {
            toValue: 0,
            friction: 8,
            tension: 60,
            useNativeDriver: true,
            restSpeedThreshold: 10,
            restDisplacementThreshold: 0.5,
        });

        // Step 2: Move to header position
        const move = Animated.timing(translateY, {
            toValue: END_Y,
            duration: 600,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
        });

        // Sequence: Initial Delay -> Lock starts -> (150ms later) Move starts
        Animated.sequence([
            Animated.delay(150),
            Animated.parallel([
                lockClose,
                Animated.sequence([
                    Animated.delay(150), // Overlap: Move starts while lock is settling
                    move
                ])
            ])
        ]).start(() => {
            setIsMoving(true);
            // Step 3: Typewriter starts immediately
            let currentText = '';
            let index = 0;

            // Show first character immediately
            if (fullTitle.length > 0) {
                currentText += fullTitle[0];
                setDisplayTitle(currentText);
                index = 1;
            }

            const timer = setInterval(() => {
                if (index < fullTitle.length) {
                    currentText += fullTitle[index];
                    setDisplayTitle(currentText);
                    index++;
                } else {
                    clearInterval(timer);
                    // Wait a moment then complete
                    setTimeout(() => onComplete(), 500);
                }
            }, 100);
        });
    }, []);

    return (
        <View style={styles.container}>
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
                    <Animated.View style={[styles.shackle, { transform: [{ translateY: shackleY }] }]} />
                    <View style={styles.lockBody} />
                </View>
                {displayTitle !== '' && (
                    <Text style={styles.typewriterText}>{displayTitle}</Text>
                )}
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000000',
        zIndex: 1000,
    },
    lockGroup: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
    },
    lockWrapper: {
        width: 20,
        height: 25,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    lockBody: {
        width: 20,
        height: 15,
        backgroundColor: '#FFFFFF',
        borderRadius: 2,
    },
    shackle: {
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
    typewriterText: {
        color: '#FFFFFF',
        fontSize: 40,
        fontWeight: '900',
        letterSpacing: 2,
        marginLeft: 10,
        // Match line height to container to avoid vertical shifts
        lineHeight: 50,
        textAlignVertical: 'center',
    }
});
