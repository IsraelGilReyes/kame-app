import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ComponentRef, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { colors } from '../../../shared/theme/colors';
import { useAuth } from './context/AuthContext';
import { styles } from './loginView.styles';

type FocusedField = 'email' | 'password' | null;

export function LoginView() {
  const router = useRouter();
  const { signIn } = useAuth();
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<FocusedField>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    setError('');

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError('Escribe tu correo y contraseña.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }

    try {
      setLoading(true);

      // Ejecuta el inicio de sesión y guarda el token/usuario globalmente
      await signIn(cleanEmail, password);

      // Redirige a la pantalla principal
      router.replace('/home');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al iniciar sesión.',
      );
    } finally {
      setLoading(false);
    }
  }

  const isEmailFocused = focusedField === 'email';
  const isPasswordFocused = focusedField === 'password';

  return (
    <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.scroll, { flexGrow: 1, paddingBottom: 32 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.topBadgeRow}>
            <View style={styles.badge}>
              <Feather name="shield" size={12} color={colors.secondary} />
              <Text style={styles.badgeText}>PORTAL OPERATIVO</Text>
            </View>
          </View>

          <View style={styles.brandRow}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>S</Text>
            </View>

            <View style={styles.brandTextGroup}>
              <Text style={styles.brand}>SLICE MANAGER</Text>
              <Text style={styles.subtitle}>
                Administración de pizzería y sucursales
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardTopBar} />

            <View style={styles.cardBody}>
              <Text style={styles.kicker}>Acceso al sistema</Text>
              <Text style={styles.title}>¡Bienvenido!</Text>
              <Text style={styles.description}>
                Inicia sesión con tu cuenta para gestionar pedidos, caja y entregas.
              </Text>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Correo electrónico</Text>

                <View
                  style={[
                    styles.inputContainer,
                    isEmailFocused && styles.inputContainerFocused,
                    error ? styles.inputContainerError : null,
                  ]}
                >
                  <View
                    style={[
                      styles.iconBox,
                      isEmailFocused && styles.iconBoxFocused,
                    ]}
                  >
                    <Feather
                      name="mail"
                      size={15}
                      color={isEmailFocused ? colors.primary : colors.muted}
                    />
                  </View>

                  <TextInput
                    style={styles.input}
                    placeholder="usuario@ejemplo.com"
                    placeholderTextColor={colors.muted}
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Contraseña</Text>

                <View
                  style={[
                    styles.inputContainer,
                    isPasswordFocused && styles.inputContainerFocused,
                    error ? styles.inputContainerError : null,
                  ]}
                >
                  <View
                    style={[
                      styles.iconBox,
                      isPasswordFocused && styles.iconBoxFocused,
                    ]}
                  >
                    <Feather
                      name="lock"
                      size={15}
                      color={isPasswordFocused ? colors.primary : colors.muted}
                    />
                  </View>

                  <TextInput
                    style={styles.input}
                    placeholder="Escribe tu contraseña"
                    placeholderTextColor={colors.muted}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    returnKeyType="go"
                    onSubmitEditing={handleLogin}
                  />

                  <Pressable
                    onPress={() => setShowPassword((prev) => !prev)}
                    accessibilityLabel={
                      showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                    }
                    style={({ pressed }) => [
                      styles.toggleButton,
                      pressed && styles.toggleButtonPressed,
                    ]}
                  >
                    <Feather
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={16}
                      color={colors.secondary}
                    />
                  </Pressable>
                </View>
              </View>

              {error ? (
                <View style={styles.errorBox}>
                  <Feather
                    name="alert-circle"
                    size={16}
                    color={colors.danger}
                  />
                  <Text style={styles.error}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.buttonWrapper}>
                <PrimaryButton
                  title="INICIAR SESIÓN"
                  onPress={handleLogin}
                  loading={loading}
                  disabled={loading}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.securityRow}>
                <View style={styles.securityDot} />
                <Text style={styles.security}>
                  Acceso exclusivo para personal autorizado
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.footer}>
            SLICE MANAGER · CONTROL Y ORGANIZACIÓN
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}