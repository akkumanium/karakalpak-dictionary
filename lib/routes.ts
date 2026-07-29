export function toPairSegment(from: string, to: string): string {
  return from === to ? from : `${from}-${to}`;
}

export function parsePairSegment(segment: string): {
  from: string;
  to: string;
  pairKey: string;
} {
  const parts = segment.split("-");
  if (parts.length >= 2) {
    const [from, ...rest] = parts;
    const to = rest.join("-");
    return { from, to, pairKey: `${from}-${to}` };
  }

  return { from: segment, to: segment, pairKey: `${segment}-${segment}` };
}
