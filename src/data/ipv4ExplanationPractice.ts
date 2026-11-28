const BASE_CALCULATIONS: Readonly<Record<string, number>> = {
  'l3-06': 24,
  'l3-08': 26,
  'l3-09': 26,
  'l3-10': 27,
  'l3-d01': 30,
  'l3-d02': 27,
  'new-l3-23': 23,
};

export function ipv4CalculationPrefix(questionId: string): number | undefined {
  const generated = questionId.match(/^gen-(?:(?:net|bc)-(2[5-9]|30)-[0-4]|(?:mask|hosts|block)-(2[5-9]|30))$/);
  return generated ? Number(generated[1] ?? generated[2]) : BASE_CALCULATIONS[questionId];
}

const CALCULATOR_EXAMPLES: Readonly<Record<string, { prefix: number; address?: string } | null>> = {
  'l3-11': { prefix: 28, address: '10.0.0.32' },
  'gen-bin-dec-252': { prefix: 22, address: '172.20.6.14' },
  'gen-bc-25-3': null, // Requires comparing two hosts while choosing a common prefix.
  'gen-bc-25-4': null, // Requires comparing two concurrently configured prefixes.
  'gen-net-25-3': null, // Requires comparing the on-link decision for two destinations.
  'gen-bc-26-4': { prefix: 26, address: '10.60.0.128' },
  'gen-hosts-27': { prefix: 26 }, // A /27 has only 30 usable addresses, not the required 32.
};

/** Keep calculator suggestions distinct from the established lesson fallback. */
export function getIpv4CalculatorExample(question: { id: string; text: string }) {
  if (Object.hasOwn(CALCULATOR_EXAMPLES, question.id)) return CALCULATOR_EXAMPLES[question.id] ?? undefined;
  const prefix = ipv4CalculationPrefix(question.id);
  if (prefix === undefined) return undefined;
  const cidr = [...question.text.matchAll(/\b((?:[0-9]{1,3}\.){3}[0-9]{1,3})\s*\/\s*([0-9]{1,2})\b/g)];
  const address = cidr.length === 1 && Number(cidr[0][2]) === prefix &&
    cidr[0][1].split('.').every(octet => Number(octet) <= 255)
    ? cidr[0][1] : undefined;
  return { prefix, address };
}

export function explainGeneratedMask(questionId: string) {
  if (!questionId.startsWith('gen-mask-')) return;
  const prefix = ipv4CalculationPrefix(questionId);
  if (prefix === undefined) return;
  const ones = prefix - 24;
  const zeros = 8 - ones;
  const lastOctet = 256 - 2 ** zeros;
  const bits = '1'.repeat(ones) + '0'.repeat(zeros);
  return {
    brief: `/${prefix} означает ${prefix} единичных битов слева. Первые 24 бита дают три октета по 255, оставшиеся ${ones} — последний октет ${lastOctet}.`,
    deep: `1. Запиши по восемь битов в каждом октете. Первые три октета уже заполнены единицами, поэтому каждый равен 255.
2. В последнем октете запиши ${ones} единичных битов слева и ${zeros} нулевых справа: \`${bits}\`.
3. Все восемь единиц дали бы 255. Нулевой хвост убирает 2^${zeros} − 1, поэтому остаётся 256 − 2^${zeros} = ${lastOctet}. Маска: \`255.255.255.${lastOctet}\`.`,
  };
}
