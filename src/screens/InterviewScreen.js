import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, SafeAreaView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAntiCheat } from '../hooks/useAntiCheat';
import { useInterview } from '../context/InterviewContext';
import GlowWrapper from '../components/GlowWrapper';
import { THEME } from '../config/theme';
import { Play, Code2, AlertTriangle } from 'lucide-react-native';

const GROQ_API_KEY = "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";

const CODING_POOL = [
    { question: "Write a python script to Print Hello World", expected: "Hello World" },
    { question: "Write a script to print the square of number 5", expected: "25" }
];

export default function InterviewScreen() {
    const navigation = useNavigation();
    const { score, setScore, setViolations } = useInterview();

    const [codingIndex, setCodingIndex] = useState(0);
    const [code, setCode] = useState("# Write your python solution here\n\n");
    const [isEvaluating, setIsEvaluating] = useState(false);

    // AntiCheat Setup
    const onTotalFailure = () => {
        if (Platform.OS === 'web') {
            alert("🚨 INTEGRITY FAILURE: Too many violations recorded. Session terminated.");
        } else {
            Alert.alert("🚨 INTEGRITY FAILURE", "Too many violations recorded. Session terminated.");
        }
        navigation.replace("Report");
    };

    const { violationCount, maxViolations, latestViolation } = useAntiCheat(onTotalFailure);

    useEffect(() => {
        setViolations(violationCount);
    }, [violationCount, setViolations]);

    const submitCode = async () => {
        setIsEvaluating(true);
        const expected = CODING_POOL[codingIndex].expected;
        const question = CODING_POOL[codingIndex].question;

        const prompt = `You are a Python code evaluator. 
Problem: ${question}
Expected Output context: ${expected}

Candidate's Code:
\`\`\`python
${code}
\`\`\`

Does the candidate's code logically accomplish the goal or print the expected output? Reply ONLY with "YES" or "NO". No markdown, no explanations.`;

        let correct = false;
        try {
            const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.1
                })
            });
            const data = await res.json();
            const evalResult = data.choices[0]?.message?.content?.trim().toUpperCase() || "";

            if (evalResult.includes("YES")) {
                correct = true;
                setScore(prev => prev + 1);
                if (Platform.OS === 'web') alert("✅ Correct!");
                else Alert.alert("✅ Correct!", "Good job. Moving to next question.");
            } else {
                if (Platform.OS === 'web') alert("❌ Incorrect implementation.");
                else Alert.alert("❌ Incorrect", "Your implementation did not meet the requirements.");
            }
        } catch (e) {
            console.error("Eval Error:", e);
            // Fallback naive checking if API fails
            if (code.includes("print") && code.includes(expected.split(" ")[0])) {
                correct = true;
                setScore(prev => prev + 1);
            }
        }

        setIsEvaluating(false);
        const nextIndex = codingIndex + 1;
        if (nextIndex >= CODING_POOL.length) {
            navigation.replace("Report");
        } else {
            setCodingIndex(nextIndex);
            setCode("# Write your python solution here\n\n");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.pulseDot} />
                    <Text style={styles.headerTitle}>Stage 2: Coding Assessment ({codingIndex + 1}/{CODING_POOL.length})</Text>
                </View>
                {violationCount > 0 && (
                    <View style={styles.violationTag}>
                        <AlertTriangle size={16} color="white" />
                        <Text style={styles.violationText}>Violations: {violationCount}/{maxViolations}</Text>
                    </View>
                )}
            </View>

            <View style={styles.content}>
                <GlowWrapper style={styles.promptWrapper}>
                    <View style={styles.promptHeader}>
                        <Code2 size={24} color={THEME.colors.accent} />
                        <Text style={styles.promptTitle}>Problem Statement</Text>
                    </View>
                    <View style={styles.promptBox}>
                        <Text style={styles.promptText}>{CODING_POOL[codingIndex].question}</Text>
                    </View>
                </GlowWrapper>

                <View style={styles.editorSection}>
                    <View style={styles.editorHeader}>
                        <Text style={styles.editorFileName}>solution.py</Text>
                        <TouchableOpacity style={styles.submitBtn} onPress={submitCode} disabled={isEvaluating}>
                            {isEvaluating ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <Text style={styles.submitBtnText}>Submit Code</Text>
                                    <Play size={14} color="white" />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        style={styles.editorInput}
                        multiline
                        textAlignVertical="top"
                        value={code}
                        onChangeText={setCode}
                        autoCapitalize="none"
                        autoCorrect={false}
                        spellCheck={false}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.colors.background },
    header: {
        height: 60,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        backgroundColor: THEME.colors.surfaceGlass,
        borderBottomWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: THEME.colors.accent },
    headerTitle: { color: 'white', fontWeight: 'bold', fontSize: 14, letterSpacing: 0.5 },
    violationTag: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: THEME.colors.danger, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    violationText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
    content: { flex: 1, padding: 16, gap: Platform.OS === 'web' ? 24 : 16, flexDirection: Platform.OS === 'web' ? 'row' : 'column' },
    promptWrapper: { flex: Platform.OS === 'web' ? 0.4 : 0.3, minHeight: 150 },
    promptHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, paddingBottom: 8 },
    promptTitle: { fontSize: 20, fontWeight: 'bold', color: THEME.colors.accent },
    promptBox: { flex: 1, padding: 16, backgroundColor: 'rgba(255,255,255,0.02)' },
    promptText: { fontSize: 18, color: THEME.colors.text, lineHeight: 28 },
    editorSection: { flex: Platform.OS === 'web' ? 0.6 : 0.7, backgroundColor: '#1e1e1e', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#333' },
    editorHeader: { height: 48, backgroundColor: 'rgba(30,30,30,1)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: 1, borderColor: '#333' },
    editorFileName: { color: '#999', fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
    submitBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#0891b2', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
    submitBtnText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
    editorInput: { flex: 1, padding: 16, color: '#d4d4d4', fontSize: 16, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }
});
