import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { colors } from '../../../shared/theme/colors';
import { useAuth } from '../../auth/presentation/context/AuthContext';
import { Branch } from '../domain/entities';
import { getBranchById, getBranches } from '../infrastructure/datasources/branches-api.datasource';
import { styles } from './branchesView.styles';

export function BranchesView() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState<boolean>(true);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [branchesCount, setBranchesCount] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const canManageBranches = ['ADMIN_GENERAL', 'GERENTE'].includes(user?.role || '');

  const loadBranchData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      if (canManageBranches) {
        const allBranches = await getBranches();
        setBranchesCount(allBranches.length);
      }

      if (user?.branchId) {
        const branchData = await getBranchById(user.branchId);
        setBranch(branchData);
      } else if (user?.role === 'ADMIN_GENERAL') {
        setBranch(null);
      } else {
        setErrorMsg('No hay sucursal asociada a este usuario.');
      }
    } catch (error: any) {
      setErrorMsg(
        error.message || 'No se pudo cargar la información de la sucursal.',
      );
    } finally {
      setLoading(false);
    }
  }, [canManageBranches, user?.branchId, user?.role]);

  useFocusEffect(
    useCallback(() => {
      loadBranchData();
    }, [loadBranchData]),
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Cargando información de la sucursal...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topBadgeRow}>
        <View style={styles.kickerBadge}>
          <Text style={styles.kickerBadgeText}>OPERACIÓN DE SUCURSAL</Text>
        </View>
      </View>

      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.title}>Información de Sucursal</Text>
        <Text style={styles.subtitle}>Detalles de la ubicación asignada</Text>
      </View>

      {/* Botón para Gerentes y Admin General: Gestionar Sucursales */}
      {canManageBranches && (
        <Pressable
          onPress={() => router.push('/branches/manageBranches' as any)}
          style={({ pressed }) => [
            styles.manageBranchesButton,
            pressed && styles.manageBranchesButtonPressed,
          ]}
        >
          <View style={styles.manageLeft}>
            <View style={styles.manageIconPill}>
              <Text style={styles.manageIconText}>+</Text>
            </View>
            <Text style={styles.manageBranchesButtonText}>
              Administrar Sucursales
            </Text>
          </View>

          {branchesCount > 0 ? (
            <View style={styles.countPill}>
              <Text style={styles.countPillText}>{branchesCount}</Text>
            </View>
          ) : null}
        </Pressable>
      )}

      {errorMsg ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{errorMsg}</Text>
        </View>
      ) : null}

      {branch ? (
        <View style={styles.card}>
          <View style={styles.cardTopBar} />

          <View style={styles.cardBody}>
            {/* Nombre e ID de Sucursal */}
            <View style={styles.branchHeader}>
              <Text style={styles.branchName}>{branch.name}</Text>
              <View style={styles.idBadge}>
                <Text style={styles.idBadgeText}>ID #{branch.id}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Dirección de la Sucursal */}
            <View style={styles.infoRow}>
              <View style={styles.iconBox}>
                <Text style={styles.iconText}>DIR</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.label}>Dirección Física</Text>
                <Text style={styles.valueText}>{branch.address}</Text>
              </View>
            </View>

            {/* Usuario y Rol Actual */}
            <View style={styles.infoRow}>
              <View style={styles.iconBox}>
                <Text style={styles.iconText}>USR</Text>
              </View>
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
                <View style={styles.iconBox}>
                  <Text style={styles.iconText}>REG</Text>
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.label}>Fecha de Registro de Sucursal</Text>
                  <Text style={styles.valueText}>
                    {new Date(branch.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Sin sucursal asignada</Text>
          <Text style={styles.emptyText}>
            {user?.role === 'ADMIN_GENERAL'
              ? 'Como Administrador General puedes administrar todas las sucursales desde el botón superior.'
              : 'No se encontró información de la sucursal.'}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}