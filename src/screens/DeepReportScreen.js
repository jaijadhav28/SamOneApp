import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, Animated, Dimensions, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Brain, Code2, TrendingUp, Trophy, Medal, BookOpen, ShieldAlert } from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit'; // Fallback for Radar on native
import { THEME } from '../config/theme';
import { auth, db } from '../config/firebase';
import { doc, setDoc, increment } from 'firebase/firestore';

const { width } = Dimensions.get('window');

export default function DeepReportScreen({ route }) {
    const navigation = useNavigation();
    const params = route.params || {};

    // Retrieve via params or fallback to localStorage if on web
    let cScore = params.cognitiveScore || 0;
    let codeScore = params.codingScore || 0;
    let cViolations = params.cognitiveViolations || 0;
    let codeViolations = params.codingViolations || 0;

    if (Platform.OS === 'web' && Object.keys(params).length === 0) {
        cScore = parseFloat(localStorage.getItem('cognitive_percent')) || 0;
        codeScore = parseFloat(localStorage.getItem('coding_percent')) || 0;
        cViolations = parseInt(localStorage.getItem('cognitive_violations')) || 0;
        codeViolations = parseInt(localStorage.getItem('coding_violations')) || 0;
    }

    const totalViolations = cViolations + codeViolations;
    const penalty = totalViolations * 10;

    let overall = ((cScore + codeScore) / 2) - penalty;
    if (overall < 0) overall = 0;

    // Badge Logic
    let badgeConfig = {
        icon: BookOpen,
        title: "Beginner",
        desc: "Keep studying! Focus heavily on Python syntax and basic puzzle solving.",
        color: "#94a3b8",
        bg: "rgba(100, 116, 139, 0.1)"
    };

    if (totalViolations >= 4) {
        badgeConfig = {
            icon: ShieldAlert,
            title: "Disqualified",
            desc: "You triggered multiple cheating and integrity violations during the assessment.",
            color: "#f87171",
            bg: "rgba(239, 68, 68, 0.1)"
        };
    } else if (overall >= 80) {
        badgeConfig = {
            icon: Trophy,
            title: "Elite",
            desc: "Outstanding performance in both logical reasoning and coding implementation.",
            color: "#facc15",
            bg: "rgba(234, 179, 8, 0.1)"
        };
    } else if (overall >= 60) {
        badgeConfig = {
            icon: Medal,
            title: "Advanced",
            desc: "Solid results. Keep practicing complex edge cases to hit Elite.",
            color: "#4ade80",
            bg: "rgba(34, 197, 94, 0.1)"
        };
    } else if (overall >= 40) {
        badgeConfig = {
            icon: TrendingUp,
            title: "Intermediate",
            desc: "You have the basics down, but there's room to improve speed and logic.",
            color: "#60a5fa",
            bg: "rgba(59, 130, 246, 0.1)"
        };
    }

    // Animation
    const floatAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.loop(Animated.sequence([
            Animated.timing(floatAnim, { toValue: 1, duration: 8000, useNativeDriver: true }),
            Animated.timing(floatAnim, { toValue: 0, duration: 8000, useNativeDriver: true })
        ])).start();
    }, []);

    useEffect(() => {
        const saveStandardStats = async () => {
            if (auth.currentUser) {
                try {
                    const userRef = doc(db, "users", auth.currentUser.uid);
                    await setDoc(userRef, {
                        deepInterviewsCompleted: increment(1),
                        deepTotalScore: increment(Math.round(overall))
                    }, { merge: true });
                } catch (e) {
                    console.error("Save Failed:", e);
                }
            }
        };
        saveStandardStats();
    }, []);

    const integrityScore = Math.max(0, 100 - (totalViolations * 25));
    const RadarIcon = badgeConfig.icon;

    return (
        <SafeAreaView style={styles.container}>
            <View style={StyleSheet.absoluteFillObject}>
                <Animated.View style={[styles.bgCircle, { top: -100, left: -100, backgroundColor: 'rgba(6, 182, 212, 0.1)', transform: [{ scale: floatAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) }] }]} />
                <Animated.View style={[styles.bgCircle, { bottom: -100, right: -100, backgroundColor: 'rgba(168, 85, 247, 0.1)' }]} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Performance Dashboard</Text>
                    <Text style={styles.subtitle}>Deep & Easy MockMentor AI Evaluation</Text>
                </View>

                <View style={styles.gridOverlays}>
                    <View style={[styles.scoreCard, { borderTopColor: '#06b6d4' }]}>
                        <View style={styles.scoreCardHeader}>
                            <Brain size={16} color="#94a3b8" />
                            <Text style={styles.scoreCardTitle}>COGNITIVE</Text>
                        </View>
                        <Text style={styles.scoreCardValue}>{Math.round(cScore)}%</Text>
                    </View>
                    <View style={[styles.scoreCard, { borderTopColor: '#6366f1' }]}>
                        <View style={styles.scoreCardHeader}>
                            <Code2 size={16} color="#94a3b8" />
                            <Text style={styles.scoreCardTitle}>CODING</Text>
                        </View>
                        <Text style={styles.scoreCardValue}>{Math.round(codeScore)}%</Text>
                    </View>
                    <View style={[styles.scoreCard, { borderTopColor: '#a855f7' }]}>
                        <View style={styles.scoreCardHeader}>
                            <TrendingUp size={16} color="#94a3b8" />
                            <Text style={styles.scoreCardTitle}>OVERALL</Text>
                        </View>
                        <Text style={styles.scoreCardValue}>{Math.round(overall)}%</Text>
                    </View>
                </View>

                <View style={styles.contentGrid}>
                    <View style={styles.chartCard}>
                        <LineChart
                            data={{
                                labels: ["Cognitive", "Coding", "Overall", "Integrity"],
                                datasets: [{ data: [cScore, codeScore, overall, integrityScore] }]
                            }}
                            width={width > 768 ? 350 : width - 80}
                            height={220}
                            chartConfig={{
                                backgroundColor: "transparent",
                                backgroundGradientFrom: "rgba(30,41,59,0.1)",
                                backgroundGradientTo: "rgba(30,41,59,0.1)",
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(6, 182, 212, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
                            }}
                            bezier
                            style={{ marginVertical: 8, borderRadius: 16 }}
                        />
                    </View>

                    <View style={styles.badgeCard}>
                        <Text style={styles.recommendationTitle}>Final Recommendation</Text>
                        <View style={[styles.badgeArea, { borderColor: badgeConfig.color, backgroundColor: badgeConfig.bg }]}>
                            <RadarIcon size={40} color={badgeConfig.color} />
                            <Text style={[styles.badgeTitle, { color: badgeConfig.color }]}>{badgeConfig.title}</Text>
                        </View>
                        <Text style={styles.badgeDesc}>{badgeConfig.desc}</Text>
                        <TouchableOpacity style={styles.returnBtn} onPress={() => navigation.navigate("Dashboard")}>
                            <Text style={styles.returnBtnText}>Return to Dashboard</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.colors.background },
    bgCircle: { width: 400, height: 400, borderRadius: 200, position: 'absolute', filter: Platform.OS === 'web' ? 'blur(100px)' : 'none' },
    scrollContent: { padding: 24, paddingVertical: 48, alignItems: 'center' },
    header: { alignItems: 'center', marginBottom: 32 },
    title: { fontSize: 32, fontWeight: '900', color: '#22d3ee', textAlign: 'center', marginBottom: 8 },
    subtitle: { fontSize: 16, color: '#9ca3af', textAlign: 'center' },
    gridOverlays: { flexDirection: width > 768 ? 'row' : 'column', gap: 24, width: '100%', maxWidth: 900, marginBottom: 32 },
    scoreCard: { flex: 1, backgroundColor: 'rgba(30, 41, 59, 0.4)', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderTopWidth: 4, alignItems: 'center' },
    scoreCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
    scoreCardTitle: { fontSize: 12, fontWeight: 'bold', color: '#94a3b8', letterSpacing: 1 },
    scoreCardValue: { fontSize: 40, fontWeight: '900', color: 'white' },
    contentGrid: { flexDirection: width > 768 ? 'row' : 'column', gap: 32, width: '100%', maxWidth: 900 },
    chartCard: { flex: 1, backgroundColor: 'rgba(30, 41, 59, 0.4)', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', minHeight: 300 },
    badgeCard: { flex: 1, backgroundColor: 'rgba(30, 41, 59, 0.4)', borderRadius: 16, padding: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
    recommendationTitle: { fontSize: 20, fontWeight: 'bold', color: '#d1d5db', marginBottom: 16 },
    badgeArea: { width: '100%', maxWidth: 250, padding: 24, borderRadius: 16, borderWidth: 2, alignItems: 'center', gap: 8, marginBottom: 16 },
    badgeTitle: { fontSize: 24, fontWeight: '900' },
    badgeDesc: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginBottom: 24, maxWidth: 300 },
    returnBtn: { backgroundColor: '#334155', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
    returnBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14 }
});
