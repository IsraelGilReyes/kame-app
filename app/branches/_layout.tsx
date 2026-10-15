
import { Stack } from 'expo-router';

export default function ProductsLayout() {
  return (
    <Stack>
      {/* Aqui se pueden configurar las pantallas que pertenecen a este feature */}
      <Stack.Screen 
        name="index" 
        options={{ title: 'Branch' }} // Esto activa automáticamente el appbar con el título y botón de volver
      />
      
    </Stack>
  );
}