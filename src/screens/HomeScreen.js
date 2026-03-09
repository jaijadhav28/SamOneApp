import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Platform, Dimensions, Animated, TextInput, Modal, Alert, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { THEME } from '../config/theme';
import GlowWrapper from '../components/GlowWrapper';
import { BrainCircuit, ArrowRight, ChevronDown, Mic, Code2, FileCheck2, Scale, BarChart as ChartIcon, Sparkles, Chrome, LayoutGrid, ShoppingBag, Youtube, Facebook, Zap, ExternalLink, Milestone, CheckCircle2, Check, Clock, Users, Building2, Send, X, Hammer, LayoutDashboard, LogOut } from 'lucide-react-native';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
    const navigation = useNavigation();
    const scrollY = useRef(new Animated.Value(0)).current;

    const [user, setUser] = useState(null);
    const [authModalVisible, setAuthModalVisible] = useState(false);
    const [upiModalVisible, setUpiModalVisible] = useState(false);
    const [isSignup, setIsSignup] = useState(false);

    // Auth Form State
    const [authName, setAuthName] = useState('');
    const [authEmail, setAuthEmail] = useState('');
    const [authPass, setAuthPass] = useState('');
    const [authLoading, setAuthLoading] = useState(false);

    // Contact Form State
    const [contactName, setContactName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactBody, setContactBody] = useState('');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return unsubscribe;
    }, []);

    const handleAuthAction = async () => {
        if (!authEmail || !authPass) return Alert.alert("Error", "Email and Password required");
        setAuthLoading(true);
        try {
            if (isSignup) {
                const res = await createUserWithEmailAndPassword(auth, authEmail, authPass);
                await setDoc(doc(db, "users", res.user.uid), {
                    name: authName, email: authEmail, interviewsCompleted: 0, totalScore: 0
                });
            } else {
                await signInWithEmailAndPassword(auth, authEmail, authPass);
            }
            setAuthModalVisible(false);
        } catch (error) {
            Alert.alert("Auth Error", error.message);
        }
        setAuthLoading(false);
    };

    const handleStartInterview = () => {
        if (user) {
            navigation.navigate('Interview');
        } else {
            setAuthModalVisible(true);
        }
    };

    const sendFeedback = async () => {
        if (!contactName || !contactEmail || !contactBody) return Alert.alert("Hold on", "Please fill all fields!");
        try {
            await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    access_key: "04ae9ad5-7457-4f31-9d82-51f6dc9e9f6a",
                    name: contactName, email: contactEmail, message: contactBody
                })
            });
            Alert.alert("Success", "Feedback sent successfully!");
            setContactBody('');
        } catch (e) {
            Alert.alert("Error", "Could not send message");
        }
    }

    return (
        <View style={styles.container}>
            {/* Neural Canvas Background Proxy */}
            <View style={StyleSheet.absoluteFillObject}>
                <Animated.View style={[styles.bgCircle, { top: -100, left: -100, backgroundColor: 'rgba(99, 102, 241, 0.1)', opacity: scrollY.interpolate({ inputRange: [0, 500], outputRange: [1, 0.2] }) }]} />
                <View style={[styles.bgCircle, { bottom: -100, right: -100, backgroundColor: 'rgba(6, 182, 212, 0.1)' }]} />
            </View>

            {/* Navigation */}
            <View style={styles.navBar}>
                <View style={styles.navLeft}>
                    <View style={styles.iconBox}><BrainCircuit size={20} color={THEME.colors.primary} /></View>
                    <View>
                        <Text style={styles.navTitle}>Mock<Text style={{ color: THEME.colors.primary }}>Mentor</Text></Text>
                        <Text style={styles.navSubtitle}>Shaping Tomorrow's Professionals</Text>
                    </View>
                </View>
                {user ? (
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <TouchableOpacity style={[styles.loginBtn, { backgroundColor: 'rgba(99,102,241,0.2)', borderWidth: 1, borderColor: THEME.colors.primary }]} onPress={handleStartInterview}>
                            <LayoutDashboard size={14} color={THEME.colors.primary} />
                            <Text style={[styles.loginBtnText, { color: THEME.colors.primary, marginLeft: 6 }]}>Dashboard</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => signOut(auth)} style={{ padding: 8 }}><LogOut size={20} color="#f87171" /></TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.loginBtn} onPress={() => setAuthModalVisible(true)}>
                        <Text style={styles.loginBtnText}>Login</Text>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView
                style={styles.scrollView}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero */}
                <View style={styles.heroSection}>
                    <View style={styles.badge}><View style={styles.badgeDot} /><Text style={styles.badgeText}>V2.0 Now Live</Text></View>
                    <Text style={styles.heroTitle}>Refining Talent{'\n'}<Text style={{ color: THEME.colors.primary }}>Via Intelligence</Text></Text>
                    <Text style={styles.heroDesc}>
                        The world's most advanced AI interview simulator. We don't just grade your answers; we analyze your <Text style={{ fontWeight: 'bold', color: 'white' }}>logic</Text>, <Text style={{ fontWeight: 'bold', color: 'white' }}>confidence</Text>, and <Text style={{ fontWeight: 'bold', color: 'white' }}>potential</Text>.
                    </Text>
                    <View style={styles.heroActions}>
                        <TouchableOpacity style={styles.primaryCta} onPress={handleStartInterview}>
                            <Text style={styles.primaryCtaText}>Start Interview</Text>
                            <ArrowRight size={18} color={THEME.colors.background} />
                        </TouchableOpacity>
                    </View>
                    <ChevronDown size={32} color={THEME.colors.textMuted} style={{ marginTop: 60, alignSelf: 'center' }} />
                </View>

                {/* Trust Sponsors */}
                <View style={styles.trustSection}>
                    <Text style={styles.trustTitle}>TRUSTED BY STUDENTS AIMING FOR</Text>
                    <View style={styles.trustGrid}>
                        <View style={styles.trustItem}><Chrome size={24} color="#60a5fa" /><Text style={styles.trustText}>Google</Text></View>
                        <View style={styles.trustItem}><LayoutGrid size={24} color="#4ade80" /><Text style={styles.trustText}>Microsoft</Text></View>
                        <View style={styles.trustItem}><ShoppingBag size={24} color="#facc15" /><Text style={styles.trustText}>Amazon</Text></View>
                        <View style={styles.trustItem}><Youtube size={24} color="#ef4444" /><Text style={styles.trustText}>Netflix</Text></View>
                        <View style={styles.trustItem}><Facebook size={24} color="#3b82f6" /><Text style={styles.trustText}>Meta</Text></View>
                    </View>
                </View>

                {/* Features */}
                <View style={[styles.featuresSection, { backgroundColor: '#0a0f1c' }]}>
                    <View style={{ alignItems: 'center', marginBottom: 40 }}>
                        <View style={[styles.badge, { borderColor: 'rgba(168, 85, 247, 0.3)' }]}><Sparkles size={14} color="#a855f7" /><Text style={[styles.badgeText, { color: '#d8b4fe' }]}>Platform Capabilities</Text></View>
                        <Text style={styles.sectionTitle}>Everything You Need to <Text style={{ color: THEME.colors.primary }}>Master Interviews</Text></Text>
                    </View>
                    <View style={styles.grid}>
                        <FeatureCard icon={<Mic size={24} color={THEME.colors.primary} />} title="Conversational Voice AI" desc="Experience real-time, fluid technical interviewing powered by Groq." color={THEME.colors.primary} />
                        <FeatureCard icon={<Code2 size={24} color="#a855f7" />} title="Live Code Sandbox" desc="Tackle Algorithmic challenges in an integrated execution environment." color="#a855f7" />
                        <FeatureCard icon={<FileCheck2 size={24} color="#ec4899" />} title="Resume Intelligence" desc="Upload your CV and forge tailored technical questions." color="#ec4899" />
                        <FeatureCard icon={<BrainCircuit size={24} color="#06b6d4" />} title="Deep AI Assessments" desc="Quickly benchmark your raw problem-solving speed." color="#06b6d4" />
                        <FeatureCard icon={<Scale size={24} color="#10b981" />} title="Say vs. Do Analysis" desc="Advanced reasoning evaluations that compare your declared approach to code." color="#10b981" />
                        <FeatureCard icon={<ChartIcon size={24} color="#f59e0b" />} title="Multi-Dimensional Scoring" desc="Receive detailed reports grading Technical Accuracy, Logic, and Communication." color="#f59e0b" />
                    </View>
                </View>

                {/* V3 Promo Section */}
                <View style={{ paddingVertical: 80, paddingHorizontal: 20 }}>
                    <GlowWrapper style={{ padding: 2, borderRadius: 40 }}>
                        <View style={styles.promoInner}>
                            <View style={{ alignItems: 'center', flex: 1 }}>
                                <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4712/4712009.png' }} style={styles.promoIcon} />
                            </View>
                            <View style={styles.promoContent}>
                                <View style={styles.miniBadge}><Zap size={12} color="#60a5fa" /><Text style={styles.miniBadgeText}>v3.0 Now Live</Text></View>
                                <Text style={styles.promoTitle}>Supercharge your productivity with{'\n'}<Text style={{ color: '#60a5fa' }}>AI TOOLS HUB</Text></Text>
                                <Text style={styles.promoDescText}>Includes MockMentorAI, Doctor AI, Image/Video generators and better stability.</Text>
                                <View style={styles.promoActions}>
                                    <TouchableOpacity style={styles.playStoreBtn} onPress={() => Linking.openURL('https://play.google.com/store/apps/details?id=thejcompany.netlify.app')}>
                                        <Text style={{ fontWeight: '900', color: 'black' }}>Get it on Google Play</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.webSiteBtn} onPress={() => Linking.openURL('https://jjaitoolshub.netlify.app')}>
                                        <ExternalLink size={16} color="#60a5fa" /><Text style={{ fontWeight: 'bold', color: 'white', marginLeft: 8 }}>Visit Official Site</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </GlowWrapper>
                </View>

                {/* Roadmap */}
                <View style={styles.roadmapSection}>
                    <View style={{ alignItems: 'center', marginBottom: 40 }}>
                        <View style={[styles.badge, { borderColor: '#a855f7' }]}><Milestone size={14} color="#a855f7" /><Text style={[styles.badgeText, { color: '#d8b4fe' }]}>Platform Evolution</Text></View>
                        <Text style={styles.sectionTitle}>Milestones & <Text style={{ color: '#a855f7' }}>Future Vision</Text></Text>
                    </View>
                    <View style={styles.roadmapGrid}>
                        <RoadmapItem title="Foundation & Groq AI" status="Completed" color="#22c5a7" icon={<CheckCircle2 />} />
                        <RoadmapItem title="Multi-Dimensional Architecture" status="Recently Launched" color={THEME.colors.primary} icon={<Check />} />
                        <RoadmapItem title="Deep AI & Resume Parsing" status="Recently Launched" color="#a855f7" icon={<Sparkles />} />
                        <RoadmapItem title="B2B Corporate APIs" status="In Development (2026)" color="#ec4899" icon={<Clock />} />
                    </View>
                </View>

                {/* Pricing Placeholder & Business Model */}
                <View style={styles.businessSection}>
                    <Text style={styles.sectionTitle}>Sustainable <Text style={{ color: THEME.colors.primary }}>Business Model</Text></Text>
                    <View style={{ flexDirection: width > 768 ? 'row' : 'column', gap: 24, marginTop: 40 }}>
                        <View style={{ flex: 1, gap: 20 }}>
                            <View style={{ flexDirection: 'row', gap: 16 }}>
                                <View style={[styles.iconBox, { backgroundColor: 'rgba(99,102,241,0.1)' }]}><Users color={THEME.colors.primary} /></View>
                                <View style={{ flex: 1 }}><Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>B2C Freemium</Text><Text style={styles.featureDesc}>Students get free interviews. Pro unlocks unlimited practice & analytics.</Text></View>
                            </View>
                            <View style={{ flexDirection: 'row', gap: 16 }}>
                                <View style={[styles.iconBox, { backgroundColor: 'rgba(168,85,247,0.1)' }]}><Building2 color="#a855f7" /></View>
                                <View style={{ flex: 1 }}><Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>B2B Recruitment</Text><Text style={styles.featureDesc}>Colleges and Companies pay per-candidate for L1 screening.</Text></View>
                            </View>
                        </View>
                        <View style={{ flex: 1 }}>
                            {/* Pricing Simulation */}
                            <TouchableOpacity style={[styles.featureCard, { alignItems: 'center' }]} onPress={() => setUpiModalVisible(true)}>
                                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 24 }}>Pro Achiever</Text>
                                <Text style={{ color: THEME.colors.primary, fontSize: 36, fontWeight: '900', marginVertical: 10 }}>$9 / mo</Text>
                                <Text style={styles.primaryCtaText}>Upgrade Now</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Contact */}
                <View style={styles.contactSection}>
                    <Text style={[styles.sectionTitle, { color: 'white' }]}>Have Feedback? Let's Build the Future</Text>
                    <View style={styles.contactForm}>
                        <TextInput style={styles.inputField} placeholder="Your Name" placeholderTextColor="#64748b" value={contactName} onChangeText={setContactName} />
                        <TextInput style={styles.inputField} placeholder="Email Address" placeholderTextColor="#64748b" value={contactEmail} onChangeText={setContactEmail} keyboardType="email-address" />
                        <TextInput style={[styles.inputField, { height: 100 }]} placeholder="Your Message..." placeholderTextColor="#64748b" value={contactBody} onChangeText={setContactBody} multiline />
                        <TouchableOpacity style={styles.submitBtn} onPress={sendFeedback}>
                            <Text style={styles.submitBtnText}>Send Message</Text>
                            <Send size={16} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.footer}><Text style={styles.footerText}>© 2026 MockMentor AI. Built with ❤️ By Jai Jadhav (JJ.28).</Text></View>
            </ScrollView>

            {/* Auth Modal */}
            <Modal visible={authModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity style={styles.closeBtn} onPress={() => setAuthModalVisible(false)}><X color="gray" /></TouchableOpacity>
                        <Text style={styles.modalTitle}>{isSignup ? "Create Account" : "Welcome Back!"}</Text>
                        <Text style={{ color: 'gray', textAlign: 'center', marginBottom: 20 }}>Login to access your dashboard.</Text>

                        {isSignup && <TextInput style={styles.inputField} placeholder="Full Name" placeholderTextColor="#64748b" value={authName} onChangeText={setAuthName} />}
                        <TextInput style={styles.inputField} placeholder="Email" placeholderTextColor="#64748b" keyboardType="email-address" value={authEmail} onChangeText={setAuthEmail} />
                        <TextInput style={styles.inputField} placeholder="Password" placeholderTextColor="#64748b" secureTextEntry value={authPass} onChangeText={setAuthPass} />

                        <TouchableOpacity style={[styles.loginBtn, { width: '100%', padding: 14, marginTop: 10 }]} onPress={handleAuthAction}>
                            <Text style={styles.loginBtnText}>{authLoading ? "Processing..." : (isSignup ? "Sign Up" : "Log In")}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={{ marginTop: 20, alignItems: 'center' }} onPress={() => setIsSignup(!isSignup)}>
                            <Text style={{ color: THEME.colors.primary }}>{isSignup ? "Already have an account? Log In" : "Don't have an account? Sign Up"}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* UPI Modal */}
            <Modal visible={upiModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { borderColor: '#eab308' }]}>
                        <Hammer size={40} color="#eab308" style={{ alignSelf: 'center', marginBottom: 20 }} />
                        <Text style={styles.modalTitle}>Under Construction</Text>
                        <Text style={{ color: 'gray', textAlign: 'center', marginBottom: 20 }}>We are currently integrating UPI & Secure Payment Gateways. This feature will be live soon!</Text>
                        <TouchableOpacity style={[styles.loginBtn, { width: '100%', padding: 14, backgroundColor: 'rgba(255,255,255,0.1)' }]} onPress={() => setUpiModalVisible(false)}>
                            <Text style={styles.loginBtnText}>Got it</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

