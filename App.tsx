import React from 'react';
import {
  Button,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

function HomeScreen({ navigation }){
  return (
    <>
    <ScrollView style={styles.cardList}>
      <View>
        <Text>Home Screen</Text>
      </View>
    </ScrollView>
    <View style={[styles.bottomBar, styles.elevation,styles.shadowProp]}>
      <Pressable onPress={()=>{navigation.navigate('Camera')}}>
        <View style={styles.circle}>
          <Text style={styles.buttonText}>SCAN</Text>
        </View>
      </Pressable>
    </View>
    </>
    
  )
}

function CameraScreen(){
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Camera Screen</Text>
    </View>
  )
}

const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Camera" component={CameraScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  cardList: {
    
  },
  bottomBar:{
    width: "100%",
    height: 45,
    marginTop: 5,
    flexDirection:"row",
    justifyContent:"center",
    backgroundColor:"white",
  },
  shadowProp: {
    shadowColor: '#171717',
    shadowOffset: {width: 2, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  elevation: {
    elevation: 20,
    shadowColor: '#52006A',
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 60 / 2,
    backgroundColor: "rgb(120,190,250)",
    top:-25,
    justifyContent:"center",
  },
  buttonText:{
    alignSelf:"center",
    color:"white",
  }
});

export default App;
