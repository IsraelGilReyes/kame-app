import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        // 1. Damos un pequeño respiro visual tipo Splash (ej. 1 segundo)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 2. Validar usando la misma llave con la que se guarda en el AuthContext (@kame_token)
        const token = await AsyncStorage.getItem('@kame_token'); 

        // 3. Redirección basada en la existencia del token
        if (token) {
          // Si hay sesión activa, manda al home
          router.replace('/home');
        } else {
          // Si no hay sesión, manda a la pantalla de inicio de sesión
          router.replace('/login');
        }
      } catch (error) {
        console.error('Error al verificar la sesión:', error);
        router.replace('/login');
      }
    };

    checkSession();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kame App</Text>
      <Text style={styles.subtitle}>Verificando sesión...</Text>
      <ActivityIndicator size="large" color="#e63946" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 20,
  },
});