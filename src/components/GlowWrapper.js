import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, Animated } from 'react-native';

export default function GlowWrapper({ children, style }) {
    if (Platform.OS === 'web') {
        const glowStyle = {
            position: 'relative',
            backgroundColor: 'rgba(30, 41, 59, 0.7)',
            backdropFilter: 'blur(12px)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.2)',
            borderRadius: 16,
            ...style
        };
        return <View style={glowStyle}>{children}</View>;
    }

    // Native fallback using Animated View for glowing border effect
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, { toValue: 1, duration: 2000, useNativeDriver: false }),
                Animated.timing(animatedValue, { toValue: 0, duration: 2000, useNativeDriver: false })
            ])
        ).start();
    }, [animatedValue]);

    const borderColor = animatedValue.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: ['rgba(99, 102, 241, 0.1)', 'rgba(236, 72, 153, 0.8)', 'rgba(99, 102, 241, 0.1)']
    });

    return (
        <Animated.View style={[{ padding: 2, borderRadius: 18, backgroundColor: borderColor, elevation: 5 }, style]}>
            <View style={{ flex: 1, backgroundColor: '#1e293b', borderRadius: 16, overflow: 'hidden' }}>
                {children}
            </View>
        </Animated.View>
    );
}
