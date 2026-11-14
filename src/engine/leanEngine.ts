import { GoalState, Hypothesis } from '../types/lean';

export interface StepLog {
  line: number;
  tactic: string;
  success: boolean;
  message?: string;
  goalsRemaining: GoalState[];
}

export interface ProofResult {
  isComplete: boolean;
  currentGoals: GoalState[];
  error?: {
    line: number;
    message: string;
  };
  stepLogs: StepLog[];
}

// Built-in Peano definitions and standard library lemmas
export interface LemmaDef {
  name: string;
  params: string[];
  lhs: string;
  rhs: string;
  description: string;
}

export const KNOWN_LEMMAS: Record<string, LemmaDef> = {
  add_zero: {
    name: 'add_zero',
    params: ['a'],
    lhs: 'a + 0',
    rhs: 'a',
    description: 'a + 0 = a (definition of addition for 0)',
  },
  add_succ: {
    name: 'add_succ',
    params: ['a', 'b'],
    lhs: 'a + succ b',
    rhs: 'succ (a + b)',
    description: 'a + succ b = succ (a + b) (definition of addition for succ)',
  },
  zero_add: {
    name: 'zero_add',
    params: ['a'],
    lhs: '0 + a',
    rhs: 'a',
    description: '0 + a = a',
  },
  succ_add: {
    name: 'succ_add',
    params: ['a', 'b'],
    lhs: 'succ a + b',
    rhs: 'succ (a + b)',
    description: 'succ a + b = succ (a + b)',
  },
  add_comm: {
    name: 'add_comm',
    params: ['a', 'b'],
    lhs: 'a + b',
    rhs: 'b + a',
    description: 'a + b = b + a (commutativity of addition)',
  },
  add_assoc: {
    name: 'add_assoc',
    params: ['a', 'b', 'c'],
    lhs: '(a + b) + c',
    rhs: 'a + (b + c)',
    description: '(a + b) + c = a + (b + c) (associativity of addition)',
  },
  add_right_comm: {
    name: 'add_right_comm',
    params: ['a', 'b', 'c'],
    lhs: 'a + b + c',
    rhs: 'a + c + b',
    description: 'a + b + c = a + c + b',
  },
  mul_zero: {
    name: 'mul_zero',
    params: ['a'],
    lhs: 'a * 0',
    rhs: '0',
    description: 'a * 0 = 0 (definition of multiplication for 0)',
  },
  zero_mul: {
    name: 'zero_mul',
    params: ['a'],
    lhs: '0 * a',
    rhs: '0',
    description: '0 * a = 0',
  },
  mul_succ: {
    name: 'mul_succ',
    params: ['a', 'b'],
    lhs: 'a * succ b',
    rhs: 'a * b + a',
    description: 'a * succ b = a * b + a (definition of multiplication for succ)',
  },
  succ_mul: {
    name: 'succ_mul',
    params: ['a', 'b'],
    lhs: 'succ a * b',
    rhs: 'a * b + b',
    description: 'succ a * b = a * b + b',
  },
  mul_one: {
    name: 'mul_one',
    params: ['a'],
    lhs: 'a * 1',
    rhs: 'a',
    description: 'a * 1 = a',
  },
  one_mul: {
    name: 'one_mul',
    params: ['a'],
    lhs: '1 * a',
    rhs: 'a',
    description: '1 * a = a',
  },
  mul_comm: {
    name: 'mul_comm',
    params: ['a', 'b'],
    lhs: 'a * b',
    rhs: 'b * a',
    description: 'a * b = b * a (commutativity of multiplication)',
  },
  mul_add: {
    name: 'mul_add',
    params: ['a', 'b', 'c'],
    lhs: 'a * (b + c)',
    rhs: 'a * b + a * c',
    description: 'a * (b + c) = a * b + a * c (left distributivity)',
  },
  add_mul: {
    name: 'add_mul',
    params: ['a', 'b', 'c'],
    lhs: '(a + b) * c',
    rhs: 'a * c + b * c',
    description: '(a + b) * c = a * c + b * c (right distributivity)',
  },
  mul_assoc: {
    name: 'mul_assoc',
    params: ['a', 'b', 'c'],
    lhs: '(a * b) * c',
    rhs: 'a * (b * c)',
    description: '(a * b) * c = a * (b * c) (associativity of multiplication)',
  },
  pow_zero: {
    name: 'pow_zero',
    params: ['a'],
    lhs: 'a ^ 0',
    rhs: '1',
    description: 'a ^ 0 = 1 (definition of power for 0)',
  },
  pow_succ: {
    name: 'pow_succ',
    params: ['a', 'b'],
    lhs: 'a ^ succ b',
    rhs: 'a ^ b * a',
    description: 'a ^ succ b = a ^ b * a (definition of power for succ)',
  },
  pow_one: {
    name: 'pow_one',
    params: ['a'],
    lhs: 'a ^ 1',
    rhs: 'a',
    description: 'a ^ 1 = a',
  },
  one_pow: {
    name: 'one_pow',
    params: ['a'],
    lhs: '1 ^ a',
    rhs: '1',
    description: '1 ^ a = 1',
  },
  zero_pow_zero: {
    name: 'zero_pow_zero',
    params: [],
    lhs: '0 ^ 0',
    rhs: '1',
    description: '0 ^ 0 = 1',
  },
  pow_add: {
    name: 'pow_add',
    params: ['a', 'm', 'n'],
    lhs: 'a ^ (m + n)',
    rhs: 'a ^ m * a ^ n',
    description: 'a ^ (m + n) = a ^ m * a ^ n',
  },
  mul_pow: {
    name: 'mul_pow',
    params: ['a', 'b', 'n'],
    lhs: '(a * b) ^ n',
    rhs: 'a ^ n * b ^ n',
    description: '(a * b) ^ n = a ^ n * b ^ n',
  },
  pow_pow: {
    name: 'pow_pow',
    params: ['a', 'm', 'n'],
    lhs: '(a ^ m) ^ n',
    rhs: 'a ^ (m * n)',
    description: '(a ^ m) ^ n = a ^ (m * n)',
  },
  one_eq_succ_zero: {
    name: 'one_eq_succ_zero',
    params: [],
    lhs: '1',
    rhs: 'succ 0',
    description: '1 = succ 0',
  },
  two_eq_succ_one: {
    name: 'two_eq_succ_one',
    params: [],
    lhs: '2',
    rhs: 'succ 1',
    description: '2 = succ 1',
  },
  three_eq_succ_two: {
    name: 'three_eq_succ_two',
    params: [],
    lhs: '3',
    rhs: 'succ 2',
    description: '3 = succ 2',
  },
  four_eq_succ_three: {
    name: 'four_eq_succ_three',
    params: [],
    lhs: '4',
    rhs: 'succ 3',
    description: '4 = succ 3',
  },
};

