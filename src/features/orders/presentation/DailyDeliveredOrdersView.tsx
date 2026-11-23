// src/features/orders/presentation/DailyDeliveredOrdersView.tsx

import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { colors } from '../../../shared/theme/colors';
import { Order } from '../../orders/domain/entities';
import { getOrders } from '../../orders/infrastructure/datasources/orders-api.datasource';
import { styles } from './DailyDeliveredOrdersView.styles';

const isSameLocalDay = (isoDate?: string): boolean => {
  if (!isoDate) return false;
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

export function DailyDeliveredOrdersView() {
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

      const filtered = allOrders.filter(
        (order) => order.status === 'ENTREGADO' && isSameLocalDay(order.createdAt),
      );

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
    }, []),
  );

  // Abrir modal de detalles
  const handleOpenDetails = (order: Order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const getOrderTypeLabel = (order: Order) =>
    order.type === 'DOMICILIO' ? 'A Domicilio' : 'En Local';

  // Renderizar tarjeta de orden entregada
  const renderItem = ({ item }: { item: Order }) => (
    <Pressable
      onPress={() => handleOpenDetails(item)}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.cardTopBar} />

      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={styles.orderId}>Orden #{item.id}</Text>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusBadgeText}>ENTREGADO</Text>
          </View>
        </View>

        <View style={styles.typePill}>
          <Text style={styles.cardType}>{getOrderTypeLabel(item)}</Text>
        </View>

        <Text style={styles.cardSubtitle}>
          {item.branch ? `Sucursal: ${item.branch.name}` : 'Sucursal no especificada'}
          {item.customerName ? ` • ${item.customerName}` : ''}
        </Text>

        {item.type === 'DOMICILIO' && item.address ? (
          <Text style={styles.cardAddress} numberOfLines={1}>
            Dirección: {item.address}
          </Text>
        ) : null}

        <View style={styles.cardFooter}>
          <Text style={styles.orderTotal}>
            Total: ${Number(item.total).toFixed(2)}
          </Text>
          <Text style={styles.orderDate}>
            {item.createdAt
              ? new Date(item.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : ''}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Cargando órdenes del día...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>ENTREGAS DEL DÍA</Text>
        </View>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>Órdenes Entregadas Hoy</Text>
        <Text style={styles.subtitle}>
          {new Date().toLocaleDateString('es-MX', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>Entregas registradas hoy</Text>
        <View style={styles.countPill}>
          <Text style={styles.countPillText}>{deliveredOrders.length}</Text>
        </View>
      </View>

      {/* Listado de Órdenes Entregadas */}
      {deliveredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No hay órdenes entregadas registradas el día de hoy.
            </Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={deliveredOrders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* Modal para ver Detalles de la Orden */}
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
              {selectedOrder && (
                <>
                  <Text style={styles.modalTitle}>
                    Detalles de Orden #{selectedOrder.id}
                  </Text>

                  <View style={styles.metaBox}>
                    <Text style={styles.modalSubInfo}>
                      Tipo: {getOrderTypeLabel(selectedOrder)}
                    </Text>
                    {selectedOrder.customerName ? (
                      <Text style={styles.modalSubInfo}>
                        Cliente: {selectedOrder.customerName}
                      </Text>
                    ) : null}
                    {selectedOrder.type === 'DOMICILIO' && selectedOrder.address ? (
                      <Text style={styles.modalSubInfo}>
                        Dirección: {selectedOrder.address}
                      </Text>
                    ) : null}
                    <Text style={styles.modalSubInfo}>
                      Fecha:{' '}
                      {selectedOrder.createdAt
                        ? new Date(selectedOrder.createdAt).toLocaleString()
                        : ''}
                    </Text>
                    <Text style={styles.modalSubInfo}>
                      Estado:{' '}
                      <Text style={{ color: colors.success, fontWeight: '900' }}>
                        {selectedOrder.status}
                      </Text>
                    </Text>
                  </View>

                  <Text style={styles.sectionLabel}>Productos Pedidos</Text>
                  <ScrollView
                    style={styles.itemsScroll}
                    showsVerticalScrollIndicator={false}
                  >
                    {selectedOrder.items?.map((item, index) => (
                      <View key={item.id ?? index} style={styles.productRow}>
                        <Text style={styles.productNameText}>
                          {item.quantity}x {item.product?.name || 'Producto'}
                        </Text>
                        <Text style={styles.productPriceText}>
                          $
                          {(
                            Number(item.product?.price || 0) * item.quantity
                          ).toFixed(2)}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>

                  <View style={styles.modalTotalBox}>
                    <Text style={styles.modalTotalLabel}>Total Cobrado:</Text>
                    <Text style={styles.modalTotalValue}>
                      ${Number(selectedOrder.total).toFixed(2)}
                    </Text>
                  </View>

                  <Pressable
                    onPress={() => setModalVisible(false)}
                    style={({ pressed }) => [
                      styles.closeButton,
                      pressed && styles.closeButtonPressed,
                    ]}
                  >
                    <Text style={styles.closeButtonText}>Cerrar Detalle</Text>
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