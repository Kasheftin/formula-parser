import { getTokens } from './lexer'
import { applyOperatorPrecedence, fixOperatorsAtTheBegining } from './operatorPrecedence'
import { type Token, type TokenNode, TokenType } from './types'

export function getTokenNodes (formula: string, skipOperatorPrecedence = false) {
  if (skipOperatorPrecedence) {
    return buildTokenNodeTree(fixOperatorsAtTheBegining(getTokens(formula)))
  } else {
    return buildTokenNodeTree(applyOperatorPrecedence(fixOperatorsAtTheBegining(getTokens(formula))))
  }
}

const meaningfulTypes = [TokenType.String, TokenType.Number, TokenType.ReferenceName, TokenType.Operator, TokenType.FunctionName, TokenType.BracketStart, TokenType.BracketEnd]

export function buildTokenNodeTree (tokens: Token[], level = 0) {
  const nodes: TokenNode[] = []
  const filteredTokens = level ? tokens : tokens.filter(token => meaningfulTypes.includes(token.type))
  for (let i = 0; i < filteredTokens.length; i++) {
    const token = filteredTokens[i]
    if ([TokenType.String, TokenType.Number, TokenType.ReferenceName].includes(token.type)) {
      addNode(nodes, {
        type: token.type,
        value: token.value,
        innerNodes: []
      })
    } else if (token.type === TokenType.Operator) {
      const lastNode = nodes.pop()
      nodes.push({
        type: token.type,
        value: token.value,
        innerNodes: lastNode ? [lastNode] : []
      })
    } else if (token.type === TokenType.FunctionName) {
      const offset = filteredTokens[i + 1]?.type === TokenType.BracketStart ? 1 : 0
      const nextI = getCorrespondingBracketEndIndex(filteredTokens, i + 1)
      addNode(nodes, {
        type: token.type,
        value: token.value,
        innerNodes: buildTokenNodeTree(filteredTokens.slice(i + 1 + offset, nextI - offset), level + 1)
      })
      i = nextI - offset
    } else if (token.type === TokenType.BracketStart) {
      const nextI = getCorrespondingBracketEndIndex(filteredTokens, i)
      addNode(nodes, {
        type: TokenType.Group,
        value: '',
        innerNodes: buildTokenNodeTree(filteredTokens.slice(i + 1, nextI), level + 1)
      })
      i = nextI - 1
    }
  }
  return nodes
}

function addNode (nodes: TokenNode[], node: TokenNode) {
  const lastNode = nodes[nodes.length - 1]
  if (lastNode?.type === TokenType.Operator && lastNode.innerNodes.length < 2) {
    lastNode.innerNodes.push(node)
  } else {
    nodes.push(node)
  }
}

function getCorrespondingBracketEndIndex (tokens: Token[], index: number) {
  let level = 0
  do {
    if (tokens[index]?.type === TokenType.BracketStart) {
      level++
    } else if (tokens[index]?.type === TokenType.BracketEnd) {
      level--
    }
    index++
  } while (level > 0 && index < tokens.length)
  return index
}
