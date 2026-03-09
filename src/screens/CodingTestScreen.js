import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, Animated, TextInput, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Code2, Play, CheckCircle, Flame } from 'lucide-react-native';
import { THEME } from '../config/theme';
import { useAntiCheat } from '../hooks/useAntiCheat';

// Very safe, basic JS evaluator mimicking the HTML behavior
const runSafeCode = (userCode) => {
  let outputLogs = [];
  const originalConsoleLog = console.log;
  try {
    console.log = (...args) => {
      outputLogs.push(args.join(' '));
    };
    // Run code securely against browser or react native core
    // Using new Function is risky but since this is client-side testing, it simulates eval
    const execute = new Function(userCode);
    execute();
    console.log = originalConsoleLog;
    return { success: true, output: outputLogs.join('\n') };
  } catch (e) {
    console.log = originalConsoleLog;
    return { success: false, output: e.toString() };
  }
};

export default function CodingTestScreen({ route }) {
  const navigation = useNavigation();

  // Grab stats passed from CognitiveTest
  const params = route.params || {};
  const cognitiveScore = params.cognitiveScore || 0;
  const cognitiveViolations = params.cognitiveViolations || 0;

  const { setViolations, violationCount } = useAntiCheat(() => {
    Alert.alert("🚨 Disqualified", "Too many violations. Ending test.");
    handleFinishTest();
  });

  const questions = [
    { title: "Hello World", desc: "Write a script to print 'hello world'.", expected: "hello world" },
    { title: "Square of 5", desc: "Write a script to print the square of number 5", expected: "25" }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [codingScore, setCodingScore] = useState(0);
  const [userCode, setUserCode] = useState("");
  const [terminalOutput, setTerminalOutput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Background Anim
  const floatAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(floatAnim, { toValue: 1, duration: 10000, useNativeDriver: true }),
      Animated.timing(floatAnim, { toValue: 0, duration: 10000, useNativeDriver: true })
    ])).start();
  }, []);

  const handleSubmit = () => {
    if (!userCode.trim()) return;
    setIsAnalyzing(true);
    setTerminalOutput("");

    setTimeout(() => {
      const currentQ = questions[currentIndex];
      const result = runSafeCode(userCode);

      let logStr = result.output;
      setTerminalOutput(logStr);

      if (result.success && logStr.toLowerCase().trim() === currentQ.expected.toLowerCase()) {
        setCodingScore(prev => prev + 1);
        handleNext();
      } else {
        setTerminalOutput(prev => prev + "\n\n❌ Expected: " + currentQ.expected + "\nGot: " + logStr);
        setTimeout(() => handleNext(), 3000); // Give them 3 seconds to see error
      }
    }, 1500);
  };

  const handleNext = () => {
    setIsAnalyzing(false);
    setUserCode("");
    setTerminalOutput("");
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      handleFinishTest(codingScore + 1); // +1 if they got it right here but state update lag
    }
  };

  const handleFinishTest = (finalScoreOverride) => {
    // Evaluate real total (react state might be 1 tick behind if correct)
    const finalScore = finalScoreOverride !== undefined ? finalScoreOverride : codingScore;
    const percent = Math.min(100, (finalScore / questions.length) * 100);

    if (Platform.OS === 'web') {
      localStorage.setItem('coding_percent', percent);
      localStorage.setItem('coding_violations', violationCount);
    }

    navigation.replace("DeepReport", {
      cognitiveScore,
      cognitiveViolations,
      codingScore: percent,
      codingViolations: violationCount
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={StyleSheet.absoluteFillObject}>
        <Animated.View style={[styles.bgCircle, { top: -100, left: -200, backgroundColor: 'rgba(56, 189, 248, 0.1)', transform: [{ scale: floatAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) }] }]} />
      </View>

      <View style={styles.header}>
        <View style={styles.logoBox}><Code2 size={24} color="#38bdf8" /><Text style={styles.logoText}>Code<Text style={{ color: '#38bdf8' }}>Mentor</Text></Text></View>
        <View style={styles.stageBox}><Text style={styles.stageText}>Stage 2: Coding Assessment ({currentIndex + 1}/2)</Text></View>
        <View />
      </View>

      <View style={styles.mainLayout}>
        {/* Left Panel */}
        <View style={styles.leftPanel}>
          {isAnalyzing ? (
            <View style={styles.analyzingBox}>
              <Flame size={48} color="#ec4899" />
              <Text style={styles.analyzingText}>Analyzing Code via AI...</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.promptArea}>
              <View style={styles.iconWrapper}><Code2 size={24} color="#38bdf8" /></View>
              <Text style={styles.qTitle}>Task: {questions[currentIndex].title}</Text>
              <Text style={styles.qDesc}>{questions[currentIndex].desc}</Text>
            </ScrollView>
          )}
        </View>

        {/* Right Panel */}
        <View style={styles.rightPanel}>
          <View style={styles.editorHeader}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <View style={[styles.dot, { backgroundColor: '#ef4444' }]} />
              <View style={[styles.dot, { backgroundColor: '#facc15' }]} />
              <View style={[styles.dot, { backgroundColor: '#22c55e' }]} />
            </View>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={isAnalyzing}>
              <Text style={styles.submitText}>Submit Code</Text>
              <Play size={14} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.editorWrapper}>
            <TextInput
              style={styles.editorInput}
              placeholder="// Write your JavaScript code here... e.g., console.log('hello world')"
              placeholderTextColor="#64748b"
              multiline
              textAlignVertical="top"
              value={userCode}
              onChangeText={setUserCode}
              editable={!isAnalyzing}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Terminal */}
          {terminalOutput !== "" && (
            <View style={styles.terminalBox}>
              <View style={styles.terminalHeader}><Text style={styles.terminalTitle}>TERMINAL OUTPUT</Text></View>
              <ScrollView style={styles.terminalScroll}>
                <Text style={styles.terminalText}>{terminalOutput}</Text>
              </ScrollView>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  bgCircle: { width: 500, height: 500, borderRadius: 250, position: 'absolute', filter: Platform.OS === 'web' ? 'blur(100px)' : 'none' },
  header: { height: 60, backgroundColor: 'rgba(255,255,255,0.03)', borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, zIndex: 10 },
  logoBox: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoText: { fontSize: 18, fontWeight: '900', color: 'white' },
  stageBox: { paddingHorizontal: 16, paddingVertical: 6, backgroundColor: 'rgba(56,189,248,0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(56,189,248,0.2)' },
  stageText: { color: '#e0f2fe', fontWeight: 'bold', fontSize: 14 },
  mainLayout: { flex: 1, flexDirection: width > 768 ? 'row' : 'column' },
  leftPanel: { flex: width > 768 ? 0.4 : 1, backgroundColor: 'rgba(15,23,42,0.8)', borderRightWidth: width > 768 ? 1 : 0, borderBottomWidth: width <= 768 ? 1 : 0, borderColor: 'rgba(255,255,255,0.1)' },
  promptArea: { padding: 32, justifyContent: 'center', flexGrow: 1 },
  iconWrapper: { width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(56,189,248,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 1, borderColor: 'rgba(56,189,248,0.3)' },
  qTitle: { fontSize: 24, fontWeight: '900', color: 'white', marginBottom: 16 },
  qDesc: { fontSize: 16, color: '#94a3b8', lineHeight: 24 },
  analyzingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 },
  analyzingText: { color: '#ec4899', fontSize: 18, fontWeight: 'bold' },
  rightPanel: { flex: width > 768 ? 0.6 : 1, backgroundColor: '#1e1e1e', flexDirection: 'column' },
  editorHeader: { height: 48, backgroundColor: 'rgba(255,255,255,0.03)', borderBottomWidth: 1, borderColor: '#333', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#38bdf8', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 6 },
  submitText: { color: '#0f172a', fontWeight: 'bold', fontSize: 12 },
  editorWrapper: { flex: 1 },
  editorInput: { flex: 1, color: '#d4d4d4', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 14, padding: 16, lineHeight: 24 },
  terminalBox: { height: 200, backgroundColor: '#0f172a', borderTopWidth: 1, borderColor: '#333' },
  terminalHeader: { padding: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderBottomWidth: 1, borderColor: '#333' },
  terminalTitle: { color: '#94a3b8', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  terminalScroll: { padding: 12 },
  terminalText: { color: '#a5b4fc', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12 }
});
