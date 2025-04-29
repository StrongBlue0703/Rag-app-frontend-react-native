import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';

import Header from '@/components/ui/Header';

const plans = [
  require('@/assets/images/subscription-0.jpg'),
  require('@/assets/images/subscription-9.jpg'),
  require('@/assets/images/subscription-49.jpg'),
  require('@/assets/images/subscription-99.gif'),
];

export default function Subscription() {
  const [selectedPlan, setSelectedPlan] = useState(0);
  const [cardNumber, setCardNumber] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [expDate, setExpDate] = useState('');
  const [cvv, setCvv] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* User Card */}
        <View style={styles.userCard}>
          <Image source={require('../assets/images/react-logo.png')} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>Sopiha Evlyn</Text>
            <Text style={styles.userPlan}>Personal Plan  $29/Month</Text>
            <Text style={styles.userPlan}>Payment Method Ends In 4599</Text>
            <Text style={styles.usage}>Space: 800MB/10gb,  Files: 123/1000,  Queries: 123/1000</Text>
          </View>
        </View>

        {/* Plan Selector */}
        <View style={styles.planRow}>
          <Text style={styles.planTabActive}>Subscription Plans</Text>
          <Text style={styles.planTab}>Basic</Text>
        </View>
        <View style={styles.planSelector}>
          {plans.map((img, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.planBox, selectedPlan === idx && styles.planBoxActive]}
              onPress={() => setSelectedPlan(idx)}
            >
              <Image source={img} style={styles.planImg} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Usage Summary */}
        <View style={{ marginTop: 10, marginBottom: 18, marginHorizontal: 16 }}>
          <Text style={styles.usage}>Space: 800MB/10gb</Text>
          <Text style={styles.usage}>Files: 123/1000</Text>
          <Text style={styles.usage}>Queries: 123/1000</Text>
        </View>

        {/* Payment Form */}
        <View style={styles.formGroup}>
          <TextInput
            style={styles.input}
            placeholder="Card Number"
            value={cardNumber}
            onChangeText={setCardNumber}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Name On Card"
            value={nameOnCard}
            onChangeText={setNameOnCard}
          />
          <TextInput
            style={styles.input}
            placeholder="Billing Address"
            value={billingAddress}
            onChangeText={setBillingAddress}
          />
          <View style={styles.rowInputs}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 8 }]}
              placeholder="Exp Date"
              value={expDate}
              onChangeText={setExpDate}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="CVV"
              value={cvv}
              onChangeText={setCvv}
              secureTextEntry
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity style={styles.continueBtn}>
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ececec',
    paddingTop: 16,
    paddingHorizontal: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  headerIcon: {
    width: 28,
    height: 28,
    marginRight: 8,
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
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
    fontSize: 18,
    marginBottom: 2,
  },
  userPlan: {
    fontSize: 14,
    color: '#222',
    marginBottom: 1,
  },
  usage: {
    fontSize: 13,
    color: '#222',
    marginTop: 2,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    marginBottom: 8,
  },
  planTabActive: {
    backgroundColor: '#000',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  planTab: {
    color: '#888',
    fontSize: 16,
    marginLeft: 2,
  },
  planSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    marginBottom: 8,
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
  },
  planBoxActive: {
    borderColor: '#5B36D6',
    borderWidth: 2,
  },
  planImg: {
    width: 44,
    height: 64,
    borderRadius: 6,
  },
  formGroup: {
    marginHorizontal: 12,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  continueBtn: {
    backgroundColor: '#5B36D6',
    borderRadius: 24,
    marginHorizontal: 10,
    marginTop: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  continueText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 6,
  },
});
