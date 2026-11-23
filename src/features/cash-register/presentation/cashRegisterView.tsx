import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
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
import { styles } from './cashRegisterView.styles';

export function CashRegisterView() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [currentRegister, setCurrentRegister] = useState<CashRegister | null>(null);
  const [initialAmountInput, setInitialAmountInput] = useState<string>('');
  const [inputFocused, setInputFocused] = useState<boolean>(false);

  // Mensajes de retroalimentación en UI
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Estado para el Modal de Confirmación de Cierre de Caja
  const [confirmModalVisible, setConfirmModalVisible] = useState<boolean>(false);

  const branchId = user?.branchId || 1;
  const branchName = user?.branch?.name || 'Sucursal Principal';

  const canViewWeeklyHistory = ['ADMIN_GENERAL', 'GERENTE'].includes(user?.role || '');

  const loadCashRegisterStatus = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const data = await getActiveCashRegister(branchId);
      setCurrentRegister(data);
    } catch (error: any) {
      setErrorMsg(error.message);
      setCurrentRegister(null);
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useFocusEffect(
    useCallback(() => {
      loadCashRegisterStatus();
    }, [loadCashRegisterStatus]),
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
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Barra superior */}
      <View style={[styles.topBar, { justifyContent: 'flex-end' }]}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>CONTROL DE CAJA</Text>
        </View>
      </View>

      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.title}>Módulo de Caja</Text>
        <View style={styles.metaRow}>
          <Text style={styles.branchText}>{branchName}</Text>
          <Text style={styles.dateText}>{todayDate}</Text>
        </View>
      </View>

      {/* Botón condicional: visible para GERENTE y ADMIN_GENERAL */}
      {canViewWeeklyHistory && (
        <Pressable
          onPress={() => router.push('/cash-register/weeklyCashRegisters' as any)}
          style={({ pressed }) => [
            styles.weeklyHistoryBtn,
            pressed && styles.weeklyHistoryBtnPressed,
          ]}
        >
          <View style={styles.weeklyHistoryLeft}>
            <View style={styles.weeklyBadge}>
              <Text style={styles.weeklyBadgeText}>HISTORIAL</Text>
            </View>
            <Text style={styles.weeklyHistoryBtnText}>
              Historial Semanal de Cajas
            </Text>
          </View>
          <Text style={styles.weeklyArrow}>→</Text>
        </Pressable>
      )}

      {/* Banners de Notificación */}
      {errorMsg ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{errorMsg}</Text>
        </View>
      ) : null}

      {successMsg ? (
        <View style={styles.successBanner}>
          <Text style={styles.successBannerText}>{successMsg}</Text>
        </View>
      ) : null}

      {/* PANEL DE CAJA ABIERTA */}
      {currentRegister && currentRegister.status === 'OPEN' ? (
        <View style={styles.card}>
          <View style={styles.cardTopBarOpen} />

          <View style={styles.cardBody}>
            <View style={styles.statusRow}>
              <View style={styles.statusBadgeOpen}>
                <View style={styles.statusDotOpen} />
                <Text style={styles.statusTextOpen}>CAJA ABIERTA</Text>
              </View>

              <View style={styles.registerIdPill}>
                <Text style={styles.registerIdText}>ID #{currentRegister.id}</Text>
              </View>
            </View>

            <Text style={styles.infoLabel}>Turno activo</Text>
            <Text style={styles.infoSubText}>
              Aperturada a las{' '}
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
              <Text style={styles.totalLabel}>Total Esperado en Caja</Text>
              <Text style={styles.totalValue}>
                ${Number(currentRegister.totalAmount).toFixed(2)}
              </Text>
            </View>

            <Pressable
              onPress={() => {
                setErrorMsg('');
                setSuccessMsg('');
                setConfirmModalVisible(true);
              }}
              disabled={actionLoading}
              style={({ pressed }) => [
                styles.closeBtn,
                pressed && styles.closeBtnPressed,
                actionLoading && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.closeBtnText}>Cerrar Caja del Día</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        /* PANEL DE APERTURA DE CAJA */
        <View style={styles.card}>
          <View style={styles.cardTopBarClosed} />

          <View style={styles.cardBody}>
            <View style={styles.statusRow}>
              <View style={styles.statusBadgeClosed}>
                <View style={styles.statusDotClosed} />
                <Text style={styles.statusTextClosed}>CAJA CERRADA</Text>
              </View>
            </View>

            <Text style={styles.openFormTitle}>Apertura de Caja para la Sucursal</Text>
            <Text style={styles.openFormSubtitle}>
              Ingresa el fondo inicial disponible para comenzar a operar el día.
            </Text>

            <Text style={styles.label}>Cantidad Inicial (Fondo de caja)</Text>

            <TextInput
              style={[
                styles.input,
                inputFocused && styles.inputFocused,
              ]}
              placeholder="Ej. 500.00"
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
              value={initialAmountInput}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              onChangeText={(text) => {
                setInitialAmountInput(text);
                if (errorMsg) setErrorMsg('');
              }}
            />

            <Pressable
              onPress={handleOpenRegister}
              disabled={actionLoading}
              style={({ pressed }) => [
                styles.openBtn,
                pressed && styles.openBtnPressed,
                actionLoading && { opacity: 0.7 },
              ]}
            >
              {actionLoading ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text style={styles.openBtnText}>Aperturar Caja Ahora</Text>
              )}
            </Pressable>
          </View>
        </View>
      )}

      {/* MODAL DE CONFIRMACIÓN DE CIERRE DE CAJA */}
      <Modal visible={confirmModalVisible} animationType="fade" transparent={true}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => !actionLoading && setConfirmModalVisible(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalTopBar} />

            <View style={styles.modalBody}>
              <Text style={styles.modalTitle}>Confirmar Cierre de Caja</Text>
              <Text style={styles.modalSubtitle}>
                ¿Deseas cerrar la caja actual? Se calculará el total recaudado por órdenes entregadas.
              </Text>

              {currentRegister && (
                <View style={styles.modalSummaryBox}>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalRowLabel}>Monto Inicial:</Text>
                    <Text style={styles.modalRowValue}>
                      ${Number(currentRegister.initialAmount).toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalRowLabel}>Recaudado Hoy:</Text>
                    <Text style={[styles.modalRowValue, { color: colors.success }]}>
                      +${Number(currentRegister.generatedAmount || 0).toFixed(2)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.modalRow,
                      {
                        borderTopWidth: 1,
                        borderTopColor: colors.border,
                        marginTop: 8,
                        paddingTop: 8,
                      },
                    ]}
                  >
                    <Text style={[styles.modalRowLabel, { fontWeight: '800', color: colors.text }]}>
                      Total Final:
                    </Text>
                    <Text
                      style={[
                        styles.modalRowValue,
                        { fontWeight: '900', color: colors.secondary },
                      ]}
                    >
                      ${Number(currentRegister.totalAmount).toFixed(2)}
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.modalActions}>
                <Pressable
                  onPress={() => setConfirmModalVisible(false)}
                  disabled={actionLoading}
                  style={({ pressed }) => [
                    styles.modalCancelBtn,
                    pressed && styles.modalCancelBtnPressed,
                  ]}
                >
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </Pressable>

                <Pressable
                  onPress={confirmCloseRegister}
                  disabled={actionLoading}
                  style={[
                    styles.modalConfirmBtn,
                    actionLoading && { opacity: 0.7 },
                  ]}
                >
                  {actionLoading ? (
                    <ActivityIndicator color={colors.surface} size="small" />
                  ) : (
                    <Text style={styles.modalConfirmText}>Sí, Cerrar Caja</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}