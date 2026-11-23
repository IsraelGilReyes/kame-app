// src/features/orders/presentation/createorderView.tsx

import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors } from '../../../shared/theme/colors';
import { Product } from '../../products/domain/entities';
import { getProducts } from '../../products/infrastructure/datasources/products-api.datasource';
import { OrderType } from '../domain/entities';
import {
  createOrder,
  CreateOrderPayload,
} from '../infrastructure/datasources/orders-api.datasource';
import { styles } from './createorderView.styles';

interface SelectedItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

type FocusedInput = 'branchId' | 'customerName' | 'address' | null;

export function CreateOrderView() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Pestaña activa en el teléfono: 'catalog' o 'summary'
  const [activeTab, setActiveTab] = useState<'catalog' | 'summary'>('catalog');

  // Lista de productos seleccionados para la orden
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  // Configuración de la orden
  const [branchId, setBranchId] = useState<string>('1');
  const [orderType, setOrderType] = useState<OrderType>('LOCAL');
  const [customerName, setCustomerName] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [focusedInput, setFocusedInput] = useState<FocusedInput>(null);

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
            : item,
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
            : item,
        )
        .filter((item) => item.quantity > 0);
    });
  };

  // Cambiar entre pedido LOCAL y DOMICILIO
  const handleSelectOrderType = (type: OrderType) => {
    setErrorMsg('');
    setOrderType(type);
    if (type === 'LOCAL') {
      setAddress('');
    }
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
      setActiveTab('summary');
      return;
    }

    const numericBranchId = parseInt(branchId, 10);
    if (isNaN(numericBranchId) || numericBranchId <= 0) {
      setErrorMsg('ID de sucursal inválido.');
      setActiveTab('summary');
      return;
    }

    if (orderType === 'DOMICILIO') {
      if (!customerName.trim()) {
        setErrorMsg('Ingresa el nombre del cliente para pedidos a domicilio.');
        setActiveTab('summary');
        return;
      }
      if (!address.trim()) {
        setErrorMsg('Ingresa la dirección de entrega para pedidos a domicilio.');
        setActiveTab('summary');
        return;
      }
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      const orderPayload: CreateOrderPayload = {
        branchId: numericBranchId,
        type: orderType,
        ...(orderType === 'DOMICILIO'
          ? {
              customerName: customerName.trim(),
              address: address.trim(),
            }
          : {
              ...(customerName.trim() ? { customerName: customerName.trim() } : {}),
            }),
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
      {/* Barra superior */}
      <View style={styles.topBar}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>PEDIDOS</Text>
        </View>
      </View>

      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.title}>Nueva Orden</Text>
        <Text style={styles.subtitle}>
          Selecciona productos del catálogo y configura el tipo de entrega
        </Text>
      </View>

      {errorMsg ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{errorMsg}</Text>
        </View>
      ) : null}

      {/* Selector de Pestañas para Móvil (Tabs) */}
      <View style={styles.tabsContainer}>
        <Pressable
          onPress={() => setActiveTab('catalog')}
          style={[
            styles.tabButton,
            activeTab === 'catalog' && styles.activeTabButton,
          ]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'catalog' && styles.activeTabText,
            ]}
          >
            Catálogo
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('summary')}
          style={[
            styles.tabButton,
            activeTab === 'summary' && styles.activeTabButton,
          ]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'summary' && styles.activeTabText,
            ]}
          >
            Pedido ({getTotalItemsCount()})
          </Text>
        </Pressable>
      </View>

      {/* Contenido condicional según la pestaña seleccionada en el teléfono */}
      {activeTab === 'catalog' ? (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHint}>
            Toca un producto para agregarlo al pedido:
          </Text>
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
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleAddProduct(item)}
                  style={({ pressed }) => [
                    styles.productCard,
                    pressed && styles.productCardPressed,
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productPrice}>
                      ${Number(item.price).toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.addIconBadge}>
                    <Text style={styles.addIconText}>+</Text>
                  </View>
                </Pressable>
              )}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}
        </View>
      ) : (
        <ScrollView
          style={styles.sectionContainer}
          contentContainerStyle={{ paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Tipo de Pedido y Sucursal</Text>

          {/* Selector LOCAL / DOMICILIO */}
          <View style={styles.typeSelectorRow}>
            <Pressable
              onPress={() => handleSelectOrderType('LOCAL')}
              style={[
                styles.typeButton,
                orderType === 'LOCAL' && styles.activeTypeButton,
              ]}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  orderType === 'LOCAL' && styles.activeTypeText,
                ]}
              >
                En Local
              </Text>
            </Pressable>

            <Pressable
              onPress={() => handleSelectOrderType('DOMICILIO')}
              style={[
                styles.typeButton,
                orderType === 'DOMICILIO' && styles.activeTypeButton,
              ]}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  orderType === 'DOMICILIO' && styles.activeTypeText,
                ]}
              >
                A Domicilio
              </Text>
            </Pressable>
          </View>

          <Text style={styles.label}>ID de Sucursal</Text>
          <TextInput
            style={[
              styles.input,
              focusedInput === 'branchId' && styles.inputFocused,
            ]}
            value={branchId}
            onChangeText={setBranchId}
            onFocus={() => setFocusedInput('branchId')}
            onBlur={() => setFocusedInput(null)}
            keyboardType="numeric"
          />

          {/* Campos condicionales según el tipo de orden */}
          {orderType === 'DOMICILIO' ? (
            <>
              <Text style={styles.label}>Nombre del Cliente *</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedInput === 'customerName' && styles.inputFocused,
                ]}
                placeholder="Ej. Juan Pérez"
                placeholderTextColor={colors.muted}
                value={customerName}
                onChangeText={setCustomerName}
                onFocus={() => setFocusedInput('customerName')}
                onBlur={() => setFocusedInput(null)}
              />

              <Text style={styles.label}>Dirección de Entrega *</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.multilineInput,
                  focusedInput === 'address' && styles.inputFocused,
                ]}
                placeholder="Calle, número, colonia y referencias"
                placeholderTextColor={colors.muted}
                value={address}
                onChangeText={setAddress}
                onFocus={() => setFocusedInput('address')}
                onBlur={() => setFocusedInput(null)}
                multiline
              />
            </>
          ) : (
            <>
              <Text style={styles.label}>
                Nombre o Referencia (Opcional en local)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  focusedInput === 'customerName' && styles.inputFocused,
                ]}
                placeholder="Ej. Mesa 4 o Mostrador"
                placeholderTextColor={colors.muted}
                value={customerName}
                onChangeText={setCustomerName}
                onFocus={() => setFocusedInput('customerName')}
                onBlur={() => setFocusedInput(null)}
              />
            </>
          )}

          <Text style={[styles.sectionTitle, { marginTop: 10 }]}>
            Productos Seleccionados
          </Text>

          <View style={styles.orderItemList}>
            {selectedItems.length === 0 ? (
              <Text style={styles.emptyText}>
                No hay productos agregados aún. Selecciona algunos en la pestaña de catálogo.
              </Text>
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
                    <Pressable
                      onPress={() => handleRemoveProduct(item.productId)}
                      style={({ pressed }) => [
                        styles.qtyBtn,
                        pressed && styles.qtyBtnPressed,
                      ]}
                    >
                      <Text style={styles.qtyBtnText}>-</Text>
                    </Pressable>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <Pressable
                      onPress={() => {
                        const productRef = products.find(
                          (p) => p.id === item.productId,
                        );
                        if (productRef) handleAddProduct(productRef);
                      }}
                      style={({ pressed }) => [
                        styles.qtyBtn,
                        pressed && styles.qtyBtnPressed,
                      ]}
                    >
                      <Text style={styles.qtyBtnText}>+</Text>
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </View>

          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total a Pagar:</Text>
            <Text style={styles.totalAmount}>
              ${calculateTotal().toFixed(2)}
            </Text>
          </View>

          <Pressable
            onPress={handleSubmitOrder}
            disabled={submitting}
            style={({ pressed }) => [
              styles.submitButton,
              pressed && styles.submitButtonPressed,
              submitting && { opacity: 0.7 },
            ]}
          >
            {submitting ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={styles.submitButtonText}>
                Confirmar y Crear Orden
              </Text>
            )}
          </Pressable>
        </ScrollView>
      )}
    </View>
  );
}