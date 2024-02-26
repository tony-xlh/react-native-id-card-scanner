import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Camera, useCameraDevice, useCameraFormat } from "react-native-vision-camera";

export default function CameraScreen(){
  const [hasPermission, setHasPermission] = useState(false);
  const [isActive,setIsActive] = useState(true);
  const device = useCameraDevice("back");
  const format = useCameraFormat(device, [
    { videoResolution: { width: 1920, height: 1080 } },
    { fps: 30 }
  ])
  const [shouldTake,setShouldTake] = useState(false);
  const [pressed,setPressed] = useState(false);
  const capture = () => {
    setShouldTake(true);
  }
  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
      setIsActive(true);
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
          pixelFormat='yuv'
        />
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
