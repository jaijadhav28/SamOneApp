import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, Animated, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Brain, CheckCircle, ArrowRight, Check, X } from 'lucide-react-native';
import { THEME } from '../config/theme';
import { useAntiCheat } from '../hooks/useAntiCheat';
import { useInterview } from '../context/InterviewContext';

const COGNITIVE_POOL = [
  { question: "What comes next? 2, 6, 12, 20, ?", options: ["28", "30", "26", "32"], answer: "30" },
  { question: "If A=1, B=2, C=3, what is CAT?", options: ["24", "20", "15", "10"], answer: "24" },
  { question: "Find odd one: Apple, Mango, Carrot, Banana", options: ["Apple", "Carrot", "Banana", "Mango"], answer: "Carrot" },
  { question: "Clock angle at 3:15?", options: ["0°", "7.5°", "15°", "30°"], answer: "7.5°" },
  { question: "2x = 10, x=?", options: ["5", "10", "2", "20"], answer: "5" },
  { question: "Shape with 8 sides?", options: ["Hexagon", "Octagon", "Pentagon", "Heptagon"], answer: "Octagon" },
  { question: "15% of 200?", options: ["25", "30", "35", "40"], answer: "30" },
  { question: "3, 9, 27, ?", options: ["54", "81", "72", "63"], answer: "81" },
  { question: "ALL BLOOPS are RAZZIES. Are BLOOPS LUPPIES?", options: ["Yes", "No", "Cannot Determine", "Sometimes"], answer: "Yes" },
  { question: "12 × 12?", options: ["124", "144", "132", "154"], answer: "144" }
];

