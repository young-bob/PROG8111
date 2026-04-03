/**
 * Smart AI Tracker — Analytics Screen
 * Displays financial analytics with SVG donut chart and bar chart.
 */
import React, {useCallback, useState} from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Svg, {Circle} from 'react-native-svg';
import {TrendingUp, TrendingDown, Target} from 'lucide-react-native';
import {Transaction} from '../types';
import * as DatabaseService from '../services/DatabaseService';
import * as FirebaseService from '../services/FirebaseService';
import {CATEGORY_COLORS} from '../constants/categories';

const AnalyticsScreen: React.FC = () => {
  const [records, setRecords] = useState<Transaction[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  const currentUser = FirebaseService.getCurrentUser();
  const userId = currentUser?.uid || 'unknown';

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const loadData = async () => {
    try {
      const transactions = await DatabaseService.getTransactions(userId);
      setRecords(transactions);
      const summary = await DatabaseService.getBalanceSummary(userId);
      setTotalIncome(summary.totalIncome);
      setTotalExpense(summary.totalExpense);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  // Calculate category breakdown for expenses
  const expenseRecords = records.filter(r => r.type === 'Expense');
  const categoryTotals: Record<string, number> = {};
  expenseRecords.forEach(r => {
    categoryTotals[r.category] = (categoryTotals[r.category] || 0) + r.amount;
  });
  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const savingsRate =
    totalIncome > 0
      ? (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1)
      : '0.0';
  const burnRate = totalIncome > 0 ? ((totalExpense / totalIncome) * 100).toFixed(1) : '0.0';

  // SVG donut chart calculations
  const circumference = 2 * Math.PI * 40; // r=40
  let offset = 0;
  const donutSegments = sortedCategories.map(([cat, amount]) => {
    const pct = totalExpense > 0 ? amount / totalExpense : 0;
    const dashArray = pct * circumference;
    const segment = {
      category: cat,
      dashArray,
      offset: -offset,
      color: CATEGORY_COLORS[cat] || '#94a3b8',
      pct: (pct * 100).toFixed(0),
    };
    offset += dashArray;
    return segment;
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {new Date().toLocaleString('en-US', {month: 'long', year: 'numeric'}).toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Summary Cards */}
      <View style={styles.cardRow}>
        <View style={[styles.card, {backgroundColor: '#ecfdf5'}]}>
          <View style={styles.cardIconRow}>
            <TrendingUp color="#059669" size={14} />
            <Text style={[styles.cardLabel, {color: '#047857'}]}>SAVINGS RATE</Text>
          </View>
          <Text style={[styles.cardValue, {color: '#065f46'}]}>{savingsRate}%</Text>
        </View>
        <View style={[styles.card, {backgroundColor: '#fff1f2'}]}>
          <View style={styles.cardIconRow}>
            <TrendingDown color="#e11d48" size={14} />
            <Text style={[styles.cardLabel, {color: '#be123c'}]}>BURN RATE</Text>
          </View>
          <Text style={[styles.cardValue, {color: '#9f1239'}]}>{burnRate}%</Text>
        </View>
      </View>

      {/* Donut Chart */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>CATEGORY BREAKDOWN</Text>
        <View style={styles.donutContainer}>
          <Svg width={180} height={180} viewBox="0 0 100 100">
            <Circle
              cx="50" cy="50" r="40" fill="transparent"
              stroke="#f3f4f6" strokeWidth={12}
            />
            {donutSegments.map((seg, i) => (
              <Circle
                key={i} cx="50" cy="50" r="40" fill="transparent"
                stroke={seg.color} strokeWidth={12}
                strokeDasharray={`${seg.dashArray} ${circumference}`}
                strokeDashoffset={seg.offset}
                rotation={-90} origin="50, 50"
              />
            ))}
          </Svg>
          <View style={styles.donutCenter}>
            <Text style={styles.donutLabel}>SPENT</Text>
            <Text style={styles.donutValue}>${totalExpense.toLocaleString()}</Text>
          </View>
        </View>
        <View style={styles.legendGrid}>
          {sortedCategories.map(([cat, amount]) => (
            <View key={cat} style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  {backgroundColor: CATEGORY_COLORS[cat] || '#94a3b8'},
                ]}
              />
              <Text style={styles.legendText}>
                {cat} ({totalExpense > 0 ? ((amount / totalExpense) * 100).toFixed(0) : 0}%)
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Weekly Activity (static placeholder) */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>WEEKLY ACTIVITY</Text>
        <View style={styles.barChart}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
            const heights = [45, 85, 60, 100, 75, 40, 55];
            const h = heights[i];
            return (
              <View key={`${day}-${i}`} style={styles.barCol}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: h,
                      backgroundColor: h === 100 ? '#059669' : '#d1fae5',
                    },
                  ]}
                />
                <Text style={styles.barLabel}>{day}</Text>
              </View>
            );
          })}
        </View>
        <View style={styles.insightRow}>
          <Target color="#10b981" size={16} />
          <Text style={styles.insightText}>
            Track your weekly spending patterns here.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  content: {padding: 20, paddingBottom: 100},
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-end', marginBottom: 20,
  },
  header: {fontSize: 22, fontWeight: '900', color: '#1f2937'},
  badge: {
    backgroundColor: '#f3f4f6', paddingHorizontal: 12,
    paddingVertical: 4, borderRadius: 20,
  },
  badgeText: {fontSize: 8, fontWeight: '900', color: '#6b7280', letterSpacing: 2},
  cardRow: {flexDirection: 'row', gap: 16, marginBottom: 20},
  card: {
    flex: 1, padding: 16, borderRadius: 20,
    alignItems: 'center', gap: 8,
  },
  cardIconRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
  cardLabel: {fontSize: 8, fontWeight: '900', letterSpacing: 2},
  cardValue: {fontSize: 24, fontWeight: '900'},
  chartCard: {
    backgroundColor: '#fff', borderRadius: 24, padding: 24,
    marginBottom: 20, elevation: 1, borderWidth: 1, borderColor: '#f9fafb',
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 10, fontWeight: '900', color: '#d1d5db',
    letterSpacing: 3, marginBottom: 24,
  },
  donutContainer: {position: 'relative', alignItems: 'center', justifyContent: 'center', marginBottom: 24},
  donutCenter: {position: 'absolute', alignItems: 'center'},
  donutLabel: {fontSize: 8, fontWeight: '900', color: '#d1d5db', letterSpacing: 2},
  donutValue: {fontSize: 22, fontWeight: '900', color: '#1f2937'},
  legendGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12,
    justifyContent: 'center',
  },
  legendItem: {flexDirection: 'row', alignItems: 'center', gap: 6},
  legendDot: {width: 10, height: 10, borderRadius: 5},
  legendText: {fontSize: 11, fontWeight: '600', color: '#6b7280'},
  barChart: {
    flexDirection: 'row', alignItems: 'flex-end',
    justifyContent: 'space-between', height: 120,
    width: '100%', paddingHorizontal: 8,
    borderBottomWidth: 1, borderBottomColor: '#f9fafb',
    paddingBottom: 8, marginBottom: 20,
  },
  barCol: {alignItems: 'center', gap: 8},
  bar: {width: 24, borderTopLeftRadius: 6, borderTopRightRadius: 6},
  barLabel: {fontSize: 9, fontWeight: '900', color: '#9ca3af'},
  insightRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#f9fafb', padding: 12, borderRadius: 16,
    width: '100%',
  },
  insightText: {fontSize: 11, fontWeight: '600', color: '#6b7280', flex: 1},
});

export default AnalyticsScreen;
