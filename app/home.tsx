import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../src/features/auth/presentation/context/AuthContext';
import { colors } from '../src/shared/theme/colors'; // Ajusta la ruta de importación de tu archivo colors.tsx

// Definición de las secciones/módulos utilizando la paleta corporativa
const menuModules = [
  {
    id: 'products',
    title: 'Productos',
    icon: '🍕',
    route: '/products',
    color: colors.accent, // B43526
  },
  {
    id: 'orders',
    title: 'Órdenes',
    icon: '📋',
    route: '/orders',
    color: colors.success, // #287A50
  },
  {
    id: 'cashier',
    title: 'Caja',
    icon: '💵',
    route: '/cash-register',
    color: colors.gold, // #E5A659
  },
  {
    id: 'branches',
    title: 'Sucursal',
    icon: '🏠',
    route: '/branches',
    color: colors.primary, // #4F0E08
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.replace('/login');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Encabezado con información del usuario */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>¡Bienvenido, {user?.name || 'Usuario'}!</Text>
          <Text style={styles.subtitle}>Panel de Control</Text>
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
    backgroundColor: colors.background, // #FFF9F2
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 28,
  },
  greeting: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.primary, // #4F0E08
  },
  subtitle: {
    fontSize: 15,
    color: colors.muted, // #806F68
    marginTop: 4,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.beige, // #DFBC94
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary, // #4F0E08
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
    backgroundColor: colors.surface, // #FFFFFF
    width: '47%',
    aspectRatio: 1,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border, // #E9D8CB
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
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
    color: colors.text, // #2B211E
    textAlign: 'center',
  },
  /* Estilos del Botón de Cerrar Sesión */
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.danger, // #B42318
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
    color: colors.danger, // #B42318
    fontSize: 16,
    fontWeight: '700',
  },
});