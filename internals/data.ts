import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeLocationDataToStorage = async (value: {
  latitude: number;
  longitude: number;
}) => {
  try {
    await AsyncStorage.setItem('lastLocation', JSON.stringify(value));
  } catch (e) {
    // saving error
    console.error('Error saving location:', e);
  }
};

const patrolIDKey = 'patrol-id';

export const getPatrolIDFromStorage = async () => {
  return AsyncStorage.getItem(patrolIDKey);
};

export const storePatrolIDToStorage = async (value: string) => {
  return AsyncStorage.setItem(patrolIDKey, value);
};