/**
 * Standardize an expression string: normalizes spaces and unicode arrows.
 */
export function cleanExpr(expr: string): string {
  return expr
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/<-\s*/g, '← ')
    .replace(/\s*->\s*/g, ' → ');
}

/**
 * Strips outer balanced parentheses if the whole expression is enclosed in them.
 */
export function stripOuterParens(s: string): string {
  s = s.trim();
  if (!s.startsWith('(') || !s.endsWith(')')) return s;
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') depth++;
    else if (s[i] === ')') depth--;
    if (depth === 0 && i < s.length - 1) return s; // Outer parens don't cover entire string
  }
  return s.slice(1, -1).trim();
}

/**
 * Splits an equality target "LHS = RHS" into [LHS, RHS].
 */
export function splitEquality(target: string): [string, string] | null {
  const clean = cleanExpr(target);
  // Find top-level '='
  let depth = 0;
  for (let i = 0; i < clean.length; i++) {
    if (clean[i] === '(') depth++;
    else if (clean[i] === ')') depth--;
    else if (clean[i] === '=' && depth === 0) {
      if (clean[i - 1] === '<' || clean[i - 1] === '>' || clean[i + 1] === '=') continue;
      const lhs = clean.slice(0, i).trim();
      const rhs = clean.slice(i + 1).trim();
      return [lhs, rhs];
    }
  }
  return null;
}

/**
 * Normalizes a single subexpression (one side of an equality or an atomic expression).
 * Recursively removes redundant parentheses:
 * - Outer parentheses enclosing the entire subexpression: `(a + b)` -> `a + b`
 * - Parentheses around single atomic identifiers or numbers: `(b)` -> `b`, `succ (a)` -> `succ a`
 * - Duplicate nested parentheses: `((a + b))` -> `(a + b)`
 */
export function normalizeSubExpr(expr: string): string {
  let s = cleanExpr(expr);
  if (!s) return s;

  let changed = true;
  let iterations = 0;
  while (changed && iterations < 10) {
    iterations++;
    const prev = s;

    // 1. Strip outer balanced parentheses around the whole expression
    s = stripOuterParens(s);

    // 2. Remove duplicate nested parentheses: ((foo)) -> (foo)
    s = s.replace(/\(\s*(\([^()]+\))\s*\)/g, '$1');

    // 3. Remove parentheses around a single identifier, variable, or number:
    // e.g. "(b)" -> "b", "(0)" -> "0", "a + (b)" -> "a + b", "succ (a)" -> "succ a"
    s = s.replace(/\(\s*([a-zA-Z0-9_]+)\s*\)/g, '$1');

    // 4. Remove parentheses around atomic succ applications ONLY when not preceded by another succ:
    // e.g. "m * (succ 0)" -> "m * succ 0", while preserving "succ (succ 0)"!
    s = s.replace(/(^|[^a-zA-Z0-9_])\(\s*(succ\s+[a-zA-Z0-9_]+)\s*\)/g, (full, prefix, inner, offset, str) => {
      const before = str.slice(0, offset + prefix.length).trimEnd();
      if (/\bsucc$/.test(before)) return full;
      return `${prefix}${inner}`;
    });

    // 5. Remove redundant left-associative parentheses for *:
    // e.g. "(a ^ m * a ^ d) * a" -> "a ^ m * a ^ d * a"
    s = s.replace(/\(([^()+]+)\)\s*\*/g, '$1 *');

    // 6. Remove redundant parentheses around multiplication terms in additive/equality contexts:
    // e.g. "(a * c) + (a * b)" -> "a * c + a * b", while preserving "(a * b) ^ n" and "succ (a * b)"
    s = s.replace(/\(\s*([a-zA-Z0-9_]+(?:\s*\*\s*[a-zA-Z0-9_]+)+)\s*\)/g, (full, inner, offset, str) => {
      const before = str.slice(0, offset).trimEnd();
      const after = str.slice(offset + full.length).trimStart();
      if (/\bsucc$/.test(before) || before.endsWith('^') || after.startsWith('^')) {
        return full;
      }
      return inner;
    });

    changed = s !== prev;
  }

  return cleanExpr(s);
}

/**
 * Normalizes an expression or equality target.
 * If the expression is an equality "LHS = RHS", normalizes both sides independently
 * and strips redundant parentheses from both sides so that "(a + b) = a + (b)" becomes "a + b = a + b".
 */
export function normalizeExpr(expr: string): string {
  const clean = cleanExpr(expr);
  const eq = splitEquality(clean);
  if (eq) {
    const lhs = normalizeSubExpr(eq[0]);
    const rhs = normalizeSubExpr(eq[1]);
    return `${lhs} = ${rhs}`;
  }
  return normalizeSubExpr(clean);
}

/**
 * Checks if two math expressions are syntactically or definitionally equal.
 */
export function exprsMatch(a: string, b: string): boolean {
  const normA = normalizeSubExpr(a);
  const normB = normalizeSubExpr(b);
  if (normA === normB) return true;

  // Simple arithmetic evaluation equality for constants (e.g. 37 = 37, 2 + 2 = 4)
  try {
    const numRegex = /^[0-9\s+*^()-]+$/;
    if (numRegex.test(normA) && numRegex.test(normB)) {
      // safe eval for pure numbers
      const evalA = Function(`"use strict"; return (${normA.replace(/\^/g, '**')})`)();
      const evalB = Function(`"use strict"; return (${normB.replace(/\^/g, '**')})`)();
      if (evalA === evalB) return true;
    }
  } catch {
    // Ignore syntax eval errors
  }

  // Remove redundant whitespace around operators
  const compactA = normA.replace(/\s*([+*^=()])\s*/g, '$1');
  const compactB = normB.replace(/\s*([+*^=()])\s*/g, '$1');
  if (compactA === compactB) return true;

  // Compare without outer parentheses
  const bareA = stripOuterParens(normA).replace(/\s*([+*^=()])\s*/g, '$1');
  const bareB = stripOuterParens(normB).replace(/\s*([+*^=()])\s*/g, '$1');
  if (bareA === bareB) return true;

  // Compare with left-associative parentheses flattened: (a + b) + c == a + b + c, (a * b) * c == a * b * c
  const flattenLeftAssoc = (s: string): string => {
    let prev = '';
    while (prev !== s) {
      prev = s;
      s = s.replace(/\(([^()]+)\)\s*\+/g, '$1 +');
      s = s.replace(/\(([^()+]+)\)\s*\*/g, '$1 *');
    }
    return s.replace(/\s*([+*^=()])\s*/g, '$1');
  };

  return flattenLeftAssoc(normA) === flattenLeftAssoc(normB);
}

