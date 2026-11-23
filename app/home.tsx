import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { useAuth } from '../src/features/auth/presentation/context/AuthContext';
import { styles } from '../src/shared/styles/home.styles';
import { colors } from '../src/shared/theme/colors';

type MenuModule = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  route: string;
  color: string;
};

const menuModules: MenuModule[] = [
  {
    id: 'products',
    title: 'Productos',
    description: 'Menú, precios y disponibilidad',
    icon: 'shopping-bag',
    route: '/products',
    color: colors.accent,
  },
  {
    id: 'orders',
    title: 'Órdenes',
    description: 'Pedidos activos y cocina',
    icon: 'clipboard',
    route: '/orders',
    color: colors.success,
  },
  {
    id: 'cashier',
    title: 'Caja',
    description: 'Cobros, cortes y movimientos',
    icon: 'dollar-sign',
    route: '/cash-register',
    color: colors.warning,
  },
  {
    id: 'branches',
    title: 'Sucursal',
    description: 'Configuración y operación local',
    icon: 'home',
    route: '/branches',
    color: colors.primary,
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [profileVisible, setProfileVisible] = useState(false);
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);

  const displayName = user?.name || 'Usuario';
  const initial = displayName.trim().charAt(0).toUpperCase() || 'U';

  const handleOpenLogoutConfirm = () => {
    setProfileVisible(false);
    setLogoutConfirmVisible(true);
  };

  const handleConfirmLogout = async () => {
    setLogoutConfirmVisible(false);
    await signOut();
    router.replace('/login');
  };

  const handleGoToChangePassword = () => {
    setProfileVisible(false);
    router.push('/changePassword' as any);
  };

  return (
    <View style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Barra superior con marca y botón de perfil */}
        <View style={styles.topBar}>
          <View style={styles.brandBadge}>
            <View style={styles.brandDot} />
            <Text style={styles.brandBadgeText}>SLICE MANAGER</Text>
          </View>

          <Pressable
            onPress={() => setProfileVisible(true)}
            accessibilityLabel="Abrir perfil de usuario"
            style={({ pressed }) => [
              styles.profileTrigger,
              pressed && styles.profileTriggerPressed,
            ]}
          >
            <Text style={styles.profileTriggerLabel} numberOfLines={1}>
              {displayName.split(' ')[0]}
            </Text>

            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>{initial}</Text>
              <View style={styles.onlineIndicator} />
            </View>
          </Pressable>
        </View>

        {/* Tarjeta principal de bienvenida */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <Text style={styles.heroKicker}>Panel de Control</Text>
            {user?.role ? (
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{user.role}</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.greeting}>¡Bienvenido, {displayName}!</Text>
          <Text style={styles.subtitle}>
            Selecciona un módulo para administrar la operación diaria de la pizzería.
          </Text>
        </View>

        {/* Encabezado de sección */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Módulos operativos</Text>
          <Text style={styles.sectionCount}>{menuModules.length} disponibles</Text>
        </View>

        {/* Grid de Tarjetas */}
        <View style={styles.gridContainer}>
          {menuModules.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => router.push(item.route as any)}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
            >
              <View style={styles.cardTop}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: item.color + '18' },
                  ]}
                >
                  <Feather name={item.icon} size={22} color={item.color} />
                </View>

                <View style={styles.arrowCircle}>
                  <Feather
                    name="arrow-up-right"
                    size={14}
                    color={colors.secondary}
                  />
                </View>
              </View>

              <View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDescription}>{item.description}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <Text style={styles.footer}>
          SLICE MANAGER · GESTIÓN INTEGRAL
        </Text>
      </ScrollView>

      {/* Modal de Perfil con información del usuario, Cambiar Contraseña y Cerrar Sesión */}
      <Modal
        visible={profileVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setProfileVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setProfileVisible(false)}
        >
          <Pressable
            style={styles.profileModalCard}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.profileModalBanner} />

            <View style={styles.profileModalBody}>
              <View style={styles.profileModalHeader}>
                <View style={styles.modalAvatar}>
                  <Text style={styles.modalAvatarText}>{initial}</Text>
                </View>

                <View style={styles.modalUserInfo}>
                  <Text style={styles.modalUserName}>{displayName}</Text>
                  <Text style={styles.modalUserEmail}>
                    {user?.email || 'Sesión activa'}
                  </Text>
                </View>

                <Pressable
                  onPress={() => setProfileVisible(false)}
                  accessibilityLabel="Cerrar perfil"
                  style={styles.closeModalButton}
                >
                  <Feather name="x" size={16} color={colors.text} />
                </Pressable>
              </View>

              <View style={styles.infoList}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Rol asignado</Text>
                  <View style={styles.infoRolePill}>
                    <Text style={styles.infoRoleText}>
                      {user?.role || 'Personal'}
                    </Text>
                  </View>
                </View>

                {(user as any)?.branchName || (user as any)?.branch?.name ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Sucursal</Text>
                    <Text style={styles.infoValue}>
                      {(user as any)?.branchName || (user as any)?.branch?.name}
                    </Text>
                  </View>
                ) : null}

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Estado</Text>
                  <Text style={[styles.infoValue, { color: colors.success }]}>
                    Conectado
                  </Text>
                </View>
              </View>

              <View style={styles.modalActions}>
                <Pressable
                  onPress={handleGoToChangePassword}
                  style={({ pressed }) => [
                    styles.changePasswordButton,
                    pressed && styles.changePasswordButtonPressed,
                  ]}
                >
                  <View style={styles.changePasswordLeft}>
                    <Feather name="key" size={16} color={colors.primary} />
                    <Text style={styles.changePasswordText}>
                      Cambiar contraseña
                    </Text>
                  </View>
                  <Feather
                    name="chevron-right"
                    size={17}
                    color={colors.secondary}
                  />
                </Pressable>

                <Pressable
                  onPress={handleOpenLogoutConfirm}
                  style={({ pressed }) => [
                    styles.logoutButton,
                    pressed && styles.logoutButtonPressed,
                  ]}
                >
                  <Feather name="log-out" size={17} color={colors.danger} />
                  <Text style={styles.logoutText}>Cerrar Sesión</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal de Confirmación para Cerrar Sesión */}
      <Modal
        visible={logoutConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutConfirmVisible(false)}
      >
        <Pressable
          style={styles.confirmBackdrop}
          onPress={() => setLogoutConfirmVisible(false)}
        >
          <Pressable
            style={styles.confirmCard}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.confirmIconCircle}>
              <Feather name="log-out" size={24} color={colors.danger} />
            </View>

            <Text style={styles.confirmTitle}>¿Cerrar sesión?</Text>
            <Text style={styles.confirmDescription}>
              Tendrás que volver a ingresar tu correo y contraseña para acceder al sistema.
            </Text>

            <View style={styles.confirmButtonsRow}>
              <Pressable
                onPress={() => setLogoutConfirmVisible(false)}
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.cancelButtonPressed,
                ]}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>

              <Pressable
                onPress={handleConfirmLogout}
                style={({ pressed }) => [
                  styles.confirmLogoutButton,
                  pressed && styles.confirmLogoutButtonPressed,
                ]}
              >
                <Text style={styles.confirmLogoutButtonText}>Sí, salir</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}