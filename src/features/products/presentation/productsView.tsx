import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from 'react-native';
import { colors } from '../../../shared/theme/colors';
import { useAuth } from '../../auth/presentation/context/AuthContext';
import { Product } from '../domain/entities';
import { getProducts } from '../infrastructure/datasources/products-api.datasource';
import { styles } from './productsView.styles';

export function ProductsView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const { user } = useAuth();

  const canManageProducts = ['ADMIN_GENERAL', 'GERENTE'].includes(user?.role || '');

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

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, []),
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>MENÚ</Text>
        </View>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>Catálogo de Productos</Text>
        <Text style={styles.subtitle}>
          Consulta los productos y precios disponibles
        </Text>
      </View>

      {canManageProducts && (
        <Pressable
          onPress={() => router.push('/products/manageProducts' as any)}
          style={({ pressed }) => [
            styles.manageButton,
            pressed && styles.manageButtonPressed,
          ]}
        >
          <Text style={styles.manageButtonText}>Administrar Productos</Text>
          <Text style={styles.manageArrow}>→</Text>
        </Pressable>
      )}

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
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No hay productos en el catálogo.</Text>
            </View>
          }
          renderItem={({ item }) => (
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
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}