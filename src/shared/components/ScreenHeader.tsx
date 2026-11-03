
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  title: string;
  subtitle: string;
  onBack: () => void;
};

export function ScreenHeader({
  title,
  subtitle,
  onBack,
}: Props) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        onPress={onBack}
        style={styles.back}
      >
        <Text style={styles.backText}>‹</Text>
      </Pressable>

      <View style={styles.copy}>
        <Text style={styles.brand}>SLICE MANAGER</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.primary,
    padding: 18,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  back: {
    width: 34,
    height: 42,
    justifyContent: 'center',
  },
  backText: {
    fontSize: 36,
    color: colors.surface,
    lineHeight: 40,
  },
  copy: {
    flex: 1,
  },
  brand: {
    fontSize: 10,
    color: colors.beige,
    fontWeight: '900',
    letterSpacing: 2,
  },
  title: {
    fontSize: 24,
    color: colors.surface,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 11,
    color: colors.beige,
    marginTop: 2,
  },
});
