import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../../../shared/theme/colors';
import { useAuth } from '../../auth/presentation/context/AuthContext';

type CashRegisterStatus = 'OPEN' | 'CLOSED';

interface CashRegisterModel {
  id: number;
  initialAmount: string;
  generatedAmount: string;
  totalAmount: string;
  status: CashRegisterStatus;
  openedAt: string;
  closedAt: string | null;
  openedBy?: { id: number; name: string; email: string };
}

const API_URL = 'http://localhost:3000';

export function WeeklyCashRegistersView() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState<boolean>(true);
  const [weeklyRegisters, setWeeklyRegisters] = useState<CashRegisterModel[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedRegister, setSelectedRegister] = useState<CashRegisterModel | null>(null);

  const branchId = user?.branchId || 1;

  const loadWeeklyData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      const token = await AsyncStorage.getItem('@kame_token');
      const response = await axios.get<CashRegisterModel[]>(
        `${API_URL}/cash-register/branch/${branchId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setWeeklyRegisters(response.data);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'No se pudo cargar el historial de cajas.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadWeeklyData();
    }, [branchId])
  );

  const handleOpenDetail = (register: CashRegisterModel) => {
    setSelectedRegister(register);
    setModalVisible(true);
  };

  const renderItem = ({ item }: { item: CashRegisterModel }) => {
    const openerName = typeof item.openedBy === 'object' ? item.openedBy?.name : 'Usuario';
    
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => handleOpenDetail(item)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.registerId}>Caja #{item.id}</Text>
          <View
            style={[
              styles.statusBadge,
              item.status === 'OPEN' ? styles.statusOpenBg : styles.statusClosedBg,
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                item.status === 'OPEN' ? styles.statusOpenText : styles.statusClosedText,
              ]}
            >
              {item.status === 'OPEN' ? '🟢 ABIERTA' : '🔴 CERRADA'}
            </Text>
          </View>
        </View>

        <Text style={styles.dateText}>Apertura: {new Date(item.openedAt).toLocaleString()}</Text>
        <Text style={styles.dateText}>Por: {openerName}</Text>

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.labelSub}>Recaudado en ventas:</Text>
            <Text style={styles.generatedAmount}>${Number(item.generatedAmount || 0).toFixed(2)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.labelSub}>Total Acumulado:</Text>
            <Text style={styles.totalAmount}>${Number(item.totalAmount || 0).toFixed(2)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Cargando cajas de la sucursal...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtnWrapper}>
          <Text style={styles.backButton}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Historial de Cajas</Text>
        <Text style={styles.subtitle}>Aperturas y ventas recaudadas</Text>
      </View>

      {errorMsg ? <Text style={styles.errorBanner}>{errorMsg}</Text> : null}

      <FlatList
        data={weeklyRegisters}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay registros de cajas en esta sucursal.</Text>
        }
      />

      {/* Modal de Detalle */}
      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedRegister && (
              <>
                <Text style={styles.modalTitle}>Detalles de Caja #{selectedRegister.id}</Text>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Estado:</Text>
                  <Text
                    style={[
                      styles.detailValue,
                      { color: selectedRegister.status === 'OPEN' ? colors.success : colors.danger },
                    ]}
                  >
                    {selectedRegister.status}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Aperturada por:</Text>
                  <Text style={styles.detailValue}>{selectedRegister.openedBy?.name || 'N/A'}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Fecha Apertura:</Text>
                  <Text style={styles.detailValue}>{new Date(selectedRegister.openedAt).toLocaleString()}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Fecha Cierre:</Text>
                  <Text style={styles.detailValue}>
                    {selectedRegister.closedAt ? new Date(selectedRegister.closedAt).toLocaleString() : 'Aún abierta'}
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Monto Inicial:</Text>
                  <Text style={styles.detailValue}>${Number(selectedRegister.initialAmount).toFixed(2)}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Ventas Recaudadas:</Text>
                  <Text style={[styles.detailValue, { color: colors.success }]}>
                    +${Number(selectedRegister.generatedAmount || 0).toFixed(2)}
                  </Text>
                </View>

                <View style={[styles.detailRow, styles.totalDetailRow]}>
                  <Text style={styles.totalDetailLabel}>Total Final:</Text>
                  <Text style={styles.totalDetailValue}>${Number(selectedRegister.totalAmount).toFixed(2)}</Text>
                </View>

                <TouchableOpacity
                  style={styles.closeDetailBtn}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeDetailText}>Cerrar Detalle</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    position: 'relative',
  },
  backBtnWrapper: {
    position: 'absolute',
    left: 0,
    top: 2,
  },
  backButton: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '600',
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
  errorBanner: {
    backgroundColor: '#FEE2E2',
    color: colors.danger,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 13,
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  registerId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusOpenBg: {
    backgroundColor: '#D1FAE5',
  },
  statusClosedBg: {
    backgroundColor: '#FEE2E2',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  statusOpenText: {
    color: colors.success,
  },
  statusClosedText: {
    color: colors.danger,
  },
  dateText: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    marginTop: 8,
  },
  labelSub: {
    fontSize: 11,
    color: colors.muted,
  },
  generatedAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.success,
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.accent,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.muted,
    marginTop: 40,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(43, 33, 30, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 13,
    color: colors.muted,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  totalDetailRow: {
    marginTop: 4,
    marginBottom: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalDetailLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.primary,
  },
  totalDetailValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.accent,
  },
  closeDetailBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeDetailText: {
    color: colors.surface,
    fontWeight: 'bold',
    fontSize: 14,
  },
});