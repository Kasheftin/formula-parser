import { useState, useMemo, useRef, useLayoutEffect } from 'react'
import type { Token, ValidationError } from './shared/src'

type Props = {
  modelValue: string
  onChange: (value: string) => void
  tokens?: Token[]
  validationErrors?: ValidationError[]
}

export function FormulaInput(props: Props) {
  const { modelValue, onChange, tokens, validationErrors } = props
  const [isFocused, setFocused] = useState(false)

  const highlight = useMemo(() => {
    const errorsByTokenIndexes = validationErrors?.reduce((out: Record<number, boolean>, error) => {
      if (error.tokenIndex || error.tokenIndex === 0) {
        out[error.tokenIndex] = true
      }
      return out
    }, {})
    return tokens?.map((token, tokenIndex) => ({
      value: token.value,
      css: `fm-colored-input__highlight--${token.type}` + (errorsByTokenIndexes?.[tokenIndex] ? ' fm-colored-input__highlight--error' : '')
    }))
  }, [tokens, validationErrors])

  const textareaRef = useRef(null)

  const updateHeight = (el?: HTMLTextAreaElement | null) => {
    if (el) {
      el.style.height = 'auto'
      el.style.height = el.scrollHeight + 'px'
      setTimeout(() => {
        el.style.height = 'auto'
        el.style.height = el.scrollHeight + 'px'
      }, 0)
    }
  }

  useLayoutEffect(() => {
    updateHeight(textareaRef.current)
  }, [modelValue])  

  useLayoutEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      updateHeight(textareaRef.current)
    })
    if (textareaRef.current) {
      resizeObserver.observe(textareaRef.current)
    }
    return () => {
      resizeObserver.disconnect()
    }
  }, [textareaRef])

  return (
    <div className="fm-colored-input">
      <div className={'fm-colored-input__wrapper' + (isFocused ? ' fm-colored-input__wrapper--focused' : '')}>
        <textarea
          ref={textareaRef}
          value={modelValue}
          className="fm-colored-input__textarea"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          rows={1}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={event => onChange(event.target.value)}
        />
        <div className="fm-colored-input__highlight">
          {highlight?.map((highlightEntry, highlightEntryIndex) => (
            <span
              key={highlightEntry.value + highlightEntryIndex}
              className={highlightEntry.css}
            >
              {highlightEntry.value}
            </span>
          ))}
        </div>
      </div>
      <div className="fm-colored-input__validation">
        {validationErrors?.map(error => error.errorType).join(', ') }
      </div>
    </div>
  )
}
