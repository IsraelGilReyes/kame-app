import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors } from '../../../shared/theme/colors';
import { Product } from '../domain/entities';
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from '../infrastructure/datasources/products-api.datasource';
import { styles } from './manageProductsView.styles';

type FocusedInput = 'name' | 'price' | null;

export function ManageProductsView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [focusedInput, setFocusedInput] = useState<FocusedInput>(null);

  // Estados para el Modal (Crear / Editar)
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  // Estados para los mensajes de error en línea
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

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, []),
  );

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
    const trimmedName = name.trim();

    if (!trimmedName) {
      setNameError('El nombre del producto es obligatorio.');
      isValid = false;
    } else {
      setNameError('');
    }

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

    if (!isValid) return;

    try {
      setSaving(true);
      if (isEditing && currentId !== null) {
        await updateProduct(currentId, { name: trimmedName, price: numericPrice });
      } else {
        await createProduct({ name: trimmedName, price: numericPrice });
      }

      setModalVisible(false);
      await loadProducts();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo guardar el producto');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDeletePrompt = (product: Product) => {
    setProductToDelete(product);
    setDeleteModalVisible(true);
  };

  const handleExecuteDelete = async () => {
    if (!productToDelete) return;

    try {
      setDeleting(true);
      await deleteProduct(productToDelete.id);
      setDeleteModalVisible(false);
      setProductToDelete(null);
      await loadProducts();
    } catch (error: any) {
      setDeleteModalVisible(false);
      Alert.alert('Error', error.message || 'No se pudo eliminar el producto');
    } finally {
      setDeleting(false);
    }
  };

  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.card}>
      <View style={styles.cardTopBar} />

      <View style={styles.cardBody}>
        <View style={styles.cardInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <View style={styles.pricePill}>
            <Text style={styles.productPrice}>
              ${Number(item.price).toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          <Pressable
            onPress={() => handleOpenEdit(item)}
            style={({ pressed }) => [
              styles.editButton,
              pressed && styles.editButtonPressed,
            ]}
          >
            <Text style={styles.editButtonText}>Editar</Text>
          </Pressable>

          <Pressable
            onPress={() => handleConfirmDeletePrompt(item)}
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && styles.deleteButtonPressed,
            ]}
          >
            {({ pressed }) => (
              <Text
                style={[
                  styles.deleteButtonText,
                  pressed && styles.deleteButtonTextPressed,
                ]}
              >
                Eliminar
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>CATÁLOGO</Text>
        </View>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>Administrar Productos</Text>
        <Text style={styles.subtitle}>
          Crea, edita precios y gestiona los productos disponibles
        </Text>
      </View>

      <Pressable
        onPress={handleOpenCreate}
        style={({ pressed }) => [
          styles.addButton,
          pressed && styles.addButtonPressed,
        ]}
      >
        <View style={styles.addIconBox}>
          <Text style={styles.addIconText}>+</Text>
        </View>
        <Text style={styles.addButtonText}>Agregar Nuevo Producto</Text>
      </Pressable>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.accent}
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No hay productos registrados.</Text>
            </View>
          }
        />
      )}

      {/* Modal para Crear / Editar */}
      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => !saving && setModalVisible(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalTopBar} />

            <View style={styles.modalBody}>
              <Text style={styles.modalTitle}>
                {isEditing ? 'Modificar Producto' : 'Crear Producto'}
              </Text>

              <Text style={styles.label}>Nombre del Producto</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedInput === 'name' && styles.inputFocused,
                  nameError ? styles.inputError : null,
                ]}
                placeholder="Ej. Pizza Especial"
                placeholderTextColor={colors.muted}
                value={name}
                onFocus={() => setFocusedInput('name')}
                onBlur={() => setFocusedInput(null)}
                onChangeText={(text) => {
                  setName(text);
                  if (text.trim()) setNameError('');
                }}
              />
              {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

              <Text style={styles.label}>Precio ($)</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedInput === 'price' && styles.inputFocused,
                  priceError ? styles.inputError : null,
                ]}
                placeholder="Ej. 190.00"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
                value={price}
                onFocus={() => setFocusedInput('price')}
                onBlur={() => setFocusedInput(null)}
                onChangeText={(text) => {
                  setPrice(text);
                  if (text.trim() && !isNaN(parseFloat(text))) setPriceError('');
                }}
              />
              {priceError ? (
                <Text style={styles.errorText}>{priceError}</Text>
              ) : null}

              <View style={styles.modalButtons}>
                <Pressable
                  onPress={() => setModalVisible(false)}
                  disabled={saving}
                  style={({ pressed }) => [
                    styles.modalCancelBtn,
                    pressed && styles.modalCancelBtnPressed,
                  ]}
                >
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </Pressable>

                <Pressable
                  onPress={handleSaveProduct}
                  disabled={saving}
                  style={[
                    styles.modalConfirmBtn,
                    saving && { opacity: 0.7 },
                  ]}
                >
                  <Text style={styles.modalBtnText}>
                    {saving ? 'Guardando...' : isEditing ? 'Guardar' : 'Crear'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal de Confirmación para Eliminar */}
      <Modal visible={deleteModalVisible} animationType="fade" transparent={true}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => !deleting && setDeleteModalVisible(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.modalTopBar, { backgroundColor: colors.danger }]} />

            <View style={styles.modalBody}>
              <Text style={styles.modalTitle}>Confirmar Eliminación</Text>
              <Text style={styles.deleteWarningText}>
                ¿Estás seguro de que deseas eliminar el producto{' '}
                <Text style={{ fontWeight: '800', color: colors.text }}>
                  {productToDelete?.name}
                </Text>
                ?
              </Text>

              <View style={styles.modalButtons}>
                <Pressable
                  onPress={() => setDeleteModalVisible(false)}
                  disabled={deleting}
                  style={({ pressed }) => [
                    styles.modalCancelBtn,
                    pressed && styles.modalCancelBtnPressed,
                  ]}
                >
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </Pressable>

                <Pressable
                  onPress={handleExecuteDelete}
                  disabled={deleting}
                  style={[
                    styles.modalDeleteBtn,
                    deleting && { opacity: 0.7 },
                  ]}
                >
                  <Text style={styles.modalBtnText}>
                    {deleting ? 'Eliminando...' : 'Sí, Eliminar'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}