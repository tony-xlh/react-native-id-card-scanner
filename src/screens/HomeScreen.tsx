import { useEffect } from "react";
import { View, StyleSheet, ScrollView, Text, Pressable } from "react-native"

interface HomeScreenProps {
  route:any;
  navigation:any;
}

export default function HomeScreen(props:HomeScreenProps){
  useEffect(() => {
    if (props.route.params?.base64) {
      console.log(props.route.params?.base64);
      console.log("at homescreen")
    }
  }, [props.route.params?.base64]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <ScrollView style={styles.cardList}>
        <View>
          <Text>Home Screen</Text>
        </View>
      </ScrollView>
      <View style={[styles.bottomBar, styles.elevation,styles.shadowProp]}>
        <Pressable onPress={()=>{props.navigation.navigate('Camera')}}>
          <View style={styles.circle}>
            <Text style={styles.buttonText}>SCAN</Text>
          </View>
        </Pressable>
      </View>
    </View>
  )
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

