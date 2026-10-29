
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
} from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text style={styles.label}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: colors.burgundyDark,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  label: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  pressed: {
    backgroundColor: colors.wine,
  },
  disabled: {
    opacity: 0.65,
  },
});