/**
 * Pattern-matches and substitutes an equality lemma inside a target expression.
 */
export function applyRewrite(
  expression: string,
  fromPattern: string,
  toPattern: string,
  params: string[] = []
): { rewritten: string; matched: boolean } {
  const cleanTarget = cleanExpr(expression);
  const cleanFrom = cleanExpr(fromPattern);
  const cleanTo = cleanExpr(toPattern);

  // If no params (concrete hypothesis like "h : y = x + 7", "0 ^ 0 = 1", or "2 = succ 1")
  if (params.length === 0) {
    const isWord = /^[a-zA-Z0-9_]+$/.test(cleanFrom);
    let matchIdx = -1;
    let matchLen = cleanFrom.length;

    if (isWord) {
      const wordRegex = new RegExp(`\\b${cleanFrom}\\b`);
      const wordMatch = wordRegex.exec(cleanTarget);
      if (wordMatch) {
        matchIdx = wordMatch.index;
        matchLen = wordMatch[0].length;
      }
    } else {
      matchIdx = cleanTarget.indexOf(cleanFrom);
    }

    // Try with parentheses around cleanFrom if not found yet
    if (matchIdx === -1) {
      const parenFrom = `(${cleanFrom})`;
      matchIdx = cleanTarget.indexOf(parenFrom);
      if (matchIdx !== -1) {
        matchLen = parenFrom.length;
      }
    }

    // Try stripping redundant outer parentheses inside compound patterns, e.g. "(a * b) + (a * c)" -> "a * b + a * c"
    let effectiveTo = cleanTo;
    if (matchIdx === -1 && cleanFrom.includes('(')) {
      const strippedFrom = cleanFrom.replace(/\(\s*([a-zA-Z0-9_]+\s*[*^]\s*[a-zA-Z0-9_]+)\s*\)/g, '$1');
      if (strippedFrom !== cleanFrom) {
        matchIdx = cleanTarget.indexOf(strippedFrom);
        if (matchIdx !== -1) {
          matchLen = strippedFrom.length;
        }
      }
    }

    // Try without outer parentheses on cleanTarget
    if (matchIdx === -1) {
      const strippedTarget = stripOuterParens(cleanTarget);
      if (strippedTarget === cleanFrom || exprsMatch(strippedTarget, cleanFrom)) {
        return { rewritten: normalizeExpr(effectiveTo), matched: true };
      }
      return { rewritten: cleanTarget, matched: false };
    }

    // Check if cleanTo needs parentheses in context (e.g. 2 * y with y := x + 7 -> 2 * (x + 7))
    let replacement = cleanTo;
    let startIdx = matchIdx;
    let endIdx = matchIdx + matchLen;
    const beforeStr = cleanTarget.slice(0, startIdx).trimEnd();
    const afterStr = cleanTarget.slice(endIdx).trimStart();

    const isMultiplicativeContext =
      /[*^/]/.test(beforeStr.slice(-1)) ||
      /[*^/]/.test(afterStr.slice(0, 1)) ||
      beforeStr.endsWith('succ');

    const hasCompoundOps = /[+]/.test(cleanTo) || (cleanTo.includes(' ') && !cleanTo.startsWith('('));
    const alreadyParenthesized =
      (cleanTo.startsWith('(') && cleanTo.endsWith(')')) ||
      (beforeStr.endsWith('(') && afterStr.startsWith(')'));

    if (isMultiplicativeContext && hasCompoundOps && !alreadyParenthesized) {
      replacement = `(${cleanTo})`;
    } else if (
      !isMultiplicativeContext &&
      !hasCompoundOps &&
      startIdx > 0 &&
      cleanTarget[startIdx - 1] === '(' &&
      endIdx < cleanTarget.length &&
      cleanTarget[endIdx] === ')'
    ) {
      startIdx--;
      endIdx++;
    }

    const replaced = cleanTarget.slice(0, startIdx) + replacement + cleanTarget.slice(endIdx);
    return { rewritten: normalizeExpr(replaced), matched: true };
  }

  // Generalized pattern matching with parameters like params = ['a', 'b']
  const { regexStr, paramGroups } = escapeRegexAndBind(cleanFrom, params);
  const regex = new RegExp(regexStr);

  const match = regex.exec(cleanTarget);
  if (match) {
    // Extract bound params
    const bindings: Record<string, string> = {};
    for (const param of params) {
      const gIndices = paramGroups[param] || [];
      let val = '';
      for (const g of gIndices) {
        if (match[g] !== undefined) {
          val = match[g].trim();
          break;
        }
      }
      bindings[param] = val;
    }

    // Construct replacement via simultaneous substitution to avoid collision (e.g. [a := (a + b), b := d])
    let replacement = cleanTo;
    if (params.length > 0) {
      const allParamsRegex = new RegExp(`\\b(${params.join('|')})\\b`, 'g');
      replacement = replacement.replace(allParamsRegex, (_, p) => bindings[p] !== undefined ? bindings[p] : p);
    }

    let startIdx = match.index;
    let endIdx = match.index + match[0].length;

    // If the matched term was enclosed in parentheses, e.g. "(b + 0)", and the replacement
    // does not require parentheses in its context, consume the enclosing parentheses.
    if (
      startIdx > 0 &&
      cleanTarget[startIdx - 1] === '(' &&
      endIdx < cleanTarget.length &&
      cleanTarget[endIdx] === ')'
    ) {
      const beforeParen = cleanTarget.slice(0, startIdx - 1).trimEnd();
      const afterParen = cleanTarget.slice(endIdx + 1).trimStart();
      const isMultiplicative =
        /[*^/]/.test(beforeParen.slice(-1)) ||
        /[*^/]/.test(afterParen.slice(0, 1)) ||
        beforeParen.endsWith('succ');
      const hasCompound = /[+]/.test(replacement) || (replacement.includes(' ') && !replacement.startsWith('('));

      if (!isMultiplicative || !hasCompound) {
        startIdx--;
        endIdx++;
      }
    }

    const replaced = cleanTarget.slice(0, startIdx) + replacement + cleanTarget.slice(endIdx);
    return { rewritten: normalizeExpr(replaced), matched: true };
  }

  // Fallback: Check if target expression itself is the pattern
  return { rewritten: cleanTarget, matched: false };
}

