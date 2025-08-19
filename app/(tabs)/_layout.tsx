import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Chrome as Home, Plus, User } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
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
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Jua-Regular',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'catalog',
          tabBarIcon: ({ size, color, focused }) => (
            <Home 
              size={size} 
              color={color} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '',
          tabBarIcon: ({ size, color, focused }) => (
            <Plus 
              size={size + 4} 
              color={color} 
              strokeWidth={focused ? 2.5 : 2}
            />
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
          title: 'profile',
          tabBarIcon: ({ size, color, focused }) => (
            <User 
              size={size} 
              color={color} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
    </Tabs>
  );
}