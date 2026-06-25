const bannedWords = [
  'bastard',
  'barstard',
  'idiot',
  'stupid',
  'dumb',
  'threat',
  'kill',
  'rape',
  'hate',
  'insult',
];

type Severity = 'low' | 'medium' | 'high';

function determineSeverity(found: string[]): Severity {
  if (found.some((w) => ['kill', 'rape', 'threat'].includes(w))) return 'high';
  if (found.some((w) => ['hate', 'idiot', 'stupid', 'barstard', 'bastard'].includes(w))) return 'medium';
  return 'low';
}

export function checkModeration(text: string) {
  const normalized = text.toLowerCase();
  const found = bannedWords.filter((word) => normalized.includes(word));
  const isFlagged = found.length > 0;
  const severity = isFlagged ? determineSeverity(found) : null;

  return {
    isFlagged,
    keywords: found,
    severity,
    warning: isFlagged ? 'Please use respectful language while submitting complaints.' : null,
  };
}
