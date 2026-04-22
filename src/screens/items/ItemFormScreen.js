import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { createItem, updateItem } from '../../api/items';
import colors from '../../constants/colors';

export default function ItemFormScreen({ route, navigation }) {
  const item = route.params?.item || null;
  const isEdit = !!item;

  const [form, setForm] = useState({
    name: item?.name || '',
    hsn_code: item?.hsn_code || '',
    unit: item?.unit || '',
    price: item?.price ? String(item.price) : '',
    gst: item?.gst ? String(item.gst) : '',
    brand_id: item?.brand_id ? String(item.brand_id) : '',
    category_id: item?.category_id ? String(item.category_id) : '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Item name is required';
    if (form.price && isNaN(parseFloat(form.price)))
      e.price = 'Enter a valid price';
    if (form.gst && (isNaN(parseFloat(form.gst)) || parseFloat(form.gst) > 100))
      e.gst = 'Enter a valid GST percentage (0-100)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    const payload = {
      ...form,
      price: form.price ? parseFloat(form.price) : null,
      gst: form.gst ? parseFloat(form.gst) : null,
      brand_id: form.brand_id ? parseInt(form.brand_id) : null,
      category_id: form.category_id ? parseInt(form.category_id) : null,
    };
    try {
      if (isEdit) {
        await updateItem(item.id, payload);
        Alert.alert('Success', 'Item updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await createItem(payload);
        Alert.alert('Success', 'Item added successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Operation failed. Please try again.');
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
            label="Item Name *"
            value={form.name}
            onChangeText={(v) => set('name', v)}
            placeholder="Enter item name"
            autoCapitalize="words"
            error={errors.name}
          />
          <CustomInput
            label="HSN Code"
            value={form.hsn_code}
            onChangeText={(v) => set('hsn_code', v)}
            placeholder="e.g. 7214"
            keyboardType="numeric"
            error={errors.hsn_code}
          />
          <CustomInput
            label="Unit"
            value={form.unit}
            onChangeText={(v) => set('unit', v)}
            placeholder="e.g. Pcs, Kg, Meter, Box"
            autoCapitalize="words"
            error={errors.unit}
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <CustomInput
                label="Price (₹)"
                value={form.price}
                onChangeText={(v) => set('price', v)}
                placeholder="0.00"
                keyboardType="decimal-pad"
                error={errors.price}
              />
            </View>
            <View style={{ flex: 1 }}>
              <CustomInput
                label="GST %"
                value={form.gst}
                onChangeText={(v) => set('gst', v)}
                placeholder="e.g. 18"
                keyboardType="decimal-pad"
                error={errors.gst}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <CustomInput
                label="Brand ID"
                value={form.brand_id}
                onChangeText={(v) => set('brand_id', v)}
                placeholder="Brand ID"
                keyboardType="numeric"
                error={errors.brand_id}
              />
            </View>
            <View style={{ flex: 1 }}>
              <CustomInput
                label="Category ID"
                value={form.category_id}
                onChangeText={(v) => set('category_id', v)}
                placeholder="Category ID"
                keyboardType="numeric"
                error={errors.category_id}
              />
            </View>
          </View>

          <Text style={styles.hint}>
            💡 Brand and Category dropdowns will be available in the next update.
          </Text>

          <CustomButton
            title={isEdit ? 'Update Item' : 'Add Item'}
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
  row: { flexDirection: 'row' },
  hint: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 16,
    fontStyle: 'italic',
  },
});
