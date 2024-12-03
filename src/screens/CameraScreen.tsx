import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, Platform, Switch } from "react-native";
import Svg, { Rect } from "react-native-svg";
import { Camera, useCameraDevice, useCameraFormat, useFrameProcessor } from "react-native-vision-camera";
import { useSharedValue, Worklets } from "react-native-worklets-core";
import * as Cropper from "vision-camera-cropper";
import { CropRegion } from "vision-camera-cropper";
import * as DDN from "vision-camera-dynamsoft-document-normalizer";

export interface CameraScreenProps {
  route:any;
  navigation:any;
}

export default function CameraScreen(props:CameraScreenProps){
  console.log(Cropper);

  const [hasPermission, setHasPermission] = useState(false);
  const [crop, setCrop] = useState(false);
  const useCrop = useRef(false);
  const [isActive,setIsActive] = useState(true);
  const device = useCameraDevice("back");
  const format = useCameraFormat(device, [
    { videoResolution: { width: 1920, height: 1080 } },
    { fps: 30 }
  ])
  const toggleSwitch = () => {
    useCrop.current = !crop;
    setCrop(previousState => !previousState);
  };
  const [cropRegion,setCropRegion] = useState({
    left: 10,
    top: 20,
    width: 80,
    height: 30
  });
  const cropRegionShared = useSharedValue<undefined|CropRegion>(undefined);
  const shouldTake = useSharedValue(false);
  const [pressed,setPressed] = useState(false);
  const capture = () => {
    shouldTake.value=true;
  }

  const adaptCropRegionForIDCard = () => {
    let size = getFrameSize();
    let regionWidth = 0.8*size.width;
    let desiredRegionHeight = regionWidth/(85.6/54);
    let height = Math.ceil(desiredRegionHeight/size.height*100);
    let region = {
      left:10,
      width:80,
      top:20,
      height:height
    };
    setCropRegion(region);
    cropRegionShared.value = region;
  }

  const getViewBox = () => {
    const frameSize = getFrameSize();
    const viewBox = "0 0 "+frameSize.width+" "+frameSize.height;
    return viewBox;
  }

  const getFrameSize = ():{width:number,height:number} => {
    let size = {width:1080,height:1920};
    return size;
  }

  const onCaptured = async (base64:string) => {
    setIsActive(false);
    console.log("onCaptured");
    console.log(useCrop.current);
    if (useCrop.current) {
      console.log(base64);
      const detectedQuads = await DDN.detectBase64(base64);
      console.log(detectedQuads);
      if (detectedQuads.length>0) {
        const normalized = await DDN.normalizeBase64(base64,detectedQuads[0].location,{includeNormalizationResultAsBase64:true});
        console.log(normalized);
        if (normalized.imageBase64) {
          base64 = normalized.imageBase64;
        }
      }
    }
    if (props) {
      if (props.navigation) {
        props.navigation.navigate({
          name: 'Card',
          params: { base64: base64 },
          merge: true,
        });
      }
    }
  }

  const onCapturedJS = Worklets.createRunOnJS(onCaptured);
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    if (shouldTake.value == true && cropRegionShared.value != undefined) {
      shouldTake.value = false;
      const result = Cropper.crop(frame,{cropRegion:cropRegion,includeImageBase64:true,saveAsFile:false});
      if (result.base64) {
        onCapturedJS(result.base64);
      }
    }
  }, []);
  
  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
      setIsActive(true);
      adaptCropRegionForIDCard();
    })();
  }, []);
  
  return (
    <View style={StyleSheet.absoluteFill}>
      {device != null &&
      hasPermission && (
      <>
        <Camera
          style={StyleSheet.absoluteFill}
          isActive={isActive}
          device={device}
          format={format}
          frameProcessor={frameProcessor}
          pixelFormat='yuv'
        />
         <Svg preserveAspectRatio='xMidYMid slice' style={StyleSheet.absoluteFill} viewBox={getViewBox()}>
          <Rect 
            x={cropRegion.left/100*getFrameSize().width}
            y={cropRegion.top/100*getFrameSize().height}
            width={cropRegion.width/100*getFrameSize().width}
            height={cropRegion.height/100*getFrameSize().height}
            strokeWidth="2"
            stroke="red"
            fillOpacity={0.0}
          />
        </Svg>
      </>
      )}
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
      <View style={[styles.control]}>
        <Text>Crop:</Text>
        <Switch
          trackColor={{false: '#767577', true: '#81b0ff'}}
          thumbColor={crop ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={crop}
        />
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
    backgroundColor:'rgba(0, 0, 0, 0.2)',
  },
  control:{
    flexDirection:"row",
    position: 'absolute',
    bottom: 0,
    height: 60,
    alignSelf:"flex-start",
    alignItems: 'center',
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
