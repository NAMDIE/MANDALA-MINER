import { View, Text, StyleSheet } from 'react-native';

export default function MineScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Mine / Journal</Text>
            <Text>Coming soon...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
});
