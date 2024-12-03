import { useEffect, useRef, useState } from "react";
import { View, StyleSheet, ScrollView, Text, Pressable, Image, Button, TextInput, Alert } from "react-native"
import { IDCardManager, ParsedResult, ScannedIDCard } from "../utils/IDCardManager";
import { decodeBase64, initLicense } from "vision-camera-dynamsoft-label-recognizer";
import { parse } from "mrz";
import { TextButton } from "../components/TextButton";

interface CardScreenProps {
  route:any;
  navigation:any;
}

export default function CardScreen(props:CardScreenProps){
  const isFrontRef = useRef(false);
  const cardKey = useRef("");
  const [frontImageBase64,setFrontImageBase64] = useState("");
  const [backImageBase64,setBackImageBase64] = useState("");
  const [parsedResult,setParsedResult] = useState<ParsedResult>(
    {
      Surname:"",
      GivenName:"",
      IDNumber:"",
      DateOfBirth:"",
      DateOfExpiry:""
    }
  );

  useEffect(() => {
    const init = async () => {
      console.log(props);
      let key = props.route.params.cardKey;
      if (key) {
        cardKey.current = key;
        let IDCard = await IDCardManager.getIDCard(key);
        if (IDCard) {
          setFrontImageBase64(IDCard.frontImage);
          setBackImageBase64(IDCard.backImage);
          setParsedResult(IDCard.info);
        }
      }
    }
    init()
  }, []);

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

  const Fields = () => {
    const onChangeText = (key:string,text:string) => {
      console.log("onChangeText");
      let result:any = JSON.parse(JSON.stringify(parsedResult));
      result[key] = text;
      setParsedResult(result);
    }
    let fieldArray = [];
    let keys = Object.keys(parsedResult);
    for (let index = 0; index < keys.length; index++) {
      let key = keys[index];
      const value = (parsedResult as any)[key];
      let view = 
      <View style={styles.infoField} key={"field-"+key}>
        <Text style={styles.fieldLabel}>{key+":"}</Text>
        <TextInput 
          style={styles.fieldInput} 
          onChangeText={(text)=>{onChangeText(key,text)}}
          value={value}/>
      </View>
      fieldArray.push(view);
    }
    return (
      fieldArray
    )
  }
  
  useEffect(() => {
    (async () => {
      let success = await initLicense("DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTE2NDk4Mjk3OTI2MzUiLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSIsInNlc3Npb25QYXNzd29yZCI6IndTcGR6Vm05WDJrcEQ5YUoifQ==");
      if (!success) {
        Alert.alert("","License for the MRZ Reader is invalid.");
      }
    })();
  }, []);

  const saveCard = async () => {
    console.log("Save Card");
    let complete = isInfoComplete();
    if (complete) {
      let key;
      if (cardKey.current) {
        key = parseInt(cardKey.current);
      }else{
        key = new Date().getTime();
        cardKey.current = key.toString();
      }
      let card:ScannedIDCard = {
        frontImage:frontImageBase64,
        backImage:backImageBase64,
        info:parsedResult,
        timestamp:key
      }
      await IDCardManager.saveIDCard(card);
      Alert.alert("","Saved");
    }else{
      Alert.alert("","Card info not complete");
    }
  }

  const isInfoComplete = () => {
    let complete = true;
    if (!frontImageBase64) {
      complete = false;
      console.log("frontImageBase64 empty");
    }
    if (!backImageBase64) {
      complete = false;
      console.log("backImageBase64 empty");
    }
    for (const key in parsedResult) {
      const value = (parsedResult as any)[key];
      console.log(key);
      console.log(value);
      if (!value) {
        complete = false;
        console.log("empty");
        break;
      }
    }
    return complete;
  }

  useEffect(() => {
    // Use `setOptions` to update the button that we previously specified
    // Now the button includes an `onPress` handler to update the count
    props.navigation.setOptions({
      headerRight: () => (
        <TextButton title="Save" onPress={()=>saveCard()}></TextButton>
      ),
    });
  }, [props.navigation,parsedResult,frontImageBase64,backImageBase64]);


  useEffect(() => {
    if (props.route.params?.base64) {
      let base64 = props.route.params?.base64; 
      if (isFrontRef.current === true) {
        setFrontImageBase64(base64);
      }else{
        setBackImageBase64(base64);
        recognizeIDCard(base64);
      }
    }
  }, [props.route.params?.base64]);

  const recognizeIDCard = async (base64:string) => {
    const OCRResult = await decodeBase64(base64)
    if (OCRResult.results.length>0) {
      let lineResults = OCRResult.results[0].lineResults;
      let MRZLines:string[] = [];
      for (let index = 0; index < lineResults.length; index++) {
        const lineResult = lineResults[index];
        MRZLines = MRZLines.concat(lineResult.text.split("\n"));
      }
      console.log(MRZLines);
      let parsed = parse(MRZLines);
      let result = {
        Surname:parsed.fields.lastName ?? "",
        GivenName:parsed.fields.firstName ?? "",
        IDNumber:parsed.fields.documentNumber ?? "",
        DateOfBirth:parsed.fields.birthDate ?? "",
        DateOfExpiry:parsed.fields.expirationDate ?? ""
      }
      console.log("set parsed result");
      console.log(result);
      setParsedResult(result);
      return;
    }
    Alert.alert("","Failed to recognize the card.");
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      <ScrollView>
        {Card({isFront:true})}
        {Card({isFront:false})}
        <Text style={styles.header}>
          Info
        </Text>
        {Fields()}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  infoField:{
    flexDirection:"row",
    paddingLeft: 10,
    paddingRight: 10,
  },
  fieldLabel:{
    flex:1/3,
    alignSelf:"center",
  },
  fieldInput:{
    flex:2/3,
    borderBottomWidth:0.2,
    borderBottomColor:"gray",
  },
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

