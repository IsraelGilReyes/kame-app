import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Button,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

// Tipos basados en tu esquema de Prisma
interface BranchModel {
  id: number;
  name: string;
  address: string;
  createdAt: string;
}

interface UserSession {
  id: number;
  name: string;
  email: string;
  role: 'GERENTE' | 'CAJERO' | 'REPARTIDOR';
  branchId: number;
}

export  function BranchesView() {
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<UserSession | null>(null);
  const [branch, setBranch] = useState<BranchModel | null>(null);

  useEffect(() => {
    // Simulación de consulta a la base de datos de Prisma
    const loadBranchData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const simulatedUser: UserSession = {
        id: 1,
        name: 'Israel Gil',
        email: 'israel@pizzeria.com',
        role: 'GERENTE',
        branchId: 1,
      };

      // Datos de la sucursal simulando el modelo Branch de Prisma
      const simulatedBranch: BranchModel = {
        id: 1,
        name: 'Sucursal Centro',
        address: 'Av. Hidalgo #123, Col. Centro, Axochiapan, Morelos',
        createdAt: '2025-01-15',
      };

      setUser(simulatedUser);
      setBranch(simulatedBranch);
      setLoading(false);
    };

    loadBranchData();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#1A535C" />
        <Text style={{ marginTop: 10 }}>Cargando información de la sucursal...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.title}>Información de Sucursal</Text>
        <Text style={styles.subtitle}>Detalles de la ubicación asignada</Text>
      </View>

      {branch ? (
        <View style={styles.card}>
          {/* Nombre e ID de Sucursal */}
          <View style={styles.branchHeader}>
            <Text style={styles.branchName}>{branch.name}</Text>
            <View style={styles.idBadge}>
              <Text style={styles.idBadgeText}>ID: #{branch.id}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Dirección de la Sucursal */}
          <View style={styles.infoRow}>
            <Text style={styles.iconText}>📍</Text>
            <View style={styles.infoContent}>
              <Text style={styles.label}>Dirección Física</Text>
              <Text style={styles.valueText}>{branch.address}</Text>
            </View>
          </View>

          {/* Usuario y Rol Actual */}
          <View style={styles.infoRow}>
            <Text style={styles.iconText}>👤</Text>
            <View style={styles.infoContent}>
              <Text style={styles.label}>Usuario Conectado</Text>
              <Text style={styles.valueText}>
                {user?.name} ({user?.role})
              </Text>
            </View>
          </View>

          {/* Fecha de Registro / Apertura */}
          <View style={styles.infoRow}>
            <Text style={styles.iconText}>📅</Text>
            <View style={styles.infoContent}>
              <Text style={styles.label}>Fecha de Registro de Sucursal</Text>
              <Text style={styles.valueText}>{branch.createdAt}</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No se encontró información de la sucursal.</Text>
        </View>
      )}

      {/* Botón de Regreso */}
      <View style={styles.backButtonContainer}>
        <Button
          title="Volver al Menú Principal"
          color="#718096"
          onPress={() => router.push('/home')}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#F8F9FA',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  subtitle: {
    fontSize: 13,
    color: '#718096',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  branchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  branchName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A535C',
    flex: 1,
  },
  idBadge: {
    backgroundColor: '#E6FFFA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#319795',
  },
  idBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#234E52',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 20,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#A0AEC0',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  valueText: {
    fontSize: 14,
    color: '#2D3748',
    fontWeight: '500',
    marginTop: 2,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#A0AEC0',
  },
  backButtonContainer: {
    marginTop: 'auto',
    marginBottom: 10,
  },
});