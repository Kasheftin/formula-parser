import { Token, TokenType } from './types'
import { getTokens } from './lexer'

const tests: [string, Token[]][] = []

tests.push(['1+2*3', [
  { type: TokenType.Number, value: '1' },
  { type: TokenType.Operator, value: '+' },
  { type: TokenType.Number, value: '2' },
  { type: TokenType.Operator, value: '*' },
  { type: TokenType.Number, value: '3' }
]])

tests.push(['round(5.5, 2)  - {field}', [
  { type: TokenType.FunctionName, value: 'round' },
  { type: TokenType.BracketStart, value: '(' },
  { type: TokenType.Number, value: '5.5' },
  { type: TokenType.Comma, value: ',' },
  { type: TokenType.Whitespace, value: ' ' },
  { type: TokenType.Number, value: '2' },
  { type: TokenType.BracketEnd, value: ')' },
  { type: TokenType.Whitespace, value: '  ' },
  { type: TokenType.Operator, value: '-' },
  { type: TokenType.Whitespace, value: ' ' },
  { type: TokenType.ReferenceBracketStart, value: '{' },
  { type: TokenType.ReferenceName, value: 'field' },
  { type: TokenType.ReferenceBracketEnd, value: '}' }
]])

tests.push(['1+-2ss', [
  { type: TokenType.Number, value: '1' },
  { type: TokenType.Operator, value: '+' },
  { type: TokenType.Operator, value: '-' },
  { type: TokenType.Number, value: '2' },
  { type: TokenType.Error, value: 's' },
  { type: TokenType.Error, value: 's' }
]])

tests.push(['5.,', [
  { type: TokenType.Number, value: '5' },
  { type: TokenType.Error, value: '.' },
  { type: TokenType.Comma, value: ',' }
]])

tests.push(['({field} - round(5.5)) * 2 + -1', [
  { type: TokenType.BracketStart, value: '(' },
  { type: TokenType.ReferenceBracketStart, value: '{' },
  { type: TokenType.ReferenceName, value: 'field' },
  { type: TokenType.ReferenceBracketEnd, value: '}' },
  { type: TokenType.Whitespace, value: ' ' },
  { type: TokenType.Operator, value: '-' },
  { type: TokenType.Whitespace, value: ' ' },
  { type: TokenType.FunctionName, value: 'round' },
  { type: TokenType.BracketStart, value: '(' },
  { type: TokenType.Number, value: '5.5' },
  { type: TokenType.BracketEnd, value: ')' },
  { type: TokenType.BracketEnd, value: ')' },
  { type: TokenType.Whitespace, value: ' ' },
  { type: TokenType.Operator, value: '*' },
  { type: TokenType.Whitespace, value: ' ' },
  { type: TokenType.Number, value: '2' },
  { type: TokenType.Whitespace, value: ' ' },
  { type: TokenType.Operator, value: '+' },
  { type: TokenType.Whitespace, value: ' ' },
  { type: TokenType.Operator, value: '-' },
  { type: TokenType.Number, value: '1' }
]])

tests.push(['{asd"1s)} + "as({as}a"', [
  { type: TokenType.ReferenceBracketStart, value: '{' },
  { type: TokenType.ReferenceName, value: 'asd"1s)' },
  { type: TokenType.ReferenceBracketEnd, value: '}' },
  { type: TokenType.Whitespace, value: ' ' },
  { type: TokenType.Operator, value: '+' },
  { type: TokenType.Whitespace, value: ' ' },
  { type: TokenType.DoubleQuoteStart, value: '"' },
  { type: TokenType.String, value: 'as({as}a' },
  { type: TokenType.DoubleQuoteEnd, value: '"' }
]])

tests.push(['\'"\'', [
  { type: TokenType.QuoteStart, value: '\'' },
  { type: TokenType.String, value: '"' },
  { type: TokenType.QuoteEnd, value: '\'' }
]])

tests.push(['""', [
  { type: TokenType.DoubleQuoteStart, value: '"' },
  { type: TokenType.String, value: '' },
  { type: TokenType.DoubleQuoteEnd, value: '"' }
]])

