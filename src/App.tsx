import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import CameraScreen from './screens/CameraScreen';
import CardScreen from './screens/CardScreen';
import { Button, Pressable, StyleSheet, Text } from 'react-native';
import { TextButton } from './components/TextButton';

const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Camera" component={CameraScreen} />
        <Stack.Screen name="Card" component={CardScreen} 
         options={({ navigation, route }) => ({
          // Add a placeholder button without the `onPress` to avoid flicker
          headerRight: () => (
            <TextButton title="Save"></TextButton>
          ),
        })}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
