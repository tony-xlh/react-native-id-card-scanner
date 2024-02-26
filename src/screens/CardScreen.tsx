import { useEffect, useRef, useState } from "react";
import { View, StyleSheet, ScrollView, Text, Pressable, Image, Button } from "react-native"

interface CardScreenProps {
  route:any;
  navigation:any;
}

export default function CardScreen(props:CardScreenProps){
  const isFrontRef = useRef(false);
  const [frontImageBase64,setFrontImageBase64] = useState("");
  const [backImageBase64,setBackImageBase64] = useState("");
  
  const goToCameraScreen = (isFront:boolean) => {
    isFrontRef.current = isFront;
    props.navigation.navigate('Camera');
  }

  const Card = (props:{isFront:boolean}) => {
    let base64;
    if (props.isFront) {
      base64 = frontImageBase64;
    }else{
      base64 = backImageBase64;
    }
    let innerControl;
    if (!base64) {
      innerControl = 
        <View style={styles.buttonContainer}>
          <Button title="Add Image"
            onPress={()=>{goToCameraScreen(props.isFront)}}
          ></Button>
        </View>
    }else{
      innerControl = 
        <View style={styles.imageContainer}>
          <Pressable
            onPress={()=>{goToCameraScreen(props.isFront)}}
          >
            <Image 
              style={styles.cardImage}
              source={{
              uri: 'data:image/jpeg;base64,'+base64,
            }}></Image>
          </Pressable>
        </View>
    }
    return (
      <>
        <Text style={styles.header}>
          {props.isFront?"Front":"Back"} Image:
        </Text>
        {innerControl}
      </>
    )
  }
  
  useEffect(() => {
    if (props.route.params?.base64) {
      let base64 = props.route.params?.base64; 
      if (isFrontRef.current === true) {
        setFrontImageBase64(base64);
      }else{
        setBackImageBase64(base64);
      }
    }
  }, [props.route.params?.base64]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <ScrollView>
        {Card({isFront:true})}
        {Card({isFront:false})}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  buttonContainer:{
    paddingLeft:10,
    paddingTop:5,
    paddingBottom:5,
    width:"30%"
  },
  imageContainer:{
    paddingLeft:10,
    paddingTop:5,
    paddingBottom:5,
  },
  cardImage:{
    height: 150,
    resizeMode: 'contain',
  },
  header:{
    paddingTop:5,
    paddingBottom:5,
    paddingLeft:10,
    fontWeight:"bold",
    color:"black",
    backgroundColor:"lightgray",
  }  
});

