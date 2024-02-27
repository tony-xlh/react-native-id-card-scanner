import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { IDCardManager, ScannedIDCard } from "../utils/IDCardManager";

export interface CardProps{
  cardKey:string;
  onPress?:()=>void;
}
export function Card(props:CardProps){
  const [card,setCard] = useState<ScannedIDCard|null>();
  const [pressed,setPressed] = useState(false);
  useEffect(() => {
    (async () => {
      console.log("mounted")
      const result = await IDCardManager.getIDCard(props.cardKey);
      setCard(result);
    })();
  }, []);

  const getDate = () => {
    if (card) {
      let timestamp = card.timestamp;
      let date = new Date(timestamp);
      return date.toUTCString();
    }
    return "";
  }

  const getCardDetailsText = () => {
    let text = "Name: "+card?.info.GivenName+" "+card?.info.Surname + "\n";
    text = text + "Scanned Date: " + getDate();
    return text;
  }

  return (
    <Pressable 
      onPress={props.onPress}
      onPressIn={()=>setPressed(true)}
      onPressOut={()=>setPressed(false)}
    >
      <View style={[styles.card,pressed?styles.pressed:null]}>
        <Image 
          style={styles.cardImage}
          source={{
            uri: 'data:image/jpeg;base64,'+card?.frontImage,
          }}
        />
        <View style={styles.cardDetails}>
          <Text>{getCardDetailsText()}</Text>
        </View>
      </View>
    </Pressable>
  )
}


const styles = StyleSheet.create({
  card:{
    flex:1,
    display:"flex",
    flexDirection:"row",
    margin: 10,
    padding:10,
    borderColor:"gray",
    borderWidth:0.2,
    borderRadius:3
  },
  pressed:{
    backgroundColor:"lightgray",
  },
  cardImage:{
    width: 100,
    height: 70,
    resizeMode:"cover"
  },
  cardDetails:{
    flex:1,
    padding:10,
    justifyContent:"center",
    flexDirection:"row"
  },
});
