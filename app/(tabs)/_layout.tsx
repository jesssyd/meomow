import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';
import { BookOpen as Home, CirclePlus, CircleUserRound } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

function IconWithCircle({
  Icon,
  size,
  color,
  focused,
  bump = 0,
}: {
  Icon: any;
  size: number;
  color: string;
  focused: boolean;
  bump?: number;
}) {
  return (
    <View
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: focused ? Colors.primary.backgroundGreen : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon size={size + bump} color={color} strokeWidth={2.5} />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: Colors.navigation.background,
          borderTopColor: Colors.navigation.border,
          borderTopWidth: 1,
          paddingTop: 14,
          paddingBottom: Platform.OS === 'ios' ? 28 : 14,
          height: Platform.OS === 'ios' ? 90 : 70,
        },
        tabBarActiveTintColor: Colors.primary.text,
        tabBarInactiveTintColor: Colors.primary.text,
        tabBarIconStyle: {
          marginTop: 0,
        },
        tabBarItemStyle: {
          alignItems: 'center',
          justifyContent: 'center',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          tabBarIcon: ({ size, color, focused }) => (
            <IconWithCircle Icon={Home} size={size} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '',
          tabBarIcon: ({ size, color, focused }) => (
            <IconWithCircle Icon={CirclePlus} size={size} color={color} focused={focused} bump={4} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('add-cat');
          },
        })}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '',
          tabBarIcon: ({ size, color, focused }) => (
            <IconWithCircle Icon={CircleUserRound} size={size} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
