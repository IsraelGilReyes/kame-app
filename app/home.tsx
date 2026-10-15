import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Definición de las secciones/módulos con emojis
const menuModules = [
  {
    id: 'products',
    title: 'Productos',
    icon: '🍕',
    route: '/products',
    color: '#FF6B6B',
  },
  {
    id: 'orders',
    title: 'Órdenes',
    icon: '📋',
    route: '/orders',
    color: '#4ECDC4',
  },
  {
    id: 'cashier',
    title: 'Caja',
    icon: '💵',
    route: '/cash-register',
    color: '#FFE66D',
  },
  {
    id: 'branches',
    title: 'Sucursal',
    icon: '🏠',
    route: '/branches',
    color: '#1A535C',
  },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>¡Bienvenido!</Text>
        <Text style={styles.subtitle}>Panel de Control - Kame House</Text>
      </View>

      {/* Grid de Tarjetas */}
      <View style={styles.gridContainer}>
        {menuModules.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => router.push(item.route as any)}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
              <Text style={styles.emojiIcon}>{item.icon}</Text>
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#F8F9FA',
  },
  header: {
    marginBottom: 28,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    marginTop: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    width: '47%',
    aspectRatio: 1,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emojiIcon: {
    fontSize: 32,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    textAlign: 'center',
  },
});