import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Tipos basados en Prisma
type CashRegisterStatus = 'OPEN' | 'CLOSED';

interface CashRegisterModel {
  id: number;
  initialAmount: string;
  generatedAmount: string;
  totalAmount: string;
  status: CashRegisterStatus;
  openedAt: string;
  closedAt: string | null;
  openedBy: string;
}

export function WeeklyCashRegistersView() {
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(true);
  const [weeklyRegisters, setWeeklyRegisters] = useState<CashRegisterModel[]>([]);

  // Estado del Modal de Detalle
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedRegister, setSelectedRegister] = useState<CashRegisterModel | null>(null);

  useEffect(() => {
    const loadWeeklyData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Cajas de ejemplo registradas en la semana
      const mockWeeklyData: CashRegisterModel[] = [
        {
          id: 10,
          initialAmount: '500.00',
          generatedAmount: '1250.50',
          totalAmount: '1750.50',
          status: 'OPEN',
          openedAt: '2026-10-14 09:00',
          closedAt: null,
          openedBy: 'Israel Gil',
        },
        {
          id: 9,
          initialAmount: '500.00',
          generatedAmount: '2100.00',
          totalAmount: '2600.00',
          status: 'CLOSED',
          openedAt: '2026-10-13 09:00',
          closedAt: '2026-10-13 21:30',
          openedBy: 'Israel Gil',
        },
        {
          id: 8,
          initialAmount: '400.00',
          generatedAmount: '1850.00',
          totalAmount: '2250.00',
          status: 'CLOSED',
          openedAt: '2026-10-12 09:15',
          closedAt: '2026-10-12 21:00',
          openedBy: 'Carlos Cajero',
        },
      ];

      setWeeklyRegisters(mockWeeklyData);
      setLoading(false);
    };

    loadWeeklyData();
  }, []);

  const handleOpenDetail = (register: CashRegisterModel) => {
    setSelectedRegister(register);
    setModalVisible(true);
  };

  const renderItem = ({ item }: { item: CashRegisterModel }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => handleOpenDetail(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.registerId}>Caja #{item.id}</Text>
        <Text
          style={[
            styles.statusBadge,
            item.status === 'OPEN' ? styles.statusOpen : styles.statusClosed,
          ]}
        >
          {item.status === 'OPEN' ? '🟢 ABIERTA' : '🔴 CERRADA'}
        </Text>
      </View>

      <Text style={styles.dateText}>Apertura: {item.openedAt}</Text>

      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.labelSub}>Recaudado en ventas:</Text>
          <Text style={styles.generatedAmount}>${item.generatedAmount}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.labelSub}>Total Acumulado:</Text>
          <Text style={styles.totalAmount}>${item.totalAmount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#1A535C" />
        <Text style={{ marginTop: 10 }}>Cargando cajas de la semana...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cajas Semanales</Text>
        <Text style={styles.subtitle}>Historial de aperturas y ventas recaudadas</Text>
      </View>

      <FlatList
        data={weeklyRegisters}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />

    

      {/* Modal de Detalle Completo de la Caja */}
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
                      { color: selectedRegister.status === 'OPEN' ? '#2F855A' : '#E53E3E' },
                    ]}
                  >
                    {selectedRegister.status}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Aperturada por:</Text>
                  <Text style={styles.detailValue}>{selectedRegister.openedBy}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Fecha Apertura:</Text>
                  <Text style={styles.detailValue}>{selectedRegister.openedAt}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Fecha Cierre:</Text>
                  <Text style={styles.detailValue}>
                    {selectedRegister.closedAt || 'Aún no cerrada'}
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Monto Inicial:</Text>
                  <Text style={styles.detailValue}>${selectedRegister.initialAmount}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Ventas Recaudadas:</Text>
                  <Text style={[styles.detailValue, { color: '#2B6CB0' }]}>
                    ${selectedRegister.generatedAmount}
                  </Text>
                </View>

                <View style={[styles.detailRow, styles.totalDetailRow]}>
                  <Text style={styles.totalDetailLabel}>Total Final:</Text>
                  <Text style={styles.totalDetailValue}>${selectedRegister.totalAmount}</Text>
                </View>

                <Button
                  title="Cerrar Detalle"
                  color="#1A535C"
                  onPress={() => setModalVisible(false)}
                />
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
    paddingTop: 50,
    backgroundColor: '#F8F9FA',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 16,
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
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    color: '#2D3748',
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusOpen: {
    backgroundColor: '#E6FFFA',
    color: '#234E52',
  },
  statusClosed: {
    backgroundColor: '#FFF5F5',
    color: '#9B2C2C',
  },
  dateText: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7',
    paddingTop: 8,
  },
  labelSub: {
    fontSize: 11,
    color: '#A0AEC0',
  },
  generatedAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2B6CB0',
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  backButtonContainer: {
    marginTop: 'auto',
    marginBottom: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 16,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: '#718096',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2D3748',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  totalDetailRow: {
    marginTop: 4,
    marginBottom: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  totalDetailLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  totalDetailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2B6CB0',
  },
});