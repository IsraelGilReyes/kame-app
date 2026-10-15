import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Button,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Interfaz que simula el modelo Product de Prisma
interface ProductItem {
  id: number;
  name: string;
  price: string;
}

export function ManageProductsView() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const branchId = params.branchId || '1'; // Recibe el ID de la sucursal por parámetros

  // Estado inicial de productos de ejemplo
  const [products, setProducts] = useState<ProductItem[]>([
    { id: 1, name: 'Pizza Pepperoni', price: '180.00' },
    { id: 2, name: 'Pizza Hawaiana', price: '140.00' },
    { id: 3, name: 'Pizza Mexicana', price: '220.00' },
    { id: 4, name: 'Pizza de Queso', price: '100.00' },
  ]);

  // Estados para el Modal (Crear / Editar)
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  // Abrir modal para CREAR
  const handleOpenCreate = () => {
    setIsEditing(false);
    setCurrentId(null);
    setName('');
    setPrice('');
    setModalVisible(true);
  };

  // Abrir modal para EDITAR
  const handleOpenEdit = (product: ProductItem) => {
    setIsEditing(true);
    setCurrentId(product.id);
    setName(product.name);
    setPrice(product.price);
    setModalVisible(true);
  };

  // Guardar (Crear o Modificar)
  const handleSaveProduct = () => {
    if (!name.trim() || !price.trim()) {
      Alert.alert('Error', 'Por favor llena todos los campos');
      return;
    }

    if (isEditing && currentId !== null) {
      // Modificar producto existente
      setProducts(
        products.map((p) => (p.id === currentId ? { ...p, name, price } : p))
      );
      Alert.alert('Éxito', 'Producto modificado correctamente');
    } else {
      // Crear nuevo producto
      const newProduct: ProductItem = {
        id: Date.now(), // ID temporal simulando autoincrement
        name,
        price,
      };
      setProducts([...products, newProduct]);
      Alert.alert('Éxito', 'Producto creado correctamente');
    }

    setModalVisible(false);
  };

  // Eliminar producto
  const handleDeleteProduct = (id: number) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar este producto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setProducts(products.filter((p) => p.id !== id));
            Alert.alert('Eliminado', 'El producto ha sido removido.');
          },
        },
      ]
    );
  };

  // Renderizar cada elemento en la lista de gestión
  const renderItem = ({ item }: { item: ProductItem }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>${item.price}</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleOpenEdit(item)}
        >
          <Text style={styles.actionText}>✏️ Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteProduct(item.id)}
        >
          <Text style={styles.actionText}>🗑️ Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Cabecera */}
      <View style={styles.header}>
        <Text style={styles.title}>Administrar Productos</Text>
        <Text style={styles.subtitle}>Sucursal ID: {branchId}</Text>
      </View>

      {/* Botón para Agregar Producto */}
      <View style={styles.addButtonContainer}>
        <Button title="+ Agregar Nuevo Producto" color="#2B6CB0" onPress={handleOpenCreate} />
      </View>

      {/* Lista de Productos */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />

      

      {/* Modal para Crear / Editar */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditing ? 'Modificar Producto' : 'Crear Producto'}
            </Text>

            <Text style={styles.label}>Nombre del Producto</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Pizza Especial"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Precio ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. 190.00"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />

            <View style={styles.modalButtons}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Button
                  title="Cancelar"
                  color="#E53E3E"
                  onPress={() => setModalVisible(false)}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Button
                  title={isEditing ? 'Guardar Cambios' : 'Crear'}
                  color="#319795"
                  onPress={handleSaveProduct}
                />
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
    backgroundColor: '#F7FAFC',
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
  addButtonContainer: {
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  productPrice: {
    fontSize: 14,
    color: '#4A5568',
    marginTop: 4,
  },
  cardActions: {
    flexDirection: 'row',
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
    fontSize: 14,
    fontWeight: '500',
    color: '#4A5568',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E0',
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    marginBottom: 16,
    backgroundColor: '#F7FAFC',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});