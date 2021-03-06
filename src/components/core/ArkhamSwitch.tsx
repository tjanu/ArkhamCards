import React, { useCallback, useContext } from 'react';
import { StyleSheet, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { TouchableOpacity as GestureHandlerTouchableOpacity } from 'react-native-gesture-handler';

import StyleContext from '@styles/StyleContext';
import AppIcon from '@icons/AppIcon';

interface Props extends TouchableOpacityProps {
  useGestureHandler?: boolean;
  value: boolean;
  onValueChange: (checked: boolean) => void;
  accessibilityLabel?: string;
  large?: boolean;
}
export default function ArkhamSwitch({ useGestureHandler, value, onValueChange, accessibilityLabel, disabled, large, ...props }: Props) {
  const { colors } = useContext(StyleContext);

  const onPress = useCallback(() => {
    onValueChange(!value);
  }, [value, onValueChange]);

  const TouchableComponent = useGestureHandler ? GestureHandlerTouchableOpacity : TouchableOpacity;
  return (
    <TouchableComponent
      onPress={onPress}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value }}
      disabled={disabled} {...props}
    >
      <View style={[styles.icon, large ? styles.largeIcon : undefined]}>
        <AppIcon size={large ? 34 : 28} name="check-circle" color={disabled ? colors.L20 : colors.L10} />
        { !!value && (
          <View style={styles.check}>
            <AppIcon size={large ? 26 : 20} name="check" color={disabled ? colors.L20 : colors.M} />
          </View>
        )}
      </View>
    </TouchableComponent>
  );
}

const styles = StyleSheet.create({
  largeIcon: {
    width: 40,
    height: 40,
  },
  icon: {
    width: 32,
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  check: {
    position: 'absolute',
    top: 2,
    right: 3,
  },
});

