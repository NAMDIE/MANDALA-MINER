import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useQuery } from "convex/react";
import { api } from "../../convex/backend/_generated/api";
import { BookOpen, Layers, Plus, TrendingUp, Zap } from 'lucide-react-native';
import { Link, useRouter } from 'expo-router';

export default function HomeScreen() {
    const router = useRouter();
    const USER_ID = "users:123" as any;
    const USER_NAME = "Alex";
    const DAILY_GOAL = 5;

    const sentences = useQuery(api.fetchSentences.get, {
        userId: USER_ID,
        limit: 100
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sentencesToday = sentences
        ? sentences.filter((s: any) => s.createdAt >= today.getTime()).length
        : 0;

    const progressPercentage = Math.min((sentencesToday / DAILY_GOAL) * 100, 100);
    const reviewsDue = 12;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Good Morning, {USER_NAME}</Text>
                    <Text style={styles.subGreeting}>Ready to expand your vocabulary?</Text>
                </View>
                <View style={styles.streakBadge}>
                    <Zap size={20} color="#F97316" fill="#F97316" />
                    <Text style={styles.streakText}>12 Days</Text>
                </View>
            </View>

            {/* Daily Goal Card */}
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View>
                        <View style={styles.cardTitleRow}>
                            <TrendingUp size={18} color="#6366F1" />
                            <Text style={styles.cardTitle}>Daily Mining Goal</Text>
                        </View>
                        <Text style={styles.cardSubtitle}>
                            You've mined <Text style={styles.bold}>{sentencesToday}</Text> out of <Text style={styles.bold}>{DAILY_GOAL}</Text> sentences today.
                        </Text>
                    </View>
                    <Text style={styles.percentage}>{Math.round(progressPercentage)}%</Text>
                </View>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
                </View>
            </View>

            {/* Actions */}
            <View style={styles.actionsGrid}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.reviewButton]}
                    onPress={() => router.push("/(tabs)/decks")}
                >
                    <View style={styles.iconBox}>
                        <Layers size={24} color="white" />
                    </View>
                    <Text style={styles.actionTitle}>Review Deck</Text>
                    <Text style={styles.actionSubtitle}>{reviewsDue} cards waiting</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.journalButton]}
                    onPress={() => router.push("/(tabs)/mine")}
                >
                    <View style={[styles.iconBox, styles.journalIconBox]}>
                        <Plus size={24} color="#4F46E5" />
                    </View>
                    <Text style={[styles.actionTitle, styles.textDark]}>New Entry</Text>
                    <Text style={[styles.actionSubtitle, styles.textGray]}>Write to mine</Text>
                </TouchableOpacity>
            </View>

            {/* Recent Sentences */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Mined Sentences</Text>
                {!sentences ? (
                    <Text>Loading...</Text>
                ) : sentences.length === 0 ? (
                    <Text style={styles.emptyText}>No sentences yet. Start journaling!</Text>
                ) : (
                    sentences.slice(0, 3).map((s: any) => (
                        <View key={s._id} style={styles.sentenceCard}>
                            <View>
                                <Text style={styles.chineseText}>{s.original}</Text>
                                <Text style={styles.translationText}>{s.translation}</Text>
                            </View>
                            <View style={[styles.badge, s.difficulty === 'Easy' ? styles.badgeEasy : null]}>
                                <Text style={styles.badgeText}>{s.difficulty || 'Easy'}</Text>
                            </View>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    content: { padding: 20, paddingBottom: 40 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    greeting: { fontSize: 24, fontWeight: 'bold', color: '#1E293B' },
    subGreeting: { color: '#64748B', marginTop: 4 },
    streakBadge: { alignItems: 'center', backgroundColor: '#FFF7ED', padding: 8, borderRadius: 12, borderWidth: 1, borderColor: '#FFEDD5' },
    streakText: { fontSize: 12, fontWeight: 'bold', color: '#C2410C', marginTop: 4 },
    card: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 },
    cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    cardTitle: { fontSize: 16, fontWeight: '600', color: '#334155' },
    cardSubtitle: { color: '#64748B', fontSize: 14, marginTop: 4 },
    bold: { fontWeight: 'bold', color: '#1E293B' },
    percentage: { fontSize: 24, fontWeight: 'bold', color: '#4F46E5' },
    progressBarBg: { height: 12, backgroundColor: '#F1F5F9', borderRadius: 6, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: '#6366F1', borderRadius: 6 },
    actionsGrid: { flexDirection: 'row', gap: 16, marginBottom: 24 },
    actionButton: { flex: 1, padding: 20, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    reviewButton: { backgroundColor: '#10B981' },
    journalButton: { backgroundColor: 'white', borderWidth: 1, borderColor: '#E2E8F0' },
    iconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    journalIconBox: { backgroundColor: '#EEF2FF' },
    actionTitle: { fontSize: 16, fontWeight: 'bold', color: 'white' },
    actionSubtitle: { fontSize: 12, color: '#D1FAE5', marginTop: 4 },
    textDark: { color: '#1E293B' },
    textGray: { color: '#64748B' },
    section: { marginTop: 8 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#334155', marginBottom: 12 },
    emptyText: { textAlign: 'center', color: '#94A3B8', padding: 20, backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed' },
    sentenceCard: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 5, elevation: 1 },
    chineseText: { fontSize: 18, fontWeight: '500', color: '#1E293B' },
    translationText: { color: '#64748B', fontSize: 14 },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
    badgeEasy: { backgroundColor: '#F0FDF4', borderColor: '#DCFCE7' },
    badgeText: { fontSize: 12, color: '#64748B' },
});
