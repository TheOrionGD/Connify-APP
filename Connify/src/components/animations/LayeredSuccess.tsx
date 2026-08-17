import React, { useEffect } from 'react';
import { View, StyleSheet, Modal, Text, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ShieldCapsule from './ShieldCapsule';

interface LayeredSuccessProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

const LayeredSuccess: React.FC<LayeredSuccessProps> = ({
  visible,
  onClose,
  title = "Connection Secure",
  message = "Handshake verified successfully."
}) => {
  const modalScale = useSharedValue(0);
  const modalOpacity = useSharedValue(0);
  const checkmarkScale = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // 1. Modal scales and fades in
      modalScale.value = withSpring(1, { damping: 12, stiffness: 90 });
      modalOpacity.value = withTiming(1, { duration: 300 });

      // 2. Checkmark pops in after shield draws (shield takes ~1.5s)
      checkmarkScale.value = withDelay(
        1500,
        withSpring(1, { damping: 10, stiffness: 100 })
      );

      // 3. Text slides up and fades in
      textOpacity.value = withDelay(
        1800,
        withTiming(1, { duration: 400 })
      );
      textTranslateY.value = withDelay(
        1800,
        withTiming(0, { duration: 400, easing: Easing.out(Easing.ease) })
      );

      // 4. Button fades in
      buttonOpacity.value = withDelay(
        2200,
        withTiming(1, { duration: 300 })
      );
    } else {
      modalScale.value = 0;
      modalOpacity.value = 0;
      checkmarkScale.value = 0;
      textOpacity.value = 0;
      textTranslateY.value = 20;
      buttonOpacity.value = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const animatedModalStyle = useAnimatedStyle(() => {
    return {
      opacity: modalOpacity.value,
      transform: [{ scale: modalScale.value }],
    };
  });

  const animatedCheckmarkStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: checkmarkScale.value }],
      opacity: interpolate(checkmarkScale.value, [0, 1], [0, 1]),
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      opacity: textOpacity.value,
      transform: [{ translateY: textTranslateY.value }],
    };
  });

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      opacity: buttonOpacity.value,
    };
  });

  if (!visible && modalOpacity.value === 0) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Animated.View style={[styles.modalContainer, animatedModalStyle]}>
          
          <View style={styles.animationContainer}>
            <ShieldCapsule isDrawing={visible} duration={1200} color="#4CD964" size={140} />
            
            <Animated.View style={[styles.checkmarkContainer, animatedCheckmarkStyle]}>
              <Icon name="check" size={50} color="#4CD964" />
            </Animated.View>
          </View>

          <Animated.View style={[styles.textContainer, animatedTextStyle]}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </Animated.View>

          <Animated.View style={[animatedButtonStyle, { width: '100%' }]}>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </Animated.View>

        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#1C1C1E', // Dark mode surface
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  animationContainer: {
    height: 160,
    width: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkmarkContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 40,
    width: 80,
    height: 80,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#0A84FF',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LayeredSuccess;
