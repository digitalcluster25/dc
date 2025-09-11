import { cn } from '../utils';

describe('cn utility function', () => {
  it('merges class names correctly', () => {
    const result = cn('class1', 'class2');
    expect(result).toBe('class1 class2');
  });

  it('handles conditional classes', () => {
    const result = cn('base', true && 'conditional', false && 'hidden');
    expect(result).toBe('base conditional');
  });

  it('handles undefined and null values', () => {
    const result = cn('base', undefined, null, 'valid');
    expect(result).toBe('base valid');
  });

  it('handles empty strings', () => {
    const result = cn('base', '', 'valid');
    expect(result).toBe('base valid');
  });

  it('handles arrays of classes', () => {
    const result = cn(['class1', 'class2'], 'class3');
    expect(result).toBe('class1 class2 class3');
  });

  it('handles objects with boolean values', () => {
    const result = cn({
      class1: true,
      class2: false,
      class3: true,
    });
    expect(result).toBe('class1 class3');
  });

  it('merges Tailwind classes correctly', () => {
    const result = cn('px-4 py-2', 'px-6');
    expect(result).toBe('py-2 px-6');
  });

  it('handles complex combinations', () => {
    const result = cn(
      'base-class',
      true && 'conditional-class',
      false && 'hidden-class',
      ['array-class1', 'array-class2'],
      { 'object-class': true, 'object-hidden': false },
      'px-4 py-2',
      'px-6 py-3'
    );
    expect(result).toBe(
      'base-class conditional-class array-class1 array-class2 object-class px-6 py-3'
    );
  });
});
