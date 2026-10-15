import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Tipos basados en Prisma
type CashRegisterStatus = 'OPEN' | 'CLOSED';
type Role = 'GERENTE' | 'CAJERO';

interface CashRegisterModel {
  id: number;
  initialAmount: string;
  generatedAmount: string;
  totalAmount: string;
  status: CashRegisterStatus;
  openedAt: string;
  closedAt: string | null;
  openedById: number;
  branchId: number;
}

interface UserSession {
  id: number;
  name: string;
  role: Role;
  branchId: number;
  branchName: string;
}

export  function CashRegisterView() {
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<UserSession | null>(null);

  // Estado de la caja actual para la sucursal
  const [currentRegister, setCurrentRegister] = useState<CashRegisterModel | null>(null);
  const [initialAmountInput, setInitialAmountInput] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const simulatedUser: UserSession = {
        id: 1,
        name: 'Gerente Israel',
        role: 'GERENTE',
        branchId: 1,
        branchName: 'Sucursal Centro',
      };

      // Simulación: Inicia con una caja abierta del día
      const simulatedRegister: CashRegisterModel = {
        id: 10,
        initialAmount: '500.00',
        generatedAmount: '1250.50',
        totalAmount: '1750.50',
        status: 'OPEN',
        openedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        closedAt: null,
        openedById: simulatedUser.id,
        branchId: simulatedUser.branchId,
      };

      setUser(simulatedUser);
      setCurrentRegister(simulatedRegister);
      setLoading(false);
    };

    loadData();
  }, []);

  // Función para Aperturar Caja
  const handleOpenRegister = () => {
    if (!initialAmountInput.trim() || isNaN(Number(initialAmountInput))) {
      Alert.alert('Error', 'Ingresa una cantidad inicial válida');
      return;
    }

    const initVal = parseFloat(initialAmountInput).toFixed(2);

    const newRegister: CashRegisterModel = {
      id: Date.now(),
      initialAmount: initVal,
      generatedAmount: '0.00',
      totalAmount: initVal,
      status: 'OPEN',
      openedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      closedAt: null,
      openedById: user?.id || 1,
      branchId: user?.branchId || 1,
    };

    setCurrentRegister(newRegister);
    setInitialAmountInput('');
    Alert.alert('Éxito', 'La caja se ha aperturado correctamente.');
  };

  // Función para Cerrar Caja
  const handleCloseRegister = () => {
    if (!currentRegister) return;

    Alert.alert(
      'Confirmar Cierre de Caja',
      `¿Deseas cerrar la caja actual?\n\n• Monto Inicial: $${currentRegister.initialAmount}\n• Recaudado Hoy: $${currentRegister.generatedAmount}\n• Total Final: $${currentRegister.totalAmount}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, Cerrar Caja',
          style: 'destructive',
          onPress: () => {
            const closed = {
              ...currentRegister,
              status: 'CLOSED' as CashRegisterStatus,
              closedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
            };
            setCurrentRegister(closed);
            Alert.alert('Caja Cerrada', 'La caja ha sido cerrada exitosamente.');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#FFE66D" />
        <Text style={{ marginTop: 10 }}>Cargando estado de caja...</Text>
      </View>
    );
  }

  const todayDate = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.title}>Módulo de Caja</Text>
        <Text style={styles.branchText}>📍 {user?.branchName}</Text>
        <Text style={styles.dateText}>📅 {todayDate}</Text>
      </View>

      {/* Botón para ver Historial Semanal */}
      <View style={styles.historyBtnContainer}>
        <Button
          title="📊 Ver Historial de Cajas de la Semana"
          color="#1A535C"
          onPress={() => router.push('cash-register/weeklyCashRegisters' as any)}
        />
      </View>

      {/* PANEL DE CAJA ABIERTA */}
      {currentRegister && currentRegister.status === 'OPEN' ? (
        <View style={styles.activeCard}>
          <View style={styles.statusBadgeOpen}>
            <Text style={styles.statusTextOpen}>🟢 CAJA ABIERTA</Text>
          </View>

          <Text style={styles.infoLabel}>Caja ID: #{currentRegister.id}</Text>
          <Text style={styles.infoSubText}>Aperturada el: {currentRegister.openedAt}</Text>

          <View style={styles.metricsContainer}>
            <View style={styles.metricBox}>
              <Text style={styles.metricTitle}>Fondo Inicial</Text>
              <Text style={styles.metricValue}>${currentRegister.initialAmount}</Text>
            </View>

            <View style={styles.metricBox}>
              <Text style={styles.metricTitle}>Recaudado Hoy</Text>
              <Text style={[styles.metricValue, { color: '#2B6CB0' }]}>
                ${currentRegister.generatedAmount}
              </Text>
            </View>
          </View>

          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total Esperado en Caja:</Text>
            <Text style={styles.totalValue}>${currentRegister.totalAmount}</Text>
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={handleCloseRegister}>
            <Text style={styles.closeBtnText}>🔒 Cerrar Caja del Día</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* PANEL DE APERTURA DE CAJA */
        <View style={styles.inactiveCard}>
          <View style={styles.statusBadgeClosed}>
            <Text style={styles.statusTextClosed}>🔴 CAJA CERRADA / SIN APERTURAR</Text>
          </View>

          <Text style={styles.openFormTitle}>Apertura de Caja para la Sucursal</Text>
          <Text style={styles.label}>Ingresa la Cantidad Inicial (Fondo de caja):</Text>

          <TextInput
            style={styles.input}
            placeholder="Ej. 500.00"
            keyboardType="numeric"
            value={initialAmountInput}
            onChangeText={setInitialAmountInput}
          />

          <Button
            title="🔓 Aperturar Caja Ahora"
            color="#319795"
            onPress={handleOpenRegister}
          />
        </View>
      )}

      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#F8F9FA',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
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
  branchText: {
    fontSize: 14,
    color: '#1A535C',
    fontWeight: '600',
    marginTop: 2,
  },
  dateText: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  historyBtnContainer: {
    marginBottom: 20,
  },
  activeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  inactiveCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  statusBadgeOpen: {
    backgroundColor: '#E6FFFA',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 12,
  },
  statusTextOpen: {
    color: '#234E52',
    fontWeight: 'bold',
    fontSize: 12,
  },
  statusBadgeClosed: {
    backgroundColor: '#FFF5F5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 12,
  },
  statusTextClosed: {
    color: '#9B2C2C',
    fontWeight: 'bold',
    fontSize: 12,
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  infoSubText: {
    fontSize: 12,
    color: '#A0AEC0',
    marginBottom: 16,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#F7FAFC',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricTitle: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  totalBox: {
    backgroundColor: '#EBF8FF',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BEE3F8',
  },
  totalLabel: {
    fontSize: 13,
    color: '#2B6CB0',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2B6CB0',
    marginTop: 2,
  },
  closeBtn: {
    backgroundColor: '#E53E3E',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  openFormTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 12,
    textAlign: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4A5568',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#F7FAFC',
  },
  backButtonContainer: {
    marginTop: 'auto',
    marginBottom: 10,
  },
});