import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../../../shared/theme/colors';
import { Product } from '../../products/domain/entities';
import { getProducts } from '../../products/infrastructure/datasources/products-api.datasource';
import { createOrder } from '../infrastructure/datasources/orders-api.datasource';

interface SelectedItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

export function CreateOrderView() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  
  // Pestaña activa en el teléfono: 'catalog' o 'summary'
  const [activeTab, setActiveTab] = useState<'catalog' | 'summary'>('catalog');
  
  // Lista de productos seleccionados para la orden
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  
  // ID de la sucursal
  const [branchId, setBranchId] = useState<string>('1'); 
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Cargar el catálogo de productos disponibles
  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Agregar o incrementar un producto en la orden
  const handleAddProduct = (product: Product) => {
    setErrorMsg('');
    setSelectedItems((prevItems) => {
      const existing = prevItems.find((item) => item.productId === product.id);
      if (existing) {
        return prevItems.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [
          ...prevItems,
          {
            productId: product.id,
            name: product.name,
            price: Number(product.price),
            quantity: 1,
          },
        ];
      }
    });
  };

  // Disminuir o eliminar un producto de la orden
  const handleRemoveProduct = (productId: number) => {
    setSelectedItems((prevItems) => {
      return prevItems
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0);
    });
  };

  // Calcular el total de la orden
  const calculateTotal = () => {
    return selectedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  // Obtener cantidad total de productos seleccionados para el badge
  const getTotalItemsCount = () => {
    return selectedItems.reduce((acc, item) => acc + item.quantity, 0);
  };

  // Guardar la orden en el backend
  const handleSubmitOrder = async () => {
    if (selectedItems.length === 0) {
      setErrorMsg('Debes agregar al menos un producto a la orden.');
      setActiveTab('summary'); // Cambiar a resumen para que vea el error
      return;
    }

    const numericBranchId = parseInt(branchId, 10);
    if (isNaN(numericBranchId)) {
      setErrorMsg('ID de sucursal inválido.');
      setActiveTab('summary');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      const orderPayload = {
        branchId: numericBranchId,
        total: calculateTotal(),
        items: selectedItems.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      };

      await createOrder(orderPayload);
      router.back(); 
    } catch (error: any) {
      setErrorMsg(error.message || 'No se pudo crear la orden.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.title}>Nueva Orden 🍕</Text>
      </View>

      {errorMsg ? <Text style={styles.errorBanner}>{errorMsg}</Text> : null}

      {/* Selector de Pestañas para Móvil (Tabs) */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'catalog' && styles.activeTabButton]}
          onPress={() => setActiveTab('catalog')}
        >
          <Text style={[styles.tabText, activeTab === 'catalog' && styles.activeTabText]}>
            🍕 Catálogo de Productos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'summary' && styles.activeTabButton]}
          onPress={() => setActiveTab('summary')}
        >
          <Text style={[styles.tabText, activeTab === 'summary' && styles.activeTabText]}>
            🛒 Pedido ({getTotalItemsCount()})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenido condicional según la pestaña seleccionada en el teléfono */}
      {activeTab === 'catalog' ? (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHint}>Toca un producto para agregarlo al pedido:</Text>
          {loading ? (
            <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={products}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.productCard}
                  onPress={() => handleAddProduct(item)}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productPrice}>${Number(item.price).toFixed(2)}</Text>
                  </View>
                  <View style={styles.addIconBadge}>
                    <Text style={styles.addIconText}>+</Text>
                  </View>
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}
        </View>
      ) : (
        <ScrollView style={styles.sectionContainer} contentContainerStyle={{ paddingBottom: 30 }}>
          <Text style={styles.sectionTitle}>Configuración y Resumen</Text>

          <Text style={styles.label}>ID de Sucursal</Text>
          <TextInput
            style={styles.input}
            value={branchId}
            onChangeText={setBranchId}
            keyboardType="numeric"
          />

          <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Productos Seleccionados</Text>
          
          <View style={styles.orderItemList}>
            {selectedItems.length === 0 ? (
              <Text style={styles.emptyText}>No hay productos agregados aún. Selecciona algunos en la pestaña de catálogo.</Text>
            ) : (
              selectedItems.map((item) => (
                <View key={item.productId} style={styles.orderItemRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.summaryName}>{item.name}</Text>
                    <Text style={styles.summarySub}>
                      ${item.price.toFixed(2)} c/u
                    </Text>
                  </View>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => handleRemoveProduct(item.productId)}
                    >
                      <Text style={styles.qtyBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => {
                        const productRef = products.find((p) => p.id === item.productId);
                        if (productRef) handleAddProduct(productRef);
                      }}
                    >
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>

          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total a Pagar:</Text>
            <Text style={styles.totalAmount}>${calculateTotal().toFixed(2)}</Text>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, submitting && { opacity: 0.7 }]}
            onPress={handleSubmitOrder}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={styles.submitButtonText}>Confirmar y Crear Orden</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16, paddingTop: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 15 },
  backButton: { fontSize: 16, color: colors.primary, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: 'bold', color: colors.primary },
  errorBanner: { backgroundColor: '#FEE2E2', color: colors.danger, padding: 10, borderRadius: 8, marginBottom: 10, textAlign: 'center', fontWeight: '500', fontSize: 13 },
  
  // Estilos de Pestañas (Tabs)
  tabsContainer: { flexDirection: 'row', backgroundColor: colors.border, borderRadius: 10, padding: 4, marginBottom: 15 },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  activeTabButton: { backgroundColor: colors.primary, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.muted },
  activeTabText: { color: colors.surface, fontWeight: 'bold' },

  sectionContainer: { flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 15, borderWidth: 1, borderColor: colors.border },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: colors.primary, marginBottom: 10 },
  sectionHint: { fontSize: 13, color: colors.muted, marginBottom: 10, fontStyle: 'italic' },
  
  productCard: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: colors.background, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  productName: { fontSize: 15, fontWeight: '600', color: colors.text },
  productPrice: { fontSize: 14, color: colors.accent, fontWeight: '700', marginTop: 4 },
  addIconBadge: { backgroundColor: colors.primary, width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  addIconText: { color: colors.surface, fontWeight: 'bold', fontSize: 18 },

  label: { fontSize: 13, fontWeight: '500', color: colors.muted, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10, fontSize: 14, marginBottom: 15, backgroundColor: colors.background, color: colors.text },
  
  orderItemList: { marginVertical: 8, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10, backgroundColor: colors.background, minHeight: 120 },
  emptyText: { textAlign: 'center', color: colors.muted, marginTop: 30, fontSize: 13, paddingHorizontal: 20 },
  
  orderItemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  summaryName: { fontSize: 14, fontWeight: '600', color: colors.text },
  summarySub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  
  quantityControls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyBtn: { backgroundColor: colors.border, width: 30, height: 30, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  qtyBtnText: { fontWeight: 'bold', color: colors.text, fontSize: 16 },
  qtyText: { fontSize: 15, fontWeight: 'bold', color: colors.text, minWidth: 20, textAlign: 'center' },

  totalContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 15, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: colors.text },
  totalAmount: { fontSize: 20, fontWeight: 'bold', color: colors.accent },

  submitButton: { backgroundColor: colors.success, paddingVertical: 16, borderRadius: 10, alignItems: 'center', marginTop: 5 },
  submitButtonText: { color: colors.surface, fontSize: 16, fontWeight: 'bold' },
});