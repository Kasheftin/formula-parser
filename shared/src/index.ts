import { NodeGenerator } from './nodeGenerator'
import { FixFirstMinus, OperatorPrecedence } from './operatorPrecedence'
import { Lexer } from './lexer'
import { Tokenizer } from './tokenizer'
import { TokenNode } from './types'
import { Evaluator } from './evaluator'

export function getTokens (formula: string) {
  return Lexer(formula, Tokenizer)
}

export function getTokenNodes (formula: string) {
  return NodeGenerator(OperatorPrecedence(FixFirstMinus(Lexer(formula, Tokenizer))))
}

export function evaluateTokenNodes (tokenNodes: TokenNode[], getPropertyValue: (v: string) => string) {
  return Evaluator(tokenNodes, getPropertyValue)
}