function escapeRegexAndBind(pattern: string, params: string[]): { regexStr: string; paramGroups: Record<string, number[]> } {
  // Tokenize pattern by operators and whitespace
  const tokens = pattern.split(/\s*([+*^()=])\s*|\s+/).filter(Boolean);
  let regexStr = '';
  let groupCount = 0;
  const paramGroups: Record<string, number[]> = {};

  // Matches balanced parens (up to 1 nested level), succ applications, or atomic identifiers/numbers
  const balancedParen = '\\((?:[^()]|\\([^()]*\\))*\\)';
  const argAtom = `(?:${balancedParen}|succ\\s+(?:${balancedParen}|[a-zA-Z0-9_]+)|[a-zA-Z0-9_]+)`;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token === 'succ' && i + 1 < tokens.length && params.includes(tokens[i + 1])) {
      const p = tokens[i + 1];
      const g1 = ++groupCount;
      const g2 = ++groupCount;
      paramGroups[p] = [g1, g2];
      regexStr += `(?:\\(\\s*\\bsucc\\b\\s+(${argAtom})\\s*\\)|\\bsucc\\b\\s+(${argAtom}))`;
      i++;
    } else if (params.includes(token)) {
      const g = ++groupCount;
      paramGroups[token] = [g];
      regexStr += `(${argAtom})`;
    } else if (token === '(' || token === ')') {
      // Grouping parentheses in axioms (e.g. (a + b) + c) can be explicit or implicit in target expressions
      regexStr += '(?:\\s*\\' + token + '\\s*)?';
    } else if (['+', '*', '^', '='].includes(token)) {
      regexStr += '\\s*\\' + token + '\\s*';
    } else {
      regexStr += '\\b' + token + '\\b';
      if (i + 1 < tokens.length && !['+', '*', '^', '(', ')', '='].includes(tokens[i + 1])) {
        regexStr += '\\s+';
      }
    }
  }

  return { regexStr, paramGroups };
}

/**
 * Infers the type of an expression term (identifier or function application)
 * with respect to available hypotheses in the current goal.
 */
export function inferTermType(term: string, hypotheses: Hypothesis[]): string | null {
  term = stripOuterParens(term.trim());
  const hyp = hypotheses.find((h) => h.name === term);
  if (hyp) return hyp.type;

  // Check function application: fn (arg) or fn arg
  const appMatch =
    term.match(/^([a-zA-Z0-9_]+)\s*\((.+)\)$/) ||
    term.match(/^([a-zA-Z0-9_]+)\s+([a-zA-Z0-9_]+)$/);
  if (appMatch) {
    const fnName = appMatch[1].trim();
    const argStr = appMatch[2].trim();
    const fnType = inferTermType(fnName, hypotheses);
    const argType = inferTermType(argStr, hypotheses);
    if (fnType && argType) {
      const arrowMatch = fnType.match(/^(.+?)\s*(?:→|->)\s*(.+)$/);
      if (arrowMatch) {
        const expectedArgType = arrowMatch[1].trim();
        const returnType = arrowMatch[2].trim();
        if (exprsMatch(expectedArgType, argType)) {
          return returnType;
        }
      }
    }
  }
  return null;
}

/**
 * Splits a string by a single-character separator only at parenthesis depth 0.
 */
function splitTopLevelChar(input: string, sep: string): string[] {
  const result: string[] = [];
  let depth = 0;
  let current = '';
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === '(' || ch === '[' || ch === '{') depth++;
    else if (ch === ')' || ch === ']' || ch === '}') depth = Math.max(0, depth - 1);

    if (ch === sep && depth === 0) {
      if (current.trim()) result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) result.push(current.trim());
  return result;
}

/**
 * Splits whitespace-separated arguments at parenthesis depth 0 (preserving "(a * b)" as one token).
 */
function splitTopLevelArgs(input: string): string[] {
  const result: string[] = [];
  let depth = 0;
  let current = '';
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === '(' || ch === '[' || ch === '{') depth++;
    else if (ch === ')' || ch === ']' || ch === '}') depth = Math.max(0, depth - 1);

    if (/\s/.test(ch) && depth === 0) {
      if (current.trim()) result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) result.push(current.trim());
  return result;
}

/**
 * Splits a proposition on top-level implication arrow `→` or `->` into [antecedent, consequent].
 */
function splitTopLevelArrow(input: string): [string, string] | null {
  const clean = cleanExpr(input);
  let depth = 0;
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (ch === '(' || ch === '[' || ch === '{') depth++;
    else if (ch === ')' || ch === ']' || ch === '}') depth = Math.max(0, depth - 1);
    else if (ch === '→' && depth === 0) {
      return [clean.slice(0, i).trim(), clean.slice(i + 1).trim()];
    }
  }
  return null;
}

// ============================================================================
// Multivariate Polynomial Normalizer for sound `ring` and `decide` tactics
// ============================================================================
type Poly = Map<string, number>; // sorted variable product string ("" for constant) -> coefficient

function polyConst(n: number): Poly {
  const m: Poly = new Map();
  if (n !== 0) m.set('', n);
  return m;
}

function polyVar(name: string): Poly {
  const m: Poly = new Map();
  m.set(name, 1);
  return m;
}

function polyAdd(a: Poly, b: Poly): Poly {
  const res: Poly = new Map(a);
  for (const [k, v] of b.entries()) {
    const next = (res.get(k) || 0) + v;
    if (next === 0) res.delete(k);
    else res.set(k, next);
  }
  return res;
}

function multiplyMonomials(m1: string, m2: string): string {
  if (!m1) return m2;
  if (!m2) return m1;
  return [...m1.split('*'), ...m2.split('*')].sort().join('*');
}

function polyMul(a: Poly, b: Poly): Poly {
  const res: Poly = new Map();
  for (const [k1, v1] of a.entries()) {
    for (const [k2, v2] of b.entries()) {
      const k = multiplyMonomials(k1, k2);
      const next = (res.get(k) || 0) + v1 * v2;
      if (next === 0) res.delete(k);
      else res.set(k, next);
    }
  }
  return res;
}

function polyPow(base: Poly, exp: number): Poly | null {
  if (!Number.isInteger(exp) || exp < 0 || exp > 20) return null;
  let res = polyConst(1);
  for (let i = 0; i < exp; i++) {
    res = polyMul(res, base);
  }
  return res;
}

function polysEqual(a: Poly, b: Poly): boolean {
  if (a.size !== b.size) return false;
  for (const [k, v] of a.entries()) {
    if (b.get(k) !== v) return false;
  }
  return true;
}

function polyToGroundNumber(p: Poly): number | null {
  for (const k of p.keys()) {
    if (k !== '') return null;
  }
  return p.get('') || 0;
}

