import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, TextInput, ScrollView, KeyboardAvoidingView, Platform, Dimensions, ActivityIndicator } from 'react-native';
import { HelpCircle, X, Send, Bot } from 'lucide-react-native';

const GROQ_API_KEY = "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";
const { height } = Dimensions.get('window');

const SYSTEM_PROMPT = `You are the MockMentor AI Help Desk Tutor. 
The user is currently taking a technical interview or assessment on the MockMentor platform. 
They have opened this Help Desk widget because they are stuck, confused, or want to learn a concept.
Your job is to be extremely supportive, friendly, and educational.
If they ask for a hint, give them a breadcrumb.
If they ask for the exact solution or code because they gave up, PROVIDE IT TO THEM clearly! 
We DO NOT want them leaving the platform to Google it. Give them whatever they need to learn and keep moving forward.`;

export default function HelpDeskWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([{ role: "ai", content: "Hi there! 👋 I am the MockMentor Help Desk AI.\n\nIf you are stuck on a concept, completely lost, or just need a hint on how to solve this, ask me anything! I am here to help you learn, not just test you." }]);
    const [inputText, setInputText] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    // Animations
    const slideAnim = useRef(new Animated.Value(height)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const scrollViewRef = useRef(null);

    const toggleOpen = () => {
        const toValue = isOpen ? 0 : 1;
        setIsOpen(!isOpen);

        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: isOpen ? height : 0,
                duration: 300,
                useNativeDriver: true
            }),
            Animated.timing(fadeAnim, {
                toValue: toValue,
                duration: 200,
                useNativeDriver: true
            }),
            Animated.spring(scaleAnim, {
                toValue: isOpen ? 0.8 : 1,
                friction: 6,
                useNativeDriver: true
            })
        ]).start();
    };

    const sendMessage = async () => {
        if (!inputText.trim() || isTyping) return;

        const userText = inputText.trim();
        const newMsg = { role: "user", content: userText };
        setMessages(prev => [...prev, newMsg]);
        setInputText("");
        setIsTyping(true);

        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

        try {
            const history = messages.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content }));
            const apiMessages = [{ role: "system", content: SYSTEM_PROMPT }, ...history, { role: "user", content: userText }];

            let res = await fetch("https://api.com.groq.com/v1/chat/completions", {
                method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
                body: JSON.stringify({ model: "llama-3.1-8b-instant", messages: apiMessages, temperature: 0.5 })
            });

            if (!res.ok) {
                res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
                    body: JSON.stringify({ model: "llama-3.1-8b-instant", messages: apiMessages, temperature: 0.5 })
                });
            }

            const data = await res.json();
            if (data.error) throw new Error("API Error");

            setMessages(prev => [...prev, { role: "ai", content: data.choices[0].message.content }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: "ai", content: "I'm having trouble connecting to the Help Desk server right now." }]);
        } finally {
            setIsTyping(false);
            setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
        }
    };

    return (
        <View style={styles.wrapper} pointerEvents="box-none">
            {/* Chat Window */}
            <Animated.View
                style={[
                    styles.windowContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                        pointerEvents: isOpen ? 'auto' : 'none'
                    }
                ]}
            >
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                    <View style={styles.header}>
                        <View style={styles.headerTitleBox}>
                            <View style={styles.pulseDot} />
                            <Text style={styles.headerTitle}>AI Help Desk</Text>
                        </View>
                        <TouchableOpacity onPress={toggleOpen} style={styles.closeBtn}>
                            <X size={20} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        ref={scrollViewRef}
                        contentContainerStyle={styles.chatBody}
                        showsVerticalScrollIndicator={true}
                    >
                        {messages.map((m, i) => (
                            <View key={i} style={[styles.msgWrapper, m.role === 'user' ? styles.msgWrapperUser : styles.msgWrapperAi]}>
                                {m.role === 'ai' && <View style={styles.aiAvatar}><Bot size={14} color="white" /></View>}
                                <View style={[styles.msgBubble, m.role === 'user' ? styles.msgUser : styles.msgAi]}>
                                    <Text style={[styles.msgText, { color: m.role === 'user' ? 'white' : '#e2e8f0' }]}>{m.content}</Text>
                                </View>
                            </View>
                        ))}
                        {isTyping && (
                            <View style={[styles.msgWrapper, styles.msgWrapperAi]}>
                                <View style={styles.aiAvatar}><Bot size={14} color="white" /></View>
                                <View style={[styles.msgBubble, styles.msgAi, { paddingHorizontal: 16, paddingVertical: 12 }]}>
                                    <ActivityIndicator size="small" color="#a5b4fc" />
                                </View>
                            </View>
                        )}
                    </ScrollView>

                    <View style={styles.inputArea}>
                        <TextInput
                            style={styles.input}
                            placeholder="Ask for a hint or solution..."
                            placeholderTextColor="#64748b"
                            value={inputText}
                            onChangeText={setInputText}
                            onSubmitEditing={sendMessage}
                        />
                        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
                            <Send size={18} color="white" />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Animated.View>

            {/* Floating FAB */}
            <TouchableOpacity style={styles.fab} onPress={toggleOpen} activeOpacity={0.8}>
                {isOpen ? <X size={28} color="white" /> : <HelpCircle size={28} color="white" />}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999 },
    fab: { position: 'absolute', bottom: 24, right: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: '#ec4899', alignItems: 'center', justifyContent: 'center', shadowColor: '#ec4899', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 10, borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
    windowContainer: { position: 'absolute', bottom: 96, right: 24, width: 350, height: 500, maxHeight: '80%', backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 25 }, shadowOpacity: 0.5, shadowRadius: 25, elevation: 15 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: 'rgba(236, 72, 153, 0.1)', borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.05)' },
    headerTitleBox: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981', shadowColor: '#10b981', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 5, elevation: 2 },
    headerTitle: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    closeBtn: { padding: 4, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.05)' },
    chatBody: { padding: 16, gap: 12, flexGrow: 1, justifyContent: 'flex-end' },
    msgWrapper: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 8, maxWidth: '85%' },
    msgWrapperUser: { alignSelf: 'flex-end' },
    msgWrapperAi: { alignSelf: 'flex-start', gap: 8 },
    aiAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#8b5cf6', alignItems: 'center', justifyContent: 'center' },
    msgBubble: { padding: 12, borderRadius: 16 },
    msgAi: { backgroundColor: 'rgba(139, 92, 246, 0.15)', borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.3)', borderBottomLeftRadius: 4 },
    msgUser: { backgroundColor: '#ec4899', borderBottomRightRadius: 4 },
    msgText: { fontSize: 14, lineHeight: 20 },
    inputArea: { flexDirection: 'row', padding: 16, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.05)', backgroundColor: 'rgba(15, 23, 42, 0.6)', gap: 8 },
    input: { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, color: 'white', fontSize: 14 },
    sendBtn: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#ec4899', alignItems: 'center', justifyContent: 'center' }
});
