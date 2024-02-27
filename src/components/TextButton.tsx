import { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

export interface TextButtonProps {
  onPress?: () => void;
  title: string;
}

export function TextButton(props:TextButtonProps){
  const [pressed,setPressed] = useState(false);
  return (
    <Pressable 
      onPress={props.onPress}
      onPressIn={()=>{setPressed(true)}}
      onPressOut={()=>{setPressed(false)}}
    >
      <Text style={[styles.buttonText,pressed?styles.pressed:null]}>{props.title}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  buttonText: {
    textTransform:"uppercase"
  },
  pressed: {
    color: "lightgray",
  },
});