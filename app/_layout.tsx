import { FontAwesome } from '@expo/vector-icons';
import { QueryClientProvider } from '@tanstack/react-query';
import { Link, Stack } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';

import LocationProvider from '../context/LocationProvider';

import { queryClient } from '~/config/react-query';
import Colors from '~/constants/Colors';

import '../global.css';

export default function Layout() {
  return (
    <LocationProvider>
      <QueryClientProvider client={queryClient}>
        <Stack
          screenOptions={{
            headerRight: () => (
              <Link href="/" asChild>
                <Pressable>
                  {({ pressed }) => (
                    <FontAwesome
                      name="shopping-cart"
                      size={20}
                      color={Colors.light.tint}
                      style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                    />
                  )}
                </Pressable>
              </Link>
            ),
          }}>
          <Stack.Screen name="index" options={{ title: 'Menu' }} />
        </Stack>
      </QueryClientProvider>
    </LocationProvider>
  );
}
