import { useState, useMemo } from 'react'
import { evaluateTokenNodes, getExtendedTokens, type ExtendedFormulaEntry } from './shared/src'
import { generateItems, generateFormulaFields, supportedColumns, supportedRefs, FormulaField } from './shared-demo/gen'
import { FormulaInput } from './FormulaInput'

export function App() {
  const [fields, setFields] = useState(generateFormulaFields())

  const setField = (field: FormulaField) => {
    setFields(fields.map(f => f.id === field.id ? field : f))
  }

  const addField = () => {
    setFields([...fields, { id: crypto.randomUUID(), referenceName: '', formula: '' }])
  }

  const formulasByRefs = useMemo(() => fields.reduce((out: Record<string, string>, field) => {
    if (field.referenceName) {
      out[field.referenceName] = field.formula
    }
    return out
  }, {}), [fields])

  const extendedTokens = useMemo(() => getExtendedTokens(formulasByRefs, supportedRefs), [formulasByRefs])

  const extendedTokensByRefs = useMemo(() => Object.values(extendedTokens).reduce((out: Record<string, ExtendedFormulaEntry>, entry) => {
    out[entry.referenceNameOrig] = entry
    return out
  }, {}), [extendedTokens])

  const extendedTokensOrdered = useMemo(() => Object.values(extendedTokens).sort((a, b) => a.order - b.order), [extendedTokens])

  const columns = useMemo(() => [
    ...supportedColumns, 
    ...fields.map(field => ({ key: field.referenceName, title: field.referenceName, type: 'formula' }))
  ], [fields])

  const [items] = useState(generateItems())

  const extendedItems = useMemo(() => items.map((item) => {
    const extendedItem: Record<string, string> = {}
    Object.entries(item).forEach(([key, value]) => {
      extendedItem[key] = (value === 0 ? 0 : (value || '')).toString()
    })
    extendedTokensOrdered.forEach((entry) => {
      extendedItem[entry.referenceNameOrig] = evaluateTokenNodes(entry.tokenNodes, (prop: string) => (extendedItem[prop] || '').toString()) 
    })
    return extendedItem
  }), [items, extendedTokensOrdered])

  return (
    <div className="fm-container">
      <div className="fm-block">
        <div className="fm-block__title">
          Formula Parser React Demo
        </div>
        <div className="fm-block__text">
          This is the demo for <a className="fm-link" href="/">Formula Parser in JavaScript/Vue/React</a> publication. 
        </div>
      </div>
      <div className="fm-block">
        <div className="fm-block__title">
          Formulas
        </div>
        <div className="fm-block__content">
          <table className="fm-table">
            <thead>
              <tr>
                <th className="fm-table__col fm-table__col--header" style={{ width: '25%' }}>
                  referenceName
                </th>
                <th className="fm-table__col fm-table__col--header">
                  formula
                </th>
                <th className="fm-table__col fm-table__col--header" style={{ width: '50px' }} />
              </tr>
            </thead>
            <tbody>
              {fields.map((field) => (
                <tr key={field.id}>
                  <td className="fm-table__col fm-table__col--input">
                    <input 
                      value={field.referenceName}
                      type="text"
                      className="fm-input"
                      onChange={event => setField({ ...field, referenceName: event.target.value })}
                    />
                  </td>
                  <td className="fm-table__col fm-table__col--input">
                    <FormulaInput 
                      modelValue={field.formula}
                      tokens={extendedTokensByRefs[field.referenceName]?.tokens}
                      validationErrors={extendedTokensByRefs[field.referenceName]?.validationErrors}
                      onChange={(formula: string) => setField({ ...field, formula })}
                    />
                  </td>
                  <td className="fm-table__col">
                    <button className="fm-btn" onClick={event => setFields(fields.filter(f => f.id !== field.id))}>
                      &times;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="fm-block__actions">
          <button className="fm-btn" onClick={event => addField()}>
            Add Formula
          </button>
        </div>
      </div>
      <div className="fm-block">
        <div className="fm-block__title">
          Items Table
        </div>
        <div className="fm-block__content">
          <table className="fm-table">
            <thead>
              <tr>
                {columns.map(column => (
                  <th
                    key={ column.key }
                    className="fm-table__col fm-table__col--header"
                  >
                    { column.title }
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {extendedItems.map(item => (
                <tr key={item.id}>
                  {columns.map(column => (
                    <td
                      key={column.key}
                      className={`fm-table__col fm-table__col--${column.key}`}
                    >
                      {extendedTokensByRefs[column.key]?.validationErrors?.length ? (
                        <span className="fm-validation">
                          INVALID
                        </span>
                      ) : (
                        <span>
                          {item[column.key] || ''}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default App
