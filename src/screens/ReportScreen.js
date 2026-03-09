import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useInterview } from '../context/InterviewContext';
import GlowWrapper from '../components/GlowWrapper';
import { THEME } from '../config/theme';
import { BarChart } from 'react-native-chart-kit';
import { BrainCircuit, Award, TrendingUp, ThumbsUp, AlertTriangle, ArrowLeft } from 'lucide-react-native';

const GROQ_API_KEY = "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";
const screenWidth = Dimensions.get("window").width;

export default function ReportScreen() {
    const navigation = useNavigation();
    const { score, violations } = useInterview();

    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState(null);

    useEffect(() => {
        generateReport();
    }, []);

    const generateReport = async () => {
        const prompt = `Act as an expert Technical Interview Analyst. Review the candidate session:
Score on Coding Questions: ${score}/2 answers correct.
Integrity Violations: ${violations}/4.

Provide JSON output only with:
- "strengths": 1 sentence of positive feedback.
- "weaknesses": 1 sentence of constructive criticism.
- "actions": Array of 3 short actionable tips.
- "tech_score": Number (0-100)
- "reasoning_score": Number (0-100)
- "comm_score": Number (0-100)
- "integrity_score": Number (100 minus penalty)
- "score": Overall final score (0-100).`;

        try {
            const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [{ role: "system", content: "You output JSON only." }, { role: "user", content: prompt }],
                    temperature: 0.3
                })
            });
            const data = await res.json();
            let text = data.choices[0]?.message?.content || "{}";

            // Extract JSON
            const startIdx = text.indexOf("{");
            const endIdx = text.lastIndexOf("}");
            if (startIdx !== -1 && endIdx !== -1) {
                text = text.substring(startIdx, endIdx + 1);
            }
            const parsed = JSON.parse(text);
            setReportData(parsed);
        } catch (e) {
            console.error("Report generation failed", e);
            // Fallback
            setReportData({
                score: (score / 2) * 100,
                tech_score: 80,
                reasoning_score: 75,
                comm_score: 85,
                integrity_score: Math.max(0, 100 - violations * 25),
                strengths: "Demonstrated solid foundation in logic.",
                weaknesses: "Can improve efficiency of initial approach.",
                actions: ["Practice system design", "Review time complexity", "Stay focused during tasks"]
            });
        }
        setLoading(false);
    };

    if (loading || !reportData) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={THEME.colors.primary} />
                <Text style={{ color: 'white', marginTop: 16, fontSize: 18, fontWeight: 'bold' }}>Generating Analysis...</Text>
            </View>
        );
    }

    const chartData = {
        labels: ["Tech", "Reason", "Comm", "Integ"],
        datasets: [{
            data: [
                reportData.tech_score || 0,
                reportData.reasoning_score || 0,
                reportData.comm_score || 0,
                reportData.integrity_score || 0
            ]
        }]
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            <View style={styles.navBar}>
                <View style={styles.navLeft}>
                    <View style={styles.iconBox}>
                        <BrainCircuit size={24} color={THEME.colors.primary} />
                    </View>
                    <Text style={styles.navTitle}>Mock<Text style={{ color: THEME.colors.primary }}>Mentor</Text> Report</Text>
                </View>
            </View>

            <GlowWrapper style={styles.heroSection}>
                <View style={[styles.heroRow, { flexDirection: Platform.OS === 'web' && screenWidth > 768 ? 'row' : 'column' }]}>
                    <View style={styles.heroTextContainer}>
                        <Text style={styles.heroSubtitle}>Date: {new Date().toLocaleDateString()}</Text>
                        <Text style={styles.heroTitle}>Performance Analysis</Text>
                        <Text style={styles.heroDesc}>AI-generated evaluation based on your responses.</Text>
                    </View>

                    <View style={styles.scoreBox}>
                        <View style={styles.scoreTextCol}>
                            <Text style={styles.scoreLabel}>OVERALL SCORE</Text>
                            <Text style={styles.scoreValue}>{reportData.score}<Text style={styles.scoreMax}>/100</Text></Text>
                        </View>
                        <View style={styles.awardIcon}>
                            <Award size={40} color="white" />
                        </View>
                    </View>
                </View>
            </GlowWrapper>

            <View style={[styles.gridRow, { flexDirection: Platform.OS === 'web' && screenWidth > 768 ? 'row' : 'column' }]}>
                <View style={[styles.gridCell, styles.glassPanel]}>
                    <Text style={styles.panelTitle}>Skill Distribution</Text>
                    <BarChart
                        data={chartData}
                        width={Platform.OS === 'web' && screenWidth > 768 ? screenWidth * 0.4 : screenWidth - 64}
                        height={220}
                        yAxisLabel=""
                        yAxisSuffix="%"
                        chartConfig={{
                            backgroundColor: THEME.colors.surface,
                            backgroundGradientFrom: THEME.colors.surface,
                            backgroundGradientTo: THEME.colors.surface,
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`
                        }}
                        style={{ marginVertical: 8, borderRadius: 16 }}
                        fromZero
                    />
                </View>
                <View style={[styles.gridCell, styles.glassPanel]}>
                    <Text style={styles.panelTitle}>Pillar Evaluation</Text>
                    <View style={styles.pillarRow}>
                        <Text style={styles.pillarText}>Technical</Text>
                        <Text style={styles.pillarVal}>{reportData.tech_score}%</Text>
                    </View>
                    <View style={styles.pillarBarBg}><View style={[styles.pillarBarFill, { width: `${reportData.tech_score}%`, backgroundColor: THEME.colors.success }]} /></View>

                    <View style={styles.pillarRow}>
                        <Text style={styles.pillarText}>Reasoning Gap</Text>
                        <Text style={styles.pillarVal}>{reportData.reasoning_score}%</Text>
                    </View>
                    <View style={styles.pillarBarBg}><View style={[styles.pillarBarFill, { width: `${reportData.reasoning_score}%`, backgroundColor: THEME.colors.primary }]} /></View>

                    <View style={styles.pillarRow}>
                        <Text style={styles.pillarText}>Communication</Text>
                        <Text style={styles.pillarVal}>{reportData.comm_score}%</Text>
                    </View>
                    <View style={styles.pillarBarBg}><View style={[styles.pillarBarFill, { width: `${reportData.comm_score}%`, backgroundColor: THEME.colors.warning }]} /></View>

                    <View style={styles.pillarRow}>
                        <Text style={styles.pillarText}>Integrity</Text>
                        <Text style={styles.pillarVal}>{reportData.integrity_score}%</Text>
                    </View>
                    <View style={styles.pillarBarBg}><View style={[styles.pillarBarFill, { width: `${reportData.integrity_score}%`, backgroundColor: THEME.colors.secondary }]} /></View>
                </View>
            </View>

            <View style={[styles.gridRow, { flexDirection: Platform.OS === 'web' && screenWidth > 768 ? 'row' : 'column' }]}>
                <View style={[styles.gridCell, styles.glassPanel, { borderLeftColor: THEME.colors.success, borderLeftWidth: 4 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <ThumbsUp size={20} color={THEME.colors.success} />
                        <Text style={[styles.panelTitle, { color: THEME.colors.success, marginBottom: 0 }]}>Strong Areas</Text>
                    </View>
                    <Text style={styles.feedbackText}>{reportData.strengths}</Text>
                </View>
                <View style={[styles.gridCell, styles.glassPanel, { borderLeftColor: THEME.colors.warning, borderLeftWidth: 4 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <AlertTriangle size={20} color={THEME.colors.warning} />
                        <Text style={[styles.panelTitle, { color: THEME.colors.warning, marginBottom: 0 }]}>Areas For Improvement</Text>
                    </View>
                    <Text style={styles.feedbackText}>{reportData.weaknesses}</Text>
                </View>
            </View>

            <View style={[styles.glassPanel, { marginBottom: 32 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <TrendingUp size={24} color={THEME.colors.primary} />
                    <Text style={[styles.panelTitle, { marginBottom: 0 }]}>Actionable Growth Plan</Text>
                </View>
                {reportData.actions?.map((action, idx) => (
                    <View key={idx} style={styles.actionRow}>
                        <View style={styles.actionIdx}><Text style={styles.actionIdxText}>{idx + 1}</Text></View>
                        <Text style={styles.actionText}>{action}</Text>
                    </View>
                ))}
            </View>

            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Interview' }] })}>
                <ArrowLeft size={18} color={THEME.colors.background} />
                <Text style={styles.backBtnText}>Restart Interview</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.colors.background },
    scrollContent: { padding: 16, paddingBottom: 60, maxWidth: 1200, alignSelf: 'center', width: '100%' },
    navBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingVertical: 8, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    navLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconBox: { padding: 8, backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: 8 },
    navTitle: { fontSize: 22, fontWeight: 'bold', color: 'white', letterSpacing: -0.5 },
    heroSection: { marginBottom: 24 },
    heroRow: { padding: 24, justifyContent: 'space-between', alignItems: 'center', gap: 24 },
    heroTextContainer: { flex: 1 },
    heroSubtitle: { color: THEME.colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
    heroTitle: { fontSize: 36, fontWeight: '900', color: 'white', marginBottom: 8 },
    heroDesc: { color: THEME.colors.textMuted, fontSize: 16 },
    scoreBox: { flexDirection: 'row', alignItems: 'center', gap: 24, backgroundColor: 'rgba(15, 23, 42, 0.4)', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    scoreTextCol: { alignItems: 'flex-end' },
    scoreLabel: { fontSize: 12, color: THEME.colors.textMuted, fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 },
    scoreValue: { fontSize: 48, fontWeight: '900', color: THEME.colors.secondary, lineHeight: 48 },
    scoreMax: { fontSize: 20, color: THEME.colors.textMuted },
    awardIcon: { width: 80, height: 80, borderRadius: 16, backgroundColor: THEME.colors.primary, justifyContent: 'center', alignItems: 'center', shadowColor: THEME.colors.primary, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 },
    gridRow: { gap: 24, marginBottom: 24 },
    gridCell: { flex: 1 },
    glassPanel: { backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
    panelTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
    pillarRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, marginTop: 12 },
    pillarText: { color: '#cbd5e1', fontSize: 14 },
    pillarVal: { color: 'white', fontSize: 14, fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
    pillarBarBg: { height: 8, backgroundColor: '#1e293b', borderRadius: 4, overflow: 'hidden' },
    pillarBarFill: { height: '100%', borderRadius: 4 },
    feedbackText: { color: '#94a3b8', fontSize: 14, lineHeight: 24 },
    actionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, padding: 16, backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    actionIdx: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(99, 102, 241, 0.2)', justifyContent: 'center', alignItems: 'center' },
    actionIdxText: { color: THEME.colors.primary, fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
    actionText: { flex: 1, color: '#e2e8f0', fontSize: 14, lineHeight: 22, marginTop: 4 },
    backBtn: { backgroundColor: 'white', alignSelf: 'center', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: 'white', shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
    backBtnText: { color: THEME.colors.background, fontWeight: 'bold', fontSize: 16 }
});
