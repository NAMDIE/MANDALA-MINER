import { View, Text, StyleSheet } from 'react-native';

export default function DecksScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Decks / Review</Text>
            <Text>Coming soon...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
});
