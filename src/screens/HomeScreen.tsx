import { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Text, Pressable } from "react-native"
import { IDCardManager } from "../utils/IDCardManager";
import { Card } from "../components/Card";

interface HomeScreenProps {
  route:any;
  navigation:any;
}

export default function HomeScreen(props:HomeScreenProps){
  const [cardKeys,setCardKeys] = useState<readonly string[]>([]);
  useEffect(() => {
    (async () => {
      setCardKeys(await IDCardManager.getKeys());
    })();
  }, []);

  const goToCardScreen = () => {
    console.log("goToCardScreen");
    props.navigation.navigate('Card');
  }

  const cardPressed = (key:string) => {
    console.log("cardPressed");
    console.log(key);
  }

  const renderCards = () => {
    let cards:React.ReactElement[] = [];
    if (cardKeys.length == 0) {
      return;
    }
    console.log("renderCards");
    cardKeys.forEach(async cardKey =>  {
      console.log(cardKey);
      let card = <Card cardKey={cardKey} onPress={()=>cardPressed(cardKey)}></Card>;
      cards.push(card);
    });
    if (cards.length>0) {
      return cards;
    }
  }
  
  return (
    <View style={StyleSheet.absoluteFill}>
      <ScrollView style={styles.cardList}>
        {renderCards()}
      </ScrollView>
      <View style={[styles.bottomBar, styles.elevation,styles.shadowProp]}>
        <Pressable onPress={()=>{goToCardScreen()}}>
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

