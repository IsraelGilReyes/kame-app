import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Button,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Tipos basados en tu esquema de Prisma
type OrderStatus = 'PENDIENTE' | 'PREPARACION' | 'ENVIADO' | 'ENTREGADO' | 'CANCELADO';
type CashRegisterStatus = 'OPEN' | 'CLOSED';

interface OrderItemModel {
  productId: number;
  productName: string;
  quantity: number;
  price: string;
}

interface OrderModel {
  id: number;
  userId: number;
  branchId: number;
  total: string;
  status: OrderStatus;
  items: OrderItemModel[];
  createdAt: string; // Formato esperado "YYYY-MM-DD HH:mm" o fecha actual
}

interface CashRegisterModel {
  id: number;
  status: CashRegisterStatus;
  initialAmount: string;
  totalAmount: string;
}

export function DailyDeliveredOrdersView() {
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(true);
  const [cashRegister, setCashRegister] = useState<CashRegisterModel | null>(null);
  const [deliveredOrders, setDeliveredOrders] = useState<OrderModel[]>([]);

  // Estado para el Modal de detalles de la orden
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderModel | null>(null);

  useEffect(() => {
    // Simulación de carga de estado de caja y órdenes del día de la base de datos
    const loadDailyData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Simulamos que la caja está ABIIERTA (OPEN)
      const simulatedCashRegister: CashRegisterModel = {
        id: 1,
        status: 'OPEN',
        initialAmount: '500.00',
        totalAmount: '1420.00',
      };

      // Fecha actual de simulación para coincidir con el día de hoy
      const todayStr = '2026-10-14';

      // Órdenes simuladas (algunas entregadas hoy, otras de otros días u otros estados)
      const mockOrders: OrderModel[] = [
        {
          id: 101,
          userId: 1,
          branchId: 1,
          total: '320.00',
          status: 'ENTREGADO',
          items: [
            { productId: 1, productName: 'Pizza Pepperoni', quantity: 1, price: '180.00' },
            { productId: 2, productName: 'Pizza Hawaiana', quantity: 1, price: '140.00' },
          ],
          createdAt: `${todayStr} 12:30`,
        },
        {
          id: 102,
          userId: 1,
          branchId: 1,
          total: '220.00',
          status: 'ENTREGADO',
          items: [
            { productId: 3, productName: 'Pizza Mexicana', quantity: 1, price: '220.00' },
          ],
          createdAt: `${todayStr} 14:15`,
        },
        {
          id: 103,
          userId: 2,
          branchId: 1,
          total: '100.00',
          status: 'PENDIENTE',
          items: [
            { productId: 4, productName: 'Pizza de Queso', quantity: 1, price: '100.00' },
          ],
          createdAt: `${todayStr} 15:00`,
        },
      ];

      // Filtrar estrictamente las órdenes que estén ENTREGADAS y sean del día de hoy
      const filtered = mockOrders.filter(
        (order) => order.status === 'ENTREGADO' && order.createdAt.startsWith(todayStr)
      );

      setCashRegister(simulatedCashRegister);
      setDeliveredOrders(filtered);
      setLoading(false);
    };

    loadDailyData();
  }, []);

  // Abrir modal de detalles
  const handleOpenDetails = (order: OrderModel) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  // Renderizar tarjeta de orden entregada
  const renderItem = ({ item }: { item: OrderModel }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => handleOpenDetails(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.orderId}>Orden #{item.id}</Text>
        <Text style={styles.statusBadge}>✅ ENTREGADO</Text>
      </View>
      <Text style={styles.cardSubtitle}>Toca para ver el detalle de los productos</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.orderTotal}>Total: ${item.total}</Text>
        <Text style={styles.orderDate}>{item.createdAt}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#319795" />
        <Text style={{ marginTop: 10 }}>Verificando caja y órdenes...</Text>
      </View>
    );
  }

  // Verificación de caja abierta según Prisma (CashRegisterStatus.OPEN)
  const isCashRegisterOpen = cashRegister?.status === 'OPEN';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Órdenes Entregadas Hoy</Text>
        <Text style={styles.subtitle}>📅 {new Date().toLocaleDateString()}</Text>
      </View>

      {/* Alerta de Estado de Caja */}
      {!isCashRegisterOpen ? (
        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>⚠️ Caja Cerrada</Text>
          <Text style={styles.warningText}>
            No hay una caja abierta en este momento. Las consultas están limitadas hasta abrir caja.
          </Text>
        </View>
      ) : (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            🟢 Caja Abierta (ID: #{cashRegister?.id}) | Acumulado: ${cashRegister?.totalAmount}
          </Text>
        </View>
      )}

      {/* Listado de Órdenes Entregadas */}
      {deliveredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay órdenes entregadas registradas el día de hoy.</Text>
        </View>
      ) : (
        <FlatList
          data={deliveredOrders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <View style={styles.backButtonContainer}>
        <Button title="Volver a Inicio" color="#718096" onPress={() => router.push('/home')} />
      </View>

      {/* Modal para ver Detalles de la Orden */}
      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedOrder && (
              <>
                <Text style={styles.modalTitle}>Detalles de Orden #{selectedOrder.id}</Text>
                <Text style={styles.modalSubInfo}>Fecha: {selectedOrder.createdAt}</Text>
                <Text style={[styles.modalSubInfo, { marginBottom: 16 }]}>
                  Estado: <Text style={{ color: '#38A169', fontWeight: 'bold' }}>{selectedOrder.status}</Text>
                </Text>

                <Text style={styles.sectionLabel}>Productos Pedidos:</Text>
                <ScrollView style={{ maxHeight: 200, marginBottom: 16 }}>
                  {selectedOrder.items.map((prod, index) => (
                    <View key={index} style={styles.productRow}>
                      <Text style={styles.productNameText}>
                        {prod.quantity}x {prod.productName}
                      </Text>
                      <Text style={styles.productPriceText}>
                        ${(parseFloat(prod.price) * prod.quantity).toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </ScrollView>

                <View style={styles.modalTotalBox}>
                  <Text style={styles.modalTotalLabel}>Total Cobrado:</Text>
                  <Text style={styles.modalTotalValue}>${selectedOrder.total}</Text>
                </View>

                <Button
                  title="Cerrar Detalle"
                  color="#319795"
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
    marginBottom: 12,
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
  infoBox: {
    backgroundColor: '#E6FFFA',
    borderWidth: 1,
    borderColor: '#319795',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#234E52',
    fontWeight: '600',
  },
  warningBox: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FEB2B2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#C53030',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 12,
    color: '#9B2C2C',
    textAlign: 'center',
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
    borderLeftWidth: 4,
    borderLeftColor: '#38A169',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2F855A',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7',
    paddingTop: 8,
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2B6CB0',
  },
  orderDate: {
    fontSize: 11,
    color: '#A0AEC0',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#A0AEC0',
    textAlign: 'center',
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
    textAlign: 'center',
  },
  modalSubInfo: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 8,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F7FAFC',
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  productNameText: {
    fontSize: 13,
    color: '#2D3748',
  },
  productPriceText: {
    fontSize: 13,
    color: '#4A5568',
    fontWeight: '500',
  },
  modalTotalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7',
    paddingTop: 10,
    marginBottom: 16,
  },
  modalTotalLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  modalTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2B6CB0',
  },
});