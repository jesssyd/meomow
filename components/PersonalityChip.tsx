import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface PersonalityChipProps {
  label: string;
  selected: boolean;
  onPress: (label: string) => void;
}

export function PersonalityChip({ label, selected, onPress }: PersonalityChipProps) {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        selected ? styles.selectedChip : styles.unselectedChip
      ]}
      onPress={() => onPress(label)}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.chipText,
          selected ? styles.selectedText : styles.unselectedText
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  unselectedChip: {
    backgroundColor: Colors.personality.unselected.background,
    borderColor: Colors.personality.unselected.border,
  },
  selectedChip: {
    backgroundColor: Colors.personality.selected.background,
    borderColor: Colors.personality.selected.border,
  },
  chipText: {
    fontFamily: 'Jua-Regular',
    fontSize: 16,
    textAlign: 'center',
  },
  unselectedText: {
    color: Colors.personality.unselected.text,
  },
  selectedText: {
    color: Colors.personality.selected.text,
  },
});