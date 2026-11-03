import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
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
import { colors } from '../../../shared/theme/colors';
import { Order } from '../../orders/domain/entities';
import { getOrders } from '../../orders/infrastructure/datasources/orders-api.datasource';

export function DailyDeliveredOrdersView() {
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(true);
  const [deliveredOrders, setDeliveredOrders] = useState<Order[]>([]);

  // Estado para el Modal de detalles de la orden
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Cargar órdenes reales desde el backend y filtrar las del día con estado ENTREGADO
  const loadDailyDeliveredOrders = async () => {
    try {
      setLoading(true);
      const allOrders = await getOrders();

      // Obtener la fecha actual en formato YYYY-MM-DD para comparar con createdAt
      const todayStr = new Date().toISOString().split('T')[0];

      // Filtrar estrictamente las órdenes que estén ENTREGADAS y sean creadas hoy
      const filtered = allOrders.filter((order) => {
        const isDelivered = order.status === 'ENTREGADO';
        const isToday = order.createdAt ? order.createdAt.startsWith(todayStr) : false;
        return isDelivered && isToday;
      });

      setDeliveredOrders(filtered);
    } catch (error) {
      console.error('Error al cargar órdenes entregadas del día:', error);
    } finally {
      setLoading(false);
    }
  };

  // useFocusEffect para recargar la información cada vez que entres a la pantalla
  useFocusEffect(
    useCallback(() => {
      loadDailyDeliveredOrders();
    }, [])
  );

  // Abrir modal de detalles
  const handleOpenDetails = (order: Order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  // Renderizar tarjeta de orden entregada
  const renderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => handleOpenDetails(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.orderId}>Orden #{item.id}</Text>
        <Text style={styles.statusBadge}>✅ ENTREGADO</Text>
      </View>
      <Text style={styles.cardSubtitle}>
        {item.branch ? `Sucursal: ${item.branch.name}` : 'Toca para ver detalles'}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={styles.orderTotal}>Total: ${Number(item.total).toFixed(2)}</Text>
        <Text style={styles.orderDate}>
          {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={{ marginTop: 10, color: colors.muted }}>Cargando órdenes del día...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Órdenes Entregadas Hoy</Text>
        <Text style={styles.subtitle}>📅 {new Date().toLocaleDateString()}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          📦 Total de entregas registradas hoy: {deliveredOrders.length}
        </Text>
      </View>

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

      
      {/* Modal para ver Detalles de la Orden */}
      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedOrder && (
              <>
                <Text style={styles.modalTitle}>Detalles de Orden #{selectedOrder.id}</Text>
                <Text style={styles.modalSubInfo}>
                  Fecha: {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : ''}
                </Text>
                <Text style={[styles.modalSubInfo, { marginBottom: 16 }]}>
                  Estado: <Text style={{ color: colors.success, fontWeight: 'bold' }}>{selectedOrder.status}</Text>
                </Text>

                <Text style={styles.sectionLabel}>Productos Pedidos:</Text>
                <ScrollView style={{ maxHeight: 200, marginBottom: 16 }}>
                  {selectedOrder.items?.map((item, index) => (
                    <View key={index} style={styles.productRow}>
                      <Text style={styles.productNameText}>
                        {item.quantity}x {item.product?.name || 'Producto'}
                      </Text>
                      <Text style={styles.productPriceText}>
                        ${(Number(item.product?.price || 0) * item.quantity).toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </ScrollView>

                <View style={styles.modalTotalBox}>
                  <Text style={styles.modalTotalLabel}>Total Cobrado:</Text>
                  <Text style={styles.modalTotalValue}>${Number(selectedOrder.total).toFixed(2)}</Text>
                </View>

                <Button
                  title="Cerrar Detalle"
                  color={colors.accent}
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
    backgroundColor: colors.background,
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
    color: colors.primary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  infoBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
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
    color: colors.text,
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.success,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.accent,
  },
  orderDate: {
    fontSize: 11,
    color: colors.muted,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
  },
  backButtonContainer: {
    marginTop: 'auto',
    marginBottom: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(43, 33, 30, 0.5)',
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
  },
  modalSubInfo: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  productNameText: {
    fontSize: 13,
    color: colors.text,
  },
  productPriceText: {
    fontSize: 13,
    color: colors.accent,
    fontWeight: '500',
  },
  modalTotalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    marginBottom: 16,
  },
  modalTotalLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.accent,
  },
});