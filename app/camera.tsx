import { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  Dimensions
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions, FlashMode } from 'expo-camera';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, RotateCcw, Zap, ZapOff, Plus, Minus } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import * as MediaLibrary from 'expo-media-library';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [zoom, setZoom] = useState(0);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Camera Access Needed</Text>
          <Text style={styles.permissionText}>
            meomow needs camera access to take photos of cats for your catalog.
          </Text>
          <TouchableOpacity 
            style={styles.permissionButton} 
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlash(current => {
      switch (current) {
        case 'off':
          return 'on';
        case 'on':
          return 'auto';
        case 'auto':
        default:
          return 'off';
      }
    });
  };

  const getFlashIcon = () => {
    switch (flash) {
      case 'on':
        return <Zap size={24} color="yellow" />;
      case 'auto':
        return <Zap size={24} color="white" />;
      case 'off':
      default:
        return <ZapOff size={24} color="white" />;
    }
  };

  const getFlashText = () => {
    switch (flash) {
      case 'on':
        return 'ON';
      case 'auto':
        return 'AUTO';
      case 'off':
      default:
        return 'OFF';
    }
  };

  const increaseZoom = () => {
    setZoom(current => Math.min(current + 0.1, 1));
  };

  const decreaseZoom = () => {
    setZoom(current => Math.max(current - 0.1, 0));
  };

  // Pinch gesture for zoom
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      const newZoom = Math.min(Math.max(zoom * event.scale, 0), 1);
      setZoom(newZoom);
    });

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });

        if (photo) {
          router.push({
            pathname: '/photo-preview',
            params: { photoUri: photo.uri }
          });
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to take photo. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <GestureDetector gesture={pinchGesture}>
        <CameraView 
          style={styles.camera} 
          facing={facing} 
          ref={cameraRef}
          flash={flash}
          zoom={zoom}
        />
      </GestureDetector>
      
      {/* Camera Controls Overlay */}
      <SafeAreaView style={styles.controlsOverlay}>
        {/* Top Controls */}
        <View style={styles.topControls}>
          <TouchableOpacity 
            style={styles.controlButton} 
            onPress={handleCancel}
          >
            <X size={28} color="white" />
          </TouchableOpacity>
          
          <View style={styles.rightTopControls}>
            <TouchableOpacity 
              style={[styles.controlButton, styles.flashButton]} 
              onPress={toggleFlash}
            >
              {getFlashIcon()}
              <Text style={styles.flashText}>{getFlashText()}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={toggleCameraFacing}
            >
              <RotateCcw size={28} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Side Zoom Controls */}
        <View style={styles.sideControls}>
          <TouchableOpacity 
            style={styles.zoomButton} 
            onPress={increaseZoom}
            disabled={zoom >= 1}
          >
            <Plus size={24} color={zoom >= 1 ? "rgba(255,255,255,0.5)" : "white"} />
          </TouchableOpacity>
          
          <View style={styles.zoomIndicator}>
            <Text style={styles.zoomText}>{Math.round(zoom * 10 + 10)}x</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.zoomButton} 
            onPress={decreaseZoom}
            disabled={zoom <= 0}
          >
            <Minus size={24} color={zoom <= 0 ? "rgba(255,255,255,0.5)" : "white"} />
          </TouchableOpacity>
        </View>
        
        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <TouchableOpacity 
            style={styles.shutterButton} 
            onPress={takePicture}
            activeOpacity={0.8}
          >
            <View style={styles.shutterButtonInner} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  camera: {
    flex: 1,
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  rightTopControls: {
    flexDirection: 'row',
    gap: 12,
  },
  sideControls: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -60 }],
    alignItems: 'center',
    gap: 12,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  flashText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
    marginTop: 2,
  },
  zoomButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    minWidth: 40,
    alignItems: 'center',
  },
  zoomText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  shutterButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  shutterButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: Colors.primary.backgroundAlt,
  },
  permissionTitle: {
    fontFamily: 'Jua-Regular',
    fontSize: 24,
    color: Colors.primary.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  permissionText: {
    fontFamily: 'Jua-Regular',
    fontSize: 16,
    color: Colors.primary.text,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: Colors.button.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  permissionButtonText: {
    fontFamily: 'Jua-Regular',
    fontSize: 16,
    color: Colors.button.primaryText,
    textAlign: 'center',
  },
  cancelButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  cancelButtonText: {
    fontFamily: 'Jua-Regular',
    fontSize: 16,
    color: Colors.primary.text,
    textAlign: 'center',
  },
  message: {
    fontFamily: 'Jua-Regular',
    fontSize: 16,
    color: Colors.white,
    textAlign: 'center',
  },
});