function parsePolyExpr(expr: string): { poly: Poly; hasVars: boolean } | null {
  const tokens = cleanExpr(expr).match(/succ|\d+|[a-zA-Z_][a-zA-Z0-9_]*|[+*^()]/g);
  if (!tokens) return null;
  let pos = 0;
  let hasVars = false;

  const peek = () => tokens[pos];
  const consume = () => tokens[pos++];

  const parseAdd = (): Poly | null => {
    let left = parseMul();
    if (!left) return null;
    while (peek() === '+') {
      consume();
      const right = parseMul();
      if (!right) return null;
      left = polyAdd(left, right);
    }
    return left;
  };

  const parseMul = (): Poly | null => {
    let left = parsePow();
    if (!left) return null;
    while (peek() === '*') {
      consume();
      const right = parsePow();
      if (!right) return null;
      left = polyMul(left, right);
    }
    return left;
  };

  const parsePow = (): Poly | null => {
    const base = parseAtom();
    if (!base) return null;
    if (peek() === '^') {
      consume();
      const expPoly = parsePow();
      if (!expPoly) return null;
      const expVal = polyToGroundNumber(expPoly);
      if (expVal === null) return null; // Non-constant exponent isn't a ring polynomial
      return polyPow(base, expVal);
    }
    return base;
  };

  const parseAtom = (): Poly | null => {
    const tok = peek();
    if (!tok) return null;
    if (tok === '(') {
      consume();
      const inner = parseAdd();
      if (!inner || peek() !== ')') return null;
      consume();
      return inner;
    }
    if (tok === 'succ') {
      consume();
      const inner = parseAtom();
      if (!inner) return null;
      return polyAdd(inner, polyConst(1));
    }
    if (/^\d+$/.test(tok)) {
      consume();
      return polyConst(parseInt(tok, 10));
    }
    if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tok)) {
      consume();
      hasVars = true;
      return polyVar(tok);
    }
    return null;
  };

  const poly = parseAdd();
  if (!poly || pos !== tokens.length) return null;
  return { poly, hasVars };
}

interface TacticStepOutcome {
  ok: boolean;
  closedGoal?: boolean;
  message?: string;
  errorMessage?: string;
}

