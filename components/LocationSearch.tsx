import { useState, useRef } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { colors, radius, spacing } from '../constants/theme';

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '';

interface Feature {
  id: string;
  place_name: string;
  text: string; // venue/place name
  context?: Array<{ id: string; text: string }>;
}

interface Props {
  value:    string;
  onChange: (value: string) => void;
}

/** Returns "Venue Name, City" — skips street numbers, postcodes, countries */
function shortLocation(feature: Feature): string {
  const name = feature.text;
  // context array goes: neighbourhood → locality → place (city) → region → country
  const city = feature.context?.find(
    c => c.id.startsWith('place.') || c.id.startsWith('locality.') || c.id.startsWith('district.')
  )?.text ?? '';
  return city ? `${name}, ${city}` : name;
}

export default function LocationSearch({ value, onChange }: Props) {
  const [suggestions, setSuggestions] = useState<Feature[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [open,        setOpen]        = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = async (text: string) => {
    if (text.length < 2) { setSuggestions([]); setOpen(false); return; }
    setLoading(true);
    try {
      const encoded = encodeURIComponent(text);
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json` +
        `?access_token=${MAPBOX_TOKEN}` +
        `&types=poi,place` +
        `&limit=5`;
      const res  = await fetch(url);
      const data = await res.json();
      if (data.features?.length) {
        setSuggestions(data.features);
        setOpen(true);
      } else {
        setSuggestions([]);
        setOpen(false);
      }
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (text: string) => {
    onChange(text);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => fetchSuggestions(text), 350);
  };

  const handleSelect = (feature: Feature) => {
    const short = shortLocation(feature);
    onChange(short);
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <View style={s.container}>
      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          value={value}
          onChangeText={handleChange}
          placeholder="Search climbing gym or location…"
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

      {open && suggestions.length > 0 && (
        <View style={s.dropdown}>
          <FlatList
            data={suggestions}
            keyExtractor={item => item.id}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={false}
            renderItem={({ item, index }) => {
              const short = shortLocation(item);
              return (
                <TouchableOpacity
                  style={[s.suggestion, index === 0 && s.suggestionFirst]}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                >
                  <Text style={s.suggestionMain} numberOfLines={1}>
                    {item.text}
                  </Text>
                  <Text style={s.suggestionSub} numberOfLines={1}>
                    {short.includes(',') ? short.split(', ').slice(1).join(', ') : item.place_name}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container:       { position: 'relative', zIndex: 10 },
  inputRow:        { flexDirection: 'row', alignItems: 'center' },
  input:           { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, color: colors.text, fontSize: 14 },
  spinner:         { position: 'absolute', right: 14 },
  dropdown:        { position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, marginTop: 4, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  suggestion:      { paddingHorizontal: spacing.md, paddingVertical: 11, borderTopWidth: 1, borderTopColor: colors.border },
  suggestionFirst: { borderTopWidth: 0 },
  suggestionMain:  { fontSize: 14, fontWeight: '600', color: colors.text },
  suggestionSub:   { fontSize: 11, color: colors.text3, marginTop: 1 },
});
