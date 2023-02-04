import { Token, TokenType } from './types'

// https://en.wikipedia.org/wiki/Operator-precedence_parser fortran approach
export function OperatorPrecedence (tokens: Token[]) {
  const newTokens: Token[] = []

  const operatorGroups = ['^', '*/', '+-', '<=>='].filter(entry => tokens.some(token => token.type === TokenType.Operator && entry.includes(token.value)))
  const commaExists = tokens.some(token => token.type === TokenType.Comma)
  const maxBracketsCount = operatorGroups.length + (commaExists ? 1 : 0)

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (token.type === TokenType.Operator) {
      const bracketCount = operatorGroups.findIndex(entry => entry.includes(token.value))
      aroundWithBrackets(newTokens, token, bracketCount)
    } else if (token.type === TokenType.Comma) {
      aroundWithBrackets(newTokens, token, operatorGroups.length)
    } else if (token.type === TokenType.BracketStart || token.type === TokenType.BracketEnd) {
      addBrackets(newTokens, maxBracketsCount, token.type)
    } else {
      newTokens.push(token)
    }
  }
  addBrackets(newTokens, maxBracketsCount, TokenType.BracketStart, true)
  addBrackets(newTokens, maxBracketsCount, TokenType.BracketEnd)
  return newTokens
}

// Fix the formula like "-sin(1)" - add 0 at the begining
export function FixFirstMinus (tokens: Token[]) {
  tokens = [...tokens]
  if (tokens[0]?.type === TokenType.Operator) {
    tokens.unshift({
      type: TokenType.Number,
      value: '0'
    })
  }
  return tokens
}

function addBrackets (tokens: Token[], count: number, type: TokenType.BracketStart | TokenType.BracketEnd, toStart = false) {
  for (let i = 0; i < count; i++) {
    tokens[toStart ? 'unshift' : 'push']({ value: type === TokenType.BracketEnd ? ')' : '(', type })
  }
}

function aroundWithBrackets (tokens: Token[], token: Token, count: number) {
  addBrackets(tokens, count, TokenType.BracketEnd)
  tokens.push(token)
  addBrackets(tokens, count, TokenType.BracketStart)
}