export default function CognitiveTestScreen({ route }) {
  const navigation = useNavigation();
  const { setViolations } = useInterview();
  // Retrieve passed params if any
  const domain = route.params?.domain || 'General';
  const context = route.params?.context || 'No Context';
  const sessionId = route.params?.sessionId || 'test_session';
  const resumeContext = route.params?.resumeContext || '';

  const questions = useMemo(() => {
    const shuffled = [...COGNITIVE_POOL].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 10);
  }, []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [cognitiveScore, setCognitiveScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isEvaluated, setIsEvaluated] = useState(false);

  // Anti-cheat
  const { violationCount } = useAntiCheat(() => {
    // total failure logic
    alert("🚨 Integrity Failure: Too many violations.");
    navigation.replace("Report");
  });

  useEffect(() => {
    setViolations(violationCount);
  }, [violationCount, setViolations]);

  // Background Animation
  const floatAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(floatAnim, { toValue: 1, duration: 10000, useNativeDriver: true }),
      Animated.timing(floatAnim, { toValue: 0, duration: 10000, useNativeDriver: true })
    ])).start();
  }, []);

  // Progress Bar Anim
  const progressAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const percent = ((isEvaluated ? currentIndex + 1 : currentIndex) / questions.length) * 100;
    Animated.timing(progressAnim, {
      toValue: percent,
      duration: 500,
      useNativeDriver: false
    }).start();
  }, [currentIndex, isEvaluated, questions.length]);

  const evaluateQuestion = () => {
    if (!selectedOption) return;
    const currentQ = questions[currentIndex];
    const isCorrect = selectedOption === currentQ.answer;
    if (isCorrect) setCognitiveScore(prev => prev + 1);
    setIsEvaluated(true);
  };

  const nextQuestion = () => {
    setCurrentIndex(prev => prev + 1);
    setSelectedOption(null);
    setIsEvaluated(false);
  };

  const submitTest = () => {
    const percent = (cognitiveScore / questions.length) * 100;
    if (Platform.OS === 'web') {
      localStorage.setItem("cognitive_percent", percent.toString());
      localStorage.setItem("cognitive_violations", violationCount.toString());
    }
    navigation.replace("Interview", {
      domain, context, sessionId, resumeContext,
      cognitiveScore: percent, cognitiveViolations: violationCount
    });
  };

  const currentQ = questions[currentIndex];
  const isLastQ = currentIndex === questions.length - 1;
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%']
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={StyleSheet.absoluteFillObject}>
        <Animated.View style={[styles.bgCircle, { top: '30%', left: -200, backgroundColor: 'rgba(6, 182, 212, 0.1)', transform: [{ scale: floatAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) }] }]} />
        <Animated.View style={[styles.bgCircle, { bottom: -100, right: -100, backgroundColor: 'rgba(99, 102, 241, 0.1)' }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.panel}>
          <View style={styles.header}>
            <View style={styles.iconBox}>
              <Brain size={32} color="#22d3ee" />
            </View>
            <Text style={styles.title}>Stage 1: Cognitive Reasoning</Text>
            <Text style={styles.subtitle}>Answer these {questions.length} rapid-fire questions to test your logical aptitude.</Text>
          </View>

          <View style={styles.progressContainer}>
            <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
          </View>

          <View style={styles.qBlock}>
            <Text style={styles.qText}>
              <Text style={styles.qNum}>Q{currentIndex + 1}/{questions.length}: </Text>
              {currentQ.question}
            </Text>

            <View style={styles.optionsGrid}>
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === opt;
                const isCorrectAnswer = opt === currentQ.answer;

                let optStyle = styles.optionItem;
                let borderStyle = styles.optionBorder;
                let radioInner = null;

                if (isEvaluated) {
                  if (isSelected && isCorrectAnswer) {
                    optStyle = [styles.optionItem, styles.optionCorrect];
                    borderStyle = [styles.optionBorder, { borderColor: '#22c55e' }];
                  } else if (isSelected && !isCorrectAnswer) {
                    optStyle = [styles.optionItem, styles.optionIncorrect];
                    borderStyle = [styles.optionBorder, { borderColor: '#ef4444' }];
                  } else if (isCorrectAnswer) {
                    // highlight correct answer if they missed it
                    optStyle = [styles.optionItem, { borderColor: '#22c55e', borderWidth: 1 }];
                  }
                } else if (isSelected) {
                  optStyle = [styles.optionItem, styles.optionSelected];
                  radioInner = <View style={styles.radioFilled} />;
                }

                return (
                  <TouchableOpacity
                    key={idx}
                    style={optStyle}
                    onPress={() => !isEvaluated && setSelectedOption(opt)}
                    activeOpacity={isEvaluated ? 1 : 0.7}
                  >
                    <View style={borderStyle}>{radioInner}</View>
                    <Text style={styles.optText}>{opt}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {isEvaluated && (
              <View style={[styles.feedbackBox, selectedOption === currentQ.answer ? styles.feedbackCorrect : styles.feedbackIncorrect]}>
                {selectedOption === currentQ.answer ? (
                  <><Check size={20} color="#4ade80" /><Text style={styles.feedbackTextCorrect}>Correct! Brilliant logic.</Text></>
                ) : (
                  <><X size={20} color="#f87171" /><Text style={styles.feedbackTextIncorrect}>Incorrect. The correct answer was: {currentQ.answer}</Text></>
                )}
              </View>
            )}

            <View style={styles.controls}>
              {!isEvaluated ? (
                <TouchableOpacity
                  style={[styles.btn, !selectedOption ? styles.btnDisabled : styles.btnEval]}
                  onPress={evaluateQuestion}
                  disabled={!selectedOption}
                >
                  <CheckCircle size={18} color="white" />
                  <Text style={styles.btnText}>Evaluate Answer</Text>
                </TouchableOpacity>
              ) : (
                isLastQ ? (
                  <TouchableOpacity style={[styles.btn, styles.btnNext]} onPress={submitTest}>
                    <Text style={styles.btnText}>Submit & Continue to Coding</Text>
                    <ArrowRight size={18} color="white" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={[styles.btn, styles.btnNext]} onPress={nextQuestion}>
                    <Text style={styles.btnText}>Next</Text>
                    <ArrowRight size={18} color="white" />
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background },
  bgCircle: { width: 500, height: 500, borderRadius: 250, position: 'absolute', filter: Platform.OS === 'web' ? 'blur(100px)' : 'none' },
  scrollContent: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  panel: { width: '100%', maxWidth: 768, backgroundColor: 'rgba(30,41,59,0.7)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 24, padding: 32 },
  header: { alignItems: 'center', marginBottom: 32 },
  iconBox: { width: 64, height: 64, borderRadius: 16, backgroundColor: 'rgba(6,182,212,0.2)', borderWidth: 1, borderColor: 'rgba(6,182,212,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '900', color: 'white', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#9ca3af', textAlign: 'center' },
  progressContainer: { width: '100%', height: 8, backgroundColor: '#1e293b', borderRadius: 4, overflow: 'hidden', marginBottom: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  progressBar: { height: '100%', backgroundColor: '#22d3ee', borderRadius: 4 },
  qBlock: { backgroundColor: 'rgba(15,23,42,0.5)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 24 },
  qText: { fontSize: 18, fontWeight: '600', color: '#cffafe', marginBottom: 24 },
  qNum: { color: '#22d3ee' },
  optionsGrid: { gap: 12, marginBottom: 24 },
  optionItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'transparent' },
  optionSelected: { borderColor: 'rgba(34,211,238,0.5)', backgroundColor: 'rgba(34,211,238,0.05)' },
  optionCorrect: { borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.2)' },
  optionIncorrect: { borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.2)' },
  optionBorder: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  radioFilled: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#22d3ee' },
  optText: { color: '#d1d5db', fontSize: 15 },
  feedbackBox: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 24 },
  feedbackCorrect: { borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.1)' },
  feedbackIncorrect: { borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)' },
  feedbackTextCorrect: { color: '#4ade80', fontWeight: 'bold' },
  feedbackTextIncorrect: { color: '#f87171', fontWeight: 'bold' },
  controls: { flexDirection: 'row', justifyContent: 'flex-end' },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  btnEval: { backgroundColor: '#4f46e5' },
  btnNext: { backgroundColor: '#0891b2' },
  btnDisabled: { backgroundColor: '#334155', opacity: 0.5 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 14 }
});
