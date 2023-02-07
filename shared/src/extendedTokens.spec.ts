import { getExtendedTokens } from './index'
import { ErrorType, ExtendedFormulaEntry } from './types'

const supportedRefs = ['d']

const tests: [Record<string, string>, Record<string, Partial<ExtendedFormulaEntry>>][] = []

tests.push([{
  a: '{b} + {c}',
  b: '1',
  c: '{d}'
}, {
  a: { order: 2, dependencies: ['b', 'c'] },
  b: { order: 1 },
  c: { order: 1, dependencies: [] }
}])

tests.push([{
  a: '{a}'
}, {
  a: { order: 0, dependencies: ['a'], validationErrors: [{ errorType: ErrorType.CircularReferenceToItself }] }
}])

tests.push([{
  a: '{b}',
  b: '{c}',
  c: '{b}'
}, {
  a: { order: 0, dependencies: ['b', 'c'], validationErrors: [{ errorType: ErrorType.DependsOnInvalid }] },
  b: { order: 0, dependencies: ['b', 'c'], validationErrors: [{ errorType: ErrorType.CircularReference }] },
  c: { order: 0, dependencies: ['b', 'c'], validationErrors: [{ errorType: ErrorType.CircularReference }] }
}])

tests.push([{
  a: '{d}',
  b: '{c}',
  c: '1',
  e: '{f}',
  f: '}"'
}, {
  a: { order: 1 },
  b: { order: 2, dependencies: ['c'] },
  c: { order: 1 },
  e: { order: 2, dependencies: ['f'], validationErrors: [{ errorType: ErrorType.DependsOnInvalid }] },
  f: { order: 1, validationErrors: [{ errorType: ErrorType.UnexpectedReferenceBracket }, { errorType: ErrorType.OperatorRequiredBeforeQuote }, { errorType: ErrorType.UnclosedDoubleQuote }] }
}])

tests.push([{
  a: '{b}',
  b: '{c}',
  c: '{b}'
}, {
  a: { order: 0, dependencies: ['b', 'c'], validationErrors: [{ errorType: ErrorType.DependsOnInvalid }] },
  b: { order: 0, dependencies: ['b', 'c'], validationErrors: [{ errorType: ErrorType.CircularReference }] },
  c: { order: 0, dependencies: ['b', 'c'], validationErrors: [{ errorType: ErrorType.CircularReference }] }
}])

describe('ExtendedTokens', () => {
  test.each(tests)('should prepare extended formula entries for %s as %s', (formulasByRefs, entriesByRefs) => {
    const result = getExtendedTokens(formulasByRefs, supportedRefs)
    Object.keys(result).forEach((referenceName) => {
      expect(result[referenceName]?.dependencies || []).toEqual(entriesByRefs[referenceName]?.dependencies || [])
      expect(result[referenceName]?.order).toEqual(entriesByRefs[referenceName]?.order)
      expect(result[referenceName]?.validationErrors?.map(({ errorType }) => errorType) || []).toEqual(entriesByRefs[referenceName]?.validationErrors?.map(({ errorType }) => errorType) || [])
    })
  })
})

const testsNoRefs: [Record<string, string>, Record<string, Partial<ExtendedFormulaEntry>>][] = []
testsNoRefs.push([{
  a: '{b} + {c}',
  b: '1',
  c: '{d}'
}, {
  a: { order: 2, dependencies: ['b', 'c'], validationErrors: [{ errorType: ErrorType.DependsOnInvalid }] },
  b: { order: 1 },
  c: { order: 1, dependencies: [], validationErrors: [{ errorType: ErrorType.UnsupportedReferenceName }] }
}])

describe('ExtendedTokens without supported refs', () => {
  test.each(testsNoRefs)('should prepare extended formula entries for %s as %s', (formulasByRefs, entriesByRefs) => {
    const result = getExtendedTokens(formulasByRefs)
    Object.keys(result).forEach((referenceName) => {
      expect(result[referenceName]?.dependencies || []).toEqual(entriesByRefs[referenceName]?.dependencies || [])
      expect(result[referenceName]?.order).toEqual(entriesByRefs[referenceName]?.order)
      expect(result[referenceName]?.validationErrors?.map(({ errorType }) => errorType) || []).toEqual(entriesByRefs[referenceName]?.validationErrors?.map(({ errorType }) => errorType) || [])
    })
  })
})