function executeSingleTactic(
  line: string,
  currentGoals: GoalState[],
  allLemmas: Record<string, LemmaDef>
): TacticStepOutcome {
  const activeGoal = currentGoals[0];

  // 1. TACTIC: rfl
  if (line === 'rfl') {
    const eq = splitEquality(activeGoal.target);
    if (eq) {
      const [lhs, rhs] = eq;
      if (exprsMatch(lhs, rhs)) {
        currentGoals.shift();
        return { ok: true, closedGoal: true, message: 'Goal solved by reflexivity!' };
      }
      return {
        ok: false,
        errorMessage: `tactic 'rfl' failed: LHS '${lhs}' is not definitionally equal to RHS '${rhs}'`,
      };
    }

    const leMatch = activeGoal.target.match(/^(.+?)\s*(?:≤|<=)\s*(.+)$/);
    if (leMatch) {
      const lhs = leMatch[1].trim();
      const rhs = leMatch[2].trim();
      if (exprsMatch(lhs, rhs)) {
        currentGoals.shift();
        return { ok: true, closedGoal: true, message: 'Goal solved by reflexivity of ≤ (le_refl)!' };
      }
      return {
        ok: false,
        errorMessage: `tactic 'rfl' failed: '${lhs}' is not definitionally equal to '${rhs}'`,
      };
    }

    return {
      ok: false,
      errorMessage: `tactic 'rfl' failed: target is not an equality or reflexive relation: ${activeGoal.target}`,
    };
  }

  // 2. TACTIC: rw [ ... ] (at hyp)?
  const rwMatch = line.match(/^rw\s*\[(.*?)\](?:\s+at\s+([a-zA-Z0-9_]+))?$/);
  if (rwMatch) {
    const rawRules = splitTopLevelChar(rwMatch[1], ',');
    const atHypothesis = rwMatch[2]?.trim();

    if (rawRules.length === 0) {
      return {
        ok: false,
        errorMessage: "Syntax error: 'rw' requires at least one rewrite rule inside brackets [ ].",
      };
    }

    const targetExpr = atHypothesis
      ? activeGoal.hypotheses.find((h) => h.name === atHypothesis)?.type
      : activeGoal.target;

    if (atHypothesis && !targetExpr) {
      return {
        ok: false,
        errorMessage: `Unknown hypothesis '${atHypothesis}' specified in 'at ${atHypothesis}'`,
      };
    }

    let currentExpr = targetExpr!;

    for (const rule of rawRules) {
      const isReversed = rule.startsWith('←') || rule.startsWith('<-');
      const cleanRule = rule.replace(/^[←<-]\s*/, '').trim();

      const ruleTokens = splitTopLevelArgs(cleanRule);
      const lemmaName = ruleTokens[0];
      const explicitArgs = ruleTokens.slice(1);

      let fromTerm = '';
      let toTerm = '';
      let params: string[] = [];

      const hyp = activeGoal.hypotheses.find((h) => h.name === lemmaName);
      if (hyp) {
        if (explicitArgs.length > 0) {
          return {
            ok: false,
            errorMessage: `Hypothesis '${lemmaName}' does not take explicit arguments`,
          };
        }
        const split = splitEquality(hyp.type);
        if (split) {
          fromTerm = isReversed ? split[1] : split[0];
          toTerm = isReversed ? split[0] : split[1];
        } else {
          return {
            ok: false,
            errorMessage: `Hypothesis '${cleanRule}' is not an equality and cannot be used for 'rw'`,
          };
        }
      } else if (allLemmas[lemmaName]) {
        const lemma = allLemmas[lemmaName];
        const lFrom = isReversed ? lemma.rhs : lemma.lhs;
        const lTo = isReversed ? lemma.lhs : lemma.rhs;

        if (explicitArgs.length > 0) {
          const argBindings: Record<string, string> = {};
          explicitArgs.forEach((arg, i) => {
            if (i < lemma.params.length) {
              argBindings[lemma.params[i]] = arg;
            }
          });
          const argRegex = new RegExp(`\\b(${Object.keys(argBindings).join('|')})\\b`, 'g');
          fromTerm = lFrom.replace(argRegex, (_, p) => argBindings[p]);
          toTerm = lTo.replace(argRegex, (_, p) => argBindings[p]);
          params = lemma.params.slice(explicitArgs.length);
        } else {
          fromTerm = lFrom;
          toTerm = lTo;
          params = lemma.params;
        }
      } else {
        return {
          ok: false,
          errorMessage: `Unknown identifier '${cleanRule}'. Have you unlocked or defined this lemma?`,
        };
      }

      const rwResult = applyRewrite(currentExpr, fromTerm, toTerm, params);
      if (!rwResult.matched) {
        return {
          ok: false,
          errorMessage: `tactic 'rewrite' failed: did not find instance of '${fromTerm}' in '${currentExpr}'`,
        };
      }

      currentExpr = rwResult.rewritten;
    }

    if (atHypothesis) {
      const targetHyp = activeGoal.hypotheses.find((h) => h.name === atHypothesis)!;
      targetHyp.type = normalizeExpr(currentExpr);
    } else {
      activeGoal.target = normalizeExpr(currentExpr);
    }

    return {
      ok: true,
      message: `Rewrote successfully. New target: ${activeGoal.target}`,
    };
  }

  // 3. TACTIC: induction n with d hd OR induction n
  const inductionMatch = line.match(/^induction\s+([a-zA-Z0-9_]+)(?:\s+with\s+([a-zA-Z0-9_]+)\s+([a-zA-Z0-9_]+))?$/);
  if (inductionMatch) {
    const varName = inductionMatch[1];
    const dVar = inductionMatch[2] || 'd';
    const hdVar = inductionMatch[3] || 'hd';

    const varHyp = activeGoal.hypotheses.find((h) => h.name === varName);
    const appearsInTarget = new RegExp(`\\b${varName}\\b`).test(activeGoal.target);

    if (!varHyp && !appearsInTarget) {
      return {
        ok: false,
        errorMessage: `Unknown variable '${varName}' for tactic 'induction'`,
      };
    }
    if (varHyp && varHyp.type !== 'ℕ' && varHyp.type !== 'Nat' && varHyp.type !== 'MyNat') {
      return {
        ok: false,
        errorMessage: `Cannot perform natural number induction on '${varName}' of type '${varHyp.type}'`,
      };
    }

    const origTarget = activeGoal.target;
    const baseHypotheses = [...activeGoal.hypotheses];

    const baseTarget = origTarget.replace(new RegExp(`\\b${varName}\\b`, 'g'), '0');
    const baseGoal: GoalState = {
      id: `${activeGoal.id}_base`,
      name: `Base Case (${varName} = 0)`,
      hypotheses: baseHypotheses.filter((h) => h.name !== varName),
      target: normalizeExpr(baseTarget),
    };

    const ihTarget = origTarget.replace(new RegExp(`\\b${varName}\\b`, 'g'), dVar);
    // Preserve parentheses around succ d when already an argument to succ
    const stepTarget = origTarget
      .replace(new RegExp(`\\bsucc\\s+${varName}\\b`, 'g'), `succ (succ ${dVar})`)
      .replace(new RegExp(`\\b${varName}\\b`, 'g'), `succ ${dVar}`);

    const stepHypotheses: Hypothesis[] = [
      ...baseHypotheses.filter((h) => h.name !== varName),
      { id: `var_${dVar}`, name: dVar, type: 'ℕ', isVariable: true },
      { id: `hyp_${hdVar}`, name: hdVar, type: normalizeExpr(ihTarget) },
    ];

    const stepGoal: GoalState = {
      id: `${activeGoal.id}_step`,
      name: `Inductive Step (${varName} = succ ${dVar})`,
      hypotheses: stepHypotheses,
      target: normalizeExpr(stepTarget),
    };

    currentGoals.splice(0, 1, baseGoal, stepGoal);
    return {
      ok: true,
      message: `Induction applied on '${varName}'. Split into Base Case and Inductive Step.`,
    };
  }

  // 4. TACTIC: exact <term>
  const exactMatch = line.match(/^exact\s+(.+)$/);
  if (exactMatch) {
    const term = exactMatch[1].trim();
    const inferredType = inferTermType(term, activeGoal.hypotheses);

    if (!inferredType) {
      return {
        ok: false,
        errorMessage: `Unknown or untypable term '${term}' for tactic 'exact'`,
      };
    }

    if (exprsMatch(inferredType, activeGoal.target)) {
      currentGoals.shift();
      return { ok: true, closedGoal: true, message: `Closed goal using exact ${term}!` };
    }

    return {
      ok: false,
      errorMessage: `Type mismatch for 'exact ${term}': term has type '${inferredType}', but expected target is '${activeGoal.target}'`,
    };
  }

  // 4.5. TACTIC: apply <hyp>
  const applyMatch = line.match(/^apply\s+([a-zA-Z0-9_]+)$/);
  if (applyMatch) {
    const hypName = applyMatch[1].trim();
    const hyp = activeGoal.hypotheses.find((h) => h.name === hypName);
    if (!hyp) {
      return {
        ok: false,
        errorMessage: `Unknown hypothesis '${hypName}' for tactic 'apply'`,
      };
    }

    const arrow = splitTopLevelArrow(hyp.type);
    if (arrow) {
      const [antecedent, consequent] = arrow;
      if (exprsMatch(consequent, activeGoal.target)) {
        activeGoal.target = antecedent;
        return {
          ok: true,
          message: `Applied ${hypName}. New target: ${activeGoal.target}`,
        };
      }
    }

    return {
      ok: false,
      errorMessage: `Cannot apply '${hypName}' of type '${hyp.type}' to target '${activeGoal.target}'`,
    };
  }

  // 5. TACTIC: intro <names...>
  const introMatch = line.match(/^intro\s+(.+)$/);
  if (introMatch) {
    const names = introMatch[1].split(/\s+/).filter(Boolean);
    let target = cleanExpr(activeGoal.target);
    const addedHyps: Hypothesis[] = [];

    for (const name of names) {
      const arrow = splitTopLevelArrow(target);
      if (arrow) {
        const [antecedent, consequent] = arrow;
        target = consequent;
        addedHyps.push({
          id: `hyp_${name}`,
          name,
          type: antecedent,
        });
      } else if (target.startsWith('∀')) {
        const forallMatch = target.match(/^∀\s*\(?([a-zA-Z0-9_]+)(?:\s*:\s*([^)]+))?\)?\s*,\s*(.+)$/);
        if (forallMatch) {
          const varType = forallMatch[2]?.trim() || 'ℕ';
          target = forallMatch[3].trim();
          addedHyps.push({
            id: `var_${name}`,
            name,
            type: varType,
            isVariable: true,
          });
        } else {
          return {
            ok: false,
            errorMessage: `tactic 'intro' failed: malformed universal quantifier '${target}'`,
          };
        }
      } else {
        return {
          ok: false,
          errorMessage: `tactic 'intro' failed: goal '${target}' has no remaining implication (→) or universal quantifier (∀)`,
        };
      }
    }

    activeGoal.hypotheses.push(...addedHyps);
    activeGoal.target = cleanExpr(target);
    return {
      ok: true,
      message: `Introduced assumptions. New target: ${activeGoal.target}`,
    };
  }

  // 6. TACTIC: ring (Sound Multivariate Polynomial Equality Checker)
  if (line === 'ring') {
    const eq = splitEquality(activeGoal.target);
    if (!eq) {
      return {
        ok: false,
        errorMessage: `tactic 'ring' failed: target '${activeGoal.target}' is not an equality`,
      };
    }
    const [lhs, rhs] = eq;
    const pLhs = parsePolyExpr(lhs);
    const pRhs = parsePolyExpr(rhs);
    if (!pLhs || !pRhs) {
      return {
        ok: false,
        errorMessage: `tactic 'ring' failed: expression is not a valid semiring polynomial over ℕ`,
      };
    }
    if (polysEqual(pLhs.poly, pRhs.poly)) {
      currentGoals.shift();
      return { ok: true, closedGoal: true, message: "Solved algebraic identity with 'ring'!" };
    }
    return {
      ok: false,
      errorMessage: `tactic 'ring' failed: '${lhs}' and '${rhs}' are not algebraically equal`,
    };
  }

  // 7. TACTIC: decide (Sound Ground Arithmetic Decision Procedure)
  if (line === 'decide') {
    const eq = splitEquality(activeGoal.target);
    if (eq) {
      const [lhs, rhs] = eq;
      const pLhs = parsePolyExpr(lhs);
      const pRhs = parsePolyExpr(rhs);
      if (!pLhs || !pRhs || pLhs.hasVars || pRhs.hasVars) {
        return {
          ok: false,
          errorMessage: `tactic 'decide' failed: goal '${activeGoal.target}' contains free variables or non-computable terms`,
        };
      }
      const valA = polyToGroundNumber(pLhs.poly);
      const valB = polyToGroundNumber(pRhs.poly);
      if (valA !== null && valB !== null && valA === valB) {
        currentGoals.shift();
        return { ok: true, closedGoal: true, message: "Decided ground equality with 'decide'!" };
      }
      return {
        ok: false,
        errorMessage: `tactic 'decide' failed: ${lhs} (${valA}) ≠ ${rhs} (${valB})`,
      };
    }

    const leMatch = activeGoal.target.match(/^(.+?)\s*(≤|<=|<)\s*(.+)$/);
    if (leMatch) {
      const lhs = leMatch[1].trim();
      const op = leMatch[2];
      const rhs = leMatch[3].trim();
      const pLhs = parsePolyExpr(lhs);
      const pRhs = parsePolyExpr(rhs);
      if (!pLhs || !pRhs || pLhs.hasVars || pRhs.hasVars) {
        return {
          ok: false,
          errorMessage: `tactic 'decide' failed: goal contains free variables`,
        };
      }
      const valA = polyToGroundNumber(pLhs.poly)!;
      const valB = polyToGroundNumber(pRhs.poly)!;
      const holds = op === '<' ? valA < valB : valA <= valB;
      if (holds) {
        currentGoals.shift();
        return { ok: true, closedGoal: true, message: "Decided ground inequality with 'decide'!" };
      }
      return {
        ok: false,
        errorMessage: `tactic 'decide' failed: ${valA} ${op} ${valB} is false`,
      };
    }

    return {
      ok: false,
      errorMessage: `tactic 'decide' failed: unsupported goal '${activeGoal.target}'`,
    };
  }

  // 8. TACTIC: simp (Rule-based Peano simplification + definitional reflexivity check)
  if (line === 'simp') {
    const simpLemmaNames = [
      'add_zero',
      'zero_add',
      'mul_zero',
      'zero_mul',
      'mul_one',
      'one_mul',
      'pow_zero',
      'pow_one',
      'one_pow',
    ];
    let expr = activeGoal.target;
    let madeProgress = false;

    for (let iter = 0; iter < 50; iter++) {
      let stepChanged = false;
      for (const name of simpLemmaNames) {
        const lemma = allLemmas[name];
        if (!lemma) continue;
        const rwRes = applyRewrite(expr, lemma.lhs, lemma.rhs, lemma.params);
        if (rwRes.matched && rwRes.rewritten !== expr) {
          expr = rwRes.rewritten;
          stepChanged = true;
          madeProgress = true;
          break;
        }
      }
      if (!stepChanged) break;
    }

    activeGoal.target = normalizeExpr(expr);
    const eq = splitEquality(activeGoal.target);
    if (eq && exprsMatch(eq[0], eq[1])) {
      currentGoals.shift();
      return { ok: true, closedGoal: true, message: "Simplified and closed goal with 'simp'!" };
    }
    const leMatch = activeGoal.target.match(/^(.+?)\s*(?:≤|<=)\s*(.+)$/);
    if (leMatch && exprsMatch(leMatch[1], leMatch[2])) {
      currentGoals.shift();
      return { ok: true, closedGoal: true, message: "Simplified and closed inequality with 'simp'!" };
    }

    if (madeProgress) {
      return {
        ok: true,
        message: `Simplified target to: ${activeGoal.target}`,
      };
    }

    return {
      ok: false,
      errorMessage: "tactic 'simp' failed: made no progress",
    };
  }

  // Unrecognized tactic
  return {
    ok: false,
    errorMessage: `Unknown or unsupported tactic: '${line}'. Valid tactics include: rfl, rw [lemma], repeat <tactic>, induction n with d hd, exact h, intro h, apply h, simp, ring, decide.`,
  };
}

