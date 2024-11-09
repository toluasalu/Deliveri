import { Pressable } from 'react-native';
import '../global.css';
import { Link, Stack } from 'expo-router';
import Colors from '~/constants/Colors';
import { FontAwesome } from '@expo/vector-icons';
import LocationProvider from '../context/LocationProvider';

export default function Layout() {
  return (
    <LocationProvider>
      <Stack screenOptions={{
        headerRight: () => (
          <Link href="/index" asChild>
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
        )
      }}>
        <Stack.Screen name="index" options={{ title: 'Menu' }} />
      </Stack>
    </LocationProvider>
  );
}
