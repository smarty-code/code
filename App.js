import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-slate-950 px-6">
      <Text className="text-3xl font-bold text-white">Hello, World 👋</Text>
      <Text className="mt-3 text-center text-base text-slate-300">
        Expo + React Native + NativeWind setup is ready.
      </Text>
      <StatusBar style="light" />
    </View>
  );
}
