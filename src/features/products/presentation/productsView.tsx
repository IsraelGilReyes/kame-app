import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, FlatList, StyleSheet, Text, View } from 'react-native';

// Datos de ejemplo simulando la estructura del modelo Product de Prisma
const pizzaProducts = [
  { id: 1, name: 'Pizza Pepperoni', price: '180.00' },
  { id: 2, name: 'Pizza Hawaiana', price: '140.00' },
  { id: 3, name: 'Pizza Mexicana', price: '220.00' },
  { id: 4, name: 'Pizza de Queso', price: '100.00' },
];

// Tipos basados en tu esquema de Prisma (Enum Role y modelo User)
type Role = 'GERENTE' | 'CAJERO' | 'REPARTIDOR';

interface UserSession {
  id: number;
  name: string;
  email: string;
  role: Role;
  branchId: number | null;
  branchName?: string;
}

export function ProductsView() {
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    // Simulando la carga del usuario autenticado conectado al backend
    const getSessionData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Simulamos un usuario con el rol GERENTE perteneciente a la sucursal 1
      const simulatedUser: UserSession = {
        id: 1,
        name: 'Israel',
        email: 'israel@pizzeria.com',
        role: 'GERENTE', // Prueba cambiando a 'CAJERO' o 'REPARTIDOR'
        branchId: 1,
        branchName: 'Sucursal Centro',
      };

      setUser(simulatedUser);
      setLoading(false);
    };

    getSessionData();
  }, []);

  // Según tu esquema, solo el GERENTE debe tener privilegios para modificar/gestionar productos
  const canManageProducts = user?.role === 'GERENTE';

  // Renderizado de las filas de la tabla
  const renderItem = ({ item, index }: { item: typeof pizzaProducts[0]; index: number }) => (
    <View style={[styles.row, index % 2 === 0 ? styles.evenRow : styles.oddRow]}>
      <Text style={[styles.cell, styles.nameCell]}>{item.name}</Text>
      <Text style={[styles.cell, styles.priceCell]}>${item.price}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={{ marginTop: 10 }}>Cargando datos de sesión...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Encabezado con datos del rol y sucursal de Prisma */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Catálogo de Productos</Text>
        {user && (
          <Text style={styles.sessionText}>
            📍 {user.branchName || 'Sin Sucursal'} | Rol: <Text style={styles.roleTag}>{user.role}</Text>
          </Text>
        )}
      </View>

      {/* Botón exclusivo para GERENTE (Gestión en su sucursal) */}
      {canManageProducts && (
        <View style={styles.adminBanner}>
          <Text style={styles.adminText}>Panel de Administración ({user?.branchName})</Text>
          <Button
            title="⚙️ Gestionar Productos de Sucursal"
            color="#1A535C"
            onPress={() =>
              router.push({
                pathname: 'products/manageProducts' as any,
               
              })
            }
          />
        </View>
      )}

      {/* Tabla de Productos (Basada en modelo Product de Prisma: name y price) */}
      <View style={styles.table}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerCell, styles.nameCell]}>Nombre del Producto</Text>
          <Text style={[styles.headerCell, styles.priceCell]}>Precio</Text>
        </View>

        <FlatList
          data={pizzaProducts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      </View>

      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2D3748',
  },
  sessionText: {
    fontSize: 13,
    color: '#718096',
    textAlign: 'center',
    marginTop: 4,
  },
  roleTag: {
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  adminBanner: {
    backgroundColor: '#E6FFFA',
    borderWidth: 1,
    borderColor: '#319795',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  adminText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#234E52',
    marginBottom: 8,
    textAlign: 'center',
  },
  table: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f4f4f4',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  headerCell: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  listContainer: {
    flexGrow: 0,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  evenRow: {
    backgroundColor: '#ffffff',
  },
  oddRow: {
    backgroundColor: '#fafafa',
  },
  cell: {
    fontSize: 14,
    color: '#555',
  },
  nameCell: {
    flex: 2,
  },
  priceCell: {
    flex: 1,
    textAlign: 'right',
  },
  buttonContainer: {
    marginTop: 'auto',
    marginBottom: 20,
  },
});