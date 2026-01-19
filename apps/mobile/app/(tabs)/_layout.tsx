import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';

// Simple icon components (replace with actual icons later)
const HomeIcon = ({ focused }: { focused: boolean }) => (
  <View className={`w-6 h-6 rounded items-center justify-center ${focused ? 'bg-primary-500' : 'bg-gray-300'}`}>
    <Text className="text-white text-xs">H</Text>
  </View>
);

const TasksIcon = ({ focused }: { focused: boolean }) => (
  <View className={`w-6 h-6 rounded items-center justify-center ${focused ? 'bg-primary-500' : 'bg-gray-300'}`}>
    <Text className="text-white text-xs">T</Text>
  </View>
);

const MessagesIcon = ({ focused }: { focused: boolean }) => (
  <View className={`w-6 h-6 rounded items-center justify-center ${focused ? 'bg-primary-500' : 'bg-gray-300'}`}>
    <Text className="text-white text-xs">M</Text>
  </View>
);

const ProfileIcon = ({ focused }: { focused: boolean }) => (
  <View className={`w-6 h-6 rounded items-center justify-center ${focused ? 'bg-primary-500' : 'bg-gray-300'}`}>
    <Text className="text-white text-xs">P</Text>
  </View>
);

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0ea5e9',
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f3f4f6',
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <HomeIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ focused }) => <TasksIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ focused }) => <MessagesIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <ProfileIcon focused={focused} />,
        }}
      />
    </Tabs>
  );
}
