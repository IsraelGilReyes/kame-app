import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* headerShown: false oculta el encabezado por defecto, 
          se puede activar en las pantallas donde se nececite el appbar para volver atrás */}
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="home" />
      <Stack.Screen name="branches" />
      <Stack.Screen name="cash-register" />
      <Stack.Screen name="orders" />
      <Stack.Screen name="products" />
    </Stack>
  );
}