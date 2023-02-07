import { ErrorType, ExtendedFormulaEntry, Token, TokenType } from './types'
import { getTokens, getTokenNodes, getValidationErrors } from './index'
import { CircularReferencesValidator, TokenDependenciesDeep } from './validator'

export function ExtendedTokens (formulasByReferences: Record<string, string>, supportedRefs?: string[]) {
  const out: Record<string, ExtendedFormulaEntry> = {}
  const tokensByRefs: Record<string, Token[]> = {}
  Object.entries(formulasByReferences).forEach(([referenceName, formula]) => {
    referenceName = referenceName.toLowerCase()
    const tokens = getTokens(formula)
    const tokenNodes = getTokenNodes(formula)
    tokensByRefs[referenceName] = tokens
    out[referenceName] = {
      referenceName,
      formula,
      tokens,
      tokenNodes,
      validationErrors: [],
      dependencies: [],
      order: 0
    }
  })
  const allSupportedRefs = [...(supportedRefs || []), ...Object.keys(tokensByRefs)]
  const dependenciesByRefs = TokenDependenciesDeep(tokensByRefs)
  Object.values(out).forEach((entry) => {
    const validationErrors = getValidationErrors(entry.tokens, allSupportedRefs)
    const circularErrors = CircularReferencesValidator(entry.referenceName, tokensByRefs)
    entry.validationErrors = [...validationErrors, ...circularErrors]
    entry.dependencies = dependenciesByRefs[entry.referenceName] || []
  })
  const resolved: Record<string, boolean> = {}
  let order = 1
  let updated = true
  while (updated) {
    updated = false
    Object.values(out).forEach((entry) => {
      if (!resolved[entry.referenceName] && !entry.dependencies.some(ref => !resolved[ref])) {
        entry.order = order
        resolved[entry.referenceName] = true
        updated = true
      }
    })
    if (updated) {
      order++
    }
  }
  const orderedOut = Object.keys(out).sort((key1, key2) => out[key1].order - out[key2].order)
  orderedOut.forEach((referenceName) => {
    const entry = out[referenceName]
    entry.tokens.forEach((token, tokenIndex) => {
      if (token.type === TokenType.ReferenceName) {
        const tokenValue = token.value.toLowerCase()
        if (tokenValue !== referenceName && !entry.validationErrors.length && out[tokenValue]?.validationErrors.length) {
          entry.validationErrors.push({ token, tokenIndex, errorType: ErrorType.DependsOnInvalid })
        }
      }
    })
  })
  Object.values(out).forEach((entry) => {
    if (!resolved[entry.referenceName] && !entry.validationErrors.length) {
      entry.validationErrors.push({ errorType: ErrorType.DependsOnCircular })
    }
  })
  return out
}
