import { ErrorType } from './types'
import { Lexer } from './lexer'
import { Tokenizer } from './tokenizer'
import { Validator } from './validator'

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

describe('Validator(Lexer(formula, Tokenizer))', () => {
  test.each(tests)('should validate %s formula with %s errors', (formula, errors) => {
    const result = Validator(Lexer(formula, Tokenizer)).map(({ errorType }) => errorType)
    expect(result).toEqual(errors)
  })
})