/**
 * Execute a complete Lean 4 proof script against a level's initial state.
 */
export function verifyProof(
  proofCode: string,
  initialGoals: GoalState[],
  unlockedTheorems: Record<string, LemmaDef> = {}
): ProofResult {
  const lines = proofCode.split('\n');
  const allLemmas: Record<string, LemmaDef> = { ...KNOWN_LEMMAS, ...unlockedTheorems };

  const currentGoals: GoalState[] = JSON.parse(JSON.stringify(initialGoals));
  const stepLogs: StepLog[] = [];

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const rawLine = lines[lineIndex];
    let line = rawLine.trim();

    // Skip empty lines and full line comments
    if (!line || line.startsWith('--') || line.startsWith('/-')) {
      continue;
    }

    // Strip inline comments
    if (line.includes('--')) {
      line = line.split('--')[0].trim();
      if (!line) continue;
    }

    // Handle bullets: · or . or *
    if (line.startsWith('·') || line.startsWith('.') || line.startsWith('*')) {
      line = line.slice(1).trim();
      if (!line) continue;
    }

    // Handle case branches: | zero => ... or | succ d hd => ...
    if (line.startsWith('|')) {
      const caseMatch = line.match(/^\|\s*(zero|succ(?:\s+[a-zA-Z0-9_]+)*)\s*=>/);
      if (caseMatch) {
        const rest = line.replace(/^\|\s*(zero|succ(?:\s+[a-zA-Z0-9_]+)*)\s*=>\s*/, '').trim();
        if (!rest) continue;
        line = rest;
      }
    }

    // Check if goals are already empty
    if (currentGoals.length === 0) {
      if (line === 'rfl') {
        stepLogs.push({
          line: lineIndex + 1,
          tactic: line,
          success: true,
          message: 'All goals closed!',
          goalsRemaining: [],
        });
        continue;
      }
      return {
        isComplete: true,
        currentGoals: [],
        stepLogs,
        error: {
          line: lineIndex + 1,
          message: 'Extra tactic found after all goals were already closed.',
        },
      };
    }

    // Combinator: repeat <tactic>
    const repeatMatch = line.match(/^repeat\s+(.+)$/);
    if (repeatMatch) {
      const innerTactic = repeatMatch[1].trim();
      if (!innerTactic) {
        return {
          isComplete: false,
          currentGoals,
          stepLogs,
          error: {
            line: lineIndex + 1,
            message: "Syntax error: 'repeat' requires a tactic argument (e.g. repeat rw [add_zero]).",
          },
        };
      }

      const seenStates = new Set<string>();
      let count = 0;

      while (currentGoals.length > 0 && count < 30) {
        const snapshotKey = JSON.stringify(currentGoals[0]);
        if (seenStates.has(snapshotKey)) break;
        seenStates.add(snapshotKey);

        // Execute on a cloned goal snapshot so a failed repeat termination leaves state clean
        const probeGoals: GoalState[] = JSON.parse(JSON.stringify(currentGoals));
        const res = executeSingleTactic(innerTactic, probeGoals, allLemmas);
        if (!res.ok) break;

        currentGoals.splice(0, currentGoals.length, ...probeGoals);
        count++;
      }

      stepLogs.push({
        line: lineIndex + 1,
        tactic: line,
        success: true,
        message:
          count > 0
            ? `Repeated '${innerTactic}' ${count} time${count > 1 ? 's' : ''}.`
            : `'repeat ${innerTactic}' finished (0 applications).`,
        goalsRemaining: JSON.parse(JSON.stringify(currentGoals)),
      });
      continue;
    }

    const outcome = executeSingleTactic(line, currentGoals, allLemmas);
    if (!outcome.ok) {
      return {
        isComplete: false,
        currentGoals,
        stepLogs,
        error: {
          line: lineIndex + 1,
          message: outcome.errorMessage || 'Tactic failed.',
        },
      };
    }

    stepLogs.push({
      line: lineIndex + 1,
      tactic: line,
      success: true,
      message: outcome.message,
      goalsRemaining: JSON.parse(JSON.stringify(currentGoals)),
    });
  }

  return {
    isComplete: currentGoals.length === 0,
    currentGoals,
    stepLogs,
  };
}