tests.push(['"" + \'"\'', [
  { type: TokenType.DoubleQuoteStart, value: '"' },
  { type: TokenType.String, value: '' },
  { type: TokenType.DoubleQuoteEnd, value: '"' },
  { type: TokenType.Whitespace, value: ' ' },
  { type: TokenType.Operator, value: '+' },
  { type: TokenType.Whitespace, value: ' ' },
  { type: TokenType.QuoteStart, value: '\'' },
  { type: TokenType.String, value: '"' },
  { type: TokenType.QuoteEnd, value: '\'' }
]])

tests.push(["'nick\\'s'", [
  { type: TokenType.QuoteStart, value: '\'' },
  { type: TokenType.String, value: "nick\\'s" },
  { type: TokenType.QuoteEnd, value: '\'' }
]])

tests.push(['print("Hello, \\"w\\"orld")', [
  { type: TokenType.FunctionName, value: 'print' },
  { type: TokenType.BracketStart, value: '(' },
  { type: TokenType.DoubleQuoteStart, value: '"' },
  { type: TokenType.String, value: 'Hello, \\"w\\"orld' },
  { type: TokenType.DoubleQuoteEnd, value: '"' },
  { type: TokenType.BracketEnd, value: ')' }
]])

tests.push(['if({n:1}<5,1,2)', [
  { type: TokenType.FunctionName, value: 'if' },
  { type: TokenType.BracketStart, value: '(' },
  { type: TokenType.ReferenceBracketStart, value: '{' },
  { type: TokenType.ReferenceName, value: 'n:1' },
  { type: TokenType.ReferenceBracketEnd, value: '}' },
  { type: TokenType.Operator, value: '<' },
  { type: TokenType.Number, value: '5' },
  { type: TokenType.Comma, value: ',' },
  { type: TokenType.Number, value: '1' },
  { type: TokenType.Comma, value: ',' },
  { type: TokenType.Number, value: '2' },
  { type: TokenType.BracketEnd, value: ')' }
]])

tests.push(['if (1<2,3,4)', [
  { type: TokenType.FunctionName, value: 'if' },
  { type: TokenType.Whitespace, value: ' ' },
  { type: TokenType.BracketStart, value: '(' },
  { type: TokenType.Number, value: '1' },
  { type: TokenType.Operator, value: '<' },
  { type: TokenType.Number, value: '2' },
  { type: TokenType.Comma, value: ',' },
  { type: TokenType.Number, value: '3' },
  { type: TokenType.Comma, value: ',' },
  { type: TokenType.Number, value: '4' },
  { type: TokenType.BracketEnd, value: ')' }
]])

tests.push(['-5', [
  { type: TokenType.Operator, value: '-' },
  { type: TokenType.Number, value: '5' }
]])

tests.push(['+5', [
  { type: TokenType.Operator, value: '+' },
  { type: TokenType.Number, value: '5' }
]])

tests.push(["uppercase('')", [
  { type: TokenType.FunctionName, value: 'uppercase' },
  { type: TokenType.BracketStart, value: '(' },
  { type: TokenType.QuoteStart, value: "'" },
  { type: TokenType.String, value: '' },
  { type: TokenType.QuoteEnd, value: "'" },
  { type: TokenType.BracketEnd, value: ')' }
]])

tests.push(['{a} & uppercase("Hello, \\"John\\"")', [
  { type: TokenType.ReferenceBracketStart, value: '{' },
  { type: TokenType.ReferenceName, value: 'a' },
  { type: TokenType.ReferenceBracketEnd, value: '}' },
  { type: TokenType.Whitespace, value: ' ' },
  { type: TokenType.Operator, value: '&' },
  { type: TokenType.Whitespace, value: ' ' },
  { type: TokenType.FunctionName, value: 'uppercase' },
  { type: TokenType.BracketStart, value: '(' },
  { type: TokenType.DoubleQuoteStart, value: '"' },
  { type: TokenType.String, value: 'Hello, \\"John\\"' },
  { type: TokenType.DoubleQuoteEnd, value: '"' },
  { type: TokenType.BracketEnd, value: ')' }
]])

describe('Lexer(formula, Tokenizer)', () => {
  test.each(tests)('should split %s to tokens correctly and join tokens back to initial formula', (formula, tokens) => {
    const result = getTokens(formula)
    expect(result).toEqual(tokens)
    expect(result.map(token => token.value).join('')).toBe(formula)
  })
})
