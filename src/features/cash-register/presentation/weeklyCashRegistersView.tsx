import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';
import { colors } from '../../../shared/theme/colors';
import { useAuth } from '../../auth/presentation/context/AuthContext';
import { CashRegister } from '../domain/entites';
import { getWeeklyCashRegisters } from '../infrastructure/datasources/cash-register-api.datasource';
import { styles } from './weeklyCashRegistersView.styles';

export function WeeklyCashRegistersView() {
  const { user } = useAuth();

  const [loading, setLoading] = useState<boolean>(true);
  const [weeklyRegisters, setWeeklyRegisters] = useState<CashRegister[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedRegister, setSelectedRegister] = useState<CashRegister | null>(null);

  const branchId = user?.branchId || 1;

  const loadWeeklyData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const data = await getWeeklyCashRegisters(branchId);
      setWeeklyRegisters(data);
    } catch (error: any) {
      setErrorMsg(error.message || 'No se pudo cargar el historial de cajas.');
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useFocusEffect(
    useCallback(() => {
      loadWeeklyData();
    }, [loadWeeklyData]),
  );

  const handleOpenDetail = (register: CashRegister) => {
    setSelectedRegister(register);
    setModalVisible(true);
  };

  const renderItem = ({ item }: { item: CashRegister }) => {
    const openerName = item.openedBy?.name || 'Usuario';
    const isOpen = item.status === 'OPEN';

    return (
      <Pressable
        onPress={() => handleOpenDetail(item)}
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
      >
        <View
          style={isOpen ? styles.cardTopBarOpen : styles.cardTopBarClosed}
        />

        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <Text style={styles.registerId}>Caja #{item.id}</Text>
            <View
              style={[
                styles.statusBadge,
                isOpen ? styles.statusOpenBorder : styles.statusClosedBorder,
              ]}
            >
              <View
                style={isOpen ? styles.statusDotOpen : styles.statusDotClosed}
              />
              <Text
                style={[
                  styles.statusBadgeText,
                  isOpen ? styles.statusOpenText : styles.statusClosedText,
                ]}
              >
                {isOpen ? 'ABIERTA' : 'CERRADA'}
              </Text>
            </View>
          </View>

          <Text style={styles.dateText}>
            Apertura: {new Date(item.openedAt).toLocaleString()}
          </Text>
          <Text style={styles.dateText}>Por: {openerName}</Text>

          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.labelSub}>Recaudado en ventas</Text>
              <Text style={styles.generatedAmount}>
                +${Number(item.generatedAmount || 0).toFixed(2)}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.labelSub}>Total Acumulado</Text>
              <Text style={styles.totalAmount}>
                ${Number(item.totalAmount || 0).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
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
      <View style={styles.topBar}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>HISTORIAL SEMANAL</Text>
        </View>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>Historial de Cajas</Text>
        <Text style={styles.subtitle}>Aperturas y ventas recaudadas</Text>
      </View>

      {errorMsg ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{errorMsg}</Text>
        </View>
      ) : null}

      <FlatList
        data={weeklyRegisters}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No hay registros de cajas en esta sucursal.
            </Text>
          </View>
        }
      />

      {/* Modal de Detalle */}
      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalTopBar} />

            <View style={styles.modalBody}>
              {selectedRegister && (
                <>
                  <Text style={styles.modalTitle}>
                    Detalles de Caja #{selectedRegister.id}
                  </Text>

                  <View style={styles.detailBox}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Estado:</Text>
                      <Text
                        style={[
                          styles.detailValue,
                          {
                            color:
                              selectedRegister.status === 'OPEN'
                                ? colors.success
                                : colors.danger,
                          },
                        ]}
                      >
                        {selectedRegister.status}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Aperturada por:</Text>
                      <Text style={styles.detailValue}>
                        {selectedRegister.openedBy?.name || 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Fecha Apertura:</Text>
                      <Text style={styles.detailValue}>
                        {new Date(selectedRegister.openedAt).toLocaleString()}
                      </Text>
                    </View>

                    <View style={[styles.detailRow, { marginBottom: 0 }]}>
                      <Text style={styles.detailLabel}>Fecha Cierre:</Text>
                      <Text style={styles.detailValue}>
                        {selectedRegister.closedAt
                          ? new Date(selectedRegister.closedAt).toLocaleString()
                          : 'Aún abierta'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailBox}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Monto Inicial:</Text>
                      <Text style={styles.detailValue}>
                        ${Number(selectedRegister.initialAmount).toFixed(2)}
                      </Text>
                    </View>

                    <View style={[styles.detailRow, { marginBottom: 0 }]}>
                      <Text style={styles.detailLabel}>Ventas Recaudadas:</Text>
                      <Text style={[styles.detailValue, { color: colors.success }]}>
                        +${Number(selectedRegister.generatedAmount || 0).toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.totalDetailRow}>
                    <Text style={styles.totalDetailLabel}>Total Final:</Text>
                    <Text style={styles.totalDetailValue}>
                      ${Number(selectedRegister.totalAmount).toFixed(2)}
                    </Text>
                  </View>

                  <Pressable
                    onPress={() => setModalVisible(false)}
                    style={({ pressed }) => [
                      styles.closeDetailBtn,
                      pressed && styles.closeDetailBtnPressed,
                    ]}
                  >
                    <Text style={styles.closeDetailText}>Cerrar Detalle</Text>
                  </Pressable>
                </>
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}