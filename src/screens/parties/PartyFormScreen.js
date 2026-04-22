import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { createParty, updateParty } from '../../api/parties';
import colors from '../../constants/colors';

export default function PartyFormScreen({ route, navigation }) {
  const party = route.params?.party || null;
  const isEdit = !!party;

  const [form, setForm] = useState({
    name: party?.name || '',
    mobile: party?.mobile || '',
    email: party?.email || '',
    address: party?.address || '',
    gst_number: party?.gst_number || '',
    state: party?.state || '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Party name is required';
    if (!form.mobile.trim()) e.mobile = 'Mobile number is required';
    else if (!/^\d{10}$/.test(form.mobile.trim()))
      e.mobile = 'Enter a valid 10-digit mobile number';
    if (form.email && !/\S+@\S+\.\S+/.test(form.email))
      e.email = 'Enter a valid email address';
    if (form.gst_number && form.gst_number.length !== 15)
      e.gst_number = 'GST number must be 15 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (isEdit) {
        await updateParty(party.id, form);
        Alert.alert('Success', 'Party updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await createParty(form);
        Alert.alert('Success', 'Party added successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err) {
      Alert.alert(
        'Error',
        err.message || 'Operation failed. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <CustomInput
            label="Party Name *"
            value={form.name}
            onChangeText={(v) => set('name', v)}
            placeholder="Enter party / company name"
            autoCapitalize="words"
            error={errors.name}
          />
          <CustomInput
            label="Mobile Number *"
            value={form.mobile}
            onChangeText={(v) => set('mobile', v)}
            placeholder="10-digit mobile number"
            keyboardType="phone-pad"
            error={errors.mobile}
          />
          <CustomInput
            label="Email Address"
            value={form.email}
            onChangeText={(v) => set('email', v)}
            placeholder="email@example.com"
            keyboardType="email-address"
            error={errors.email}
          />
          <CustomInput
            label="Address"
            value={form.address}
            onChangeText={(v) => set('address', v)}
            placeholder="Full address"
            autoCapitalize="sentences"
            multiline
            numberOfLines={3}
            error={errors.address}
          />
          <CustomInput
            label="GST Number"
            value={form.gst_number}
            onChangeText={(v) => set('gst_number', v.toUpperCase())}
            placeholder="15-character GST number"
            autoCapitalize="characters"
            error={errors.gst_number}
          />
          <CustomInput
            label="State"
            value={form.state}
            onChangeText={(v) => set('state', v)}
            placeholder="e.g. Maharashtra"
            autoCapitalize="words"
            error={errors.state}
          />

          <CustomButton
            title={isEdit ? 'Update Party' : 'Add Party'}
            onPress={handleSubmit}
            loading={loading}
            style={{ marginTop: 8 }}
          />
          <CustomButton
            title="Cancel"
            onPress={() => navigation.goBack()}
            variant="ghost"
            style={{ marginTop: 10 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingBottom: 48 },
});
