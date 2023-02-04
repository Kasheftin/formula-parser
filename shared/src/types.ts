export enum TokenType {
  Number = 'Number',
  String = 'String',
  Whitespace = 'Whitespace',
  Operator = 'Operator',
  BracketStart = 'BracketStart',
  BracketEnd = 'BracketEnd',
  ReferenceBracketStart = 'ReferenceBracketStart',
  ReferenceBracketEnd = 'ReferenceBracketEnd',
  ReferenceName = 'ReferenceName',
  FunctionName = 'FunctionName',
  Comma = 'Comma',
  QuoteStart = 'QuoteStart',
  QuoteEnd = 'QuoteEnd',
  EmptyStringAndQuoteEnd = 'EmptyStringAndQuoteEnd',
  DoubleQuoteStart = 'DoubleQuoteStart',
  DoubleQuoteEnd = 'DoubleQuoteEnd',
  EmptyStringAndDoubleQuoteEnd = 'EmptyStringAndDoubleQuoteEnd',
  Group = 'Group',
  Error = 'Error'
}

export type Token = {
  type: TokenType,
  value: string
}

export type TokenNode = Token & {
  innerNodes: TokenNode[]
}

export interface LexerStream {
  match: (pattern: RegExp, consume: boolean) => string | null
  skip: () => void
  prev: TokenType | null
}
