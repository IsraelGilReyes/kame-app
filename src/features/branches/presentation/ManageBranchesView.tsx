import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { colors } from '../../../shared/theme/colors';
import { useAuth } from '../../auth/presentation/context/AuthContext';

interface BranchModel {
  id: number;
  name: string;
  address: string;
  createdAt?: string;
}

const API_URL = 'http://localhost:3000'; // Ajusta si tu backend usa otra URL

export function ManageBranchesView() {
  const router = useRouter();
  const { user } = useAuth();

  const [branches, setBranches] = useState<BranchModel[]>([]);
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

  // Estado del Modal de Confirmación de Eliminación
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [branchToDelete, setBranchToDelete] = useState<BranchModel | null>(null);

  const isManager = user?.role === 'GERENTE';

  const loadBranches = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const token = await AsyncStorage.getItem('@kame_token');
      const response = await axios.get<BranchModel[]>(`${API_URL}/branches`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBranches(response.data);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Error al cargar las sucursales.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (!isManager) {
        setErrorMsg('Acceso restringido solo a gerentes.');
        setLoading(false);
        return;
      }
      loadBranches();
    }, [user])
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

  const handleOpenEditModal = (branch: BranchModel) => {
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
      const token = await AsyncStorage.getItem('@kame_token');
      const headers = { Authorization: `Bearer ${token}` };

      if (isEditing && selectedBranchId) {
        // Actualizar
        await axios.put(
          `${API_URL}/branches/${selectedBranchId}`,
          { name: nameInput.trim(), address: addressInput.trim() },
          { headers }
        );
        setSuccessMsg('¡Sucursal actualizada correctamente!');
      } else {
        // Crear
        await axios.post(
          `${API_URL}/branches`,
          { name: nameInput.trim(), address: addressInput.trim() },
          { headers }
        );
        setSuccessMsg('¡Sucursal creada exitosamente!');
      }

      setModalVisible(false);
      loadBranches();
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Error al guardar la sucursal.');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDeleteBranch = (branch: BranchModel) => {
    setBranchToDelete(branch);
    setDeleteModalVisible(true);
  };

  const handleDeleteBranch = async () => {
    if (!branchToDelete) return;

    try {
      setActionLoading(true);
      const token = await AsyncStorage.getItem('@kame_token');
      await axios.delete(`${API_URL}/branches/${branchToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setDeleteModalVisible(false);
      setBranchToDelete(null);
      setSuccessMsg('¡Sucursal eliminada correctamente!');
      loadBranches();
    } catch (error: any) {
      setDeleteModalVisible(false);
      setErrorMsg(error.response?.data?.message || 'No se pudo eliminar la sucursal.');
    } finally {
      setActionLoading(false);
    }
  };

  if (!isManager) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorBanner}>Acceso denegado. Solo los gerentes pueden administrar sucursales.</Text>
        <TouchableOpacity style={styles.menuButton} onPress={() => router.back()}>
          <Text style={styles.menuButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtnWrapper}>
          <Text style={styles.backButton}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Gestión de Sucursales</Text>
        <Text style={styles.subtitle}>Crear, modificar y eliminar ubicaciones</Text>
      </View>

      {/* Banners de Notificación */}
      {errorMsg ? <Text style={styles.errorBanner}>{errorMsg}</Text> : null}
      {successMsg ? <Text style={styles.successBanner}>{successMsg}</Text> : null}

      {/* Botón para Nueva Sucursal */}
      <TouchableOpacity style={styles.createButton} onPress={handleOpenCreateModal}>
        <Text style={styles.createButtonText}>+ Registrar Nueva Sucursal</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={branches}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.branchName}>{item.name}</Text>
                <View style={styles.idBadge}>
                  <Text style={styles.idBadgeText}>ID: #{item.id}</Text>
                </View>
              </View>

              <Text style={styles.branchAddress}>📍 {item.address}</Text>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => handleOpenEditModal(item)}
                >
                  <Text style={styles.editBtnText}>✏️ Modificar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => confirmDeleteBranch(item)}
                >
                  <Text style={styles.deleteBtnText}>🗑️ Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay sucursales registradas.</Text>
          }
        />
      )}

      {/* MODAL DE CREAR / EDITAR */}
      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditing ? 'Modificar Sucursal' : 'Nueva Sucursal'}
            </Text>
            <Text style={styles.modalSubtitle}>
              {isEditing ? 'Actualiza los datos de la sucursal' : 'Ingresa los datos para registrar la sucursal'}
            </Text>

            <Text style={styles.label}>Nombre de la Sucursal</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Sucursal Centro"
              placeholderTextColor={colors.muted}
              value={nameInput}
              onChangeText={setNameInput}
            />

            <Text style={styles.label}>Dirección</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Av. Principal #123"
              placeholderTextColor={colors.muted}
              value={addressInput}
              onChangeText={setAddressInput}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setModalVisible(false)}
                disabled={actionLoading}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalConfirmBtn, actionLoading && { opacity: 0.7 }]}
                onPress={handleSaveBranch}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color={colors.surface} size="small" />
                ) : (
                  <Text style={styles.modalConfirmText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      <Modal visible={deleteModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Eliminar Sucursal</Text>
            <Text style={styles.modalSubtitle}>
              ¿Estás seguro de que deseas eliminar la sucursal &quot;{branchToDelete?.name}&quot;? Esta acción no se puede deshacer.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setDeleteModalVisible(false)}
                disabled={actionLoading}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalDeleteBtn, actionLoading && { opacity: 0.7 }]}
                onPress={handleDeleteBranch}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color={colors.surface} size="small" />
                ) : (
                  <Text style={styles.modalDeleteText}>Sí, Eliminar</Text>
                )}
              </TouchableOpacity>
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
    paddingTop: 45,
    backgroundColor: colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
    position: 'relative',
  },
  backBtnWrapper: {
    position: 'absolute',
    left: 0,
    top: 2,
  },
  backButton: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    color: colors.danger,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 13,
  },
  successBanner: {
    backgroundColor: '#D1FAE5',
    color: colors.success,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 13,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  createButtonText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  branchName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  idBadge: {
    backgroundColor: colors.beige,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  idBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.primary,
  },
  branchAddress: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: 12,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  editBtn: {
    flex: 1,
    backgroundColor: colors.background,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  editBtnText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: '#FEE2E2',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: colors.danger,
    fontWeight: '600',
    fontSize: 13,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.muted,
    marginTop: 40,
    fontSize: 14,
  },
  menuButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
  },
  menuButtonText: {
    color: colors.surface,
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(43, 33, 30, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.muted,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    marginBottom: 14,
    backgroundColor: colors.background,
    color: colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: colors.border,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCancelText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: colors.success,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: colors.surface,
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalDeleteBtn: {
    flex: 1,
    backgroundColor: colors.danger,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalDeleteText: {
    color: colors.surface,
    fontWeight: 'bold',
    fontSize: 14,
  },
});