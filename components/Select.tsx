// components/Select.tsx
import { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  LayoutRectangle,
} from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { Colors, FontSizes } from '@/constants';

type Props = {
  value: string;
  options: string[];
  placeholder?: string;
  onChange: (value: string) => void;
};

export default function Select({ value, options, placeholder = 'choose', onChange }: Props) {
  const triggerRef = useRef<View>(null);
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<LayoutRectangle | null>(null);

  const openMenu = () => {
    // Position the dropdown under the trigger
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setOpen(true);
    });
  };

  return (
    <>
      <TouchableOpacity ref={triggerRef as any} style={styles.select} onPress={openMenu} activeOpacity={0.8}>
        <Text style={[styles.selectText, !value && styles.placeholder]}>
          {value || placeholder}
        </Text>
        <ChevronDown size={16} color={Colors.primary.text} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />
        <View
          style={[
            styles.dropdown,
            {
              top: (anchor?.y ?? 120) + (anchor?.height ?? 40) + 6,
              left: 20,
              right: 20,
            },
          ]}
        >
          <ScrollView style={{ maxHeight: 280 }} showsVerticalScrollIndicator={false}>
            {options.map((opt) => {
              const selected = value === opt;
              return (
                <TouchableOpacity
                  key={opt}
                  style={[styles.option, selected && styles.optionSelected]}
                  onPress={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  select: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(56, 48, 41, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    fontFamily: 'Jua-Regular',
    fontSize: FontSizes.body,
    color: Colors.primary.text,
  },
  placeholder: {
    opacity: 0.6,
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 6,
    // soft shadow
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 6,
    marginVertical: 2,
  },
  optionSelected: {
    backgroundColor: 'rgba(66, 133, 244, 0.12)',
  },
  optionText: {
    fontFamily: 'Jua-Regular',
    fontSize: FontSizes.body,
    color: Colors.primary.text,
  },
  optionTextSelected: {
    color: Colors.primary.text,
  },
});
