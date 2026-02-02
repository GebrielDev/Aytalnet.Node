import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import StartTripScreen from './src/screens/StartTripScreen';
import ActiveTripScreen from './src/screens/ActiveTripScreen';
import EndTripScreen from './src/screens/EndTripScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { driver, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#2563EB' }, headerTintColor: '#fff' }}>
      {!driver ? (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Fleet Driver' }} />
          <Stack.Screen name="StartTrip" component={StartTripScreen} options={{ title: 'Start Trip' }} />
          <Stack.Screen name="ActiveTrip" component={ActiveTripScreen} options={{ title: 'Active Trip', headerBackVisible: false }} />
          <Stack.Screen name="EndTrip" component={EndTripScreen} options={{ title: 'End Trip' }} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
