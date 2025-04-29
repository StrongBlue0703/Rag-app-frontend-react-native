import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

import Header from '@/components/ui/Header';
import ChatComponent from '@/components/chat/ChatComponent';

const plans = [
  require('@/assets/images/subscription-0.jpg'),
  require('@/assets/images/subscription-9.jpg'),
  require('@/assets/images/subscription-49.jpg'),
  require('@/assets/images/subscription-99.gif'),
  require('@/assets/images/subscription-0.jpg'), // Placeholder for 5th plan
];

const planDetails = [
  { space: '10gb', files: 1000, queries: 1000, price: 9 },
  { space: '50gb', files: 5000, queries: 5000, price: 29 },
  { space: '100gb', files: 10000, queries: 10000, price: 49 },
  { space: '1tb', files: 100000, queries: 100000, price: 99 },
  { space: '10gb', files: 1000, queries: 1000, price: 9 }, // Placeholder
];

export default function Account() {
  const [selectedPlan, setSelectedPlan] = useState(0);
  const [activeTab, setActiveTab] = useState('plans');
  const router = useRouter();

  useEffect(() => {
    router.setParams({ activeSection: 'account' });
  }, []);

  return (
    <View style={styles.outerContainer}>
      <Header />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* User Card */}
        <View style={styles.userCard}>
          <Image 
            source={require('@/assets/images/main-logo.jpg')} 
            style={styles.avatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>Sophia Evlyn</Text>
            <Text style={styles.userPlan}>Personal Plan  $29/Month</Text>
            <Text style={styles.userPlanSmall}>Payment Method Ends In 4599</Text>
            <Text style={styles.usage}>
              Space: 800MB/10gb,   Files: 123/1000,   Queries: 123/1000
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'plans' && styles.tabActive]}
            onPress={() => setActiveTab('plans')}
          >
            <Text style={[styles.tabText, activeTab === 'plans' && styles.tabTextActive]}>Subscription Plans</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'name' && styles.tabInactive]}
            onPress={() => setActiveTab('name')}
          >
            <Text style={[styles.tabText, activeTab === 'name' && styles.tabTextInactive]}>Name Of The Plan</Text>
          </TouchableOpacity>
        </View>

        {/* Plan Selector */}
        <View style={styles.planSelector}>
          {plans.map((plan, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.planBox, selectedPlan === index && styles.planBoxActive]}
              onPress={() => setSelectedPlan(index)}
            >
              <Image source={plan} style={styles.planImg} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Plan Details */}
        <View style={styles.planDetails}>
          <Text style={styles.detailText}>Space: {planDetails[selectedPlan].space}</Text>
          <Text style={styles.detailText}>Files: {planDetails[selectedPlan].files}</Text>
          <Text style={styles.detailText}>Queries: {planDetails[selectedPlan].queries}/Mo</Text>
          <Text style={styles.detailText}>Price: ${planDetails[selectedPlan].price}</Text>
        </View>
      </ScrollView>
      <ChatComponent />
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#ececec',
  },
  container: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 0,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    margin: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 14,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  userPlan: {
    fontSize: 14,
    color: '#222',
    marginBottom: 1,
    fontWeight: '500',
  },
  userPlanSmall: {
    fontSize: 12,
    color: '#444',
    marginBottom: 2,
  },
  usage: {
    fontSize: 12,
    color: '#222',
    marginTop: 2,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    marginBottom: 12,
    marginTop: 8,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: 'transparent',
  },
  tabActive: {
    backgroundColor: '#000',
  },
  tabInactive: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#888',
  },
  tabTextActive: {
    color: '#fff',
  },
  tabTextInactive: {
    color: '#888',
  },
  planSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    marginBottom: 8,
    marginTop: 4,
  },
  planBox: {
    width: 54,
    height: 74,
    backgroundColor: '#111',
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  planBoxActive: {
    borderColor: '#5B36D6',
    borderWidth: 2,
    shadowOpacity: 0.18,
    elevation: 4,
  },
  planImg: {
    width: 44,
    height: 64,
    borderRadius: 6,
  },
  planDetails: {
    marginLeft: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 15,
    color: '#222',
    marginBottom: 2,
    fontWeight: '500',
  },
});
