import { LexerStream, TokenType } from './types'

export function Tokenizer ({ match, skip, prev }: LexerStream): TokenType {
  if (prev !== TokenType.QuoteStart && match(/^"/, true)) {
    if (prev === TokenType.String) {
      return TokenType.DoubleQuoteEnd
    } else if (prev === TokenType.DoubleQuoteStart) {
      return TokenType.EmptyStringAndDoubleQuoteEnd
    } else {
      return TokenType.DoubleQuoteStart
    }
  }

  if (match(/^'/, true)) {
    if (prev === TokenType.String) {
      return TokenType.QuoteEnd
    } else if (prev === TokenType.QuoteStart) {
      return TokenType.EmptyStringAndQuoteEnd
    } else {
      return TokenType.QuoteStart
    }
  }

  if (prev === TokenType.DoubleQuoteStart) {
    match(/^([^"\\]|\\.)+(?=")/, true)
    return TokenType.String
  }

  if (prev === TokenType.QuoteStart) {
    match(/^([^'\\]|\\.)+(?=')/, true)
    return TokenType.String
  }

  const numberRegex = /^[-]?\d*\.?\d+/
  if (match(numberRegex, false)) {
    if (prev && [TokenType.Number, TokenType.String, TokenType.BracketEnd, TokenType.ReferenceBracketEnd].includes(prev) && match(/^-/, true)) {
      return TokenType.Operator
    } else {
      match(numberRegex, true)
      return TokenType.Number
    }
  }

  if (prev === TokenType.ReferenceBracketStart && match(/^[^{}]+(?=\})/, true)) {
    return TokenType.ReferenceName
  }

  const rest: [RegExp, TokenType][] = [
    [/^(<=|==|>=)/, TokenType.Operator],
    [/^[+\-*/^<=>]/, TokenType.Operator],
    [/^[a-zA-Z][a-zA-Z0-9]*(?=\s*\()/, TokenType.FunctionName],
    [/^\(/, TokenType.BracketStart],
    [/^\)/, TokenType.BracketEnd],
    [/^{/, TokenType.ReferenceBracketStart],
    [/^}/, TokenType.ReferenceBracketEnd],
    [/^,/, TokenType.Comma],
    [/^\s+/, TokenType.Whitespace]
  ]

  for (const [pattern, type] of rest) {
    if (match(pattern, true)) {
      return type
    }
  }

  skip()
  return TokenType.Error
}
