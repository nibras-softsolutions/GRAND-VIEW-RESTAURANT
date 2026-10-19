import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { useCart } from '../../context/CartContext';
import { SavedAddress } from '../../types';

interface AddressManagerModalProps {
  visible: boolean;
  onClose: () => void;
}

const ISLANDS = ['Amini', 'Kavaratti', 'Agatti', 'Andrott', 'Kalpeni', 'Kadmat'];

export const AddressManagerModal: React.FC<AddressManagerModalProps> = ({
  visible,
  onClose,
}) => {
  const { savedAddresses, deliveryAddress, updateDeliveryAddress } = useCart();
  const [showAddForm, setShowAddForm] = useState(false);

  // New Address form
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [island, setIsland] = useState('Amini');
  const [houseName, setHouseName] = useState('');
  const [locality, setLocality] = useState('');
  const [landmark, setLandmark] = useState('');
  const [instructions, setInstructions] = useState('');

  const handleSelectAddress = (addr: SavedAddress) => {
    updateDeliveryAddress(addr);
    onClose();
  };

  const handleSaveNew = () => {
    if (!fullName.trim() || !phone.trim() || !houseName.trim() || !locality.trim()) {
      return;
    }

    const newAddr: SavedAddress = {
      id: `addr-${Date.now()}`,
      label: 'Home',
      fullName: fullName.trim(),
      phone: phone.trim(),
      island: island.trim(),
      houseName: houseName.trim(),
      locality: locality.trim(),
      landmark: landmark.trim(),
      deliveryInstructions: instructions.trim(),
    };

    updateDeliveryAddress(newAddr);
    setShowAddForm(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Delivery Addresses</Text>
          <TouchableOpacity
            style={styles.addIconBtn}
            onPress={() => setShowAddForm(!showAddForm)}
          >
            <Ionicons
              name={showAddForm ? 'list' : 'add'}
              size={22}
              color={Colors.primary}
            />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {showAddForm ? (
            <View style={styles.card}>
              <Text style={styles.formTitle}>Add Island Address (No GPS)</Text>

              <View style={styles.formRow}>
                <Text style={styles.label}>Recipient Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor={Colors.textMuted}
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              <View style={styles.formRow}>
                <Text style={styles.label}>Phone Number *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="10-digit mobile"
                  placeholderTextColor={Colors.textMuted}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formRow}>
                <Text style={styles.label}>Select Island *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {ISLANDS.map((isl) => (
                    <TouchableOpacity
                      key={isl}
                      style={[styles.islandChip, island === isl && styles.islandChipActive]}
                      onPress={() => setIsland(isl)}
                    >
                      <Text
                        style={[styles.islandText, island === isl && styles.islandTextActive]}
                      >
                        {isl}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.formRow}>
                <Text style={styles.label}>House Name / Number *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Baitul Noor"
                  placeholderTextColor={Colors.textMuted}
                  value={houseName}
                  onChangeText={setHouseName}
                />
              </View>

              <View style={styles.formRow}>
                <Text style={styles.label}>Area / Locality *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Near Juma Masjid"
                  placeholderTextColor={Colors.textMuted}
                  value={locality}
                  onChangeText={setLocality}
                />
              </View>

              <View style={styles.formRow}>
                <Text style={styles.label}>Landmark</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Opposite Post Office"
                  placeholderTextColor={Colors.textMuted}
                  value={landmark}
                  onChangeText={setLandmark}
                />
              </View>

              <View style={styles.formRow}>
                <Text style={styles.label}>Delivery Instructions</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Please call when reaching the road"
                  placeholderTextColor={Colors.textMuted}
                  value={instructions}
                  onChangeText={setInstructions}
                />
              </View>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveNew}
                activeOpacity={0.85}
              >
                <Text style={styles.saveBtnText}>Save Island Address</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.addressList}>
              {savedAddresses.map((addr) => {
                const isSelected = deliveryAddress?.id === addr.id;
                return (
                  <TouchableOpacity
                    key={addr.id}
                    style={[styles.addrCard, isSelected && styles.addrCardActive]}
                    onPress={() => handleSelectAddress(addr)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.addrCardHeader}>
                      <View style={styles.labelRow}>
                        <Ionicons
                          name="location"
                          size={16}
                          color={isSelected ? Colors.primary : Colors.textMuted}
                        />
                        <Text style={styles.addrCardLabel}>{addr.label}</Text>
                        {isSelected && (
                          <View style={styles.activePill}>
                            <Text style={styles.activePillText}>Selected</Text>
                          </View>
                        )}
                      </View>
                      <Ionicons
                        name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                        size={20}
                        color={isSelected ? Colors.primary : Colors.cardBorder}
                      />
                    </View>

                    <Text style={styles.addrName}>
                      {addr.fullName} • {addr.phone}
                    </Text>
                    <Text style={styles.addrLine}>
                      {addr.houseName}, {addr.locality}, {addr.island}
                    </Text>
                    {addr.landmark ? (
                      <Text style={styles.addrLandmark}>
                        Landmark: {addr.landmark}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity
                style={styles.addNewAddrBtn}
                onPress={() => setShowAddForm(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
                <Text style={styles.addNewAddrText}>Add New Delivery Address</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFB',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 20 : 16,
    paddingBottom: 14,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF1',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  scrollContent: {
    padding: 16,
  },
  addressList: {
    gap: 12,
  },
  addrCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#ECEEF1',
  },
  addrCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySoft,
  },
  addrCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addrCardLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  activePill: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  activePillText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
  },
  addrName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  addrLine: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  addrLandmark: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  addNewAddrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 8,
  },
  addNewAddrText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEEF1',
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  formRow: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F5F6F8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ECEEF1',
    paddingHorizontal: 14,
    height: 44,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  islandChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F5F6F8',
    borderWidth: 1,
    borderColor: '#ECEEF1',
    marginRight: 8,
  },
  islandChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryDark,
  },
  islandText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  islandTextActive: {
    color: Colors.white,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  saveBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
