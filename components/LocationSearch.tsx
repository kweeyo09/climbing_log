/**
 * LocationSearch — Nominatim-powered autocomplete (no API key required).
 * Mirrors the preview HTML locSearch() behaviour exactly.
 */
import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, ScrollView,
} from 'react-native';
import { colors, radius, spacing } from '../constants/theme';

interface NominatimResult {
  place_id: number;
  display_name: string;
  name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
  };
}

interface Props {
  value:    string;
  onChange: (value: string) => void;
}

/** Returns "Venue Name, City" — same logic as preview shortLocation() */
function shortLocation(result: NominatimResult): string {
  const name = result.name || result.display_name.split(',')[0].trim();
  const a = result.address ?? {};
  const city = a.city || a.town || a.village || a.municipality || a.county || '';
  return city ? `${name}, ${city}` : name;
}

export default function LocationSearch({ value, onChange }: Props) {
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [open,        setOpen]        = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = async (text: string) => {
    if (text.length < 3) { setSuggestions([]); setOpen(false); return; }
    setLoading(true);
    try {
      const url =
        'https://nominatim.openstreetmap.org/search' +
        '?q=' + encodeURIComponent(text) +
        '&format=json&limit=6&addressdetails=1';
      const res  = await fetch(url, {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'Ascenta-app/1.0',
        },
      });
      const data: NominatimResult[] = await res.json();
      if (Array.isArray(data) && data.length) {
        setSuggestions(data);
        setOpen(true);
      } else {
        setSuggestions([]);
        setOpen(false);
      }
    } catch {
      setSuggestions([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (text: string) => {
    onChange(text);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => fetchSuggestions(text), 400);
  };

  const handleSelect = (result: NominatimResult) => {
    onChange(shortLocation(result));
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
          <ScrollView
            keyboardShouldPersistTaps="handled"
            scrollEnabled={suggestions.length > 4}
            style={{ maxHeight: 200 }}
          >
            {suggestions.map((item, index) => {
              const short = shortLocation(item);
              const parts = short.split(', ');
              const mainText = parts[0];
              const subText  = parts.slice(1).join(', ');
              return (
                <TouchableOpacity
                  key={item.place_id}
                  style={[s.suggestion, index > 0 && s.suggestionBorder]}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                >
                  <Text style={s.suggestionMain} numberOfLines={1}>
                    {mainText}
                  </Text>
                  {subText ? (
                    <Text style={s.suggestionSub} numberOfLines={1}>
                      {subText}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
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
  dropdown:        { position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', borderWidth: 1, borderColor: '#d0ccc4', borderTopWidth: 0, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, zIndex: 999, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 8, marginTop: 0 },
  suggestion:      { paddingHorizontal: spacing.md, paddingVertical: 10 },
  suggestionBorder:{ borderTopWidth: 1, borderTopColor: '#f0ece4' },
  suggestionMain:  { fontSize: 13, fontWeight: '600', color: '#333' },
  suggestionSub:   { fontSize: 11, color: '#888', marginTop: 1 },
});
