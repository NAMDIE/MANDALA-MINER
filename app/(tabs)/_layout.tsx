import { Tabs } from "expo-router";
import { Home, PenTool, Layers, Settings } from "lucide-react-native";

export default function TabLayout() {
    return (
        <Tabs screenOptions={{ tabBarActiveTintColor: "#4F46E5" }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color }) => <Home size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="mine"
                options={{
                    title: "Mine",
                    tabBarIcon: ({ color }) => <PenTool size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="decks"
                options={{
                    title: "Decks",
                    tabBarIcon: ({ color }) => <Layers size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: "Settings",
                    tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
