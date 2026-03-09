import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, Animated, Dimensions, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, FileText, CheckCircle, TrendingUp, Clock, UploadCloud, Tag, ChevronLeft, ChevronRight, Send, Check } from 'lucide-react-native';
import { THEME } from '../config/theme';
import { auth, db } from '../config/firebase';
import { doc, setDoc, onSnapshot, increment } from 'firebase/firestore';

const { width } = Dimensions.get('window');
const GROQ_API_KEY = "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"; // From users file

const SKILLS_DB = [
    "python", "java", "c++", "sql", "mysql", "mongodb",
    "machine learning", "deep learning", "nlp",
    "pandas", "numpy", "react", "node.js", "express",
    "flask", "django", "aws", "docker", "kubernetes",
    "javascript", "typescript", "html", "css", "tailwind", "git"
];

export default function ResumeInterviewScreen() {
    const navigation = useNavigation();
    const [stats, setStats] = useState({ count: 0, score: 0, time: 0 });

    const [resumeText, setResumeText] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [detectedSkills, setDetectedSkills] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [evaluations, setEvaluations] = useState({});
    const [evaluatingIdx, setEvaluatingIdx] = useState(null);
    const [currentQ, setCurrentQ] = useState(0);
    const [startTime] = useState(Date.now());

    // Animation
    const floatAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.loop(Animated.sequence([
            Animated.timing(floatAnim, { toValue: 1, duration: 12000, useNativeDriver: true }),
            Animated.timing(floatAnim, { toValue: 0, duration: 12000, useNativeDriver: true })
        ])).start();
    }, []);

    useEffect(() => {
        const unsubAuth = auth.onAuthStateChanged((user) => {
            if (user) {
                const unsubDoc = onSnapshot(doc(db, "users", user.uid), (docRef) => {
                    if (docRef.exists()) {
                        const data = docRef.data();
                        const rc = data.resumeInterviewsCompleted || 0;
                        setStats({
                            count: rc,
                            score: rc > 0 ? Math.round((data.resumeTotalScore || 0) / rc) : 0,
                            time: data.resumePracticeMinutes || 0
                        });
                    }
                });
                return () => unsubDoc();
            } else {
                navigation.replace("Home");
            }
        });
        return () => unsubAuth();
    }, []);

    const extractSkills = (text) => {
        const lower = text.toLowerCase();
        return SKILLS_DB.filter(s => lower.includes(s));
    };

    const callGroqAPI = async (prompt, systemParams = "") => {
        try {
            const res = await fetch("https://api.com.groq.com/v1/chat/completions", {
                method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
                body: JSON.stringify({ model: "llama-3.1-8b-instant", messages: [{ role: "user", content: prompt }], temperature: 0.7 })
            });
            if (!res.ok) {
                const res2 = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
                    body: JSON.stringify({ model: "llama-3.1-8b-instant", messages: [{ role: "user", content: prompt }], temperature: 0.7 })
                });
                const data2 = await res2.json();
                return data2.choices[0].message.content;
            }
            const data = await res.json();
            return data.choices[0].message.content;
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const handleAnalyze = async () => {
        if (!resumeText.trim()) {
            Alert.alert("Error", "Please paste your resume or experience summary first.");
            return;
        }
        setIsAnalyzing(true);
        try {
            const parsedSkills = extractSkills(resumeText);
            setDetectedSkills(parsedSkills.length > 0 ? parsedSkills : ["General Candidate"]);

            const prompt = `Based on this resume:\n\n${resumeText.substring(0, 1500)}\n\nGenerate:\n- 5 Technical questions\n- 3 Behavioral questions\n- 2 Scenario questions\n\nReturn a numbered list only. No extra conversational text or intro block. Do not use markdown bolding in the list numbers.`;
            const content = await callGroqAPI(prompt);

            let lines = content.replace(/```json/g, "").replace(/```/g, "").split("\n").filter(q => q.trim().length > 10);
            if (lines.length > 10) lines = lines.slice(0, 10);

            setQuestions(lines);
            setCurrentQ(0);
        } catch (e) {
            Alert.alert("Error", "Failed to analyze resume via AI.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const evaluateAnswer = async (idx) => {
        const ans = answers[idx]?.trim();
        if (!ans) {
            Alert.alert("Input Required", "Please type your answer before evaluating.");
            return;
        }

        setEvaluatingIdx(idx);
        try {
            const prompt = `Question: ${questions[idx]}\nAnswer: ${ans}\n\nGive response strictly in this format exactly:\nScore: X/10\nFeedback: ...\nFollow-up: ...`;
            const content = await callGroqAPI(prompt);

            let score = 5; let feedback = "Good effort."; let followup = "Could you expand on that?";
            content.split("\n").forEach(line => {
                if (line.includes("Score")) { try { score = parseInt(line.split(":")[1].split("/")[0].trim()); } catch (e) { } }
                else if (line.includes("Feedback")) { feedback = line.replace("Feedback:", "").trim(); }
                else if (line.includes("Follow-up")) { followup = line.replace("Follow-up:", "").trim(); }
            });

            setEvaluations(prev => ({ ...prev, [idx]: { score, feedback, followup } }));
        } catch (e) {
            Alert.alert("Evaluation Error", "Could not evaluate answer. Try again.");
        } finally {
            setEvaluatingIdx(null);
        }
    };

    const finishInterview = async () => {
        if (!auth.currentUser) return navigation.replace("Dashboard");

        const evalKeys = Object.keys(evaluations);
        const mins = Math.max(1, Math.round((Date.now() - startTime) / 60000));
        let avg = 0;

        if (evalKeys.length > 0) {
            avg = evalKeys.reduce((acc, k) => acc + (evaluations[k].score * 10), 0) / evalKeys.length;
        }

        try {
            await setDoc(doc(db, "users", auth.currentUser.uid), {
                resumeInterviewsCompleted: increment(1),
                resumeTotalScore: increment(Math.round(avg)),
                resumePracticeMinutes: increment(mins)
            }, { merge: true });
            navigation.replace("Dashboard");
        } catch (e) {
            Alert.alert("Error", "Failed to save final score.");
            navigation.replace("Dashboard");
        }
    };

    const renderUploadState = () => (
        <View style={styles.tiltContainer}>
            <View style={styles.tiltHeader}>
                <Text style={styles.tiltTitle}>Upload Your <Text style={{ color: '#f472b6' }}>Resume</Text></Text>
                <Text style={styles.tiltDesc}>Paste your text resume or experience summary. Our AI will parse your exact experience into dynamic interview questions.</Text>
            </View>

            <View style={styles.uploadCard}>
                <View style={styles.uploadIconBox}>
                    <FileText size={40} color="#f472b6" />
                </View>
                <TextInput
                    style={styles.resumeInput}
                    placeholder="Paste your resume text or experience summary here..."
                    placeholderTextColor="#64748b"
                    multiline
                    textAlignVertical="top"
                    value={resumeText}
                    onChangeText={setResumeText}
                />
                <TouchableOpacity style={styles.uploadBtn} onPress={handleAnalyze}>
                    <UploadCloud size={24} color="white" />
                    <Text style={styles.uploadBtnText}>Analyze Resume</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderLoadingState = () => (
        <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#ec4899" style={{ marginBottom: 20 }} />
            <Text style={styles.loadingText}>Analyzing Experience & Generating Questions...</Text>
        </View>
    );

    const renderAnalysisState = () => {
        const qText = questions[currentQ];
        const isEvaled = !!evaluations[currentQ];
        const isEvaling = evaluatingIdx === currentQ;
        const evalData = evaluations[currentQ];

        return (
            <View style={styles.analysisContainer}>
                <View style={styles.skillsCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <Tag size={20} color="#f472b6" />
                        <Text style={styles.skillsTitle}>Detected Skills</Text>
                    </View>
                    <View style={styles.skillsGrid}>
                        {detectedSkills.map((s, i) => (
                            <View key={i} style={styles.skillBadge}>
                                <Text style={styles.skillText}>{s}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.qCard}>
                    <Text style={styles.qHeader}>
                        <Text style={{ color: '#818cf8', fontWeight: '900' }}>Q{currentQ + 1}/{questions.length}. </Text>
                        {qText}
                    </Text>

                    <TextInput
                        style={styles.ansInput}
                        placeholder="Type your detailed answer here..."
                        placeholderTextColor="#64748b"
                        multiline
                        textAlignVertical="top"
                        value={answers[currentQ] || ""}
                        onChangeText={(t) => setAnswers(prev => ({ ...prev, [currentQ]: t }))}
                        editable={!isEvaled}
                    />

                    <View style={{ alignItems: 'flex-end', marginBottom: isEvaled ? 16 : 0 }}>
                        {!isEvaled ? (
                            <TouchableOpacity style={styles.evalBtn} onPress={() => evaluateAnswer(currentQ)} disabled={isEvaling}>
                                {isEvaling ? <ActivityIndicator size="small" color="white" /> : <Send size={16} color="white" />}
                                <Text style={styles.evalBtnText}>{isEvaling ? "Evaluating..." : "Evaluate"}</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.evalutedBadge}>
                                <Check size={16} color="white" />
                                <Text style={styles.evalBtnText}>Evaluated</Text>
                            </View>
                        )}
                    </View>

                    {isEvaled && (
                        <View style={styles.feedbackBlock}>
                            <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center', marginBottom: 12 }}>
                                <View style={[styles.scoreBox, { backgroundColor: evalData.score >= 8 ? 'rgba(34,197,94,0.2)' : evalData.score >= 5 ? 'rgba(234,179,8,0.2)' : 'rgba(239,68,68,0.2)' }]}>
                                    <Text style={[styles.scoreNum, { color: evalData.score >= 8 ? '#4ade80' : evalData.score >= 5 ? '#facc15' : '#f87171' }]}>{evalData.score}</Text>
                                    <Text style={styles.scoreMax}>/10</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.feedbackText}><Text style={{ color: 'white', fontWeight: 'bold' }}>Feedback: </Text>{evalData.feedback}</Text>
                                </View>
                            </View>
                            <View style={styles.followupBox}>
                                <Text style={styles.followupText}><Text style={{ fontWeight: 'bold' }}>Follow-up: </Text>{evalData.followup}</Text>
                            </View>
                        </View>
                    )}
                </View>

                <View style={styles.paginationRow}>
                    {currentQ > 0 ? (
                        <TouchableOpacity style={styles.pageBtn} onPress={() => setCurrentQ(prev => prev - 1)}>
                            <ChevronLeft size={16} color="white" />
                            <Text style={styles.pageBtnText}>Previous</Text>
                        </TouchableOpacity>
                    ) : <View />}

                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        {currentQ < questions.length - 1 && isEvaled && (
                            <TouchableOpacity style={styles.pageBtnNext} onPress={() => setCurrentQ(prev => prev + 1)}>
                                <Text style={styles.pageBtnText}>Next</Text>
                                <ChevronRight size={16} color="white" />
                            </TouchableOpacity>
                        )}
                        {currentQ === questions.length - 1 && isEvaled && (
                            <TouchableOpacity style={styles.submitAllBtn} onPress={finishInterview}>
                                <CheckCircle size={18} color="white" />
                                <Text style={styles.pageBtnText}>Submit All</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={StyleSheet.absoluteFillObject}>
                <Animated.View style={[styles.bgCircle, { top: '25%', left: '25%', backgroundColor: 'rgba(236, 72, 153, 0.1)', transform: [{ scale: floatAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] }) }] }]} />
                <Animated.View style={[styles.bgCircle, { bottom: '25%', right: '25%', backgroundColor: 'rgba(168, 85, 247, 0.1)' }]} />
            </View>

            <View style={styles.nav}>
                <TouchableOpacity style={styles.navGroup} onPress={() => navigation.navigate("Dashboard")}>
                    <View style={styles.backBtn}><ArrowLeft size={20} color="#f472b6" /></View>
                    <Text style={styles.navTitle}>Resume<Text style={{ color: '#f472b6' }}>AI</Text></Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.statsHeader}>
                    <FileText size={20} color="#f472b6" />
                    <Text style={styles.statsTitle}>Resume AI Stats</Text>
                </View>

                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <View style={[styles.statIconBox, { backgroundColor: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.2)' }]}>
                            <CheckCircle size={32} color="#4ade80" />
                        </View>
                        <View>
                            <Text style={styles.statValue}>{stats.count}</Text>
                            <Text style={styles.statLabel}>Interviews Completed</Text>
                        </View>
                    </View>
                    <View style={styles.statCard}>
                        <View style={[styles.statIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.2)' }]}>
                            <TrendingUp size={32} color="#60a5fa" />
                        </View>
                        <View>
                            <Text style={styles.statValue}>{stats.score}%</Text>
                            <Text style={styles.statLabel}>Average Score</Text>
                        </View>
                    </View>
                    <View style={styles.statCard}>
                        <View style={[styles.statIconBox, { backgroundColor: 'rgba(168, 85, 247, 0.1)', borderColor: 'rgba(168, 85, 247, 0.2)' }]}>
                            <Clock size={32} color="#c084fc" />
                        </View>
                        <View>
                            <Text style={styles.statValue}>{stats.time}m</Text>
                            <Text style={styles.statLabel}>Minutes Practiced</Text>
                        </View>
                    </View>
                </View>

                {isAnalyzing ? renderLoadingState() : (questions.length > 0 ? renderAnalysisState() : renderUploadState())}

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    bgCircle: { width: 400, height: 400, borderRadius: 200, position: 'absolute', filter: Platform.OS === 'web' ? 'blur(100px)' : 'none' },
    nav: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', zIndex: 10 },
    navGroup: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    backBtn: { padding: 8, backgroundColor: 'rgba(236,72,153,0.1)', borderRadius: 8 },
    navTitle: { fontSize: 20, fontWeight: 'bold', color: 'white' },
    scrollContent: { padding: 24, paddingBottom: 60, flexGrow: 1 },
    statsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    statsTitle: { fontSize: 20, fontWeight: 'bold', color: '#f472b6' },
    statsGrid: { flexDirection: width > 768 ? 'row' : 'column', gap: 24, marginBottom: 48 },
    statCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, flexDirection: 'row', alignItems: 'center', gap: 20 },
    statIconBox: { padding: 16, borderRadius: 12, borderWidth: 1 },
    statValue: { fontSize: 30, fontWeight: 'bold', color: 'white' },
    statLabel: { fontSize: 14, color: '#9ca3af' },
    tiltContainer: { alignItems: 'center', paddingVertical: 40 },
    tiltHeader: { alignItems: 'center', marginBottom: 40 },
    tiltTitle: { fontSize: 36, fontWeight: '900', color: 'white', marginBottom: 16, textAlign: 'center' },
    tiltDesc: { fontSize: 18, color: '#9ca3af', textAlign: 'center', maxWidth: 600 },
    uploadCard: { width: '100%', maxWidth: 800, backgroundColor: 'rgba(30,41,59,0.5)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 24, padding: 40, alignItems: 'center' },
    uploadIconBox: { width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(236,72,153,0.1)', borderWidth: 1, borderColor: 'rgba(236,72,153,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
    resumeInput: { width: '100%', height: 200, backgroundColor: 'rgba(15,23,42,0.8)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 20, color: 'white', fontSize: 16, marginBottom: 32 },
    uploadBtn: { width: '100%', maxWidth: 400, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#db2777', paddingVertical: 20, borderRadius: 16 },
    uploadBtnText: { color: 'white', fontSize: 20, fontWeight: '900' },
    loadingCard: { alignItems: 'center', padding: 60, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    loadingText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    analysisContainer: { gap: 32 },
    skillsCard: { backgroundColor: 'rgba(30,41,59,0.4)', borderRadius: 24, padding: 32, borderTopWidth: 4, borderTopColor: '#ec4899' },
    skillsTitle: { fontSize: 18, fontWeight: 'bold', color: '#f472b6' },
    skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    skillBadge: { backgroundColor: 'rgba(236,72,153,0.2)', borderWidth: 1, borderColor: 'rgba(236,72,153,0.3)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    skillText: { color: '#f9a8d4', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
    qCard: { backgroundColor: 'rgba(30,41,59,0.4)', borderRadius: 24, padding: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', overflow: 'hidden' },
    qHeader: { fontSize: 18, fontWeight: '600', color: 'white', marginBottom: 24, lineHeight: 28 },
    ansInput: { backgroundColor: 'rgba(15,23,42,0.6)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 20, color: '#e2e8f0', fontSize: 15, minHeight: 120, marginBottom: 20 },
    evalBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#4f46e5', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
    evalutedBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#16a34a', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
    evalBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
    feedbackBlock: { backgroundColor: 'rgba(30,41,59,0.8)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 20 },
    scoreBox: { width: 64, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    scoreNum: { fontSize: 24, fontWeight: '900' },
    scoreMax: { fontSize: 10, fontWeight: 'bold', color: 'rgba(255,255,255,0.5)', marginTop: -4 },
    feedbackText: { color: '#d1d5db', fontSize: 14, lineHeight: 22 },
    followupBox: { backgroundColor: 'rgba(79,70,229,0.1)', borderLeftWidth: 2, borderLeftColor: '#6366f1', padding: 12, borderRadius: 8, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 },
    followupText: { color: '#c7d2fe', fontSize: 14 },
    paginationRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16 },
    pageBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#334155', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
    pageBtnNext: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#4f46e5', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
    submitAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#db2777', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 12 },
    pageBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14 }
});
