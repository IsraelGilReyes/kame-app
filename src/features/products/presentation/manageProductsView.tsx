import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { colors } from '../../../shared/theme/colors';
import { Product } from '../domain/entities';
import { createProduct, deleteProduct, getProducts, updateProduct } from '../infrastructure/datasources/products-api.datasource';

export function ManageProductsView() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Estados para el Modal (Crear / Editar)
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  // Estados para los mensajes de error en línea (sin alertas)
  const [nameError, setNameError] = useState('');
  const [priceError, setPriceError] = useState('');

  // Estados para el Modal de Confirmación de Eliminación
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudieron cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setCurrentId(null);
    setName('');
    setPrice('');
    setNameError('');
    setPriceError('');
    setModalVisible(true);
  };

  const handleOpenEdit = (product: Product) => {
    setIsEditing(true);
    setCurrentId(product.id);
    setName(product.name);
    setPrice(product.price.toString());
    setNameError('');
    setPriceError('');
    setModalVisible(true);
  };

  const handleSaveProduct = async () => {
    let isValid = true;

    // Validación de nombre
    if (!name.trim()) {
      setNameError('El nombre del producto es obligatorio.');
      isValid = false;
    } else {
      setNameError('');
    }

    // Validación de precio
    const numericPrice = parseFloat(price);
    if (!price.trim()) {
      setPriceError('El precio es obligatorio.');
      isValid = false;
    } else if (isNaN(numericPrice) || numericPrice <= 0) {
      setPriceError('Ingresa un precio válido mayor a 0.');
      isValid = false;
    } else {
      setPriceError('');
    }

    if (!isValid) return; // Detiene la ejecución si hay errores

    try {
      if (isEditing && currentId !== null) {
        await updateProduct(currentId, { name, price: numericPrice });
      } else {
        await createProduct({ name, price: numericPrice });
      }

      setModalVisible(false);
      loadProducts();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo guardar el producto');
    }
  };

  const handleConfirmDeletePrompt = (product: Product) => {
    setProductToDelete(product);
    setDeleteModalVisible(true);
  };

  const handleExecuteDelete = async () => {
    if (!productToDelete) return;

    try {
      await deleteProduct(productToDelete.id);
      setDeleteModalVisible(false);
      setProductToDelete(null);
      loadProducts();
    } catch (error: any) {
      setDeleteModalVisible(false);
      Alert.alert('Error', error.message || 'No se pudo eliminar el producto');
    }
  };

  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>${Number(item.price).toFixed(2)}</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.editButton} onPress={() => handleOpenEdit(item)}>
          <Text style={styles.actionText}>✏️ Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleConfirmDeletePrompt(item)}>
          <Text style={styles.actionText}>🗑️ Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Administrar Productos 🍕</Text>
      </View>

      <TouchableOpacity style={styles.addButton} onPress={handleOpenCreate}>
        <Text style={styles.addButtonText}>+ Agregar Nuevo Producto</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* Modal para Crear / Editar */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditing ? 'Modificar Producto' : 'Crear Producto'}
            </Text>

            <Text style={styles.label}>Nombre del Producto</Text>
            <TextInput
              style={[styles.input, nameError ? styles.inputError : null]}
              placeholder="Ej. Pizza Especial"
              placeholderTextColor={colors.muted}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (text.trim()) setNameError('');
              }}
            />
            {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

            <Text style={styles.label}>Precio ($)</Text>
            <TextInput
              style={[styles.input, priceError ? styles.inputError : null]}
              placeholder="Ej. 190.00"
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
              value={price}
              onChangeText={(text) => {
                setPrice(text);
                if (text.trim() && !isNaN(parseFloat(text))) setPriceError('');
              }}
            />
            {priceError ? <Text style={styles.errorText}>{priceError}</Text> : null}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.muted }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.success }]}
                onPress={handleSaveProduct}
              >
                <Text style={styles.modalBtnText}>{isEditing ? 'Guardar' : 'Crear'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Confirmación para Eliminar */}
      <Modal visible={deleteModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⚠️ Confirmar Eliminación</Text>
            <Text style={styles.deleteWarningText}>
              ¿Estás seguro de que deseas eliminar el producto{' '}
              <Text style={{ fontWeight: 'bold', color: colors.text }}>{productToDelete?.name}</Text>?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.muted }]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.modalBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.danger }]}
                onPress={handleExecuteDelete}
              >
                <Text style={styles.modalBtnText}>Sí, Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: colors.background },
  header: { marginBottom: 20, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: colors.primary },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: { color: colors.surface, fontSize: 16, fontWeight: 'bold' },
  listContainer: { paddingBottom: 20 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 1,
  },
  cardInfo: { flex: 1 },
  productName: { fontSize: 16, fontWeight: '600', color: colors.text },
  productPrice: { fontSize: 14, color: colors.accent, fontWeight: '700', marginTop: 4 },
  cardActions: { flexDirection: 'row', gap: 8 },
  editButton: { backgroundColor: colors.beige, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 },
  deleteButton: { backgroundColor: '#FEE2E2', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 },
  actionText: { fontSize: 12, fontWeight: '600', color: colors.text },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(43, 33, 30, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: colors.surface, borderRadius: 16, padding: 20, width: '100%', maxWidth: 400, borderWidth: 1, borderColor: colors.border, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', color: colors.primary },
  label: { fontSize: 14, fontWeight: '500', color: colors.muted, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10, fontSize: 14, marginBottom: 4, backgroundColor: colors.background, color: colors.text },
  inputError: { borderColor: colors.danger },
  errorText: { fontSize: 12, color: colors.danger, marginBottom: 12, fontWeight: '500' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 10 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  modalBtnText: { color: colors.surface, fontWeight: 'bold', fontSize: 14 },
  deleteWarningText: { fontSize: 15, color: colors.muted, textAlign: 'center', marginBottom: 20, lineHeight: 22 },
});