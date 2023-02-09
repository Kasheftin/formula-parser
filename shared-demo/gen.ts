export type Item = {
  id: string
  title: string
  estimation?: number 
  budget?: number
  loggedTime?: number
}

export type ExtendedItem = Item & {
  formulaResults: Record<string, string>
}

export type ItemKey = keyof Item

export const supportedRefs: ItemKey[] = ['id', 'title', 'estimation', 'budget', 'loggedTime']

export const supportedColumns: { key: ItemKey; title: string; type: 'default' | 'formula' }[] = [
  { key: 'title', title: 'Item Title', type: 'default' },
  { key: 'estimation', title: 'Estimation (hours)', type: 'default' },
  { key: 'budget', title: 'Budget ($)', type: 'default' },
  { key: 'loggedTime', title: 'Time (seconds)', type: 'default' }
] 

export type FormulaField = {
  id: string
  referenceName: string
  formula: string
}

export function generateItems (n = 10) {
  const out: Item[] = []
  for (let i = 0; i < n; i++) {
    out.push({
      id: crypto.randomUUID(),
      title: `Item #${i + 1}`,
      estimation: Math.floor(Math.random() * 10) + 1,
      budget: (Math.floor(Math.random() * 10) + 1) * 100,
      loggedTime: Math.floor(Math.random() * 20000)
    })
  }
  return out
}

export function generateFormulaFields (): FormulaField[] {
  return [
    { id: crypto.randomUUID(), referenceName: 'rate', formula: '50' },
    { id: crypto.randomUUID(), referenceName: 'tax', formula: '21' },
    { id: crypto.randomUUID(), referenceName: 'timeHours', formula: 'floor({loggedTime} / 3600)' },        
    { id: crypto.randomUUID(), referenceName: 'spent', formula: 'round(({rate} * {timeHours}) * (100 + {tax}) / 100, 2, 1)' },
    { id: crypto.randomUUID(), referenceName: 'budgetLeft', formula: 'if ({budget} - {spent}<0, "overspent", ({budget} - {spent}) & "$ left")' },
    { id: crypto.randomUUID(), referenceName: 'a', formula: '{b}' },
    { id: crypto.randomUUID(), referenceName: 'b', formula: '{c}' },
    { id: crypto.randomUUID(), referenceName: 'c', formula: '{a}' }
  ]
}
