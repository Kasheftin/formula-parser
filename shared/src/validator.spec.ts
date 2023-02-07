import { ErrorType, Token, TokenType, ValidationError } from './types'
import { CircularReferencesValidator, Validator } from './validator'
import { getTokens } from './index'

const tests: [string, ErrorType[]][] = []
tests.push(['1 + 2', []])
tests.push([' + 2', []])
tests.push(['-(-round({x}))', []])
tests.push(['-(-invalidFunctionName({x}))', [ErrorType.InvalidFunction]])
tests.push(['*2', [ErrorType.UnexpectedOperator]])
tests.push(['{x} + ', [ErrorType.ValueRequiredAfterOperator]])
tests.push(['5 5', [ErrorType.OperatorRequiredBeforeNumber]])
tests.push(['5 "asd"', [ErrorType.OperatorRequiredBeforeQuote]])
tests.push(['5 \'asd\'', [ErrorType.OperatorRequiredBeforeQuote]])
tests.push(['5 "asd', [ErrorType.OperatorRequiredBeforeQuote, ErrorType.UnclosedDoubleQuote]])
tests.push(['5 \'asd', [ErrorType.OperatorRequiredBeforeQuote, ErrorType.UnclosedQuote]])
tests.push(['5 \'', [ErrorType.OperatorRequiredBeforeQuote, ErrorType.UnclosedQuote]])
tests.push(['sin() round(floor(5))', [ErrorType.InvalidFunction, ErrorType.OperatorRequiredBeforeFunction]])
tests.push(['5,6', [ErrorType.UnexpectedComma]])
tests.push(['round(,4)', [ErrorType.UnexpectedComma]])
tests.push(['round(4,)', [ErrorType.UnexpectedBracket]])
tests.push(['round())', [ErrorType.UnexpectedBracket]])
tests.push(['min', [ErrorType.InvalidCharacter, ErrorType.InvalidCharacter, ErrorType.InvalidCharacter]])
tests.push(['4 ()', [ErrorType.OperatorRequiredBeforeBracket]])
tests.push(['() + () - 1', []])
tests.push(['5 {f}', [ErrorType.OperatorRequiredBeforeReference]])
tests.push(['5 }', [ErrorType.UnexpectedReferenceBracket]])
tests.push(['5 + {asd', [ErrorType.UnclosedReferenceBracket]])
tests.push(['5 {}', [ErrorType.OperatorRequiredBeforeReference, ErrorType.ReferenceNameRequiredInBrackets]])
tests.push(['5 + (12 - 3', [ErrorType.UnclosedBracket]])
tests.push(['5 + (12 -', [ErrorType.ValueRequiredAfterOperator, ErrorType.UnclosedBracket]])
tests.push(['5 + (12 -)', [ErrorType.UnexpectedBracket]])
tests.push(['-(-round({x}))', []])
tests.push(['-(*round({x}))', [ErrorType.UnexpectedOperator]])
tests.push(['*(-round({x}))', [ErrorType.UnexpectedOperator]])

const testsWithRefs: [string, string[], ErrorType[]][] = []
testsWithRefs.push(['sin({x}) + cos({y})', ['x'], [ErrorType.InvalidFunction, ErrorType.InvalidFunction, ErrorType.UnsupportedReferenceName]])

describe('Validator(Lexer(formula, Tokenizer))', () => {
  test.each(tests)('should validate %s formula with %s errors', (formula, errors) => {
    const result = Validator(getTokens(formula)).map(({ errorType }) => errorType)
    expect(result).toEqual(errors)
  })
})

describe('Validator(Lexer(formula, Tokenizer), supportedRefs[])', () => {
  test.each(testsWithRefs)('should validate %s formula with %s errors', (formula, supportedRefs, errors) => {
    const result = Validator(getTokens(formula), supportedRefs).map(({ errorType }) => errorType)
    expect(result).toEqual(errors)
  })
})

const circularTests: [string, string, Record<string, string>, ValidationError[]][] = []
circularTests.push([
  'c',
  '{b} + {a}',
  { a: '1', b: '{a} + {c} + 1' },
  [{ token: { type: TokenType.ReferenceName, value: 'b' }, tokenIndex: 1, errorType: ErrorType.CircularReference }]
])
circularTests.push([
  'VaR',
  '(1 + round({vaR}))',
  {},
  [{ token: { type: TokenType.ReferenceName, value: 'vaR' }, tokenIndex: 8, errorType: ErrorType.CircularReferenceToItself }]
])
circularTests.push([
  'a',
  '{B} + round({f})',
  { b: '{c} - 1', c: '{d} - 1', d: '{e} + 1', e: '{a}' },
  [{ token: { type: TokenType.ReferenceName, value: 'B' }, tokenIndex: 1, errorType: ErrorType.CircularReference }]
])
// Despite {a} depends on {b} which circullary depends on {c}, {a} formula is correct by itself.
// It should not be evaluated however because on the evalation step {a} will be calculated after {b}, the last should not be evaluated due to circular error.
circularTests.push([
  'a',
  '{b} + 1',
  { b: '{c} + 1', c: '{b} - 1' },
  []
])

describe('CircularReferencesValidator', () => {
  test.each(circularTests)('should find circular references in ref=%s formula=%s', (referenceName, formula, allFormulas, errors) => {
    const tokens = getTokens(formula)
    const tokensByReferences = Object.entries(allFormulas).reduce((out: Record<string, Token[]>, [referenceName, formula]) => {
      out[referenceName] = getTokens(formula)
      return out
    }, {})
    const result = CircularReferencesValidator(referenceName, tokens, tokensByReferences)
    expect(result).toEqual(errors)
  })
})
