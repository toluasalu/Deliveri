import React, { forwardRef } from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';

type ButtonProps = {
  title: string;
  loading?: boolean;
} & TouchableOpacityProps;

export const Button = forwardRef<TouchableOpacity, ButtonProps>(
  ({ title, loading = false, disabled, ...touchableProps }, ref) => {
    return (
      <TouchableOpacity
        disabled={loading || disabled}
        ref={ref}
        {...touchableProps}
        className={`${styles.button} ${touchableProps.className}`}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text className={styles.buttonText}>{title}</Text>
          {loading ? <ActivityIndicator size="small" color="white" /> : null}
        </View>
      </TouchableOpacity>
    );
  }
);

const styles = {
  button: 'items-center bg-indigo-500 rounded-[28px] shadow-md p-4',
  buttonText: 'text-white text-lg font-semibold text-center',
};
