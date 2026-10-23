import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../src/features/auth/presentation/context/AuthContext'; // Ajusta la ruta a tu AuthContext

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
  const { user, signOut } = useAuth(); // Extraemos user y signOut del contexto

  const handleLogout = async () => {
    await signOut(); // Borra el token y datos guardados en AsyncStorage
    router.replace('/login'); // Redirige a la pantalla de login
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Encabezado con información del usuario */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>¡Bienvenido, {user?.name || 'Usuario'}!</Text>
          <Text style={styles.subtitle}>Panel de Control - Kame House</Text>
          {user?.role && (
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user.role}</Text>
            </View>
          )}
        </View>
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

      {/* Botón de Cerrar Sesión */}
      <TouchableOpacity
        style={styles.logoutButton}
        activeOpacity={0.8}
        onPress={handleLogout}
      >
        <Text style={styles.logoutIcon}>🚪</Text>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#F8F9FA',
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 28,
  },
  greeting: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  subtitle: {
    fontSize: 15,
    color: '#718096',
    marginTop: 4,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A5568',
    textTransform: 'uppercase',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 30,
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
  /* Estilos del Botón de Cerrar Sesión */
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FEB2B2',
    borderRadius: 14,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    gap: 8,
  },
  logoutIcon: {
    fontSize: 18,
  },
  logoutText: {
    color: '#E53E3E',
    fontSize: 16,
    fontWeight: '700',
  },
});