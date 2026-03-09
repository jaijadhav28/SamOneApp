import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert, SafeAreaView, Platform, Dimensions, Animated, KeyboardAvoidingView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAntiCheat } from '../hooks/useAntiCheat';
import { useInterview } from '../context/InterviewContext';
import { THEME } from '../config/theme';
import { Timer, Code2, Play, Bot, Video, Mic, Send, AlertTriangle } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { CameraView, useCameraPermissions } from 'expo-camera';

const { width } = Dimensions.get('window');
const GROQ_API_KEY = "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"; // Hardcoded from user HTML for demo

export default function InterviewScreen() {
    const navigation = useNavigation();
    const { score, setScore, setViolations } = useInterview();
    const [permission, requestPermission] = useCameraPermissions();

    const [timer, setTimer] = useState(0);
    const [cameraActive, setCameraActive] = useState(false);

    // Editor State
    const [code, setCode] = useState("// Welcome to the technical interview.\n// If asked a coding question, write your solution below.\n\n");
    const [terminalOutput, setTerminalOutput] = useState("");

    // Chat & LLM State
    const [chatHistory, setChatHistory] = useState([]);
    const [inputText, setInputText] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [isThinking, setIsThinking] = useState(false);

    const scrollViewRef = useRef();
    const recognitionRef = useRef(null);

    // Neural Canvas Background (Animated Glow)
    const floatAnim1 = useRef(new Animated.Value(0)).current;
    const floatAnim2 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(Animated.sequence([Animated.timing(floatAnim1, { toValue: 1, duration: 10000, useNativeDriver: true }), Animated.timing(floatAnim1, { toValue: 0, duration: 10000, useNativeDriver: true })])).start();
        Animated.loop(Animated.sequence([Animated.timing(floatAnim2, { toValue: 1, duration: 15000, useNativeDriver: true }), Animated.timing(floatAnim2, { toValue: 0, duration: 15000, useNativeDriver: true })])).start();
    }, []);

    // AntiCheat Setup
    const onTotalFailure = () => {
        if (Platform.OS === 'web') alert('🚨 INTEGRITY FAILURE: Too many violations. Session terminated.');
        else Alert.alert("🚨 INTEGRITY FAILURE", "Too many violations. Session terminated.");
        navigation.replace("Report");
    };
    const { violationCount, maxViolations } = useAntiCheat(onTotalFailure);

    useEffect(() => {
        setViolations(violationCount);
    }, [violationCount, setViolations]);

    // Timer Logic
    useEffect(() => {
        const interval = setInterval(() => setTimer(t => t + 1), 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60).toString().padStart(2, "0");
        const s = (secs % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    // Initialize Chat
    useEffect(() => {
        startInterview();
        setupWebSpeechRecognition();
        return () => {
            Speech.stop();
            if (recognitionRef.current) recognitionRef.current.stop();
        };
    }, []);

    const setupWebSpeechRecognition = () => {
        if (Platform.OS === 'web' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRec();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-IN';

            recognition.onresult = (event) => {
                let finalTranscript = "";
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript + " ";
                }
                if (finalTranscript) setInputText(prev => prev + finalTranscript);
            };

            recognition.onerror = (e) => console.log("Speech Reg Error", e);
            recognition.onend = () => {
                if (isRecording) { try { recognition.start(); } catch (e) { } }
            };
            recognitionRef.current = recognition;
        }
    };

    const toggleMic = () => {
        if (Platform.OS !== 'web') {
            Alert.alert("Notice", "Live speech recognition in this demo is optimized for Web (Chrome). Please use the keyboard for Native.");
            return;
        }
        if (isRecording) {
            setIsRecording(false);
            if (recognitionRef.current) recognitionRef.current.stop();
        } else {
            setIsRecording(true);
            if (recognitionRef.current) {
                try { recognitionRef.current.start(); } catch (e) { }
            }
        }
    };

    const startInterview = async () => {
        const introText = "Hello! I'm your interviewer for the SWE role. Let's begin.\n\n\"Before you write any code, please walk me through your approach to the problem you are going to solve.\"";
        setChatHistory([{ role: 'assistant', content: introText }]);
        speakText(introText.split("\n\n")[1].replace(/"/g, ''));

        setIsThinking(true);
        const problemPrompt = "Give me a challenging Data Structure problem statement, but DO NOT ask me a follow-up question yet. Just present the problem.";
        const res = await callGroqAPI(problemPrompt, []);
        setIsThinking(false);

        if (res) {
            parseAndAddAIResponse(res);
        }
    };

    const buildSystemPrompt = () => {
        return `You are a strict, highly experienced, and professional hiring manager conducting a LIVE technical interview for a Software Engineer position. Focus on Javascript, algorithms, and system design.
        
YOUR BEHAVIOR RULES:
1. You are conducting a real, conversational interview. Answer directly.
2. If the candidate answers poorly, correct them briefly.
3. IF ASKING A CODING QUESTION, provide EXACT code skeleton inside a markdown javascript block (e.g. \`\`\`javascript ).
4. Keep spoken responses EXTREMELY SHORT (under 40 words).
5. Only answer with text. Never output markdown outside of the coding block.`;
    };

    const callGroqAPI = async (userMsg, history) => {
        try {
            const formattedHistory = history.map(h => ({ role: h.role === 'model' || h.role === 'assistant' ? 'assistant' : 'user', content: h.content }));
            const res = await fetch("https://api.com.groq.com/v1/chat/completions", { // Fixed to official endpoint below if fails
                method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
                body: JSON.stringify({ model: "llama-3.1-8b-instant", messages: [{ role: "system", content: buildSystemPrompt() }, ...formattedHistory, { role: "user", content: userMsg }], temperature: 0.7, max_tokens: 500 })
            });
            if (!res.ok) {
                // Try official fallback url if the above proxy url is dead
                const res2 = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
                    body: JSON.stringify({ model: "llama-3.1-8b-instant", messages: [{ role: "system", content: buildSystemPrompt() }, ...formattedHistory, { role: "user", content: userMsg }], temperature: 0.7, max_tokens: 500 })
                });
                const data2 = await res2.json();
                return data2.choices?.[0]?.message?.content || null;
            }
            const data = await res.json();
            return data.choices?.[0]?.message?.content || null;
        } catch (e) { console.error("Groq err:", e); return null; }
    };

    const parseAndAddAIResponse = (text) => {
        let cleanText = text;
        const codeMatch = text.match(/```(?:javascript|js|python|java|cpp)?\n([\s\S]*?)```/i);
        if (codeMatch) {
            const extractedCode = codeMatch[1].trim();
            setCode(prev => prev + `\n\n// Interviewer says:\n${extractedCode}`);
            cleanText = text.replace(/```(?:javascript|js|python|java|cpp)?\n[\s\S]*?```/i, "\n*(Code placed in editor)*\n");
        }
        setChatHistory(prev => [...prev, { role: 'assistant', content: cleanText }]);
        speakText(cleanText);
    };

    const speakText = (text) => {
        const clean = text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/`(.*?)`/g, "$1").replace(/\*(Code placed in editor)\*/gi, "").trim();
        if (!clean) return;
        Speech.speak(clean, { language: 'en', rate: 1.05, pitch: 1.0 });
    };

    const submitAnswer = async () => {
        if (isRecording) toggleMic();
        const text = inputText.trim();
        if (!text) return;

        setInputText("");
        const newHistory = [...chatHistory, { role: 'user', content: text }];
        setChatHistory(newHistory);

        setIsThinking(true);
        let codeContext = "";
        if (code && !code.includes("Write your solution below")) {
            codeContext = `\n\n[Candidate's Current Code]:\n\`\`\`javascript\n${code}\n\`\`\``;
        }

        const aiResponse = await callGroqAPI(text + codeContext, newHistory);
        setIsThinking(false);

        if (aiResponse) {
            parseAndAddAIResponse(aiResponse);
            setScore(prev => prev + 1); // increment score just for continuing conversation as basic metric
        } else {
            const fallback = "Hmm, let me rephrase. Can you explain your logic again?";
            setChatHistory(prev => [...prev, { role: 'assistant', content: fallback }]);
            speakText(fallback);
        }
    };

    const runCodeLocal = () => {
        setTerminalOutput("Running...");
        try {
            let logs = [];
            const ogLog = console.log;
            console.log = (...args) => { logs.push(args.join(" ")); ogLog(...args); };

            // eslint-disable-next-line no-new-func
            const result = new Function(code)();
            console.log = ogLog;

            if (logs.length > 0) setTerminalOutput(`$ Output:\n${logs.join("\n")}${result !== undefined ? "\nReturned: " + result : ""}`);
            else setTerminalOutput(`$ Output:\nExecution finished. No console output.${result !== undefined ? "\nReturned: " + result : ""}`);
        } catch (e) {
            setTerminalOutput(`$ Error:\n${e.message}`);
        }
    };

    const enableCamera = async () => {
        if (!permission?.granted) {
            const req = await requestPermission();
            if (req.granted) setCameraActive(true);
        } else {
            setCameraActive(true);
        }
    };

    const endInterview = () => {
        if (Platform.OS === 'web') {
            if (window.confirm("End Interview & Generate Report?")) navigation.replace("Report");
        } else {
            Alert.alert("End Interview", "Are you sure you want to finish?", [
                { text: 'Cancel', style: 'cancel' },
                { text: 'End Now', onPress: () => navigation.replace("Report") }
            ]);
        }
    };

    const isDesktop = width > 768;

    return (
        <SafeAreaView style={styles.container}>
            {/* Neural Canvas Background Proxy */}
            <View style={StyleSheet.absoluteFillObject}>
                <Animated.View style={[styles.bgCircle, { top: -100, left: -100, backgroundColor: 'rgba(99, 102, 241, 0.1)', transform: [{ scale: floatAnim1.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) }] }]} />
                <Animated.View style={[styles.bgCircle, { bottom: -100, right: -100, backgroundColor: 'rgba(168, 85, 247, 0.1)', transform: [{ scale: floatAnim2.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] }) }] }]} />
            </View>

            {/* Header */}
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={styles.recordDot} />
                    <Text style={styles.domainTitle}>Software Engineering</Text>
                    {violationCount > 0 && <Text style={{ color: 'red', fontSize: 12, marginLeft: 10 }}>Flags: {violationCount}</Text>}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={styles.timerBadge}>
                        <Timer size={14} color="#9ca3af" />
                        <Text style={styles.timerText}>{formatTime(timer)}</Text>
                    </View>
                    <TouchableOpacity style={styles.endBtn} onPress={endInterview}>
                        <Text style={styles.endBtnText}>End</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <KeyboardAvoidingView style={styles.mainLayout} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View style={[styles.contentSplit, { flexDirection: isDesktop ? 'row' : 'column' }]}>

                    {/* LEFT SIDE: Code Editor */}
                    <View style={[styles.leftSection, isDesktop && { borderRightWidth: 1 }]}>
                        <View style={styles.editorHeader}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Code2 size={16} color="#34d399" />
                                <Text style={styles.filename}>solution.js</Text>
                            </View>
                            <TouchableOpacity style={styles.runBtn} onPress={runCodeLocal}>
                                <Play size={12} color="#34d399" />
                                <Text style={styles.runBtnText}>Run</Text>
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={styles.editorBody}
                            multiline
                            textAlignVertical="top"
                            value={code}
                            onChangeText={setCode}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        {/* Terminal Area */}
                        {terminalOutput ? (
                            <View style={styles.terminalArea}>
                                <Text style={styles.terminalText}>{terminalOutput}</Text>
                            </View>
                        ) : null}
                    </View>

                    {/* RIGHT SIDE: Video & Transcript */}
                    <View style={styles.rightSection}>

                        {/* Video Top Half */}
                        <View style={styles.videoHalf}>
                            {/* AI Video Simulate */}
                            <View style={styles.aiVideoArea}>
                                <View style={styles.aiBotCircle}>
                                    <Bot size={40} color="white" />
                                </View>
                                {isThinking && (
                                    <View style={styles.aiStatusBadge}>
                                        <View style={[styles.recordDot, { backgroundColor: '#818cf8', width: 6, height: 6 }]} />
                                        <Text style={{ color: '#818cf8', fontSize: 10, fontFamily: 'monospace' }}>Analyzing...</Text>
                                    </View>
                                )}
                            </View>

                            {/* User PIP Video */}
                            <View style={styles.pipVideoContainer}>
                                {cameraActive ? (
                                    <CameraView style={StyleSheet.absoluteFillObject} facing="front" />
                                ) : (
                                    <TouchableOpacity style={styles.pipPlaceholder} onPress={enableCamera}>
                                        <View style={styles.enableCamBtn}><Video size={16} color="white" /></View>
                                        <Text style={{ color: '#9ca3af', fontSize: 8, marginTop: 4 }}>Enable</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {/* Chat / Transcript Bottom Half */}
                        <View style={styles.chatHalf}>
                            <View style={styles.chatHeader}>
                                <Text style={styles.chatHeaderText}>Live Transcript</Text>
                            </View>
                            <ScrollView
                                style={styles.chatScroll}
                                contentContainerStyle={{ padding: 16, gap: 16 }}
                                ref={scrollViewRef}
                                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                            >
                                {chatHistory.map((chat, i) => (
                                    <View key={i} style={chat.role === 'user' ? styles.bubbleUser : styles.bubbleAi}>
                                        <Text style={[styles.bubbleText, chat.role === 'user' ? { color: '#e9d5ff' } : { color: '#e0e7ff' }]}>
                                            {Platform.OS === 'web' ? <span dangerouslySetInnerHTML={{ __html: chat.content.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>").replace(/\n/g, "<br/>") }} /> : chat.content.replace(/\*\*(.*?)\*\*/g, "$1")}
                                        </Text>
                                    </View>
                                ))}
                            </ScrollView>

                            <View style={styles.inputArea}>
                                <TextInput
                                    style={styles.chatInput}
                                    placeholder={isRecording ? "Listening... (Speak now)" : "Type your technical approach here..."}
                                    placeholderTextColor="#64748b"
                                    value={inputText}
                                    onChangeText={setInputText}
                                    multiline
                                />
                                <View style={styles.inputControls}>
                                    <TouchableOpacity style={[styles.micBtn, isRecording && styles.micBtnActive]} onPress={toggleMic}>
                                        <Mic size={18} color="white" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.replyBtn} onPress={submitAnswer}>
                                        <Text style={styles.replyBtnText}>Reply</Text>
                                        <Send size={14} color="white" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>

                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.colors.background },
    bgCircle: { width: 400, height: 400, borderRadius: 200, position: 'absolute', filter: Platform.OS === 'web' ? 'blur(100px)' : 'none' },
    header: { height: 56, backgroundColor: 'rgba(30, 41, 59, 0.7)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.1)', zIndex: 50 },
    recordDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },
    domainTitle: { color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.5 },
    timerBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(30,41,59,0.8)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    timerText: { color: 'white', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 13 },
    endBtn: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    endBtnText: { color: '#f87171', fontWeight: 'bold', fontSize: 13 },

    mainLayout: { flex: 1 },
    contentSplit: { flex: 1 },
    leftSection: { flex: 1.5, backgroundColor: '#1e1e1e', borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
    editorHeader: { height: 40, backgroundColor: '#2d2d2d', borderBottomWidth: 1, borderColor: 'black', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
    filename: { color: '#d1d5db', fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
    runBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(52, 211, 153, 0.2)', borderWidth: 1, borderColor: 'rgba(52, 211, 153, 0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6 },
    runBtnText: { color: '#34d399', fontSize: 12, fontWeight: 'bold' },
    editorBody: { flex: 1, padding: 16, color: '#d4d4d4', fontSize: 14, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
    terminalArea: { height: 120, backgroundColor: '#1e1e1e', borderTopWidth: 1, borderColor: '#333', padding: 12 },
    terminalText: { color: '#d4d4d4', fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },

    rightSection: { flex: 1, backgroundColor: '#0f172a' },
    videoHalf: { flex: 0.8, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'black', overflow: 'hidden' },
    aiVideoArea: { flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' },
    aiBotCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', shadowColor: '#6366f1', shadowOpacity: 0.8, shadowRadius: 20, shadowOffset: { height: 0, width: 0 } },
    aiStatusBadge: { position: 'absolute', bottom: 10, left: 10, backgroundColor: 'rgba(15,23,42,0.8)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(99,102,241,0.3)', flexDirection: 'row', alignItems: 'center', gap: 6 },
    pipVideoContainer: { position: 'absolute', top: 12, right: 12, width: 110, height: 150, backgroundColor: '#1e293b', borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    pipPlaceholder: { flex: 1, backgroundColor: 'rgba(30,41,59,0.9)', alignItems: 'center', justifyContent: 'center' },
    enableCamBtn: { backgroundColor: '#4f46e5', padding: 10, borderRadius: 20 },

    chatHalf: { flex: 1.2, backgroundColor: 'rgba(15,23,42,0.5)' },
    chatHeader: { padding: 8, backgroundColor: 'rgba(30,41,59,0.5)', borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    chatHeaderText: { color: '#9ca3af', fontSize: 11, fontWeight: 'bold' },
    chatScroll: { flex: 1 },
    bubbleAi: { alignSelf: 'flex-start', backgroundColor: 'rgba(99, 102, 241, 0.15)', borderLeftWidth: 3, borderColor: '#6366f1', padding: 12, borderRadius: 16, borderTopLeftRadius: 4, maxWidth: '90%' },
    bubbleUser: { alignSelf: 'flex-end', backgroundColor: 'rgba(168, 85, 247, 0.15)', borderRightWidth: 3, borderColor: '#a855f7', padding: 12, borderRadius: 16, borderTopRightRadius: 4, maxWidth: '85%' },
    bubbleText: { fontSize: 13, lineHeight: 20 },

    inputArea: { padding: 12, backgroundColor: '#0f172a', borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)', gap: 10 },
    chatInput: { backgroundColor: 'rgba(30,41,59,0.8)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 12, color: '#e2e8f0', minHeight: 60 },
    inputControls: { flexDirection: 'row', gap: 10 },
    micBtn: { width: 44, height: 44, backgroundColor: '#334155', borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    micBtnActive: { backgroundColor: '#ef4444', borderColor: '#ef4444' },
    replyBtn: { flex: 1, backgroundColor: '#4f46e5', borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    replyBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14 }
});
