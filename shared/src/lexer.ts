import { Tokenizer } from './tokenizer'
import { Token, TokenType } from './types'

export function Lexer (formula: string, tokenizer: typeof Tokenizer) {
  const tokens: Token[] = []
  let position = 0
  const skip = () => {
    position++
  }
  const match = (pattern: RegExp, move: boolean) => {
    const match = formula.substring(position).match(pattern)
    if (!match) {
      return null
    }
    if (move) {
      position += match[0].length
    }
    return match[0] || null
  }

  let prev: TokenType | null = null
  while (position < formula.length) {
    const startingPosition = position
    let tokenType = tokenizer({ match, skip, prev })
    if (startingPosition === position) {
      throw new Error('Tokenizer did not move forward')
    }
    if (tokenType === TokenType.EmptyStringAndDoubleQuoteEnd) {
      tokens.push({
        type: TokenType.String,
        value: ''
      })
      tokenType = TokenType.DoubleQuoteEnd
    } else if (tokenType === TokenType.EmptyStringAndQuoteEnd) {
      tokens.push({
        type: TokenType.String,
        value: ''
      })
      tokenType = TokenType.QuoteEnd
    }
    tokens.push({
      type: tokenType,
      value: formula.substring(startingPosition, position)
    })
    if (tokenType !== TokenType.Whitespace) {
      prev = tokenType
    }
  }

  return tokens
}