function FeatureCard({ icon, title, desc, color }) {
    return (
        <View style={styles.featureCard}>
            <View style={[styles.featureIconBox, { backgroundColor: `${color}1A`, borderColor: `${color}33` }]}>{icon}</View>
            <Text style={styles.featureTitle}>{title}</Text>
            <Text style={styles.featureDesc}>{desc}</Text>
        </View>
    );
}

function RoadmapItem({ title, status, desc, color, icon }) {
    return (
        <View style={[styles.featureCard, { width: '100%', marginBottom: 16, borderColor: `${color}40` }]}>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                <View style={{ padding: 6, backgroundColor: `${color}20`, borderRadius: 20 }}>{icon}</View>
                <Text style={{ color: color, fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' }}>{status}</Text>
            </View>
            <Text style={styles.featureTitle}>{title}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.colors.background },
    scrollView: { flex: 1 },
    bgCircle: { width: 400, height: 400, borderRadius: 200, position: 'absolute', filter: 'blur(100px)' },
    navBar: {
        position: 'absolute', top: 16, left: 16, right: 16, zIndex: 50,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: 'rgba(15,23,42,0.85)', paddingHorizontal: 16, paddingVertical: 12,
        borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
    },
    navLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    iconBox: { backgroundColor: 'rgba(99,102,241,0.2)', padding: 6, borderRadius: 8 },
    navTitle: { fontSize: 18, fontWeight: 'bold', color: 'white', lineHeight: 20 },
    navSubtitle: { fontSize: 9, color: THEME.colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
    loginBtn: { backgroundColor: THEME.colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    loginBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14, textAlign: 'center' },

    heroSection: { paddingTop: 140, paddingHorizontal: 20, paddingBottom: 60, minHeight: Platform.OS === 'web' ? '100vh' : 700, justifyContent: 'center', alignItems: 'center' },
    badge: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(99,102,241,0.3)', marginBottom: 24 },
    badgeDot: { width: 8, height: 8, backgroundColor: THEME.colors.primary, borderRadius: 4 },
    badgeText: { color: '#c7d2fe', fontSize: 12, fontWeight: 'bold' },
    heroTitle: { fontSize: width > 768 ? 72 : 44, fontWeight: '900', color: 'white', textAlign: 'center', marginBottom: 24, lineHeight: width > 768 ? 80 : 50 },
    heroDesc: { fontSize: width > 768 ? 20 : 16, color: THEME.colors.textMuted, textAlign: 'center', maxWidth: 600, lineHeight: 28, marginBottom: 40 },
    heroActions: { flexDirection: width > 768 ? 'row' : 'column', gap: 16, alignItems: 'center' },
    primaryCta: { backgroundColor: 'white', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
    primaryCtaText: { color: THEME.colors.background, fontWeight: 'bold', fontSize: 16 },

    trustSection: { paddingVertical: 40, borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)', backgroundColor: 'rgba(15,23,42,0.8)' },
    trustTitle: { textAlign: 'center', color: THEME.colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 20, letterSpacing: 2 },
    trustGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 30, paddingHorizontal: 20 },
    trustItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    trustText: { color: 'white', fontSize: 20, fontWeight: 'bold' },

    featuresSection: { paddingVertical: 80, paddingHorizontal: 24 },
    sectionTitle: { fontSize: 32, fontWeight: '900', color: 'white', textAlign: 'center' },
    grid: { flexDirection: width > 768 ? 'row' : 'column', flexWrap: 'wrap', gap: 20, marginTop: 40, justifyContent: 'center' },
    featureCard: { width: width > 768 ? '30%' : '100%', backgroundColor: 'rgba(30,41,59,0.4)', padding: 24, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    featureIconBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, marginBottom: 20 },
    featureTitle: { fontSize: 20, fontWeight: 'bold', color: 'white', marginBottom: 12 },
    featureDesc: { color: THEME.colors.textMuted, fontSize: 14, lineHeight: 22 },

    promoInner: { backgroundColor: '#1a2235', borderRadius: 36, padding: 32, flexDirection: width > 768 ? 'row' : 'column', alignItems: 'center', gap: 30 },
    promoIcon: { width: 160, height: 160, borderRadius: 24, borderWidth: 4, borderColor: 'rgba(59,130,246,0.5)' },
    promoContent: { flex: 2, alignItems: width > 768 ? 'flex-start' : 'center' },
    miniBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(59,130,246,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(59,130,246,0.2)' },
    miniBadgeText: { color: '#60a5fa', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    promoTitle: { fontSize: width > 768 ? 40 : 28, fontWeight: '900', color: 'white', textAlign: width > 768 ? 'left' : 'center', marginBottom: 16 },
    promoDescText: { color: THEME.colors.textMuted, fontSize: 16, textAlign: width > 768 ? 'left' : 'center', marginBottom: 24, lineHeight: 24 },
    promoActions: { flexDirection: width > 768 ? 'row' : 'column', gap: 16, width: '100%' },
    playStoreBtn: { backgroundColor: 'white', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
    webSiteBtn: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },

    roadmapSection: { paddingVertical: 80, paddingHorizontal: 20 },
    roadmapGrid: { maxWidth: 800, alignSelf: 'center', width: '100%' },

    businessSection: { paddingVertical: 80, paddingHorizontal: 20, backgroundColor: '#0b1121' },
    contactSection: { paddingVertical: 80, paddingHorizontal: 20, backgroundColor: '#0B1120', borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    contactForm: { maxWidth: 600, width: '100%', alignSelf: 'center', backgroundColor: '#222222', p: 20, paddingHorizontal: 20, paddingVertical: 30, borderRadius: 24, borderWidth: 2, borderColor: '#333', marginTop: 40, gap: 16 },
    inputField: { backgroundColor: 'rgba(30,41,59,0.8)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 16, color: 'white', marginBottom: 16 },
    submitBtn: { backgroundColor: THEME.colors.primary, padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    submitBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { backgroundColor: '#0f172a', width: '100%', maxWidth: 400, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(99,102,241,0.3)', position: 'relative' },
    closeBtn: { position: 'absolute', top: 16, right: 16, zIndex: 10 },
    modalTitle: { fontSize: 24, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 8 },

    footer: { paddingVertical: 32, alignItems: 'center', borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.05)', backgroundColor: '#0f172a' },
    footerText: { color: '#64748b', fontSize: 12 }
});
