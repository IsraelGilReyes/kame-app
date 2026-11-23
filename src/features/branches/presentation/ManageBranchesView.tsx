import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors } from '../../../shared/theme/colors';
import { useAuth } from '../../auth/presentation/context/AuthContext';
import { Branch } from '../domain/entities';
import {
  createBranch,
  deleteBranch,
  getBranches,
  updateBranch,
} from '../infrastructure/datasources/branches-api.datasource';
import { styles } from './manageBranchesView.styles';

type FocusedInput = 'name' | 'address' | null;

export function ManageBranchesView() {
  const { user } = useAuth();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Banners de UI
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Estado del Modal (Crear / Editar)
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [nameInput, setNameInput] = useState<string>('');
  const [addressInput, setAddressInput] = useState<string>('');
  const [focusedInput, setFocusedInput] = useState<FocusedInput>(null);

  // Estado del Modal de Confirmación de Eliminación
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);

  const canManageBranches = ['ADMIN_GENERAL', 'GERENTE'].includes(user?.role || '');

  const loadBranches = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const data = await getBranches();
      setBranches(data);
    } catch (error: any) {
      setErrorMsg(error.message || 'Error al cargar las sucursales.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!canManageBranches) {
        setErrorMsg('Acceso restringido a gerentes y administradores.');
        setLoading(false);
        return;
      }
      loadBranches();
    }, [canManageBranches, loadBranches]),
  );

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setSelectedBranchId(null);
    setNameInput('');
    setAddressInput('');
    setErrorMsg('');
    setSuccessMsg('');
    setModalVisible(true);
  };

  const handleOpenEditModal = (branch: Branch) => {
    setIsEditing(true);
    setSelectedBranchId(branch.id);
    setNameInput(branch.name);
    setAddressInput(branch.address);
    setErrorMsg('');
    setSuccessMsg('');
    setModalVisible(true);
  };

  const handleSaveBranch = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!nameInput.trim() || !addressInput.trim()) {
      setErrorMsg('Por favor completa todos los campos.');
      return;
    }

    try {
      setActionLoading(true);

      if (isEditing && selectedBranchId) {
        await updateBranch(selectedBranchId, {
          name: nameInput.trim(),
          address: addressInput.trim(),
        });
        setSuccessMsg('¡Sucursal actualizada correctamente!');
      } else {
        await createBranch({
          name: nameInput.trim(),
          address: addressInput.trim(),
        });
        setSuccessMsg('¡Sucursal creada exitosamente!');
      }

      setModalVisible(false);
      await loadBranches();
    } catch (error: any) {
      setErrorMsg(error.message || 'Error al guardar la sucursal.');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDeleteBranch = (branch: Branch) => {
    setBranchToDelete(branch);
    setDeleteModalVisible(true);
  };

  const handleDeleteBranch = async () => {
    if (!branchToDelete) return;

    try {
      setActionLoading(true);
      await deleteBranch(branchToDelete.id);

      setDeleteModalVisible(false);
      setBranchToDelete(null);
      setSuccessMsg('¡Sucursal eliminada correctamente!');
      await loadBranches();
    } catch (error: any) {
      setDeleteModalVisible(false);
      setErrorMsg(error.message || 'No se pudo eliminar la sucursal.');
    } finally {
      setActionLoading(false);
    }
  };

  if (!canManageBranches) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>
            Acceso denegado. Solo gerentes y administradores pueden administrar sucursales.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Barra superior */}
      <View style={[styles.topBar, { justifyContent: 'flex-end' }]}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>SUCURSALES</Text>
        </View>
      </View>

      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Sucursales</Text>
        <Text style={styles.subtitle}>Crear, modificar y eliminar ubicaciones</Text>
      </View>

      {/* Banners de Notificación */}
      {errorMsg ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{errorMsg}</Text>
        </View>
      ) : null}

      {successMsg ? (
        <View style={styles.successBanner}>
          <Text style={styles.successBannerText}>{successMsg}</Text>
        </View>
      ) : null}

      {/* Botón para Nueva Sucursal */}
      <Pressable
        onPress={handleOpenCreateModal}
        style={({ pressed }) => [
          styles.createButton,
          pressed && styles.createButtonPressed,
        ]}
      >
        <View style={styles.createIconBox}>
          <Text style={styles.createIconText}>+</Text>
        </View>
        <Text style={styles.createButtonText}>Registrar Nueva Sucursal</Text>
      </Pressable>

      {loading ? (
        <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={branches}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTopBar} />

              <View style={styles.cardBody}>
                <View style={styles.cardHeader}>
                  <Text style={styles.branchName}>{item.name}</Text>
                  <View style={styles.idBadge}>
                    <Text style={styles.idBadgeText}>ID #{item.id}</Text>
                  </View>
                </View>

                <Text style={styles.branchAddress}>{item.address}</Text>

                <View style={styles.cardActions}>
                  <Pressable
                    onPress={() => handleOpenEditModal(item)}
                    style={({ pressed }) => [
                      styles.editBtn,
                      pressed && styles.editBtnPressed,
                    ]}
                  >
                    <Text style={styles.editBtnText}>Modificar</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => confirmDeleteBranch(item)}
                    style={({ pressed }) => [
                      styles.deleteBtn,
                      pressed && styles.deleteBtnPressed,
                    ]}
                  >
                    {({ pressed }) => (
                      <Text
                        style={[
                          styles.deleteBtnText,
                          pressed && styles.deleteBtnTextPressed,
                        ]}
                      >
                        Eliminar
                      </Text>
                    )}
                  </Pressable>
                </View>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No hay sucursales registradas.</Text>
            </View>
          }
        />
      )}

      {/* MODAL DE CREAR / EDITAR */}
      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalTopBar} />

            <View style={styles.modalBody}>
              <Text style={styles.modalTitle}>
                {isEditing ? 'Modificar Sucursal' : 'Nueva Sucursal'}
              </Text>
              <Text style={styles.modalSubtitle}>
                {isEditing
                  ? 'Actualiza los datos de la sucursal'
                  : 'Ingresa los datos para registrar la sucursal'}
              </Text>

              <Text style={styles.label}>Nombre de la Sucursal</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedInput === 'name' && styles.inputFocused,
                ]}
                placeholder="Ej. Sucursal Centro"
                placeholderTextColor={colors.muted}
                value={nameInput}
                onChangeText={setNameInput}
                onFocus={() => setFocusedInput('name')}
                onBlur={() => setFocusedInput(null)}
              />

              <Text style={styles.label}>Dirección</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedInput === 'address' && styles.inputFocused,
                ]}
                placeholder="Ej. Av. Principal #123"
                placeholderTextColor={colors.muted}
                value={addressInput}
                onChangeText={setAddressInput}
                onFocus={() => setFocusedInput('address')}
                onBlur={() => setFocusedInput(null)}
              />

              <View style={styles.modalActions}>
                <Pressable
                  onPress={() => setModalVisible(false)}
                  disabled={actionLoading}
                  style={({ pressed }) => [
                    styles.modalCancelBtn,
                    pressed && styles.modalCancelBtnPressed,
                  ]}
                >
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </Pressable>

                <Pressable
                  onPress={handleSaveBranch}
                  disabled={actionLoading}
                  style={[
                    styles.modalConfirmBtn,
                    actionLoading && { opacity: 0.7 },
                  ]}
                >
                  {actionLoading ? (
                    <ActivityIndicator color={colors.surface} size="small" />
                  ) : (
                    <Text style={styles.modalConfirmText}>Guardar</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      <Modal visible={deleteModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.modalTopBar, { backgroundColor: colors.danger }]} />

            <View style={styles.modalBody}>
              <Text style={styles.modalTitle}>Eliminar Sucursal</Text>
              <Text style={styles.modalSubtitle}>
                ¿Estás seguro de que deseas eliminar la sucursal &quot;{branchToDelete?.name}&quot;? Esta acción no se puede deshacer.
              </Text>

              <View style={styles.modalActions}>
                <Pressable
                  onPress={() => setDeleteModalVisible(false)}
                  disabled={actionLoading}
                  style={({ pressed }) => [
                    styles.modalCancelBtn,
                    pressed && styles.modalCancelBtnPressed,
                  ]}
                >
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </Pressable>

                <Pressable
                  onPress={handleDeleteBranch}
                  disabled={actionLoading}
                  style={[
                    styles.modalDeleteBtn,
                    actionLoading && { opacity: 0.7 },
                  ]}
                >
                  {actionLoading ? (
                    <ActivityIndicator color={colors.surface} size="small" />
                  ) : (
                    <Text style={styles.modalDeleteText}>Sí, Eliminar</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}