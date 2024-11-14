import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

export const handleOpenSettings = () => {
  if (Platform.OS === 'ios') {
    Linking.openURL('app-settings:');
  } else {
    Linking.openSettings();
  }
};
