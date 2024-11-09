/* eslint-disable import/order */
import { Stack, Link } from 'expo-router';
import { FlatList } from 'react-native';
import products from "../assets/data/products";
import { Button } from '~/components/Button';
import CartListItem from '~/components/CartListItem';
import { Container } from '~/components/Container';
import { ScreenContent } from '~/components/ScreenContent';
import ProductListItem from '~/components/ProductListItem';

export default function Home() {
  return (
    <>
      <Stack.Screen options={{ title: 'Home' }} />
      <Container>
        <FlatList
          data={products}
          renderItem={({ item }) => <ProductListItem product={item} />}
          contentContainerStyle={{ gap: 10, padding: 10 }}
          columnWrapperStyle={{ gap: 10 }}
          numColumns={2}
        />
        <Link href={{ pathname: '/details', params: { name: 'Dan' } }} asChild>
          <Button title="Checkout" />
        </Link>
      </Container>
    </>
  );
}
