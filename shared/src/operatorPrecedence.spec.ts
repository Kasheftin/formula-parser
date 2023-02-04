import { Lexer } from './lexer'
import { Tokenizer } from './tokenizer'
import { OperatorPrecedence, FixNegative } from './operatorPrecedence'

const tests: [string, string][] = []

tests.push(['1', '1'])

tests.push(['1 + 2 * 3', '((1) + (2*3))'])

tests.push(['-sin({f}*(5+{g}))', '((0)-(sin(({f}*((5)+({g}))))))'])

tests.push(['-round(5.541, 2)', '((  0 - round((5.541),(2))  ))'])

tests.push(['({field} - round(5.5)) * 2 + -1', '(((({field})-(round((5.5))))*2)+(-1))'])

tests.push(['1 < 2 + 3', '( (1) < (2+3) )'])

describe('OperatorPrecedence', () => {
  test.each(tests)('%s should be wrapped as %s', (formula, result) => {
    const tokens = OperatorPrecedence(FixNegative(Lexer(formula, Tokenizer)))
    expect(tokens.map(token => token.value).join('').replace(/\s/g, '')).toBe(result.replace(/\s/g, ''))
  })
})
