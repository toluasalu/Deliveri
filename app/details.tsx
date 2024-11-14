import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Location from 'expo-location';
import { Stack } from 'expo-router';
import * as TaskManager from 'expo-task-manager';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import { useLocationContext } from '../context/LocationProvider';

import { Button } from '~/components/Button';
import { getPatrolIDFromStorage, storeLocationDataToStorage } from '~/internals/data';
import { handleOpenSettings } from '~/internals/linking';
import type { Location as LocationType } from '~/internals/location';

const LOCATION_TASK_NAME = 'background-location-task';

TaskManager.defineTask(
  LOCATION_TASK_NAME,
  ({ data, error }: { data: { locations: LocationType[] }; error: unknown }) => {
    if (error) {
      // Error occurred - check `error.message` for more details.
      return;
    }
    if (data) {
      const { locations } = data;
      console.log('Locations;', locations);
      // do something with the locations captured in the background
      if (locations && locations.length > 0) {
        console.log('Locations object:', locations);
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
        const updateSerialNumber = async (serial: number) => {
          try {
            await AsyncStorage.setItem('serialNumber', (serial + 1).toString());
          } catch (e) {
            console.error('Error updating serial number:', e);
          }
        };

        // Using the function to check if patrolID is available
        const checkPatrolID = async () => {
          const patrolId = await getPatrolIDFromStorage();
          const serialNumber = await getSerialNumber();
          console.log('Serial No:', serialNumber);
          if (patrolId) {
            // patrolId is not null or undefined
            axios
              .post(
                'https://cloudbases.in/forest_patrolling/PatrollingAppTestApi/update_patrolling_track',
                {
                  patrolling_id: patrolId,
                  latitude,
                  longitude,
                  serialNo: serialNumber,
                },
                {
                  headers: {
                    'Content-Type': 'multipart/form-data',
                  },
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
            await storeLocationDataToStorage({ latitude, longitude });
          } else {
            // patrolId is null or undefined
            console.log('No Patrol ID found');
          }
        };
        checkPatrolID();
      }
    }
  }
);

export default function Details() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const { markerObj, setMarkerObj } = useLocationContext();
  const mapRef = useRef<MapView>(null);
  const [backgroundPermission, requestBackgroundPermission] = Location.useBackgroundPermissions();
  const [foregroundPermission, requestForegroundPermission] = Location.useForegroundPermissions();

  const [region, setRegion] = useState({
    latitude: 9.1123704,
    longitude: 7.376144,
    latitudeDelta: 0.0622,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    setMarkerObj({ latitude: region.latitude, longitude: region.longitude });
    mapRef.current?.animateToRegion(region, 3 * 1000);
  }, [region]);

  if (!backgroundPermission?.granted) {
    return (
      <View>
        <Text>Background Permission not granted</Text>
        <Button title="Grant Permission" onPress={() => onPress('background')} />
      </View>
    );
  }
  if (!foregroundPermission?.granted) {
    return (
      <View>
        <Text>Background Permission not granted</Text>
        <Button title="Grant Permission" onPress={() => onPress('foreground')} />
      </View>
    );
  }

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
  async function onPress(type: 'background' | 'foreground') {
    const permission = type === 'background' ? backgroundPermission : foregroundPermission;
    const requestPermission =
      type === 'background' ? requestBackgroundPermission : requestForegroundPermission;

    if (!permission?.canAskAgain) {
      console.log("can't ask again");

      Alert.alert('Permission denied', 'Please enable permission in settings', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: async () => {
            handleOpenSettings();
          },
        },
      ]);

      return;
    }

    if (!permission?.granted) {
      if (await requestPermission()) {
        // await takeAction(type);
      }
    } else {
      // await takeAction(type);
    }
  }
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
    transform: [{ translateX: -50 }],
  },
});
