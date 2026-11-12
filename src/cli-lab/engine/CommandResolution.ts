import { CommandSpec, DeviceMode } from './types';

/** Enter and TAB give an exact keyword precedence over longer prefixes. */
export function matchingKeywords(keywords: string[], token: string): string[] {
  const partial = token.toLowerCase();
  return keywords.includes(partial) ? [partial] : keywords.filter(k => k.startsWith(partial));
}

/** Resolve a completed 'do' prefix with the same mode/privilege rules as Enter. */
export function commandContext(specs: CommandSpec[], words: string[], mode: DeviceMode, privilege: number) {
  const leading = resolveKeywords(specs, words.slice(0, 1), mode, privilege);
  const delegated = words.length > 0 && !leading.ambiguous && leading.tokens[0] === 'do' &&
    leading.candidates.some(s => s.match.length === 1 && s.match[0] === 'do');
  return {
    specs: delegated ? specs.filter(s => s.match[0] !== 'do') : specs,
    words: delegated ? words.slice(1) : words,
    mode: delegated ? 'privileged' as const : mode,
    privilege: delegated ? 15 : privilege,
  };
}

/**
 * Resolve IOS-like abbreviations against registered executable command paths.
 * A keyword may be abbreviated only when it identifies one keyword at its
 * position in the current mode. Exact keywords take precedence over prefixes.
 * Arguments (interfaces, VLANs, hostnames...) are never abbreviated here.
 */
export function resolveKeywords(
  specs: CommandSpec[],
  words: string[],
  mode: DeviceMode,
  privilege: number,
): { tokens: string[]; candidates: CommandSpec[]; ambiguous?: string[] } {
  let candidates = specs.filter(s => s.modes.includes(mode) && (s.minPrivilege ?? 0) <= privilege);
  const tokens = [...words];
  for (let i = 0; i < words.length; i++) {
    const token = words[i].toLowerCase();
    const keywords = Array.from(new Set(candidates.filter(s => s.match.length > i).map(s => s.match[i])));
    if (!keywords.length) break; // argument, not a registered keyword
    const matching = matchingKeywords(keywords, token);
    if (!matching.length) break; // argument to a completed command path
    if (matching.length > 1) return { tokens, candidates: [], ambiguous: matching.sort() };
    tokens[i] = matching[0];
    candidates = candidates.filter(s => s.match.length <= i || s.match[i] === matching[0]);
    // A completed command with arguments can also stay eligible, but only
    // when the token is not a keyword of another command branch.
  }
  return { tokens, candidates };
}

export function commandFor(
  specs: CommandSpec[],
  words: string[],
  mode: DeviceMode,
  privilege: number,
): { spec?: CommandSpec; tokens: string[]; ambiguous?: string[] } {
  const result = resolveKeywords(specs, words, mode, privilege);
  if (result.ambiguous) return { tokens: words, ambiguous: result.ambiguous };
  const candidates = result.candidates.filter(s =>
    s.match.length <= result.tokens.length &&
    s.match.every((keyword, index) => result.tokens[index].toLowerCase() === keyword)
  );
  // More-specific commands override handlers that accept trailing arguments.
  candidates.sort((a, b) => b.match.length - a.match.length);
  return { spec: candidates[0], tokens: result.tokens };
}
