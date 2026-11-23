import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors } from '../../../shared/theme/colors';
import { styles } from './changePasswordView.styles';
import { useAuth } from './context/AuthContext';

type FocusedInput = 'current' | 'next' | 'confirm' | null;

export function ChangePasswordView() {
  const router = useRouter();
  const { user, changePassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [focused, setFocused] = useState<FocusedInput>(null);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  function handleRequestConfirm() {
    setError('');
    setSuccessMessage('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Completa todos los campos.');
      return;
    }

    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('La nueva contraseña y su confirmación no coinciden.');
      return;
    }

    if (currentPassword === newPassword) {
      setError('La nueva contraseña debe ser distinta a la actual.');
      return;
    }

    setConfirmVisible(true);
  }

  async function handleConfirmChangePassword() {
    setConfirmVisible(false);
    setError('');
    setSuccessMessage('');

    try {
      setLoading(true);
      const msg = await changePassword(currentPassword, newPassword);
      setSuccessMessage(msg);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo actualizar la contraseña.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backButtonPressed,
            ]}
          >
            <Text style={styles.backButtonText}>← Volver</Text>
          </Pressable>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>SEGURIDAD DE CUENTA</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTopBar} />

          <View style={styles.cardBody}>
            <Text style={styles.kicker}>Perfil y acceso</Text>
            <Text style={styles.title}>Cambiar contraseña</Text>
            <Text style={styles.description}>
              Actualiza tu contraseña para mantener protegida tu sesión en Slice Manager.
            </Text>

            {user?.email ? (
              <View style={styles.userSummaryBox}>
                <Text style={styles.userSummaryText}>
                  Cuenta activa: {user.email}
                </Text>
              </View>
            ) : null}

            {/* Contraseña actual */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Contraseña actual</Text>
              <View
                style={[
                  styles.inputContainer,
                  focused === 'current' && styles.inputContainerFocused,
                ]}
              >
                <TextInput
                  style={styles.input}
                  placeholder="Ingresa tu contraseña actual"
                  placeholderTextColor={colors.muted}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  onFocus={() => setFocused('current')}
                  onBlur={() => setFocused(null)}
                  secureTextEntry={!showCurrent}
                  autoCapitalize="none"
                  returnKeyType="next"
                />
                <Pressable
                  onPress={() => setShowCurrent((prev) => !prev)}
                  style={({ pressed }) => [
                    styles.togglePill,
                    pressed && styles.togglePillPressed,
                  ]}
                >
                  <Text style={styles.toggleText}>
                    {showCurrent ? 'OCULTAR' : 'MOSTRAR'}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Nueva contraseña */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nueva contraseña</Text>
              <View
                style={[
                  styles.inputContainer,
                  focused === 'next' && styles.inputContainerFocused,
                ]}
              >
                <TextInput
                  style={styles.input}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={colors.muted}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  onFocus={() => setFocused('next')}
                  onBlur={() => setFocused(null)}
                  secureTextEntry={!showNext}
                  autoCapitalize="none"
                  returnKeyType="next"
                />
                <Pressable
                  onPress={() => setShowNext((prev) => !prev)}
                  style={({ pressed }) => [
                    styles.togglePill,
                    pressed && styles.togglePillPressed,
                  ]}
                >
                  <Text style={styles.toggleText}>
                    {showNext ? 'OCULTAR' : 'MOSTRAR'}
                  </Text>
                </Pressable>
              </View>
              <Text style={styles.hintText}>
                Usa al menos 6 caracteres y evita repetir tu clave anterior.
              </Text>
            </View>

            {/* Confirmar nueva contraseña */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirmar nueva contraseña</Text>
              <View
                style={[
                  styles.inputContainer,
                  focused === 'confirm' && styles.inputContainerFocused,
                ]}
              >
                <TextInput
                  style={styles.input}
                  placeholder="Repite la nueva contraseña"
                  placeholderTextColor={colors.muted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onFocus={() => setFocused('confirm')}
                  onBlur={() => setFocused(null)}
                  secureTextEntry={!showNext}
                  autoCapitalize="none"
                  returnKeyType="go"
                  onSubmitEditing={handleRequestConfirm}
                />
              </View>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {successMessage ? (
              <View style={styles.successBox}>
                <Text style={styles.successText}>{successMessage}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={handleRequestConfirm}
              disabled={loading}
              style={[
                styles.submitButton,
                loading && styles.submitButtonDisabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text style={styles.submitButtonText}>GUARDAR CONTRASEÑA</Text>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Modal de confirmación para cambiar contraseña */}
      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setConfirmVisible(false)}
        >
          <Pressable
            style={styles.modalCard}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalTopBar} />

            <View style={styles.modalBody}>
              <View style={styles.modalBadge}>
                <Text style={styles.modalBadgeText}>CONFIRMAR CAMBIO</Text>
              </View>

              <Text style={styles.modalTitle}>¿Actualizar contraseña?</Text>
              <Text style={styles.modalDescription}>
                Se reemplazará la contraseña actual de tu cuenta
                {user?.email ? ` (${user.email})` : ''}.
              </Text>

              <View style={styles.modalButtonsRow}>
                <Pressable
                  onPress={() => setConfirmVisible(false)}
                  style={({ pressed }) => [
                    styles.cancelButton,
                    pressed && styles.cancelButtonPressed,
                  ]}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </Pressable>

                <Pressable
                  onPress={handleConfirmChangePassword}
                  style={({ pressed }) => [
                    styles.confirmButton,
                    pressed && styles.confirmButtonPressed,
                  ]}
                >
                  <Text style={styles.confirmButtonText}>Sí, cambiar</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}