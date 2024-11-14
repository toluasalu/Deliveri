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

export const getPatrolIDFromStorage = async () => {
  try {
    return await AsyncStorage.getItem('patrolID');
  } catch (e) {
    // saving error
    console.error('Error getting patrolID:', e);
  }
};
