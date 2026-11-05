import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../../../shared/theme/colors';
import { useAuth } from '../../auth/presentation/context/AuthContext';

interface BranchModel {
  id: number;
  name: string;
  address: string;
  createdAt?: string;
}

const API_URL = 'http://localhost:3000'; // Ajusta si tu backend usa otra URL

export function BranchesView() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState<boolean>(true);
  const [branch, setBranch] = useState<BranchModel | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const isManager = user?.role === 'GERENTE';

  useEffect(() => {
    const loadBranchData = async () => {
      try {
        setLoading(true);
        setErrorMsg('');

        if (!user?.branchId) {
          setErrorMsg('No hay sucursal asociada a este usuario.');
          setLoading(false);
          return;
        }

        const token = await AsyncStorage.getItem('@kame_token');
        const response = await axios.get<BranchModel>(
          `${API_URL}/branches/${user.branchId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setBranch(response.data);
      } catch (error: any) {
        setErrorMsg(error.response?.data?.message || 'No se pudo cargar la información de la sucursal.');
      } finally {
        setLoading(false);
      }
    };

    loadBranchData();
  }, [user]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Cargando información de la sucursal...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Encabezado sin botón de volver */}
      <View style={styles.header}>
        <Text style={styles.title}>Información de Sucursal</Text>
        <Text style={styles.subtitle}>Detalles de la ubicación asignada</Text>
      </View>

      {/* Botón exclusivo para Gerentes: Gestionar Sucursales */}
      {isManager && (
        <TouchableOpacity
          style={styles.manageBranchesButton}
          onPress={() => router.push('/branches/manageBranches' as any)} // Ajusta la ruta según tu estructura de archivos
        >
          <Text style={styles.manageBranchesButtonText}>⚙️ Administrar Sucursales</Text>
        </TouchableOpacity>
      )}

      {errorMsg ? <Text style={styles.errorBanner}>{errorMsg}</Text> : null}

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
          {branch.createdAt && (
            <View style={styles.infoRow}>
              <Text style={styles.iconText}>📅</Text>
              <View style={styles.infoContent}>
                <Text style={styles.label}>Fecha de Registro de Sucursal</Text>
                <Text style={styles.valueText}>
                  {new Date(branch.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No se encontró información de la sucursal.</Text>
        </View>
      )}

      {/* Botón de Menú Principal */}
      <View style={styles.backButtonContainer}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => router.push('/home' as any)}
        >
          <Text style={styles.menuButtonText}>Volver al Menú Principal</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    paddingTop: 45,
    backgroundColor: colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: colors.muted,
    fontSize: 14,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  manageBranchesButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  manageBranchesButtonText: {
    color: colors.surface,
    fontWeight: 'bold',
    fontSize: 15,
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    color: colors.danger,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 13,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
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
    color: colors.primary,
    flex: 1,
  },
  idBadge: {
    backgroundColor: colors.beige,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  idBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
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
    color: colors.muted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  valueText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    marginTop: 2,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.muted,
  },
  backButtonContainer: {
    marginTop: 'auto',
    marginBottom: 10,
  },
  menuButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  menuButtonText: {
    color: colors.surface,
    fontWeight: 'bold',
    fontSize: 15,
  },
});