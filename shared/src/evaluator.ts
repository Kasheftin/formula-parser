import { TokenNode, TokenType } from './types'
import { executeFunction, executeOperator } from './supportedFunctions'

export function evaluateTokenNodes (tokenNodes: TokenNode[], getPropertyValue: (v: string) => string): string {
  let result = ''
  for (const node of tokenNodes) {
    result += evaluateNode(node, getPropertyValue)
  }
  return result
}

function evaluateNode (node: TokenNode, getPropertyValue: (v: string) => string): string {
  if (node.type === TokenType.Operator) {
    const parameters = node.innerNodes.map((x) => evaluateNode(x, getPropertyValue))
    return executeOperator(node.value, parameters)
  } else if (node.type === TokenType.FunctionName) {
    const parameters = node.innerNodes.map((x) => evaluateNode(x, getPropertyValue))
    return executeFunction(node.value, parameters)
  } else if (node.type === TokenType.ReferenceName) {
    return getPropertyValue(node.value)
  } else if (node.type === TokenType.String) {
    return node.value
  } else if (node.type === TokenType.Number) {
    return node.value
  } else if (node.type === TokenType.Group) {
    return node.innerNodes.reduce((out, childNode) => out + evaluateNode(childNode, getPropertyValue), '')
  }
  return ''
}
