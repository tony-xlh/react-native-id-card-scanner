import { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

export default function CameraScreen(){
  const [shouldTake,setShouldTake] = useState(false);
  const [pressed,setPressed] = useState(false);
  const capture = () => {
    setShouldTake(true);
  }
  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={[styles.bottomBar]}>
        <Pressable 
          onPressIn={()=>{setPressed(true)}}
          onPressOut={()=>{setPressed(false)}}
          onPress={()=>{capture()}}>
          <View style={styles.outerCircle}>
          <View style={[styles.innerCircle, pressed ? styles.circlePressed:null]}></View>
          </View>
        </Pressable>
      </View>
    </View>
  )
}


const styles = StyleSheet.create({
  bottomBar:{
    position: "absolute",
    width: "100%",
    bottom: 0,
    height: 60,
    flexDirection:"row",
    justifyContent:"center",
  },
  outerCircle: {
    width: 60,
    height: 60,
    borderRadius: 60 / 2,
    backgroundColor: "lightgray",
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
  },
  innerCircle: {
    width: 45,
    height: 45,
    borderRadius: 45 / 2,
    backgroundColor: "white",
  },
  circlePressed: {
    backgroundColor: "lightgray",
  }
});
