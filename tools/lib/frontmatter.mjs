export function parseFrontmatter(source) {
  if (!source.startsWith('---\n')) return { fields: null, body: source };
  const end = source.indexOf('\n---', 4);
  if (end === -1) return { fields: null, body: source };
  const raw = source.slice(4, end);
  const body = source.slice(source.indexOf('\n', end + 1) + 1);
  const fields = {};
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (!m) continue;
    const [, key, valueRaw] = m;
    let value = valueRaw.trim();
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (value.includes(' #')) {
      value = value.slice(0, value.indexOf(' #')).trim();
    }
    fields[key] = value;
  }
  return { fields, body };
}
