import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, Animated, Dimensions, Modal, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BrainCircuit, LogOut, Briefcase, CheckCircle, TrendingUp, Clock, Layers, Zap, Brain, BarChart2, UploadCloud, Coffee, Code2, LayoutTemplate, Server, Database, Cloud, ShieldAlert, Binary, Users, Network, BarChartBig, Compass, ShoppingCart, Grid3x3, Facebook, Crown, Check, X, FileText, ArrowRight } from 'lucide-react-native';
import { THEME } from '../config/theme';
import { auth, db } from '../config/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

const { width } = Dimensions.get('window');

// Data arrays for mapping
const domains = [
    { name: 'Java Developer', desc: 'Core Java, Spring Boot, Microservices', icon: Coffee, color: '#ef4444', context: 'Core Java, Spring Boot, Hibernate, Microservices' },
    { name: 'Python Developer', desc: 'Django, FastAPI, Scripting', icon: Code2, color: '#3b82f6', context: 'Python, Django, FastAPI, Data Structures' },
    { name: 'Frontend React', desc: 'React.js, Redux, DOM Manipulation', icon: LayoutTemplate, color: '#06b6d4', context: 'React.js, JavaScript, CSS, Redux, Performance' },
    { name: 'Node.js Backend', desc: 'Express, MongoDB, SQL, APIs', icon: Server, color: '#10b981', context: 'Node.js, Express, MongoDB, SQL, API Design' },
    { name: 'Data Science', desc: 'ML Algorithms, Pandas, Statistics', icon: Database, color: '#22c55e', context: 'Machine Learning, Statistics, SQL, Python' },
    { name: 'Cloud & DevOps', desc: 'AWS, Docker, Kubernetes, CI/CD', icon: Cloud, color: '#f97316', context: 'AWS, Docker, Kubernetes, CI/CD' },
    { name: 'Cyber Security', desc: 'Network Security, Ethical Hacking', icon: ShieldAlert, color: '#ef4444', context: 'Network Security, Ethical Hacking, OWASP, Linux' },
    { name: 'Product Mgmt', desc: 'Agile, Strategy, User Metrics', icon: Briefcase, color: '#eab308', context: 'Agile, User Stories, Product Strategy, Metrics' },
    { name: 'C++ Core', desc: 'STL, Pointers, Memory Mgmt', icon: Binary, color: '#4f46e5', context: 'C++, STL, Memory Management, Pointers' },
    { name: 'HR Behavioral', desc: 'Leadership, Conflict Resolution', icon: Users, color: '#a855f7', context: 'Behavioral, Leadership, Strengths/Weaknesses, Situational' },
    { name: 'System Design', desc: 'Scalability, HLD/LLD, Load Balancers', icon: Network, color: '#ec4899', context: 'Scalability, Load Balancing, Caching, Database Design' },
    { name: 'Data Analyst', desc: 'Excel, SQL, PowerBI, Visualization', icon: BarChartBig, color: '#14b8a6', context: 'Excel, SQL, PowerBI, Tableau' },
];

const companies = [
    { name: 'Google', desc: 'Algo & Data Structures', icon: Compass, context: 'Algorithms, System Design, Googleyness, Scalability', from: '#3b82f6', to: '#ef4444' },
    { name: 'Amazon', desc: 'Leadership Principles, OOD', icon: ShoppingCart, context: 'Leadership Principles, Object Oriented Design, AWS', from: '#f97316', to: '#eab308' },
    { name: 'Microsoft', desc: 'C#, Problem Solving, Azure', icon: Grid3x3, context: 'C#, Azure, System Design, Problem Solving', from: '#38bdf8', to: '#06b6d4' },
    { name: 'Meta', desc: 'Performance, React, Graph Algos', icon: Facebook, context: 'React, Scalable Infrastructure, Graph Algorithms', from: '#2563eb', to: '#4f46e5' },
];

