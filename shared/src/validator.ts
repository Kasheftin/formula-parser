import { functionIsSupported } from './supportedFunctions'
import { operatorAllowedAfter, Token, TokenType, ErrorType, ValidationError } from './types'

const operatorRequiredMap: Partial<Record<TokenType, ErrorType>> = {
  [TokenType.Number]: ErrorType.OperatorRequiredBeforeNumber,
  [TokenType.FunctionName]: ErrorType.OperatorRequiredBeforeFunction,
  [TokenType.QuoteStart]: ErrorType.OperatorRequiredBeforeQuote,
  [TokenType.DoubleQuoteStart]: ErrorType.OperatorRequiredBeforeQuote
}

const startToEndMap: Partial<Record<TokenType, TokenType>> = {
  [TokenType.QuoteEnd]: TokenType.QuoteStart,
  [TokenType.DoubleQuoteEnd]: TokenType.DoubleQuoteStart
}

const valueAllowedAfter = [
  TokenType.Operator,
  TokenType.Comma,
  TokenType.BracketStart
]

const unclosedErrorMap: Partial<Record<TokenType, ErrorType>> = {
  [TokenType.QuoteStart]: ErrorType.UnclosedQuote,
  [TokenType.DoubleQuoteStart]: ErrorType.UnclosedDoubleQuote,
  [TokenType.FunctionName]: ErrorType.UnclosedBracket,
  [TokenType.Group]: ErrorType.UnclosedBracket,
  [TokenType.ReferenceName]: ErrorType.UnclosedReferenceBracket
}

export function Validator (tokens: Token[]) {
  const errors: ValidationError[] = []
  const unclosedTokens: { token: Token; tokenIndex: number, type: TokenType }[] = []
  let functionLevel = 0
  for (let tokenIndex = 0; tokenIndex < tokens.length; tokenIndex++) {
    const addError = (errorType: ErrorType) => errors.push({ token, tokenIndex, errorType })
    const token = tokens[tokenIndex]
    const next = getClosestToken(tokens, tokenIndex, token => token.type !== TokenType.Whitespace, +1)
    const prev = getClosestToken(tokens, tokenIndex, token => token.type !== TokenType.Whitespace, -1)

    if (token.type === TokenType.Operator) {
      if (!prev || !operatorAllowedAfter.includes(prev.type)) {
        // -(-sin({x})) is allowed syntax
        if (!'+-'.includes(token.value) || !next || ![TokenType.Number, TokenType.BracketStart, TokenType.ReferenceBracketStart, TokenType.FunctionName, TokenType.QuoteStart, TokenType.DoubleQuoteStart].includes(next.type)) {
          addError(ErrorType.UnexpectedOperator)
        }
      }
      if (!next) {
        addError(ErrorType.ValueRequiredAfterOperator)
      }
    }

    if (operatorRequiredMap[token.type] && prev && !valueAllowedAfter.includes(prev.type)) {
      addError(operatorRequiredMap[token.type] as ErrorType)
    }

    if (token.type === TokenType.FunctionName && !functionIsSupported(token.value)) {
      addError(ErrorType.InvalidFunction)
    }

    if ([TokenType.QuoteStart, TokenType.DoubleQuoteStart].includes(token.type)) {
      unclosedTokens.push({ token, tokenIndex, type: token.type })
    }

    if (startToEndMap[token.type]) {
      if (unclosedTokens.length && unclosedTokens[unclosedTokens.length - 1].token.type === startToEndMap[token.type]) {
        unclosedTokens.pop()
      }
    }

    if (token.type === TokenType.Comma) {
      if (functionLevel <= 0 || !prev || !operatorAllowedAfter.includes(prev.type)) {
        addError(ErrorType.UnexpectedComma)
      }
    }

    if (token.type === TokenType.Error) {
      addError(ErrorType.InvalidCharacter)
    }

    if (token.type === TokenType.BracketStart) {
      unclosedTokens.push({ token, tokenIndex, type: prev?.type === TokenType.FunctionName ? TokenType.FunctionName : TokenType.Group })
      if (prev?.type === TokenType.FunctionName) {
        functionLevel++
      } else if (prev && !valueAllowedAfter.includes(prev.type)) {
        addError(ErrorType.OperatorRequiredBeforeBracket)
      }
    }

    if (token.type === TokenType.BracketEnd) {
      if (unclosedTokens.length && unclosedTokens[unclosedTokens.length - 1].type === TokenType.FunctionName) {
        functionLevel--
        unclosedTokens.pop()
        if (!prev || (!operatorAllowedAfter.includes(prev.type) && prev.type !== TokenType.BracketStart)) {
          addError(ErrorType.UnexpectedBracket)
        }
      } else if (unclosedTokens.length && unclosedTokens[unclosedTokens.length - 1].type === TokenType.Group) {
        unclosedTokens.pop()
        if (!prev || (!operatorAllowedAfter.includes(prev.type) && prev.type !== TokenType.BracketStart)) {
          addError(ErrorType.UnexpectedBracket)
        }
      } else {
        addError(ErrorType.UnexpectedBracket)
      }
    }

    if (token.type === TokenType.ReferenceBracketStart) {
      unclosedTokens.push({ token, tokenIndex, type: TokenType.ReferenceName })
      if (prev && !valueAllowedAfter.includes(prev.type)) {
        addError(ErrorType.OperatorRequiredBeforeReference)
      }
    }

    if (token.type === TokenType.ReferenceBracketEnd) {
      if (unclosedTokens.length && unclosedTokens[unclosedTokens.length - 1].type === TokenType.ReferenceName) {
        unclosedTokens.pop()
        if (!prev || prev.type !== TokenType.ReferenceName) {
          addError(ErrorType.ReferenceNameRequiredInBrackets)
        }
      } else {
        addError(ErrorType.UnexpectedReferenceBracket)
      }
    }
  }

  unclosedTokens.forEach(({ token, tokenIndex, type }) => {
    if (unclosedErrorMap[type]) {
      errors.push({ token, tokenIndex, errorType: unclosedErrorMap[type] as ErrorType })
    }
  })
  return errors
}

function getClosestToken (tokens: Token[], index: number, match: (token: Token) => boolean, offset: number) {
  for (let i = index + offset; (i >= 0 && i < tokens.length); i += offset) {
    if (match(tokens[i])) {
      return tokens[i]
    }
  }
  return null
}
