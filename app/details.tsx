import * as Location from 'expo-location';
import { Stack } from 'expo-router';
import * as TaskManager from 'expo-task-manager';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import { Button } from '~/components/Button';
import { updatePatrolTrack } from '~/domains/api';
import { useCreatePatrol, useUpdatePatrolTrack } from '~/domains/hooks';
import { getPatrolIDFromStorage, storePatrolIDToStorage } from '~/internals/data';
import { handleOpenSettings } from '~/internals/linking';
import type { Location as LocationType } from '~/internals/location';

const LOCATION_TASK_NAME = 'background-location-task';

const defaultLocationOptions: Location.LocationOptions = {
  accuracy: Location.Accuracy.Highest,
  distanceInterval: 1,
  timeInterval: 15000,
  mayShowUserSettingsDialog: true,
};

TaskManager.defineTask(
  LOCATION_TASK_NAME,
  async ({
    data,
    error,
    executionInfo,
  }: {
    data: { locations: (LocationType | null)[] };
    error: unknown;
    executionInfo: { eventId: string };
  }) => {
    if (error) {
      console.log('error', error);
    }
    if (data) {
      try {
        const currentLocation = data.locations[0];
        const patrolId = await getPatrolIDFromStorage();
        if (patrolId && currentLocation) {
          console.log(`Updating patrol track in background: ${patrolId}, with co-ordinates: ${currentLocation?.coords.latitude}, ${currentLocation?.coords.longitude}`);
          updatePatrolTrack({
            latitude: currentLocation?.coords.latitude,
            longitude: currentLocation?.coords.longitude,
            patrolId,
            serialNumber: executionInfo.eventId,
          });
        }
      } catch (error) {
        console.log(`Error updating patrol track: ${error}, `);
      }
    }
  }
);

let subscription: { remove: () => void } | null = null;
export default function Details() {
  // const { markerObj, setMarkerObj } = useLocationContext();
  const mapRef = useRef<MapView>(null);
  const [backgroundPermission] = Location.useBackgroundPermissions();
  const [foregroundPermission] = Location.useForegroundPermissions();

  const [region, setRegion] = useState({
    latitude: 9.1123704,
    longitude: 7.376144,
    latitudeDelta: 0.0622,
    longitudeDelta: 0.0421,
  });

  const marker = { latitude: region.latitude, longitude: region.longitude };

  const createPatrolMutation = useCreatePatrol();
  const updatePatrolTrackMutation = useUpdatePatrolTrack();
  const [patrolId, setPatrolId] = React.useState<null | string>(null);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null); // Correct scoping for subscription
  const serialNumber = useRef(0);

  useEffect(() => {
    (async () => {
      if (foregroundPermission?.granted) {
        subscriptionRef.current = await Location.watchPositionAsync(
          defaultLocationOptions,
          (currentLocation) => {
            updateLocation(currentLocation);
            if (patrolId) {
              updatePatrolTrackMutation.mutate({
                latitude: currentLocation?.coords.latitude,
                longitude: currentLocation?.coords.longitude,
                patrolId,
                serialNumber: serialNumber.current,
              }
              );
              serialNumber.current = serialNumber.current + 1;
            }
          }
        );
      }
      if (backgroundPermission?.granted) {
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.Highest,
        });
      }
    })();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove(); // Properly remove the subscription
        subscriptionRef.current = null; // Reset the ref
      }
    };
  }, [foregroundPermission?.granted, backgroundPermission?.granted, patrolId]);

  const createTrip = () => {
    const patrolling_name = 'Trip_' + Date.now();
    console.log('create trip', patrolling_name);
    createPatrolMutation.mutate(
      {
        patrolling_name,
      },
      {
        onSuccess: ({ data }) => {
          Alert.alert('Patrol created successfully');
          try {
            setPatrolId(data.data.patrolling_id.toString());
            storePatrolIDToStorage(data.data.patrolling_id.toString());
          } catch (error) {
            console.log('Error saving patrolID:', error);
            Alert.alert(`Error saving patrolID: ${error}`);
          }
        },
      }
    );
  };

  if (!backgroundPermission?.granted) {
    return (
      <View>
        <Text>Background Permission not granted</Text>
        <Button title="Grant Background" onPress={() => onPermission('background')} />
      </View>
    );
  }

  if (!foregroundPermission?.granted) {
    return (
      <View>
        <Text>Foreground Permission not granted</Text>
        <Button title="Grant Foreground" onPress={() => onPermission('foreground')} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: patrolId ? `Patrolling ${patrolId}` : 'Details',
          headerRight: () => (
            <Button
              title="Create Patrol"
              onPress={createTrip}
              loading={createPatrolMutation.isPending}
            />
          ),
        }}
      />
      <View style={styles.container}>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          ref={mapRef}
          initialRegion={region}
          showsBuildings>
          {marker && (
            <Marker coordinate={marker} pinColor="red">
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
  function cantAskAgain() {
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
  }

  async function onPermission(type: 'background' | 'foreground') {
    const permission = type === 'background' ? backgroundPermission : foregroundPermission;
    const requestPermission =
      type === 'background'
        ? Location.requestBackgroundPermissionsAsync
        : Location.requestForegroundPermissionsAsync;

    if (!permission?.canAskAgain) {
      cantAskAgain();
      return;
    }

    if (permission?.granted) {
      console.log('permission already granted');
    } else {
      const newPermission = await requestPermission();
      if (newPermission?.granted) {
      } else {
        handleOpenSettings();
      }
    }
  }

  function updateLocation(currentLocation: Location.LocationObject) {
    // setLocation(currentLocation);
    const newRegion = {
      latitude: currentLocation?.coords.latitude,
      longitude: currentLocation?.coords.longitude,
      latitudeDelta: 0.0622,
      longitudeDelta: 0.0421,
    };
    setRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 3 * 1000);
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