export default function DashboardScreen() {
    const navigation = useNavigation();
    const [userData, setUserData] = useState({ name: 'User', count: 0, score: 0, time: 0, deepCount: 0, deepScore: 0, plan: 'Free', photo: null });
    const [resumeModalVisible, setResumeModalVisible] = useState(false);
    const [resumeText, setResumeText] = useState("");

    // Neural Glow animation refs
    const floatAnim1 = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.loop(Animated.sequence([
            Animated.timing(floatAnim1, { toValue: 1, duration: 8000, useNativeDriver: true }),
            Animated.timing(floatAnim1, { toValue: 0, duration: 8000, useNativeDriver: true })
        ])).start();
    }, []);

    useEffect(() => {
        const unsubscribeAuth = auth.onAuthStateChanged((user) => {
            if (user) {
                const unsubDoc = onSnapshot(doc(db, "users", user.uid), (document) => {
                    if (document.exists()) {
                        const data = document.data();
                        const avg = data.interviewsCompleted > 0 ? Math.round(data.totalScore / data.interviewsCompleted) : 0;
                        const deepAvg = data.deepInterviewsCompleted > 0 ? Math.round((data.deepTotalScore || 0) / data.deepInterviewsCompleted) : 0;
                        setUserData({
                            name: data.name || 'User',
                            count: data.interviewsCompleted || 0,
                            score: avg,
                            time: data.practiceMinutes || 0,
                            deepCount: data.deepInterviewsCompleted || 0,
                            deepScore: deepAvg,
                            plan: data.plan || 'Free',
                            photo: data.photo || null
                        });
                    }
                });
                return () => unsubDoc();
            } else {
                navigation.replace("Home");
            }
        });
        return () => unsubscribeAuth();
    }, []);

    const handleLogout = () => {
        auth.signOut().then(() => navigation.replace("Home"));
    };

    const selectDomain = async (name, context) => {
        // Need to pass domain data to Interview Context
        // Web stored it in localStorage, but since we are using React Navigation, 
        // we can either pass params or update the global InterviewContext.
        // Assuming InterviewContext handles this or InterviewScreen takes params.

        let sessionId = "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
        if (Platform.OS === 'web') {
            localStorage.setItem("selectedDomain", name);
            localStorage.setItem("selectedContext", context);
            localStorage.setItem("resumeContext", "No background provided.");
            localStorage.setItem("currentSessionId", sessionId);
        }

        if (auth.currentUser) {
            try {
                await setDoc(doc(db, "sessions", sessionId), {
                    userId: auth.currentUser.uid,
                    domain: name,
                    context: context,
                    resumeText: "No background provided.",
                    status: "started",
                    startTime: new Date().toISOString(),
                    transcripts: [],
                    integrityEvents: [],
                });
            } catch (e) { console.error(e); }
        }

        // Navigate
        navigation.navigate("Interview", { domain: name, context: context, sessionId });
    };

    const startInterviewWithContext = async () => {
        let rText = resumeText.trim() || "No background provided.";
        let sessionId = "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);

        if (Platform.OS === 'web') {
            localStorage.setItem("resumeContext", rText);
            localStorage.setItem("currentSessionId", sessionId);
        }

        setResumeModalVisible(false);
        navigation.navigate("Interview", { domain: 'Custom Context', context: 'General', sessionId, resumeContext: rText });
    };

    const renderHeader = () => (
        <View style={styles.navBar}>
            <TouchableOpacity style={styles.navLogo} onPress={() => navigation.navigate("Home")}>
                <BrainCircuit size={24} color="#818cf8" />
                <Text style={styles.navLogoText}>Mock<Text style={{ color: '#818cf8' }}>Mentor</Text></Text>
            </TouchableOpacity>
            <View style={styles.navActions}>
                {Platform.OS === 'web' && <TouchableOpacity><Text style={styles.navUpgrade}>Upgrade Plan</Text></TouchableOpacity>}
                <View style={styles.navAvatar}>
                    <Text style={styles.navAvatarText}>{userData.name.charAt(0).toUpperCase()}</Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.navLogout}>
                    <LogOut size={20} color="#9ca3af" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={StyleSheet.absoluteFillObject}>
                <Animated.View style={[styles.bgCircle, { top: -100, left: -100, backgroundColor: 'rgba(99, 102, 241, 0.1)', transform: [{ scale: floatAnim1.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) }] }]} />
                <Animated.View style={[styles.bgCircle, { bottom: -100, right: -100, backgroundColor: 'rgba(168, 85, 247, 0.1)', transform: [{ scale: floatAnim1.interpolate({ inputRange: [0, 1], outputRange: [1.2, 1] }) }] }]} />
            </View>

            {renderHeader()}

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={styles.welcomeSection}>
                    <Text style={styles.welcomeTitle}>Welcome back, <Text style={{ color: '#818cf8' }}>{userData.name.split(" ")[0]}</Text>
                        {userData.plan === 'Pro' && <Text style={styles.proBadge}>  PRO</Text>}
                    </Text>
                    <Text style={styles.welcomeSubtitle}>Your progress updates in real-time. Select a professional track to begin.</Text>
                </View>

                <View style={styles.heroSection}>
                    <Text style={styles.heroMain}>Master the <Text style={{ color: '#818cf8' }}>Interview.</Text></Text>
                    <Text style={styles.heroSub}>AI-powered mock interviews tailored to your exact career, skills, and target companies.</Text>
                </View>

                {/* Primary Stats */}
                <View style={styles.sectionHeader}>
                    <Briefcase size={20} color="#818cf8" />
                    <Text style={styles.sectionTitle}>Career Tracks & Stats</Text>
                </View>

                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <View style={[styles.statIconBox, { backgroundColor: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.2)' }]}>
                            <CheckCircle size={32} color="#4ade80" />
                        </View>
                        <View>
                            <Text style={styles.statValue}>{userData.count}</Text>
                            <Text style={styles.statLabel}>Interviews Completed</Text>
                        </View>
                    </View>
                    <View style={styles.statCard}>
                        <View style={[styles.statIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.2)' }]}>
                            <TrendingUp size={32} color="#60a5fa" />
                        </View>
                        <View>
                            <Text style={styles.statValue}>{userData.score}%</Text>
                            <Text style={styles.statLabel}>Average Score</Text>
                        </View>
                    </View>
                    <View style={styles.statCard}>
                        <View style={[styles.statIconBox, { backgroundColor: 'rgba(168, 85, 247, 0.1)', borderColor: 'rgba(168, 85, 247, 0.2)' }]}>
                            <Clock size={32} color="#c084fc" />
                        </View>
                        <View>
                            <Text style={styles.statValue}>{userData.time}m</Text>
                            <Text style={styles.statLabel}>Minutes Practiced</Text>
                        </View>
                    </View>
                </View>

                {/* Tilt Card Mapping */}
                <View style={styles.deepCardContainer}>
                    <View style={styles.deepCardBody}>
                        <View style={styles.sectionHeader}>
                            <Zap size={20} color="#22d3ee" />
                            <Text style={[styles.sectionTitle, { color: '#22d3ee' }]}>Deep & Easy MockMentor Stats</Text>
                        </View>

                        <View style={styles.statsGrid}>
                            <View style={[styles.statCard, { borderColor: 'rgba(34,211,238,0.2)' }]}>
                                <View style={[styles.statIconBox, { backgroundColor: 'rgba(34,211,238,0.1)', borderColor: 'rgba(34,211,238,0.2)' }]}>
                                    <Brain size={32} color="#22d3ee" />
                                </View>
                                <View>
                                    <Text style={styles.statValue}>{userData.deepCount}</Text>
                                    <Text style={styles.statLabel}>Assessments Completed</Text>
                                </View>
                            </View>
                            <View style={[styles.statCard, { borderColor: 'rgba(99,102,241,0.2)' }]}>
                                <View style={[styles.statIconBox, { backgroundColor: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.2)' }]}>
                                    <BarChart2 size={32} color="#818cf8" />
                                </View>
                                <View>
                                    <Text style={styles.statValue}>{userData.deepScore}%</Text>
                                    <Text style={styles.statLabel}>Average Overall Score</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.deepCardLaunchBlock}>
                            <View style={{ flex: 1, paddingRight: 20 }}>
                                <Text style={styles.launchTitle}>Quick Launch</Text>
                                <Text style={styles.launchDesc}>Jump straight into a specialized test or use your exact resume to generate custom HR and technical rounds.</Text>
                            </View>
                            <View style={styles.launchButtons}>
                                <TouchableOpacity style={[styles.launchBtn, { backgroundColor: '#0ea5e9' }]}>
                                    <Zap size={20} color="white" />
                                    <Text style={styles.launchBtnText}>Deep & Easy AI</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setResumeModalVisible(true)} style={[styles.launchBtn, { backgroundColor: '#d946ef' }]}>
                                    <UploadCloud size={20} color="white" />
                                    <Text style={styles.launchBtnText}>Upload Resume</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Tracks Grid */}
                <View style={styles.trackGrid}>
                    {domains.map((d, i) => (
                        <TouchableOpacity key={i} style={styles.trackCard} onPress={() => selectDomain(d.name, d.context)}>
                            <View style={[styles.trackIconBox, { backgroundColor: `${d.color}15`, borderColor: `${d.color}30` }]}>
                                <d.icon size={28} color={d.color} />
                            </View>
                            <Text style={styles.trackName}>{d.name}</Text>
                            <Text style={styles.trackDesc}>{d.desc}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Companies Sections */}
                <View style={[styles.sectionHeader, { marginTop: 40 }]}>
                    <CheckCircle size={20} color="#818cf8" />
                    <Text style={styles.sectionTitle}>Company-Specific Interviews</Text>
                </View>
                <Text style={styles.sectionSubDesc}>Tailored questions, technical tests, and HR rounds modeled after top tech giants.</Text>

                <View style={styles.trackGrid}>
                    {companies.map((c, i) => (
                        <TouchableOpacity key={i} style={styles.trackCard} onPress={() => selectDomain(c.name + ' - SWE', c.context)}>
                            <View style={[styles.trackIconBox, { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }]}>
                                <c.icon size={28} color="white" />
                            </View>
                            <Text style={styles.trackName}>{c.name}</Text>
                            <Text style={styles.trackDesc}>{c.desc}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Plans and Pricing */}
                <View style={styles.pricingSection}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 30 }}>
                        <Crown size={32} color="#facc15" />
                        <Text style={styles.pricingTitle}>Plans & Pricing</Text>
                    </View>

                    <View style={styles.pricingGrid}>
                        {/* Free Plan */}
                        <View style={styles.priceCard}>
                            <Text style={styles.planName}>Aspirant</Text>
                            <View style={styles.priceBlock}>
                                <Text style={styles.priceBig}>Free</Text>
                                <Text style={styles.pricePeriod}>/ forever</Text>
                            </View>
                            <View style={styles.planFeatures}>
                                <Text style={styles.planFeatureText}><Check size={16} color="#4ade80" /> 5 Interviews / Month</Text>
                                <Text style={styles.planFeatureText}><Check size={16} color="#4ade80" /> Basic AI Feedback</Text>
                                <Text style={styles.planFeatureText}><Check size={16} color="#4ade80" /> Standard Tracks</Text>
                            </View>
                            <View style={[styles.planBtn, { backgroundColor: 'rgba(255,255,255,0.05)' }]}><Text style={{ color: '#d1d5db', fontWeight: 'bold' }}>Current Plan</Text></View>
                        </View>
                        {/* Pro Plan */}
                        <View style={[styles.priceCard, { borderColor: '#6366f1', transform: [{ scale: Platform.OS === 'web' ? 1.05 : 1 }], backgroundColor: 'rgba(99,102,241,0.05)' }]}>
                            <View style={styles.popularBadge}><Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>POPULAR</Text></View>
                            <Text style={[styles.planName, { color: 'white' }]}>Pro Achiever</Text>
                            <View style={styles.priceBlock}>
                                <Text style={[styles.priceBig, { color: '#818cf8' }]}>$9</Text>
                                <Text style={styles.pricePeriod}>/ month</Text>
                            </View>
                            <View style={styles.planFeatures}>
                                <Text style={styles.planFeatureText}><Check size={16} color="#818cf8" /> Unlimited Interviews</Text>
                                <Text style={styles.planFeatureText}><Check size={16} color="#818cf8" /> Deep Behavioral Analysis</Text>
                                <Text style={styles.planFeatureText}><Check size={16} color="#818cf8" /> Company-Specific Tracks</Text>
                                <Text style={styles.planFeatureText}><Check size={16} color="#818cf8" /> Resume parsing</Text>
                            </View>
                            <TouchableOpacity style={[styles.planBtn, { backgroundColor: '#4f46e5' }]}><Text style={{ color: 'white', fontWeight: 'bold' }}>Upgrade Now</Text></TouchableOpacity>
                        </View>
                        {/* Mentor Plan */}
                        <View style={[styles.priceCard, { borderColor: 'rgba(168,85,247,0.3)' }]}>
                            <Text style={[styles.planName, { color: '#d8b4fe' }]}>Mentor & Institute</Text>
                            <View style={styles.priceBlock}>
                                <Text style={[styles.priceBig, { color: '#c084fc' }]}>$49</Text>
                                <Text style={styles.pricePeriod}>/ month</Text>
                            </View>
                            <Text style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>For Teachers & Colleges</Text>
                            <View style={styles.planFeatures}>
                                <Text style={styles.planFeatureText}><Check size={16} color="#c084fc" /> Manage 50 Students</Text>
                                <Text style={styles.planFeatureText}><Check size={16} color="#c084fc" /> Analytics Dashboard</Text>
                                <Text style={styles.planFeatureText}><Check size={16} color="#c084fc" /> Custom Questions</Text>
                                <Text style={styles.planFeatureText}><Check size={16} color="#c084fc" /> Bulk PDF Reports</Text>
                            </View>
                            <TouchableOpacity style={[styles.planBtn, { backgroundColor: 'rgba(147,51,234,0.2)', borderColor: 'rgba(147,51,234,0.5)', borderWidth: 1 }]}><Text style={{ color: '#d8b4fe', fontWeight: 'bold' }}>Contact Sales</Text></TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>© 2026 MockMentor AI. Built with ❤️ By Jai Jadhav (JJ.28).</Text>
                </View>

            </ScrollView>

            <Modal visible={resumeModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity style={styles.modalClose} onPress={() => setResumeModalVisible(false)}><X color="#9ca3af" size={24} /></TouchableOpacity>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                            <View style={styles.modalIcon}><FileText color="#818cf8" size={24} /></View>
                            <View>
                                <Text style={styles.modalTitle}>Interview Context</Text>
                                <Text style={styles.modalSub}>Provide your background for a personalized interview.</Text>
                            </View>
                        </View>
                        <Text style={styles.modalLabel}>Paste your Resume / Experience Summary</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="E.g., I have 3 years of experience as a React developer..."
                            placeholderTextColor="#64748b"
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                            value={resumeText}
                            onChangeText={setResumeText}
                        />
                        <Text style={styles.modalDisclaimer}>Our AI will parse this to ask highly relevant, personalized questions.</Text>
                        <TouchableOpacity style={styles.modalStartBtn} onPress={startInterviewWithContext}>
                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Start Interview</Text>
                            <ArrowRight color="white" size={18} />
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.colors.background },
    bgCircle: { width: 400, height: 400, borderRadius: 200, position: 'absolute', filter: Platform.OS === 'web' ? 'blur(100px)' : 'none' },
    navBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)', zIndex: 10 },
    navLogo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    navLogoText: { fontSize: 20, fontWeight: 'bold', color: 'white' },
    navActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    navUpgrade: { color: '#facc15', fontSize: 14, fontWeight: '600' },
    navAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#334155', borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
    navAvatarText: { color: 'white', fontWeight: 'bold' },
    navLogout: { padding: 8, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 8 },
    scrollContent: { paddingHorizontal: 24, paddingTop: 40, paddingBottom: 60 },
    welcomeSection: { marginBottom: 48 },
    welcomeTitle: { fontSize: 36, fontWeight: '900', color: 'white', marginBottom: 16 },
    proBadge: { backgroundColor: '#4f46e5', color: 'white', fontSize: 10, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, overflow: 'hidden' },
    welcomeSubtitle: { fontSize: 18, color: '#9ca3af' },
    heroSection: { alignItems: 'center', marginBottom: 32 },
    heroMain: { fontSize: 48, fontWeight: '900', color: 'white', marginBottom: 16, textAlign: 'center' },
    heroSub: { fontSize: 18, color: '#9ca3af', textAlign: 'center', maxWidth: 600 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#818cf8' },
    statsGrid: { flexDirection: width > 768 ? 'row' : 'column', gap: 24, marginBottom: 48 },
    statCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, flexDirection: 'row', alignItems: 'center', gap: 20 },
    statIconBox: { padding: 16, borderRadius: 12, borderWidth: 1 },
    statValue: { fontSize: 30, fontWeight: 'bold', color: 'white' },
    statLabel: { fontSize: 14, color: '#9ca3af' },
    deepCardContainer: { marginVertical: 48, alignItems: 'center' },
    deepCardBody: { width: '100%', maxWidth: 1000, backgroundColor: '#0f172a', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 24, padding: 32 },
    deepCardLaunchBlock: { flexDirection: width > 768 ? 'row' : 'column', alignItems: width > 768 ? 'center' : 'flex-start', justifyContent: 'space-between', borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingTop: 32, gap: 24 },
    launchTitle: { fontSize: 18, fontWeight: 'bold', color: 'white', marginBottom: 8 },
    launchDesc: { fontSize: 14, color: '#9ca3af', maxWidth: 400 },
    launchButtons: { flexDirection: width > 768 ? 'row' : 'column', gap: 16 },
    launchBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
    launchBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    trackGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 24, marginBottom: 40 },
    trackCard: { width: width > 768 ? '22%' : '100%', backgroundColor: 'rgba(30,41,59,0.4)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, minWidth: 250 },
    trackIconBox: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 1 },
    trackName: { fontSize: 20, fontWeight: 'bold', color: 'white', marginBottom: 8 },
    trackDesc: { fontSize: 14, color: '#9ca3af' },
    sectionSubDesc: { fontSize: 14, color: '#9ca3af', marginBottom: 24, marginTop: -16 },
    pricingSection: { marginTop: 64, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingTop: 64 },
    pricingTitle: { fontSize: 30, fontWeight: 'bold', color: 'white' },
    pricingGrid: { flexDirection: width > 768 ? 'row' : 'column', gap: 32 },
    priceCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 24, padding: 32 },
    popularBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: '#818cf8', paddingHorizontal: 12, paddingVertical: 4, borderBottomLeftRadius: 12, borderTopRightRadius: 24 },
    planName: { fontSize: 20, fontWeight: 'bold', color: '#d1d5db' },
    priceBlock: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginVertical: 16 },
    priceBig: { fontSize: 36, fontWeight: 'bold', color: 'white' },
    pricePeriod: { fontSize: 16, color: '#6b7280' },
    planFeatures: { gap: 16, marginBottom: 32, flex: 1 },
    planFeatureText: { fontSize: 14, color: '#9ca3af' },
    planBtn: { width: '100%', paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    footer: { marginTop: 48, paddingTop: 32, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.05)', alignItems: 'center' },
    footerText: { color: '#6b7280', fontSize: 14 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.95)', alignItems: 'center', justifyContent: 'center', padding: 16 },
    modalContent: { width: '100%', maxWidth: 500, backgroundColor: '#1e293b', borderWidth: 1, borderColor: 'rgba(99,102,241,0.3)', borderRadius: 24, padding: 32 },
    modalClose: { position: 'absolute', top: 16, right: 16, zIndex: 10 },
    modalIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(99,102,241,0.2)', alignItems: 'center', justifyContent: 'center' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: 'white' },
    modalSub: { fontSize: 14, color: '#9ca3af' },
    modalLabel: { fontSize: 12, fontWeight: 'bold', color: '#9ca3af', marginBottom: 8 },
    modalInput: { backgroundColor: 'rgba(15,23,42,0.5)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 16, color: 'white', fontSize: 14 },
    modalDisclaimer: { fontSize: 10, color: '#64748b', marginTop: 4, marginBottom: 24 },
    modalStartBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#4f46e5', paddingVertical: 16, borderRadius: 12 }
});
