import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
    const router = useRouter();

    const handleLogin = () => {
        // Mock login for now
        router.replace("/(tabs)");
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome to Mandarin Miner</Text>
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login / Start</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 32 },
    button: { backgroundColor: '#4F46E5', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
