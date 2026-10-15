import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      // 1. Simulamos un tiempo de carga del Splash Screen (ej. 2 segundos)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // ==========================================
      // ZONA DE CÓDIGO PARA FUTURA VALIDACIÓN:
      // Aquí después, agregar  lógica real, por ejemplo:
      // const token = await AsyncStorage.getItem('userToken');
      // if (token) { router.replace('/home'); } else { router.replace('/login'); }
      // ==========================================

      // Por ahora, como ejemplo, redirige directamente a home:
      router.replace('/home');
    };

    checkSession();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kame App</Text>
      <Text style={styles.subtitle}>Cargando...</Text>
      <ActivityIndicator size="large" color="#0000ff" />
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
  },
  subtitle: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 20,
  },
});