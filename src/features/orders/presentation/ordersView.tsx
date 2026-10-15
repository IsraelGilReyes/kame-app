import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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
type Role = 'GERENTE' | 'CAJERO';
type OrderStatus = 'PENDIENTE' | 'PREPARACION' | 'ENVIADO' | 'ENTREGADO' | 'CANCELADO';

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
  createdAt: string;
}

interface UserSession {
  id: number;
  name: string;
  role: Role;
  branchId: number;
  branchName: string;
}

// Productos disponibles de ejemplo para armar la orden
const availableProducts = [
  { id: 1, name: 'Pizza Pepperoni', price: '180.00' },
  { id: 2, name: 'Pizza Hawaiana', price: '140.00' },
  { id: 3, name: 'Pizza Mexicana', price: '220.00' },
  { id: 4, name: 'Pizza de Queso', price: '100.00' },
];

export  function OrdersView() {
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<UserSession | null>(null);

  // Lista simulada de órdenes con sus respectivos productos (OrderItem)
  const [orders, setOrders] = useState<OrderModel[]>([
    {
      id: 1,
      userId: 1,
      branchId: 1,
      total: '320.00',
      status: 'PENDIENTE',
      items: [
        { productId: 1, productName: 'Pizza Pepperoni', quantity: 1, price: '180.00' },
        { productId: 2, productName: 'Pizza Hawaiana', quantity: 1, price: '140.00' },
      ],
      createdAt: '2026-10-14 10:00',
    },
    {
      id: 2,
      userId: 1,
      branchId: 1,
      total: '220.00',
      status: 'ENTREGADO',
      items: [
        { productId: 3, productName: 'Pizza Mexicana', quantity: 1, price: '220.00' },
      ],
      createdAt: '2026-10-14 10:15',
    },
  ]);

  // Estados para el Modal (Crear / Editar Orden)
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [status, setStatus] = useState<OrderStatus>('PENDIENTE');
  
  // Productos seleccionados temporalmente para la orden actual
  const [selectedItems, setSelectedItems] = useState<OrderItemModel[]>([]);

  useEffect(() => {
    const getSessionData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const simulatedUser: UserSession = {
        id: 1,
        name: 'Carlos Cajero',
        role: 'CAJERO',
        branchId: 1,
        branchName: 'Sucursal Centro',
      };
      setUser(simulatedUser);
      setLoading(false);
    };
    getSessionData();
  }, []);

  const canManageOrders = user?.role === 'GERENTE' || user?.role === 'CAJERO';

  // Agregar producto a la orden en curso (en el modal)
  const handleAddProductToOrder = (prod: typeof availableProducts[0]) => {
    const existing = selectedItems.find((item) => item.productId === prod.id);
    if (existing) {
      setSelectedItems(
        selectedItems.map((item) =>
          item.productId === prod.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setSelectedItems([
        ...selectedItems,
        { productId: prod.id, productName: prod.name, quantity: 1, price: prod.price },
      ]);
    }
  };

  // Remover producto de la orden en curso
  const handleRemoveProductFromOrder = (productId: number) => {
    setSelectedItems(selectedItems.filter((item) => item.productId !== productId));
  };

  // Calcular total automáticamente basado en los items
  const calculateTotal = () => {
    return selectedItems
      .reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0)
      .toFixed(2);
  };

  // Abrir modal para CREAR orden
  const handleOpenCreate = () => {
    setIsEditing(false);
    setCurrentId(null);
    setStatus('PENDIENTE');
    setSelectedItems([]);
    setModalVisible(true);
  };

  // Abrir modal para EDITAR orden
  const handleOpenEdit = (order: OrderModel) => {
    setIsEditing(true);
    setCurrentId(order.id);
    setStatus(order.status);
    setSelectedItems([...order.items]);
    setModalVisible(true);
  };

  // Guardar Orden (Crear o Modificar)
  const handleSaveOrder = () => {
    if (selectedItems.length === 0) {
      Alert.alert('Error', 'Debes agregar al menos un producto a la orden');
      return;
    }

    const totalCalculated = calculateTotal();

    if (isEditing && currentId !== null) {
      setOrders(
        orders.map((o) =>
          o.id === currentId
            ? { ...o, total: totalCalculated, status, items: selectedItems }
            : o
        )
      );
      Alert.alert('Éxito', 'Orden modificada correctamente');
    } else {
      const newOrder: OrderModel = {
        id: Date.now(),
        userId: user?.id || 1,
        branchId: user?.branchId || 1,
        total: totalCalculated,
        status: 'PENDIENTE',
        items: selectedItems,
        createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      };
      setOrders([newOrder, ...orders]);
      Alert.alert('Éxito', 'Orden creada exitosamente');
    }

    setModalVisible(false);
  };

  // Eliminar orden
  const handleDeleteOrder = (id: number) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar esta orden?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setOrders(orders.filter((o) => o.id !== id));
            Alert.alert('Eliminado', 'La orden ha sido removida.');
          },
        },
      ]
    );
  };

  // Renderizar cada orden en la lista principal
  const renderItem = ({ item }: { item: OrderModel }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderId}>Orden #{item.id}</Text>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>

      {/* Lista de productos incluidos en la orden */}
      <View style={styles.itemsContainer}>
        <Text style={styles.itemsTitle}>Productos:</Text>
        {item.items.map((prod, idx) => (
          <View key={idx} style={styles.itemRow}>
            <Text style={styles.itemText}>• {prod.quantity}x {prod.productName}</Text>
            <Text style={styles.itemPrice}>${(parseFloat(prod.price) * prod.quantity).toFixed(2)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.orderTotal}>Total: ${item.total}</Text>
        <Text style={styles.orderDate}>{item.createdAt}</Text>
      </View>

      {canManageOrders && (
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.editButton} onPress={() => handleOpenEdit(item)}>
            <Text style={styles.actionText}>✏️ Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteOrder(item.id)}>
            <Text style={styles.actionText}>🗑️ Eliminar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4ECDC4" />
        <Text style={{ marginTop: 10 }}>Cargando módulo de órdenes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Órdenes</Text>
        <Text style={styles.subtitle}>📍 {user?.branchName} | Rol: {user?.role}</Text>
      </View>

      {/* Botones de Acción Superior */}
      {canManageOrders && (
        <View style={styles.topActionsContainer}>
          <View style={{ flex: 1, marginRight: 6 }}>
            <Button title="+ Crear Orden" color="#319795" onPress={handleOpenCreate} />
          </View>
          <View style={{ flex: 1, marginLeft: 6 }}>
            <Button 
              title="📅 Entregadas Hoy" 
              color="#2B6CB0" 
              onPress={() => router.push('orders/DailyDeliveredOrders' as any)} 
            />
          </View>
        </View>
      )}

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />

      

      {/* Modal para Crear / Editar Orden con Productos */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditing ? 'Modificar Orden' : 'Nueva Orden'}
            </Text>

            <ScrollView style={{ maxHeight: 300 }}>
              {/* Selector de productos disponibles */}
              <Text style={styles.label}>Seleccionar Productos:</Text>
              <View style={styles.productsCatalog}>
                {availableProducts.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.catalogItem}
                    onPress={() => handleAddProductToOrder(p)}
                  >
                    <Text style={styles.catalogItemText}>+ {p.name} (${p.price})</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Productos agregados a la orden actual */}
              <Text style={[styles.label, { marginTop: 12 }]}>Productos en la Orden:</Text>
              {selectedItems.length === 0 ? (
                <Text style={styles.emptyText}>No hay productos agregados aún.</Text>
              ) : (
                selectedItems.map((item) => (
                  <View key={item.productId} style={styles.selectedItemRow}>
                    <Text style={styles.selectedItemText}>
                      {item.quantity}x {item.productName}
                    </Text>
                    <TouchableOpacity onPress={() => handleRemoveProductFromOrder(item.productId)}>
                      <Text style={styles.removeText}>❌ Quitar</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}

              {/* Estado de la orden (Solo si está editando) */}
              {isEditing && (
                <>
                  <Text style={[styles.label, { marginTop: 12 }]}>Estado de la Orden:</Text>
                  <View style={styles.statusContainer}>
                    {(['PENDIENTE', 'PREPARACION', 'ENVIADO', 'ENTREGADO', 'CANCELADO'] as OrderStatus[]).map((st) => (
                      <TouchableOpacity
                        key={st}
                        style={[styles.statusChip, status === st && styles.statusChipSelected]}
                        onPress={() => setStatus(st)}
                      >
                        <Text style={[styles.statusChipText, status === st && styles.statusChipTextSelected]}>
                          {st}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.modalTotalContainer}>
              <Text style={styles.modalTotalText}>Total a Pagar: ${calculateTotal()}</Text>
            </View>

            <View style={styles.modalButtons}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Button title="Cancelar" color="#E53E3E" onPress={() => setModalVisible(false)} />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Button title={isEditing ? 'Guardar Cambios' : 'Crear Orden'} color="#319795" onPress={handleSaveOrder} />
              </View>
            </View>
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
  topActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
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
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
    paddingBottom: 6,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#D69E2E',
    backgroundColor: '#FEFCBF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  itemsContainer: {
    marginBottom: 8,
  },
  itemsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 4,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  itemText: {
    fontSize: 13,
    color: '#2D3748',
  },
  itemPrice: {
    fontSize: 13,
    color: '#718096',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7',
    paddingTop: 6,
    marginBottom: 8,
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
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#EDF2F7',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  deleteButton: {
    backgroundColor: '#FED7D7',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
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
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#2D3748',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 6,
  },
  productsCatalog: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  catalogItem: {
    backgroundColor: '#EBF8FF',
    borderWidth: 1,
    borderColor: '#BEE3F8',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  catalogItemText: {
    fontSize: 12,
    color: '#2B6CB0',
    fontWeight: '500',
  },
  selectedItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    padding: 8,
    borderRadius: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedItemText: {
    fontSize: 13,
    color: '#2D3748',
  },
  removeText: {
    fontSize: 12,
    color: '#E53E3E',
  },
  emptyText: {
    fontSize: 12,
    color: '#A0AEC0',
    fontStyle: 'italic',
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  statusChip: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E0',
    backgroundColor: '#EDF2F7',
  },
  statusChipSelected: {
    backgroundColor: '#319795',
    borderColor: '#319795',
  },
  statusChipText: {
    fontSize: 11,
    color: '#4A5568',
  },
  statusChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalTotalContainer: {
    marginVertical: 12,
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7',
    paddingTop: 8,
  },
  modalTotalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2B6CB0',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});