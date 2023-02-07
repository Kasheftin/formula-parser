import { Lexer } from './lexer'
import { Tokenizer } from './tokenizer'
import { OperatorPrecedence, FixOperatorsAtTheBegining } from './operatorPrecedence'

const tests: [string, string][] = []

tests.push(['1', '1'])

tests.push(['1 + 2 * 3', '((1) + (2*3))'])

tests.push(['-sin({f}*(5+{g}))', '((0)-(sin(({f}*((5)+({g}))))))'])

tests.push(['-round(5.541, 2)', '((  0 - round((5.541),(2))  ))'])

tests.push(['({field} - round(5.5)) * 2 + -1', '(((({field})-(round((5.5))))*2)+(0)-(1))'])

tests.push(['1 < 2 + 3', '( (1) < (2+3) )'])

describe('OperatorPrecedence', () => {
  test.each(tests)('%s should be wrapped as %s', (formula, result) => {
    const tokens = OperatorPrecedence(FixOperatorsAtTheBegining(Lexer(formula, Tokenizer)))
    expect(tokens.map(token => token.value).join('').replace(/\s/g, '')).toBe(result.replace(/\s/g, ''))
  })
})

const beginingTests: [string, string][] = []

beginingTests.push(['+-5+-+-(-(+-5))', '0+0-5+0-0+0-(0-(0+0-5))'])
beginingTests.push(['-5-(-(-5))', '0-5-(0-(0-5))'])

describe('FixOperatorsAtTheBegining', () => {
  test.each(beginingTests)('%s should be prepended with 0 as %s', (formula, result) => {
    const tokens = FixOperatorsAtTheBegining(Lexer(formula, Tokenizer))
    expect(tokens.map(token => token.value).join('').replace(/\s/g, '')).toBe(result.replace(/\s/g, ''))
  })
})