/**
 * Parses Lean 4 theorem declarations (e.g. "theorem my_thm (a b : ℕ) : a + b = b + a")
 * or plain mathematical equalities into a structured goal state for Freeplay mode.
 */
export function parseTheoremDeclaration(statement: string): {
  name: string;
  hypotheses: Hypothesis[];
  target: string;
  statement: string;
} {
  const clean = cleanExpr(statement);

  // Check if starts with theorem / lemma / example
  const headerMatch = clean.match(/^(theorem|lemma|example)\b\s*(.*)$/);
  if (headerMatch) {
    const keyword = headerMatch[1];
    let rest = headerMatch[2].trim();
    let rawName = 'freeplay_thm';

    // Extract optional theorem/lemma name before params or colon
    if (keyword !== 'example') {
      const nameMatch = rest.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*(.*)$/);
      if (nameMatch) {
        rawName = nameMatch[1];
        rest = nameMatch[2].trim();
      }
    }

    // Find the first top-level ':' (at paren depth 0) separating binders from target
    let depth = 0;
    let topColonIdx = -1;
    for (let i = 0; i < rest.length; i++) {
      const ch = rest[i];
      if (ch === '(' || ch === '[' || ch === '{') depth++;
      else if (ch === ')' || ch === ']' || ch === '}') depth = Math.max(0, depth - 1);
      else if (ch === ':' && depth === 0) {
        topColonIdx = i;
        break;
      }
    }

    if (topColonIdx !== -1) {
      const paramsStr = rest.slice(0, topColonIdx).trim();
      const target = rest.slice(topColonIdx + 1).trim();
      const hypotheses: Hypothesis[] = [];

      // Parse all (...) binder groups
      const parenRegex = /\(([^)]+)\)/g;
      let m;
      while ((m = parenRegex.exec(paramsStr)) !== null) {
        const inside = m[1].trim();
        const colonIdx = inside.indexOf(':');
        if (colonIdx !== -1) {
          const identifiers = inside.slice(0, colonIdx).trim().split(/\s+/).filter(Boolean);
          const typeStr = inside.slice(colonIdx + 1).trim();

          if (typeStr === 'ℕ' || typeStr === 'Nat' || typeStr === 'MyNat') {
            for (const id of identifiers) {
              hypotheses.push({
                id: `var_${id}`,
                name: id,
                type: 'ℕ',
                isVariable: true,
              });
            }
          } else {
            for (const hypName of identifiers) {
              hypotheses.push({
                id: `hyp_${hypName}`,
                name: hypName,
                type: typeStr,
              });
            }
          }
        }
      }

      return {
        name: rawName,
        hypotheses,
        target,
        statement: clean,
      };
    }
  }

  // Fallback: If user entered an equality "a + b = b + a" directly
  const eq = splitEquality(clean);
  if (eq) {
    const varMatches = clean.match(/\b[a-zA-Z]\b/g);
    const uniqueVars = Array.from(new Set(varMatches || [])).filter(
      (v) => v !== 's' && v !== 'u' && v !== 'c'
    );
    const hypotheses: Hypothesis[] = uniqueVars.map((v) => ({
      id: `var_${v}`,
      name: v,
      type: 'ℕ',
      isVariable: true,
    }));

    return {
      name: 'freeplay_thm',
      hypotheses,
      target: clean,
      statement: `theorem freeplay_thm (${uniqueVars.join(' ')} : ℕ) : ${clean}`,
    };
  }

  return {
    name: 'freeplay_thm',
    hypotheses: [{ id: 'v_a', name: 'a', type: 'ℕ', isVariable: true }],
    target: clean || 'a + 0 = a',
    statement: `example (a : ℕ) : ${clean || 'a + 0 = a'}`,
  };
}
