import React from 'react';
// MockMentor AI v3.0 - Ready for Deployment (Netlify: mockmentorai.netlify.app)
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import CognitiveTestScreen from './src/screens/CognitiveTestScreen';
import CodingTestScreen from './src/screens/CodingTestScreen';
import ResumeInterviewScreen from './src/screens/ResumeInterviewScreen';
import InterviewScreen from './src/screens/InterviewScreen';
import ReportScreen from './src/screens/ReportScreen';
import DeepReportScreen from './src/screens/DeepReportScreen';
import { InterviewProvider } from './src/context/InterviewContext';
import HelpDeskWidget from './src/components/HelpDeskWidget';
import { View } from 'react-native';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <InterviewProvider>
      <View style={{ flex: 1 }}>
        <NavigationContainer theme={DarkTheme}>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#0f172a' } // Dark theme background matching legacy UI
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="Cognitive" component={CognitiveTestScreen} />
            <Stack.Screen name="CodingTest" component={CodingTestScreen} />
            <Stack.Screen name="ResumeInterview" component={ResumeInterviewScreen} />
            <Stack.Screen name="Interview" component={InterviewScreen} />
            <Stack.Screen name="Report" component={ReportScreen} />
            <Stack.Screen name="DeepReport" component={DeepReportScreen} />
          </Stack.Navigator>
        </NavigationContainer>
        <HelpDeskWidget />
      </View>
    </InterviewProvider>
  );
}
