/**
 * Design tokens — exact values from preview HTML :root variables
 *
 * --bg:#E9E1D5; --card:#FAF4E6; --surface:#EDE5D8; --border:#D6CCBF;
 * --accent:#6A5ACD; --accentDim:rgba(106,90,205,0.12); --accentBdr:rgba(106,90,205,0.32);
 * --hi:#E8C547; --hiDim:rgba(232,197,71,0.12);
 * --ok:#22c55e; --okDim:rgba(34,197,94,0.12); --okBdr:rgba(34,197,94,0.35);
 * --err:#c0392b; --errDim:rgba(192,57,43,0.10); --errBdr:rgba(192,57,43,0.28);
 * --text:#1a1612; --text2:#6b5f52; --text3:#a8998a;
 * --r:12px; --rl:16px; --rxl:24px;
 */
export const colors = {
  bg:           '#E9E1D5',
  card:         '#FAF4E6',
  surface:      '#EDE5D8',
  border:       '#D6CCBF',

  accent:       '#6A5ACD',
  accentDim:    'rgba(106,90,205,0.12)',
  accentBorder: 'rgba(106,90,205,0.32)',
  accentBdr:    'rgba(106,90,205,0.32)',  // alias used in some components

  highlight:    '#E8C547',
  highlightDim: 'rgba(232,197,71,0.12)',
  highlightBdr: 'rgba(232,197,71,0.30)',

  // --ok:#22c55e (preview uses this exact green)
  success:      '#22c55e',
  successDim:   'rgba(34,197,94,0.12)',
  successBdr:   'rgba(34,197,94,0.35)',

  error:        '#c0392b',
  errorDim:     'rgba(192,57,43,0.10)',
  errorBdr:     'rgba(192,57,43,0.28)',

  text:         '#1a1612',
  text2:        '#6b5f52',
  text3:        '#a8998a',
};

// Spacing — preview uses px values: 20px horizontal padding, 14px card padding, 10px gap
export const spacing = {
  xs: 4,
  sm: 8,
  md: 14,   // card padding (matches .sess-card padding:14px)
  lg: 20,   // horizontal page padding (matches padding:0 20px)
  xl: 32,
};

// Border radius — from --r:12px, --rl:16px, --rxl:24px
export const radius = {
  sm: 8,
  md: 12,   // --r
  lg: 16,   // --rl
  xl: 24,   // --rxl
};
