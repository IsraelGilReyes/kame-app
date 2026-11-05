import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../../../shared/theme/colors';
import { useAuth } from '../../auth/presentation/context/AuthContext';
import { CashRegister } from '../domain/entites';
import {
  closeCashRegister,
  getActiveCashRegister,
  openCashRegister,
} from '../infrastructure/datasources/cash-register-api.datasource';

export function CashRegisterView() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [currentRegister, setCurrentRegister] = useState<CashRegister | null>(null);
  const [initialAmountInput, setInitialAmountInput] = useState<string>('');
  
  // Mensajes de retroalimentación en UI
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Estado para el Modal de Confirmación de Cierre de Caja
  const [confirmModalVisible, setConfirmModalVisible] = useState<boolean>(false);

  const branchId = user?.branchId || 1;
  const branchName = user?.branch?.name || 'Sucursal Principal';

  // Verificar si el usuario actual es GERENTE
  const isManager = user?.role === 'GERENTE';

  const loadCashRegisterStatus = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const data = await getActiveCashRegister(branchId);
      setCurrentRegister(data); // Si es null, mostrará el formulario de apertura
    } catch (error: any) {
      setErrorMsg(error.message);
      setCurrentRegister(null);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCashRegisterStatus();
    }, [branchId])
  );

  const handleOpenRegister = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    const amount = parseFloat(initialAmountInput);

    if (!initialAmountInput.trim() || isNaN(amount) || amount < 0) {
      setErrorMsg('Ingresa una cantidad inicial válida.');
      return;
    }

    try {
      setActionLoading(true);
      const newRegister = await openCashRegister({
        branchId,
        initialAmount: amount,
      });
      setCurrentRegister(newRegister);
      setInitialAmountInput('');
      setSuccessMsg('¡La caja se ha aperturado correctamente!');
    } catch (error: any) {
      setErrorMsg(error.message || 'No se pudo abrir la caja.');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmCloseRegister = async () => {
    if (!currentRegister) return;
    setErrorMsg('');
    setSuccessMsg('');

    try {
      setActionLoading(true);
      await closeCashRegister(currentRegister.id);
      setCurrentRegister(null);
      setConfirmModalVisible(false);
      setSuccessMsg('¡La caja ha sido cerrada exitosamente!');
    } catch (error: any) {
      setConfirmModalVisible(false);
      setErrorMsg(error.message || 'No se pudo cerrar la caja.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Verificando estado de caja...</Text>
      </View>
    );
  }

  const todayDate = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtnWrapper}>
          <Text style={styles.backButton}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Módulo de Caja</Text>
        <Text style={styles.branchText}>📍 {branchName}</Text>
        <Text style={styles.dateText}>📅 {todayDate}</Text>
      </View>

      {/* 🔐 BOTÓN CONDICIONAL: Solo visible para GERENTES */}
      {isManager && (
        <TouchableOpacity
          style={styles.weeklyHistoryBtn}
          onPress={() => router.push('/cash-register/weeklyCashRegisters' as any)}
        >
          <Text style={styles.weeklyHistoryBtnText}>📊 Ver Historial Semanal de Cajas</Text>
        </TouchableOpacity>
      )}

      {/* Banners de Notificación */}
      {errorMsg ? <Text style={styles.errorBanner}>{errorMsg}</Text> : null}
      {successMsg ? <Text style={styles.successBanner}>{successMsg}</Text> : null}

      {/* PANEL DE CAJA ABIERTA */}
      {currentRegister && currentRegister.status === 'OPEN' ? (
        <View style={styles.activeCard}>
          <View style={styles.statusBadgeOpen}>
            <Text style={styles.statusTextOpen}>🟢 CAJA ABIERTA</Text>
          </View>

          <Text style={styles.infoLabel}>Caja ID: #{currentRegister.id}</Text>
          <Text style={styles.infoSubText}>
            Aperturada el:{' '}
            {new Date(currentRegister.openedAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>

          <View style={styles.metricsContainer}>
            <View style={styles.metricBox}>
              <Text style={styles.metricTitle}>Fondo Inicial</Text>
              <Text style={styles.metricValue}>
                ${Number(currentRegister.initialAmount).toFixed(2)}
              </Text>
            </View>

            <View style={styles.metricBox}>
              <Text style={styles.metricTitle}>Recaudado Hoy</Text>
              <Text style={[styles.metricValue, { color: colors.success }]}>
                +${Number(currentRegister.generatedAmount || 0).toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total Esperado en Caja:</Text>
            <Text style={styles.totalValue}>
              ${Number(currentRegister.totalAmount).toFixed(2)}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.closeBtn, actionLoading && { opacity: 0.7 }]}
            onPress={() => {
              setErrorMsg('');
              setSuccessMsg('');
              setConfirmModalVisible(true);
            }}
            disabled={actionLoading}
          >
            <Text style={styles.closeBtnText}>🔒 Cerrar Caja del Día</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* PANEL DE APERTURA DE CAJA */
        <View style={styles.inactiveCard}>
          <View style={styles.statusBadgeClosed}>
            <Text style={styles.statusTextClosed}>🔴 CAJA CERRADA / SIN APERTURAR</Text>
          </View>

          <Text style={styles.openFormTitle}>Apertura de Caja para la Sucursal</Text>
          <Text style={styles.label}>Ingresa la Cantidad Inicial (Fondo de caja):</Text>

          <TextInput
            style={styles.input}
            placeholder="Ej. 500.00"
            placeholderTextColor={colors.muted}
            keyboardType="numeric"
            value={initialAmountInput}
            onChangeText={(text) => {
              setInitialAmountInput(text);
              if (errorMsg) setErrorMsg('');
            }}
          />

          <TouchableOpacity
            style={[styles.openBtn, actionLoading && { opacity: 0.7 }]}
            onPress={handleOpenRegister}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={styles.openBtnText}>🔓 Aperturar Caja Ahora</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* MODAL DE CONFIRMACIÓN DE CIERRE DE CAJA */}
      <Modal visible={confirmModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar Cierre de Caja</Text>
            <Text style={styles.modalSubtitle}>
              ¿Deseas cerrar la caja actual? Se calculará el total recaudado por órdenes entregadas.
            </Text>

            {currentRegister && (
              <View style={styles.modalSummaryBox}>
                <View style={styles.modalRow}>
                  <Text style={styles.modalRowLabel}>Monto Inicial:</Text>
                  <Text style={styles.modalRowValue}>${Number(currentRegister.initialAmount).toFixed(2)}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalRowLabel}>Recaudado Hoy:</Text>
                  <Text style={[styles.modalRowValue, { color: colors.success }]}>
                    +${Number(currentRegister.generatedAmount || 0).toFixed(2)}
                  </Text>
                </View>
                <View style={[styles.modalRow, { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 8, paddingTop: 8 }]}>
                  <Text style={[styles.modalRowLabel, { fontWeight: 'bold' }]}>Total Final:</Text>
                  <Text style={[styles.modalRowValue, { fontWeight: 'bold', color: colors.accent }]}>
                    ${Number(currentRegister.totalAmount).toFixed(2)}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setConfirmModalVisible(false)}
                disabled={actionLoading}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalConfirmBtn, actionLoading && { opacity: 0.7 }]}
                onPress={confirmCloseRegister}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color={colors.surface} size="small" />
                ) : (
                  <Text style={styles.modalConfirmText}>Sí, Cerrar Caja</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  branchText: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: '600',
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  weeklyHistoryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  weeklyHistoryBtnText: {
    color: colors.surface,
    fontWeight: 'bold',
    fontSize: 14,
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
  successBanner: {
    backgroundColor: '#D1FAE5',
    color: colors.success,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 13,
  },
  activeCard: {
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
  inactiveCard: {
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
  statusBadgeOpen: {
    backgroundColor: '#D1FAE5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 12,
  },
  statusTextOpen: {
    color: colors.success,
    fontWeight: 'bold',
    fontSize: 12,
  },
  statusBadgeClosed: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 12,
  },
  statusTextClosed: {
    color: colors.danger,
    fontWeight: 'bold',
    fontSize: 12,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  infoSubText: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 16,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 10,
  },
  metricBox: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricTitle: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  totalBox: {
    backgroundColor: colors.beige,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  totalLabel: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.accent,
    marginTop: 2,
  },
  closeBtn: {
    backgroundColor: colors.danger,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeBtnText: {
    color: colors.surface,
    fontWeight: 'bold',
    fontSize: 15,
  },
  openFormTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.muted,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: colors.background,
    color: colors.text,
  },
  openBtn: {
    backgroundColor: colors.success,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  openBtnText: {
    color: colors.surface,
    fontWeight: 'bold',
    fontSize: 15,
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
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  modalSummaryBox: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  modalRowLabel: {
    fontSize: 13,
    color: colors.muted,
  },
  modalRowValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: colors.border,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCancelText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: colors.danger,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: colors.surface,
    fontWeight: 'bold',
    fontSize: 14,
  },
});