import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../../../shared/theme/colors';
import { useAuth } from '../../auth/presentation/context/AuthContext';
import { Order, OrderStatus } from '../domain/entities';
import { getOrders, updateOrderStatus } from '../infrastructure/datasources/orders-api.datasource';

export function OrdersView() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const { user } = useAuth();

  // Estados para el Modal de Detalles
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  // Verificación de roles según tu backend
  const userRole = user?.role || '';
  const canCreateOrder = ['GERENTE', 'CAJERO'].includes(userRole);
  const canUpdateStatus = ['GERENTE', 'CAJERO', 'REPARTIDOR', 'COCINA'].includes(userRole);
  
  // 🔒 Restricción para ver las órdenes entregadas del día (Solo Gerente y Cajero)
  const canViewDailyDelivered = ['GERENTE', 'CAJERO'].includes(userRole);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [])
  );

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'PENDIENTE': return colors.warning;
      case 'PREPARACION': return colors.accent;
      case 'ENVIADO': return '#805AD5';
      case 'ENTREGADO': return colors.success;
      case 'CANCELADO': return colors.danger;
      default: return colors.muted;
    }
  };

  // Manejar el cambio de estado de una orden
  const handleStatusChange = async (newStatus: string) => {
    if (!selectedOrder) return;
    try {
      setUpdating(true);
      await updateOrderStatus(selectedOrder.id, { status: newStatus });
      Alert.alert('Éxito', `Orden #${selectedOrder.id} actualizada a ${newStatus}`);
      setModalVisible(false);
      loadOrders();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo actualizar el estado');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Encabezado sin botón de volver */}
      <View style={styles.header}>
        <Text style={styles.title}>Órdenes y Pedidos 📋</Text>
      </View>

      {/* Botón exclusivo para crear orden según el rol */}
      {canCreateOrder && (
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('/orders/CreateOrder' as any)}
        >
          <Text style={styles.createButtonText}>+ Crear Nueva Orden</Text>
        </TouchableOpacity>
      )}

      {/* 🚀 Botón exclusivo para GERENTE y CAJERO para ver las órdenes entregadas del día */}
      {canViewDailyDelivered && (
        <TouchableOpacity
          style={styles.dailyButton}
          onPress={() => router.push('/orders/DailyDeliveredOrders' as any)} // Ajusta la ruta exacta de tu archivo
        >
          <Text style={styles.dailyButtonText}>📅 Ver Órdenes Entregadas Hoy</Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => {
                setSelectedOrder(item);
                setModalVisible(true);
              }}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.orderId}>Orden #{item.id}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>

              {item.branch && <Text style={styles.detail}>Sucursal: {item.branch.name}</Text>}
              {item.user && <Text style={styles.detail}>Atendió: {item.user.name}</Text>}
              
              <Text style={styles.total}>Total: ${Number(item.total).toFixed(2)}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* Modal de Detalles y Cambio de Estado */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedOrder && (
              <>
                <Text style={styles.modalTitle}>Detalles de Orden #{selectedOrder.id}</Text>
                
                <View style={styles.modalInfoBox}>
                  <Text style={styles.modalTextInfo}>
                    <Text style={{ fontWeight: 'bold' }}>Estado actual:</Text>{' '}
                    <Text style={{ color: getStatusColor(selectedOrder.status), fontWeight: 'bold' }}>
                      {selectedOrder.status}
                    </Text>
                  </Text>
                  {selectedOrder.branch && (
                    <Text style={styles.modalTextInfo}>
                      <Text style={{ fontWeight: 'bold' }}>Sucursal:</Text> {selectedOrder.branch.name}
                    </Text>
                  )}
                  {selectedOrder.user && (
                    <Text style={styles.modalTextInfo}>
                      <Text style={{ fontWeight: 'bold' }}>Atendió:</Text> {selectedOrder.user.name}
                    </Text>
                  )}
                </View>

                <Text style={styles.productsHeader}>Productos en la orden:</Text>
                <FlatList
                  data={selectedOrder.items || []}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <View style={styles.productRow}>
                      <Text style={styles.productName}>
                        {item.product?.name || 'Producto'} (x{item.quantity})
                      </Text>
                      <Text style={styles.productPrice}>
                        ${(Number(item.product?.price || 0) * item.quantity).toFixed(2)}
                      </Text>
                    </View>
                  )}
                  style={styles.productList}
                />

                <Text style={styles.modalTotal}>
                  Total: ${Number(selectedOrder.total).toFixed(2)}
                </Text>

                {/* Botones de cambio de estado si el rol está permitido */}
                {canUpdateStatus && (
                  <View style={styles.statusActionContainer}>
                    <Text style={styles.changeStatusLabel}>Cambiar estado a:</Text>
                    <View style={styles.statusButtonsGrid}>
                      {['PENDIENTE', 'PREPARACION', 'ENVIADO', 'ENTREGADO', 'CANCELADO'].map((st) => (
                        selectedOrder.status !== st && (
                          <TouchableOpacity
                            key={st}
                            style={[styles.statusOptionBtn, { backgroundColor: getStatusColor(st as OrderStatus) }]}
                            onPress={() => handleStatusChange(st)}
                            disabled={updating}
                          >
                            <Text style={styles.statusOptionText}>{st}</Text>
                          </TouchableOpacity>
                        )
                      ))}
                    </View>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.closeModalBtn}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeModalText}>Cerrar</Text>
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
  container: { flex: 1, backgroundColor: colors.background, padding: 20, paddingTop: 50 },
  header: { marginBottom: 20, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: colors.primary },
  createButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  createButtonText: { color: colors.surface, fontSize: 16, fontWeight: 'bold' },
  dailyButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dailyButtonText: { color: colors.surface, fontSize: 15, fontWeight: 'bold' },
  listContainer: { paddingBottom: 20 },
  card: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderId: { fontSize: 16, fontWeight: 'bold', color: colors.text },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { color: colors.surface, fontSize: 11, fontWeight: 'bold' },
  detail: { fontSize: 14, color: colors.muted, marginTop: 2 },
  total: { fontSize: 16, fontWeight: 'bold', color: colors.accent, marginTop: 8 },
  
  // Estilos del Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(43, 33, 30, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: colors.surface, borderRadius: 16, padding: 20, width: '100%', maxWidth: 450, maxHeight: '80%', borderWidth: 1, borderColor: colors.border, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, textAlign: 'center', color: colors.primary },
  modalInfoBox: { backgroundColor: colors.background, padding: 10, borderRadius: 8, marginBottom: 12 },
  modalTextInfo: { fontSize: 14, color: colors.text, marginBottom: 4 },
  productsHeader: { fontSize: 14, fontWeight: 'bold', color: colors.primary, marginBottom: 6 },
  productList: { maxHeight: 150, marginBottom: 10 },
  productRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: colors.border },
  productName: { fontSize: 13, color: colors.text },
  productPrice: { fontSize: 13, fontWeight: '600', color: colors.accent },
  modalTotal: { fontSize: 16, fontWeight: 'bold', color: colors.primary, textAlign: 'right', marginVertical: 10 },
  statusActionContainer: { marginTop: 10, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 },
  changeStatusLabel: { fontSize: 13, fontWeight: 'bold', color: colors.muted, marginBottom: 8 },
  statusButtonsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 15 },
  statusOptionBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 },
  statusOptionText: { color: colors.surface, fontSize: 11, fontWeight: 'bold' },
  closeModalBtn: { backgroundColor: colors.muted, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  closeModalText: { color: colors.surface, fontWeight: 'bold', fontSize: 14 },
});