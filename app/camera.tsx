// app/camera.tsx (or wherever your camera screen lives)
import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { X, RotateCcw, Zap, ZapOff, Plus, Minus } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

type FlashMode = 'off' | 'on' | 'torch';
const ZOOM_STEP = 0.1;          // button increment
const PINCH_SENSITIVITY = 0.8;  // higher = faster zoom response to pinch

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [zoom, setZoom] = useState(0);            // 0..1
  const [flash, setFlash] = useState<FlashMode>('off');

  const cameraRef = useRef<CameraView>(null);
  const baseZoom = useRef(0);               // for pinch baseline
  const router = useRouter();

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

  const toggleCameraFacing = () => {
    setFacing(curr => {
      // if we were in torch and switch to front, torch is not supported
      if (flash === 'torch') setFlash('off');
      return curr === 'back' ? 'front' : 'back';
    });
  };

  const nextFlash = () => {
    // off -> on -> torch -> off (skip torch on front camera)
    if (flash === 'off') return setFlash('on');
    if (flash === 'on')  return setFlash(facing === 'front' ? 'off' : 'torch');
    return setFlash('off');
  };

  const zoomOut = () => setZoom(z => clamp(z - ZOOM_STEP));
  const zoomIn  = () => setZoom(z => clamp(z + ZOOM_STEP));

  // Pinch gesture for zoom
  const pinchGesture = Gesture.Pinch()
    .onBegin(() => {
      baseZoom.current = zoom;
    })
    .onUpdate((event) => {
      // Calculate new zoom based on pinch scale
      const newZoom = baseZoom.current + (event.scale - 1) * PINCH_SENSITIVITY;
      setZoom(clamp(newZoom, 0, 1));
    })
    .onEnd(() => {
      baseZoom.current = zoom;
    });

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (photo) {
        router.push({
          pathname: '/photo-preview',
          params: { photoUri: photo.uri },
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleCancel = () => router.back();

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
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const flashIcon = flash === 'off' ? <ZapOff size={22} color="white" /> : <Zap size={22} color="white" />;

  return (
    <View style={styles.container}>
      {/* Gesture detector wraps the camera for pinch-to-zoom */}
      <GestureDetector gesture={pinchGesture}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          zoom={zoom}
          flash={(flash === 'on' ? 'on' : 'off') as any}
          enableTorch={flash === 'torch'}
        />
      </GestureDetector>
      
      {/* Controls overlay - positioned absolutely over the camera */}
      <SafeAreaView style={styles.controlsOverlay} pointerEvents="box-none">
        {/* Top bar: close + flash + flip */}
        <View style={styles.topControls}>
          <TouchableOpacity style={styles.circleBtn} onPress={handleCancel}>
            <X size={24} color="white" />
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity style={styles.circleBtn} onPress={nextFlash}>
              {flashIcon}
            </TouchableOpacity>
            <TouchableOpacity style={styles.circleBtn} onPress={toggleCameraFacing}>
              <RotateCcw size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom bar: zoom -, label, +  |  shutter  |  flash mode text */}
        <View style={styles.bottomControls}>
          <View style={styles.bottomRow}>
            {/* Zoom cluster */}
            <View style={styles.zoomCluster}>
              <TouchableOpacity 
                style={[styles.smallBtn, zoom <= 0 && styles.disabledBtn]} 
                onPress={zoomOut}
                disabled={zoom <= 0}
              >
                <Minus size={20} color={zoom <= 0 ? "rgba(255,255,255,0.4)" : "white"} />
              </TouchableOpacity>
              <Text style={styles.zoomLabel}>{`${(1 + zoom * 9).toFixed(1)}x`}</Text>
              <TouchableOpacity 
                style={[styles.smallBtn, zoom >= 1 && styles.disabledBtn]} 
                onPress={zoomIn}
                disabled={zoom >= 1}
              >
                <Plus size={20} color={zoom >= 1 ? "rgba(255,255,255,0.4)" : "white"} />
              </TouchableOpacity>
            </View>

            {/* Shutter */}
            <TouchableOpacity style={styles.shutterButton} onPress={takePicture} activeOpacity={0.85}>
              <View style={styles.shutterButtonInner} />
            </TouchableOpacity>

            {/* Flash text */}
            <View style={styles.flashPill}>
              <Text style={styles.flashText}>{flash}</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  camera: { flex: 1 },
  
  // Overlay for controls positioned absolutely
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
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  bottomControls: {
    position: 'absolute',
    bottom: 34,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  bottomRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  smallBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  disabledBtn: {
    backgroundColor: 'rgba(0,0,0,0.25)',
  },

  zoomCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: width * 0.32,
    justifyContent: 'flex-start',
  },
  zoomLabel: {
    minWidth: 48,
    textAlign: 'center',
    fontFamily: 'Jua-Regular',
    fontSize: 16,
    color: 'white',
  },

  shutterButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  shutterButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'white',
  },

  flashPill: { width: width * 0.32, alignItems: 'flex-end' },
  flashText: {
    textTransform: 'uppercase',
    fontFamily: 'Jua-Regular',
    fontSize: 12,
    color: 'white',
    opacity: 0.9,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 14,
  },

  permissionContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 40, backgroundColor: Colors.primary.backgroundAlt,
  },
  permissionTitle: {
    fontFamily: 'Jua-Regular', fontSize: 24, color: Colors.primary.text,
    textAlign: 'center', marginBottom: 16,
  },
  permissionText: {
    fontFamily: 'Jua-Regular', fontSize: 16, color: Colors.primary.text,
    textAlign: 'center', marginBottom: 30, lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: Colors.button.primary, paddingHorizontal: 32,
    paddingVertical: 16, borderRadius: 8, marginBottom: 12,
  },
  permissionButtonText: {
    fontFamily: 'Jua-Regular', fontSize: 16, color: Colors.button.primaryText, textAlign: 'center',
  },
  cancelButton: { paddingHorizontal: 32, paddingVertical: 16 },
  cancelButtonText: { fontFamily: 'Jua-Regular', fontSize: 16, color: Colors.primary.text, textAlign: 'center' },
  message: { fontFamily: 'Jua-Regular', fontSize: 16, color: Colors.white, textAlign: 'center' },
});