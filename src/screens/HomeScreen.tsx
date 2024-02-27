import { useEffect, useRef, useState } from "react";
import { View, StyleSheet, ScrollView, Text, Pressable, Modal } from "react-native"
import { IDCardManager } from "../utils/IDCardManager";
import { Card } from "../components/Card";

interface HomeScreenProps {
  route:any;
  navigation:any;
}

export default function HomeScreen(props:HomeScreenProps){
  const selectedCardKey = useRef("");
  const [cardKeys,setCardKeys] = useState<readonly string[]>([]);
  const [modalVisible,setModalVisible] = useState(false);
  useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', async () => {
      console.log("screen focused");
      setCardKeys(await IDCardManager.getKeys());
    });
    return unsubscribe;
  }, [props.navigation]);

  const goToCardScreen = () => {
    console.log("goToCardScreen");
    props.navigation.navigate('Card',{
      cardKey: selectedCardKey.current,
    });
  }

  const cardPressed = (key:string) => {
    selectedCardKey.current = key;
    setModalVisible(true);
  }

  const renderCards = () => {
    let cards:React.ReactElement[] = [];
    if (cardKeys.length == 0) {
      return;
    }
    console.log("renderCards");
    cardKeys.forEach(async cardKey =>  {
      console.log(cardKey);
      let card = <Card key={cardKey} cardKey={cardKey} onPress={()=>cardPressed(cardKey)}></Card>;
      cards.push(card);
    });
    if (cards.length>0) {
      return cards;
    }
  }

  const performAction = async (mode:"delete"|"open") => {
    if (mode === "delete") {
      await IDCardManager.deleteIDCard(selectedCardKey.current);
      setCardKeys(await IDCardManager.getKeys());
    }else{
      goToCardScreen();
    }
    setModalVisible(!modalVisible);
  }
  
  return (
    <View style={StyleSheet.absoluteFill}>
      <ScrollView style={styles.cardList}>
        {renderCards()}
      </ScrollView>
      <View style={[styles.bottomBar, styles.elevation,styles.shadowProp]}>
        <Pressable onPress={()=>{selectedCardKey.current ="";goToCardScreen()}}>
          <View style={styles.circle}>
            <Text style={styles.buttonText}>SCAN</Text>
          </View>
        </Pressable>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Please select an action:</Text>
            <View style={{flexDirection:"row"}}>
              <Pressable
                style={styles.button}
                onPress={() => performAction("open")}>
                <Text style={styles.textStyle}>Open</Text>
              </Pressable>
              <Pressable
                style={styles.button}
                onPress={() => performAction("delete")}>
                <Text style={styles.textStyle}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    backgroundColor: '#2196F3',
    margin:5,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});

