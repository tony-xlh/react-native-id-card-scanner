import { useEffect, useRef, useState } from "react";
import { View, StyleSheet, ScrollView, Text, Pressable, Image, Button, TextInput, Alert } from "react-native"
import { ParsedResult } from "../utils/IDCardManager";
import { decodeBase64, initLicense, updateTemplate, useCustomModel } from "vision-camera-dynamsoft-label-recognizer";
import { parse } from "mrz";

interface CardScreenProps {
  route:any;
  navigation:any;
}

export default function CardScreen(props:CardScreenProps){
  const isFrontRef = useRef(false);
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
    let fieldArray = [];
    let keys = Object.keys(parsedResult);
    for (let index = 0; index < keys.length; index++) {
      let key = keys[index];
      const value = (parsedResult as any)[key];
      let view = 
      <View style={styles.infoField} key={"field-"+key}>
        <Text style={styles.fieldLabel}>{key+":"}</Text>
        <TextInput style={styles.fieldInput} value={value}/>
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
      try {
        await useCustomModel({customModelFolder:"MRZ",customModelFileNames:["MRZ"]});
        await updateTemplate("{\"CharacterModelArray\":[{\"DirectoryPath\":\"\",\"Name\":\"MRZ\"}],\"LabelRecognizerParameterArray\":[{\"Name\":\"default\",\"ReferenceRegionNameArray\":[\"defaultReferenceRegion\"],\"CharacterModelName\":\"MRZ\",\"LetterHeightRange\":[5,1000,1],\"LineStringLengthRange\":[30,44],\"LineStringRegExPattern\":\"([ACI][A-Z<][A-Z<]{3}[A-Z0-9<]{9}[0-9][A-Z0-9<]{15}){(30)}|([0-9]{2}[(01-12)][(01-31)][0-9][MF<][0-9]{2}[(01-12)][(01-31)][0-9][A-Z<]{3}[A-Z0-9<]{11}[0-9]){(30)}|([A-Z<]{0,26}[A-Z]{1,3}[(<<)][A-Z]{1,3}[A-Z<]{0,26}<{0,26}){(30)}|([ACIV][A-Z<][A-Z<]{3}([A-Z<]{0,27}[A-Z]{1,3}[(<<)][A-Z]{1,3}[A-Z<]{0,27}){(31)}){(36)}|([A-Z0-9<]{9}[0-9][A-Z<]{3}[0-9]{2}[(01-12)][(01-31)][0-9][MF<][0-9]{2}[(01-12)][(01-31)][0-9][A-Z0-9<]{8}){(36)}|([PV][A-Z<][A-Z<]{3}([A-Z<]{0,35}[A-Z]{1,3}[(<<)][A-Z]{1,3}[A-Z<]{0,35}<{0,35}){(39)}){(44)}|([A-Z0-9<]{9}[0-9][A-Z<]{3}[0-9]{2}[(01-12)][(01-31)][0-9][MF<][0-9]{2}[(01-12)][(01-31)][0-9][A-Z0-9<]{14}[A-Z0-9<]{2}){(44)}\",\"MaxLineCharacterSpacing\":130,\"TextureDetectionModes\":[{\"Mode\":\"TDM_GENERAL_WIDTH_CONCENTRATION\",\"Sensitivity\":8}],\"Timeout\":9999}],\"LineSpecificationArray\":[{\"BinarizationModes\":[{\"BlockSizeX\":30,\"BlockSizeY\":30,\"Mode\":\"BM_LOCAL_BLOCK\",\"MorphOperation\":\"Close\"}],\"LineNumber\":\"\",\"Name\":\"defaultTextArea->L0\"}],\"ReferenceRegionArray\":[{\"Localization\":{\"FirstPoint\":[0,0],\"SecondPoint\":[100,0],\"ThirdPoint\":[100,100],\"FourthPoint\":[0,100],\"MeasuredByPercentage\":1,\"SourceType\":\"LST_MANUAL_SPECIFICATION\"},\"Name\":\"defaultReferenceRegion\",\"TextAreaNameArray\":[\"defaultTextArea\"]}],\"TextAreaArray\":[{\"Name\":\"defaultTextArea\",\"LineSpecificationNameArray\":[\"defaultTextArea->L0\"]}]}");
      } catch (error:any) {
        console.log(error);
        Alert.alert("Error","Failed to load model.");
      }
    })();
  }, []);

  const recognizeIDCard = async (base64:string) => {
    const result = await decodeBase64(base64)
    if (result.results.length>0) {
      let lineResults = result.results[0].lineResults;
      if (lineResults.length >= 3) {
        let MRZLines = [];
        MRZLines.push(lineResults[lineResults.length - 3].text);
        MRZLines.push(lineResults[lineResults.length - 2].text);
        MRZLines.push(lineResults[lineResults.length - 1].text);
        console.log(MRZLines);
        let parsed = parse(MRZLines);
        let result = {
          Surname:parsed.fields.lastName ?? "",
          GivenName:parsed.fields.firstName ?? "",
          IDNumber:parsed.fields.documentNumber ?? "",
          DateOfBirth:parsed.fields.birthDate ?? "",
          DateOfExpiry:parsed.fields.expirationDate ?? ""
        }
        setParsedResult(result);
        return;
      }
    }
    Alert.alert("","Failed to recognize the card.");
  }

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

