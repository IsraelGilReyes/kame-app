// src/features/orders/presentation/ordersView.tsx

import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { colors } from '../../../shared/theme/colors';
import { useAuth } from '../../auth/presentation/context/AuthContext';
import { Order, OrderStatus } from '../domain/entities';
import {
  getOrders,
  updateOrderStatus,
} from '../infrastructure/datasources/orders-api.datasource';
import { styles } from './ordersView.styles';

type StatusFilter = 'TODAS' | OrderStatus;

const ALL_STATUSES: OrderStatus[] = [
  'PENDIENTE',
  'PREPARACION',
  'ENVIADO',
  'ENTREGADO',
  'CANCELADO',
];

const STATUS_FILTERS: StatusFilter[] = ['TODAS', ...ALL_STATUSES];

export function OrdersView() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<StatusFilter>('TODAS');
  const router = useRouter();
  const { user } = useAuth();

  // Estados para el Modal de Detalles
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  const userRole = user?.role || '';
  const canCreateOrder = ['ADMIN_GENERAL', 'GERENTE', 'CAJERO'].includes(userRole);
  const canViewDailyDelivered = ['ADMIN_GENERAL', 'GERENTE', 'CAJERO'].includes(userRole);

  const getAllowedStatusesForRole = (): OrderStatus[] => {
    if (userRole === 'GERENTE' || userRole === 'ADMIN_GENERAL') {
      return ALL_STATUSES;
    }
    if (userRole === 'CAJERO' || userRole === 'REPARTIDOR') {
      return ['ENVIADO', 'ENTREGADO'];
    }
    if (userRole === 'COCINA') {
      return ['PREPARACION'];
    }
    return [];
  };

  const allowedStatuses = getAllowedStatusesForRole();

  const loadOrders = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadOrders(false);
    }, [loadOrders]),
  );

  const countByStatus = useMemo(() => {
    const counts: Record<string, number> = { TODAS: orders.length };
    for (const status of ALL_STATUSES) {
      counts[status] = orders.filter((o) => o.status === status).length;
    }
    return counts;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (selectedFilter === 'TODAS') return orders;
    return orders.filter((order) => order.status === selectedFilter);
  }, [orders, selectedFilter]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'PENDIENTE':
        return colors.warning;
      case 'PREPARACION':
        return colors.accent;
      case 'ENVIADO':
        return colors.secondary;
      case 'ENTREGADO':
        return colors.success;
      case 'CANCELADO':
        return colors.danger;
      default:
        return colors.muted;
    }
  };

  const getOrderTypeLabel = (order: Order) =>
    order.type === 'DOMICILIO' ? 'A Domicilio' : 'En Local';

  // Manejar el cambio de estado de una orden
  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!selectedOrder) return;
    try {
      setUpdating(true);
      await updateOrderStatus(selectedOrder.id, { status: newStatus });
      Alert.alert('Éxito', `Orden #${selectedOrder.id} actualizada a ${newStatus}`);
      setModalVisible(false);
      loadOrders(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo actualizar el estado');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Barra superior */}
      <View style={styles.topBar}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>PEDIDOS Y FLUJO</Text>
        </View>
      </View>

      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.title}>Órdenes y Pedidos</Text>
        <Text style={styles.subtitle}>
          Consulta el estado de las órdenes y actualiza su avance
        </Text>
      </View>

      {/* Botón exclusivo para crear orden según el rol */}
      {canCreateOrder && (
        <Pressable
          onPress={() => router.push('/orders/CreateOrder' as any)}
          style={({ pressed }) => [
            styles.createButton,
            pressed && styles.createButtonPressed,
          ]}
        >
          <View style={styles.createIconBox}>
            <Text style={styles.createIconText}>+</Text>
          </View>
          <Text style={styles.createButtonText}>Crear Nueva Orden</Text>
        </Pressable>
      )}

      {/* Botón para ver las órdenes entregadas del día */}
      {canViewDailyDelivered && (
        <Pressable
          onPress={() => router.push('/orders/DailyDeliveredOrders' as any)}
          style={({ pressed }) => [
            styles.dailyButton,
            pressed && styles.dailyButtonPressed,
          ]}
        >
          <Text style={styles.dailyButtonText}>Ver Órdenes Entregadas Hoy</Text>
          <Text style={styles.dailyArrow}>→</Text>
        </Pressable>
      )}

      {/* Chips de filtro rápido por estado */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filtersContainer}
      >
        {STATUS_FILTERS.map((filter) => {
          const isActive = selectedFilter === filter;
          const count = countByStatus[filter] ?? 0;

          return (
            <Pressable
              key={filter}
              onPress={() => setSelectedFilter(filter)}
              style={[
                styles.filterChip,
                isActive && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  isActive && styles.filterChipTextActive,
                ]}
              >
                {filter}
              </Text>
              <View
                style={[
                  styles.filterCountBadge,
                  isActive && styles.filterCountBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterCountText,
                    isActive && styles.filterCountTextActive,
                  ]}
                >
                  {count}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.accent}
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadOrders(true)}
              colors={[colors.accent]}
              tintColor={colors.accent}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                {selectedFilter === 'TODAS'
                  ? 'No hay órdenes registradas.'
                  : `No hay órdenes en estado ${selectedFilter}.`}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                setSelectedOrder(item);
                setModalVisible(true);
              }}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
            >
              <View
                style={[
                  styles.cardTopBar,
                  { backgroundColor: getStatusColor(item.status) },
                ]}
              />

              <View style={styles.cardBody}>
                <View style={styles.cardHeader}>
                  <Text style={styles.orderId}>Orden #{item.id}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(item.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                </View>

                <View style={styles.typePill}>
                  <Text style={styles.typeTag}>{getOrderTypeLabel(item)}</Text>
                </View>

                {item.customerName ? (
                  <Text style={styles.detail}>Cliente: {item.customerName}</Text>
                ) : null}
                {item.type === 'DOMICILIO' && item.address ? (
                  <Text style={styles.detail} numberOfLines={1}>
                    Dirección: {item.address}
                  </Text>
                ) : null}
                {item.branch && (
                  <Text style={styles.detail}>Sucursal: {item.branch.name}</Text>
                )}
                {item.user && (
                  <Text style={styles.detail}>Atendió: {item.user.name}</Text>
                )}

                <View style={styles.cardFooter}>
                  <Text style={styles.totalLabel}>Total de la orden</Text>
                  <Text style={styles.total}>
                    ${Number(item.total).toFixed(2)}
                  </Text>
                </View>
              </View>
            </Pressable>
          )}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* Modal de Detalles y Cambio de Estado */}
      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => !updating && setModalVisible(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalTopBar} />

            <View style={styles.modalBody}>
              {selectedOrder && (
                <>
                  <Text style={styles.modalTitle}>
                    Detalles de Orden #{selectedOrder.id}
                  </Text>

                  <View style={styles.modalInfoBox}>
                    <Text style={styles.modalTextInfo}>
                      <Text style={{ fontWeight: '800' }}>Tipo:</Text>{' '}
                      {getOrderTypeLabel(selectedOrder)}
                    </Text>
                    <Text style={styles.modalTextInfo}>
                      <Text style={{ fontWeight: '800' }}>Estado actual:</Text>{' '}
                      <Text
                        style={{
                          color: getStatusColor(selectedOrder.status),
                          fontWeight: '900',
                        }}
                      >
                        {selectedOrder.status}
                      </Text>
                    </Text>
                    {selectedOrder.customerName ? (
                      <Text style={styles.modalTextInfo}>
                        <Text style={{ fontWeight: '800' }}>Cliente:</Text>{' '}
                        {selectedOrder.customerName}
                      </Text>
                    ) : null}
                    {selectedOrder.type === 'DOMICILIO' && selectedOrder.address ? (
                      <Text style={styles.modalTextInfo}>
                        <Text style={{ fontWeight: '800' }}>Dirección:</Text>{' '}
                        {selectedOrder.address}
                      </Text>
                    ) : null}
                    {selectedOrder.branch && (
                      <Text style={styles.modalTextInfo}>
                        <Text style={{ fontWeight: '800' }}>Sucursal:</Text>{' '}
                        {selectedOrder.branch.name}
                      </Text>
                    )}
                    {selectedOrder.user && (
                      <Text style={styles.modalTextInfo}>
                        <Text style={{ fontWeight: '800' }}>Atendió:</Text>{' '}
                        {selectedOrder.user.name}
                      </Text>
                    )}
                  </View>

                  <Text style={styles.productsHeader}>Productos en la orden</Text>
                  <FlatList
                    data={selectedOrder.items || []}
                    keyExtractor={(item, index) => (item.id ?? index).toString()}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                      <View style={styles.productRow}>
                        <Text style={styles.productName}>
                          {item.product?.name || 'Producto'} (x{item.quantity})
                        </Text>
                        <Text style={styles.productPrice}>
                          $
                          {(
                            Number(item.product?.price || 0) * item.quantity
                          ).toFixed(2)}
                        </Text>
                      </View>
                    )}
                    style={styles.productList}
                  />

                  <View style={styles.modalTotalBox}>
                    <Text style={styles.modalTotalLabel}>Total:</Text>
                    <Text style={styles.modalTotal}>
                      ${Number(selectedOrder.total).toFixed(2)}
                    </Text>
                  </View>

                  {/* Botones de cambio de estado permitidos para el rol */}
                  {allowedStatuses.length > 0 && (
                    <View style={styles.statusActionContainer}>
                      <Text style={styles.changeStatusLabel}>
                        Cambiar estado a:
                      </Text>
                      <View style={styles.statusButtonsGrid}>
                        {allowedStatuses.map(
                          (st) =>
                            selectedOrder.status !== st && (
                              <Pressable
                                key={st}
                                onPress={() => handleStatusChange(st)}
                                disabled={updating}
                                style={({ pressed }) => [
                                  styles.statusOptionBtn,
                                  { backgroundColor: getStatusColor(st) },
                                  pressed && styles.statusOptionBtnPressed,
                                ]}
                              >
                                <Text style={styles.statusOptionText}>{st}</Text>
                              </Pressable>
                            ),
                        )}
                      </View>
                    </View>
                  )}

                  <Pressable
                    onPress={() => setModalVisible(false)}
                    disabled={updating}
                    style={({ pressed }) => [
                      styles.closeModalBtn,
                      pressed && styles.closeModalBtnPressed,
                    ]}
                  >
                    <Text style={styles.closeModalText}>Cerrar</Text>
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