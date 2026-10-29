
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { colors } from '../../../shared/theme/colors';
import { useAuth } from './context/AuthContext';

export function LoginView() {
  const router = useRouter();
  const { signIn } = useAuth(); // <-- Extraemos la función global de login

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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




  return (
    <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.brandRow}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>S</Text>
            </View>

            <View>
              <Text style={styles.brand}>SLICE MANAGER</Text>
              <Text style={styles.subtitle}>
                Administración de pizzería
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.accent} />

            <Text style={styles.title}>¡Bienvenido!</Text>
            <Text style={styles.description}>
              Inicia sesión para continuar.
            </Text>

            <Text style={styles.label}>
              Correo electrónico
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.icon}>@</Text>

              <TextInput
                style={styles.input}
                placeholder="usuario@ejemplo.com"
                placeholderTextColor={colors.muted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            <Text style={styles.label}>Contraseña</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.icon}>●</Text>

              <TextInput
                style={styles.input}
                placeholder="Escribe tu contraseña"
                placeholderTextColor={colors.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                returnKeyType="go"
                onSubmitEditing={handleLogin}
              />

              <Text
                style={styles.showPassword}
                onPress={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </Text>
            </View>

            {error ? (
              <Text style={styles.error}>{error}</Text>
            ) : null}

            <PrimaryButton
              title="INICIAR SESIÓN"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
            />

            <Text style={styles.security}>
              Acceso exclusivo para personal autorizado
            </Text>
          </View>

          <Text style={styles.footer}>
            SLICE MANAGER · CONTROL Y ORGANIZACIÓN
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
    backgroundColor: colors.sand,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 32,
    backgroundColor: colors.sand,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    marginBottom: 25,
  },
  logo: {
    width: 58,
    height: 58,
    borderRadius: 17,
    backgroundColor: colors.burgundyDark,
    borderWidth: 1,
    borderColor: colors.ochre,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: colors.ochre,
    fontSize: 31,
    fontWeight: '900',
  },
  brand: {
    color: colors.burgundyDark,
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: 1,
  },
  subtitle: {
    color: colors.wine,
    fontSize: 13,
    marginTop: 3,
  },
  card: {
    backgroundColor: colors.cream,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.white,
    padding: 24,
    elevation: 4,
  },
  accent: {
    width: 42,
    height: 5,
    borderRadius: 10,
    backgroundColor: colors.brick,
    marginBottom: 17,
  },
  title: {
    color: colors.burgundyDark,
    fontSize: 28,
    fontWeight: '900',
  },
  description: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 7,
    marginBottom: 24,
  },
  label: {
    color: colors.burgundyDark,
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 8,
    marginTop: 4,
  },
  inputContainer: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: 12,
    marginBottom: 17,
  },
  icon: {
    width: 27,
    color: colors.wine,
    fontSize: 18,
    fontWeight: '800',
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    paddingVertical: 14,
  },
  showPassword: {
    color: colors.wine,
    fontSize: 11,
    fontWeight: '700',
    paddingLeft: 5,
  },
  error: {
    color: colors.error,
    fontSize: 13,
    marginBottom: 14,
    lineHeight: 18,
  },
  security: {
    color: colors.muted,
    textAlign: 'center',
    fontSize: 11,
    marginTop: 17,
    lineHeight: 16,
  },
  footer: {
    textAlign: 'center',
    color: colors.wine,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 22,
  },
});