import { Stack } from "expo-router";
import { ConvexClientProvider } from "../lib/convex";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ErrorBoundary } from "../components/ErrorBoundary";

export default function RootLayout() {
    return (
        <ErrorBoundary>
            <SafeAreaProvider>
                <ConvexClientProvider>
                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen name="(auth)" options={{ presentation: 'modal', headerShown: false }} />
                    </Stack>
                    <StatusBar style="auto" />
                </ConvexClientProvider>
            </SafeAreaProvider>
        </ErrorBoundary>
    );
}
