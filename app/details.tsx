import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline, AnimatedRegion, Callout } from 'react-native-maps';
import { View, StyleSheet, Alert, Text } from 'react-native';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { createNewDoc } from 'firebaseConfig';
import { useLocationContext } from '../context/LocationProvider';
import { Button } from '../components/Button';
import axios from 'axios';
import dayjs from 'dayjs';
const LOCATION_TASK_NAME = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
  if (error) {
    // Error occurred - check `error.message` for more details.
    return;
  }
  if (data) {
    const { locations } = data;
    console.log("Locations;", locations);
    // do something with the locations captured in the background
    if (locations && locations.length > 0) {
      console.log("Locations object:", locations);
      const { latitude, longitude } = locations[0].coords;
      console.log('Background Location:', { latitude, longitude });
      // Function to get serial number from AsyncStorage
      const getSerialNumber = async () => {
        try {
          const serial = await AsyncStorage.getItem('serialNumber');
          return serial ? parseInt(serial, 10) : 0; // Default to 0 if not found
        } catch (e) {
          console.error('Error getting serial number:', e);
          return 0;
        }
      };
      // Function to update and store serial number
      const updateSerialNumber = async (serial) => {
        try {
          await AsyncStorage.setItem('serialNumber', (serial + 1).toString());
        } catch (e) {
          console.error('Error updating serial number:', e);
        }
      };
      const getData = async () => {
        try {
          return await AsyncStorage.getItem('patrolID');
        } catch (e) {
          // saving error
          console.error('Error getting patrolID:', e);
        }
      };

      // Using the function to check if patrolID is available
      const checkPatrolID = async () => {
        const patrolId = await getData();
        const serialNumber = await getSerialNumber();
        console.log("Serial No:", serialNumber);
        if (patrolId) {
          // patrolId is not null or undefined
          axios
            .post(
              'https://cloudbases.in/forest_patrolling/PatrollingAppTestApi/update_patrolling_track',
              {
                patrolling_id: patrolId,
                latitude,
                longitude,
                serialNo: serialNumber
              },
              {
                headers: {
                  'Content-Type': 'multipart/form-data'
                }
              }
            )
            .then(function (response) {
              console.log('Update Patrol Response:', response?.data?.data);
            })
            .catch(function (error) {
              console.log('Update Patrol Error:', error);
            });
          // Store the updated serial number
          await updateSerialNumber(serialNumber);
          const storeData = async (value) => {
            try {
              await AsyncStorage.setItem('lastLocation', JSON.stringify(value));
            } catch (e) {
              // saving error
              console.error('Error saving location:', e);
            }
          };

          storeData({ latitude, longitude });
        } else {
          // patrolId is null or undefined
          console.log('No Patrol ID found');
        }
      };
      checkPatrolID();
    }
  }
});

export default function Details() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<null | string>(null);
  const { markerObj, setMarkerObj } = useLocationContext();
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState({
    latitude: 9.1123704,
    longitude: 7.376144,
    latitudeDelta: 0.0622,
    longitudeDelta: 0.0421,
  });
  // const [markerObj, setMarkerObj] = useState<{ latitude: number; longitude: number } | null>(null);
  const handleCreateDoc = async (lat, long) => {
    const tripID = 'Trip_' + dayjs().format('YYYYMMDD_HHmmss'); // Example: "Trip_20241102_153045"
    const collectionName = `Coordinates ${tripID}`;
    const docRef = await createNewDoc(
      collectionName,
      lat,
      long
    );
    if (docRef) {
      console.log('Document created successfully');
    }
  };

  useEffect(() => {
    (async () => {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        Alert.alert('Foreground Permission to access location was denied');
        return;
      }
      if (foregroundStatus === 'granted') {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== 'granted') {
          Alert.alert('Background Permission to access location was denied');
          return;
        }
        if (backgroundStatus === 'granted') {
          await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.Highest,
          });
        }
        const location = await Location.getCurrentPositionAsync({});
        setLocation(location);
      }
    })();
  }, []);

  useEffect(() => {
    const fetchLatestLocation = async () => {
      try {
        const storedLocation = await AsyncStorage.getItem('latestLocation');
        if (storedLocation) {
          const { latitude, longitude } = JSON.parse(storedLocation);
          setMarkerObj({ latitude, longitude });
          mapRef.current?.animateToRegion(
            {
              latitude,
              longitude,
              latitudeDelta: 0.0622,
              longitudeDelta: 0.0421,
            },
            3000
          );
        }
      } catch (err) {
        console.error('Failed to load location from AsyncStorage:', err);
      }
    };

    fetchLatestLocation();
  }, []);

  useEffect(() => {
    if (!location) return; // Exit if location is not set yet
    // Update the region state with the new latitude and longitude
    setRegion((prevRegion) => ({
      latitude: location?.coords.latitude,
      longitude: location?.coords.longitude,
      latitudeDelta: 0.0622,
      longitudeDelta: 0.0421,
    }));
    handleCreateDoc(location?.coords.latitude, location?.coords.longitude);
    const tripID = 'Trip_' + Date.now(); // Example of generating a unique name
    axios.post('https://cloudbases.in/forest_patrolling/PatrollingAppTestApi/start_patrolling', {
      patrolling_name: tripID,
    },
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
      .then(async (response) => {
        console.log("Patrol Response:", response?.data?.data);
        try {
          await AsyncStorage.setItem('patrolID', response?.data?.data?.patrolling_id.toString());
        } catch (e) {
          // saving error
          console.error('Error saving patrolID:', e);
        }
      })
      .catch(function (error) {
        console.log("Patrol Error:", error);
      });
    setMarkerObj({ latitude: location?.coords.latitude, longitude: location?.coords.longitude });
  }, [location]);

  useEffect(() => {
    setMarkerObj({ latitude: region.latitude, longitude: region.longitude });
    mapRef.current?.animateToRegion(region, 3 * 1000);
  }, [region]);
  return (
    <>
      <Stack.Screen options={{ title: 'Details' }} />
      <View style={styles.container}>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          ref={mapRef}
          initialRegion={region}
          showsBuildings>
          {markerObj && (
            <Marker coordinate={markerObj} pinColor="red">
              <Callout>
                <View style={{ padding: 10 }}>
                  <Text style={{ fontSize: 22 }}>Your Location</Text>
                </View>
              </Callout>
            </Marker>
          )}
        </MapView>
      </View>
    </>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  buttonContainerStyle: {
    position: 'absolute',
    bottom: 20,
    left: '50%',
    transform: [{ translateX: -50 }]
  }
});

