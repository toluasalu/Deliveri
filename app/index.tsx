/* eslint-disable import/order */
import { Link, Stack } from 'expo-router';
import React from 'react';
import { FlatList } from 'react-native';
import { Button } from '~/components/Button';
import { Container } from '~/components/Container';
import ProductListItem from '~/components/ProductListItem';
import products from '../assets/data/products';

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
