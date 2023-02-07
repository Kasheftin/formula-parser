import { NodeGenerator } from './nodeGenerator'
import { FixOperatorsAtTheBegining, OperatorPrecedence } from './operatorPrecedence'
import { Lexer } from './lexer'
import { Tokenizer } from './tokenizer'
import { Token, TokenNode } from './types'
import { Evaluator } from './evaluator'
import { Validator } from './validator'

export function getTokens (formula: string) {
  return Lexer(formula, Tokenizer)
}

export function getValidationErrors (tokens: Token[]) {
  return Validator(tokens)
}

export function getTokenNodes (formula: string) {
  return NodeGenerator(OperatorPrecedence(FixOperatorsAtTheBegining(Lexer(formula, Tokenizer))))
}

export function evaluateTokenNodes (tokenNodes: TokenNode[], getPropertyValue: (v: string) => string) {
  return Evaluator(tokenNodes, getPropertyValue)
}
