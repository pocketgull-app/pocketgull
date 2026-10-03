import { describe, it, expect } from 'vitest';
// @ts-ignore - braces does not provide TypeScript types in dev
import braces from 'braces';

describe('CVE-2026-93687 AST Depth Guard & Braces Sandboxing', () => {
  it('correctly expands normal bash-like brace patterns', () => {
    const result = braces('src/{components,services}/*.ts');
    expect(result).toEqual(['src/(components|services)/*.ts']);

    const expanded = braces('src/{components,services}/*.ts', { expand: true });
    expect(expanded).toEqual(['src/components/*.ts', 'src/services/*.ts']);
  });

  it('allows safe, moderately nested brace patterns (<250 levels)', () => {
    // 5 levels of nesting
    const moderate = '{a,{b,{c,{d,e}}}}';
    expect(() => braces(moderate)).not.toThrow();
  });

  it('safely throws a SyntaxError on deeply nested patterns (>=250) to prevent stack exhaustion DoS', () => {
    // Attempt attack with 300 nested brace levels
    const attackPayload = '{a,'.repeat(300) + 'b' + '}'.repeat(300);

    expect(() => {
      braces(attackPayload);
    }).toThrowError(/Exceeded maximum brace nesting depth/);

    expect(() => {
      braces(attackPayload, { expand: true });
    }).toThrowError(/Exceeded maximum brace nesting depth/);
  });
});
