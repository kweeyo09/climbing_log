import { useState, useRef } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { colors, radius, spacing } from '../constants/theme';

const PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY ?? '';

interface Prediction {
  place_id:     string;
  description:  string;
  // structured_formatting gives us the main gym name vs city
  structured_formatting: {
    main_text:      string;
    secondary_text: string;
  };
}

interface Props {
  value:    string;
  onChange: (value: string) => void;
}

export default function LocationSearch({ value, onChange }: Props) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [open,        setOpen]        = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchPredictions = async (text: string) => {
    if (text.length < 2) { setPredictions([]); setOpen(false); return; }

    setLoading(true);
    try {
      const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
      url.searchParams.set('input', text);
      url.searchParams.set('key', PLACES_API_KEY);
      url.searchParams.set('types', 'establishment');
      // Bias results toward climbing-related places
      url.searchParams.set('keyword', 'climbing gym bouldering wall');

      const res  = await fetch(url.toString());
      const data = await res.json();

      if (data.status === 'OK') {
        setPredictions(data.predictions.slice(0, 5));
        setOpen(true);
      } else {
        setPredictions([]);
        setOpen(false);
      }
    } catch {
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (text: string) => {
    onChange(text);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => fetchPredictions(text), 350);
  };

  const handleSelect = (prediction: Prediction) => {
    onChange(prediction.description);
    setPredictions([]);
    setOpen(false);
  };

  return (
    <View style={s.container}>
      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          value={value}
          onChangeText={handleChange}
          placeholder="e.g. The Climbing Hangar, Fontainebleau…"
          placeholderTextColor={colors.text3}
          autoCapitalize="words"
          returnKeyType="done"
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
        {loading && (
          <ActivityIndicator
            size="small"
            color={colors.accent}
            style={s.spinner}
          />
        )}
      </View>

      {open && predictions.length > 0 && (
        <View style={s.dropdown}>
          <FlatList
            data={predictions}
            keyExtractor={item => item.place_id}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={false}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[s.suggestion, index === 0 && s.suggestionFirst]}
                onPress={() => handleSelect(item)}
                activeOpacity={0.7}
              >
                <Text style={s.suggestionMain} numberOfLines={1}>
                  {item.structured_formatting.main_text}
                </Text>
                <Text style={s.suggestionSub} numberOfLines={1}>
                  {item.structured_formatting.secondary_text}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container:      { position: 'relative', zIndex: 10 },
  inputRow:       { flexDirection: 'row', alignItems: 'center' },
  input:          { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, color: colors.text, fontSize: 14 },
  spinner:        { position: 'absolute', right: 14 },
  dropdown:       { position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, marginTop: 4, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  suggestion:     { paddingHorizontal: spacing.md, paddingVertical: 11, borderTopWidth: 1, borderTopColor: colors.border },
  suggestionFirst:{ borderTopWidth: 0 },
  suggestionMain: { fontSize: 14, fontWeight: '600', color: colors.text },
  suggestionSub:  { fontSize: 11, color: colors.text3, marginTop: 1 },
});
