/**
 * LocationSearch — Nominatim-powered autocomplete (no API key required).
 * Returns specific place-level gym suggestions so similarly named venues are
 * distinguished by branch, street, area, and postcode rather than generic city text.
 */
import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, ScrollView,
} from 'react-native';
import { colors, radius, spacing, typography } from '../constants/theme';

interface NominatimResult {
  place_id: number;
  display_name: string;
  name: string;
  type?: string;
  class?: string;
  address?: {
    leisure?: string;
    house_number?: string;
    road?: string;
    quarter?: string;
    suburb?: string;
    neighbourhood?: string;
    city_district?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    postcode?: string;
  };
}

interface Props {
  value:    string;
  onChange: (value: string) => void;
}

const branchHints = ['aldgate', 'stratford', 'vauxhall', 'westfield', 'mile end', 'bethnal green'];

function compactParts(parts: Array<string | undefined>): string[] {
  const seen = new Set<string>();
  return parts
    .map(part => part?.trim())
    .filter((part): part is string => Boolean(part))
    .filter(part => {
      const key = part.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function branchFromResult(result: NominatimResult): string {
  const address = result.address ?? {};
  const haystack = `${result.name} ${result.display_name}`.toLowerCase();
  const direct = branchHints.find(hint => haystack.includes(hint));
  if (direct) return direct.split(' ').map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
  return address.quarter || address.suburb || address.neighbourhood || '';
}

function venueName(result: NominatimResult): string {
  const rawName = result.name || result.address?.leisure || result.display_name.split(',')[0].trim();
  const branch = branchFromResult(result);

  if (rawName.toLowerCase() === 'city bouldering' && branch) {
    return `City Bouldering ${branch}`;
  }

  return rawName;
}

function locationSubText(result: NominatimResult): string {
  const address = result.address ?? {};
  const street = compactParts([address.house_number, address.road]).join(' ');
  const area = address.quarter || address.suburb || address.neighbourhood || address.city_district;
  return compactParts([street, area, address.postcode]).join(' · ');
}

/** Returns a concise stored value without a full address. */
function selectedLocation(result: NominatimResult): string {
  const name = venueName(result);
  const area = branchFromResult(result);
  return area && !name.toLowerCase().includes(area.toLowerCase()) ? `${name}, ${area}` : name;
}

function queryVariants(text: string): string[] {
  const clean = text.trim().replace(/\s+/g, ' ');
  const lower = clean.toLowerCase();
  const variants = [clean];

  // Nominatim currently resolves “City Bouldering Aldgate” more reliably than
  // “Aldgate East”, while the latter is how users often refer to the branch.
  if (lower.includes('city bouldering') && lower.includes('aldgate east')) {
    variants.push(clean.replace(/aldgate east/ig, 'Aldgate'));
  }

  if (!lower.includes('london')) variants.push(`${clean} London`);
  if (!lower.includes('uk') && !lower.includes('united kingdom')) variants.push(`${clean} UK`);

  return Array.from(new Set(variants));
}

function sortPlaceResults(results: NominatimResult[], query: string): NominatimResult[] {
  const lowerQuery = query.toLowerCase();
  return [...results].sort((a, b) => {
    const aText = `${venueName(a)} ${a.display_name}`.toLowerCase();
    const bText = `${venueName(b)} ${b.display_name}`.toLowerCase();
    const aSport = a.type === 'sports_centre' || aText.includes('bouldering') ? 1 : 0;
    const bSport = b.type === 'sports_centre' || bText.includes('bouldering') ? 1 : 0;
    const aExact = lowerQuery.split(' ').filter(token => token.length > 2 && aText.includes(token)).length;
    const bExact = lowerQuery.split(' ').filter(token => token.length > 2 && bText.includes(token)).length;
    return (bSport * 10 + bExact) - (aSport * 10 + aExact);
  });
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
      const allResults: NominatimResult[] = [];
      const seen = new Set<number>();

      for (const query of queryVariants(text)) {
        const url =
          'https://nominatim.openstreetmap.org/search' +
          '?q=' + encodeURIComponent(query) +
          '&format=json&limit=8&addressdetails=1&countrycodes=gb&extratags=1&namedetails=1';
        const res  = await fetch(url, {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'Ascenta-app/1.0',
          },
        });
        const data: NominatimResult[] = await res.json();
        if (Array.isArray(data)) {
          data.forEach(item => {
            if (!seen.has(item.place_id)) {
              seen.add(item.place_id);
              allResults.push(item);
            }
          });
        }
        if (allResults.length >= 6) break;
      }

      const ranked = sortPlaceResults(allResults, text).slice(0, 6);
      setSuggestions(ranked);
      setOpen(ranked.length > 0);
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
    onChange(selectedLocation(result));
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
          placeholder="Search exact gym, e.g. City Bouldering Aldgate"
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
            style={{ maxHeight: 236 }}
          >
            {suggestions.map((item, index) => {
              const mainText = venueName(item);
              const subText = locationSubText(item);
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
  input:           { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, color: colors.text, fontSize: 14, fontFamily: typography.family.regular, fontWeight: typography.weight.regular },
  spinner:         { position: 'absolute', right: 14 },
  dropdown:        { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderTopWidth: 0, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, zIndex: 999, shadowColor: colors.shadow, shadowOpacity: 0.10, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 8, marginTop: -1, marginBottom: spacing.sm, overflow: 'hidden' },
  suggestion:      { paddingHorizontal: spacing.md, paddingVertical: 11 },
  suggestionBorder:{ borderTopWidth: 1, borderTopColor: colors.border },
  suggestionMain:  { fontSize: 14, fontFamily: typography.family.semibold, fontWeight: typography.weight.semibold, color: colors.text },
  suggestionSub:   { fontSize: 11, fontFamily: typography.family.regular, fontWeight: typography.weight.regular, color: colors.text3, marginTop: 2 },
});
