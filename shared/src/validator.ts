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

export function getValidationErrors (tokens: Token[], supportedRefs?: string[]) {
  const errors: ValidationError[] = []
  const unclosedTokens: { token: Token; tokenIndex: number; type: TokenType }[] = []
  const supportedRefsLowerCase = supportedRefs?.map(ref => ref.toLowerCase())
  let functionLevel = 0
  let prev: Token | null = null
  let prevIndex = 0
  for (let tokenIndex = 0; tokenIndex < tokens.length; tokenIndex++) {
    const addError = (errorType: ErrorType) => errors.push({ token, tokenIndex, errorType })
    const token = tokens[tokenIndex]

    if (token.type === TokenType.Operator && !'+-'.includes(token.value)) {
      if (!prev || !operatorAllowedAfter.includes(prev.type)) {
        addError(ErrorType.UnexpectedOperator)
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

    if (token.type === TokenType.ReferenceName && token.value && supportedRefsLowerCase && !supportedRefsLowerCase.includes(token.value.toLowerCase())) {
      addError(ErrorType.UnsupportedReferenceName)
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

    if (token.type !== TokenType.Whitespace) {
      prev = token
      prevIndex = tokenIndex
    }
  }

  if (prev?.type === TokenType.Operator) {
    errors.push({ token: prev, tokenIndex: prevIndex, errorType: ErrorType.ValueRequiredAfterOperator })
  }

  unclosedTokens.forEach(({ token, tokenIndex, type }) => {
    if (unclosedErrorMap[type]) {
      errors.push({ token, tokenIndex, errorType: unclosedErrorMap[type] as ErrorType })
    }
  })
  return errors
}

export function getTokenDependenciesDeep (tokensByReferences: Record<string, Token[]>) {
  const dependencyMap: Record<string, string[]> = {}
  const definedReferences: Record<string, boolean> = {}
  Object.entries(tokensByReferences).forEach(([referenceName, tokens]) => {
    referenceName = referenceName.toLowerCase()
    definedReferences[referenceName] = true
    tokens.forEach((token) => {
      if (token.type === TokenType.ReferenceName) {
        if (!dependencyMap[referenceName]) {
          dependencyMap[referenceName] = []
        }
        dependencyMap[referenceName].push(token.value.toLowerCase())
      }
    })
  })
  const getAllReferences = (referenceName: string) => {
    const dependencies: Record<string, boolean> = {}
    const processedReferences: Record<string, boolean> = {}
    const run = (referenceName: string) => {
      if (dependencyMap[referenceName] && !processedReferences[referenceName]) {
        processedReferences[referenceName] = true
        dependencyMap[referenceName].forEach((dependencyName) => {
          dependencies[dependencyName] = true
          run(dependencyName)
        })
      }
    }
    run(referenceName)
    return dependencies
  }
  return Object.keys(tokensByReferences).reduce((out: Record<string, string[]>, referenceName) => {
    referenceName = referenceName.toLowerCase()
    out[referenceName] = Object.keys(getAllReferences(referenceName))
      .filter(key => definedReferences[key])
      .sort((key1, key2) => key1.localeCompare(key2))
    return out
  }, {})
}

export function getCircularValidationErrors (referenceName: string, tokensByReferences: Record<string, Token[]>) {
  const tokens = tokensByReferences[referenceName] || []
  referenceName = referenceName.toLowerCase()
  const errors: ValidationError[] = []
  const dependenciesByReferences = getTokenDependenciesDeep(tokensByReferences)
  for (let tokenIndex = 0; tokenIndex < tokens.length; tokenIndex++) {
    const token = tokens[tokenIndex]
    if (token.type === TokenType.ReferenceName) {
      const tokenReferenceName = token.value.toLowerCase()
      if (tokenReferenceName === referenceName) {
        errors.push({ token, tokenIndex, errorType: ErrorType.CircularReferenceToItself })
      } else if (dependenciesByReferences[tokenReferenceName]?.includes(referenceName)) {
        errors.push({ token, tokenIndex, errorType: ErrorType.CircularReference })
      }
    }
  }
  return errors
}
