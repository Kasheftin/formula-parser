import { NodeGenerator } from './nodeGenerator'
import { FixOperatorsAtTheBegining, OperatorPrecedence } from './operatorPrecedence'
import { Lexer } from './lexer'
import { Tokenizer } from './tokenizer'
import { Token, TokenNode } from './types'
import { Evaluator } from './evaluator'
import { CircularReferencesValidator, Validator } from './validator'
import { ExtendedTokens } from './extendedTokens'

export function getTokens (formula: string) {
  return Lexer(formula, Tokenizer)
}

export function getValidationErrors (tokens: Token[], supportedRefs?: string[]) {
  return Validator(tokens, supportedRefs)
}

export function getCircularValidationErrors (referenceName: string, tokensByReferences: Record<string, Token[]>) {
  return CircularReferencesValidator(referenceName, tokensByReferences)
}

export function getTokenNodes (formula: string) {
  return NodeGenerator(OperatorPrecedence(FixOperatorsAtTheBegining(Lexer(formula, Tokenizer))))
}

export function evaluateTokenNodes (tokenNodes: TokenNode[], getPropertyValue: (v: string) => string) {
  return Evaluator(tokenNodes, getPropertyValue)
}

export function getExtendedTokens (formulasByReferences: Record<string, string>, supportedRefs?: string[]) {
  return ExtendedTokens(formulasByReferences, supportedRefs)
}
