<template>
  <main class="fm-container">
    <div class="fm-block">
      <div class="fm-block__title">
        Formula Parser Vue Demo
      </div>
      <div class="fm-block__text">
        This is the demo for <a class="fm-link" href="/">Formula Parser in JavaScript/Vue/React</a> publication. 
      </div>
    </div>
    <div class="fm-block">
      <div class="fm-block__title">
        Formulas
      </div>
      <div class="fm-block__content">
        <table class="fm-table">
          <thead>
            <tr>
              <th class="fm-table__col fm-table__col--header" width="25%">
                referenceName
              </th>
              <th class="fm-table__col fm-table__col--header">
                formula
              </th>
              <th class="fm-table__col fm-table__col--header" width="50px" />
            </tr>
          </thead>
          <tbody>
            <tr v-for="field, fieldIndex in fields" :key="field.id">
              <td class="fm-table__col fm-table__col--input">
                <input v-model="field.referenceName" type="text" class="fm-input" />
              </td>
              <td class="fm-table__col fm-table__col--input">
                <FormulaInput
                  v-model="field.formula"
                  :tokens="extendedTokensByRefs[field.referenceName]?.tokens"
                  :validation-errors="extendedTokensByRefs[field.referenceName]?.validationErrors"
                />
              </td>
              <td class="fm-table__col">
                <button class="fm-btn" @click="fields.splice(fieldIndex, 1)">
                  &times;
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="fm-block__actions">
        <button class="fm-btn" @click="addField">
          Add Formula
        </button>
      </div>
    </div>
    <div class="fm-block">
      <div class="fm-block__title">
        Items Table
      </div>
      <div class="fm-block__content">
        <table class="fm-table">
          <thead>
            <tr>
              <th
                v-for="column in columns" 
                :key="column.key" 
                class="fm-table__col fm-table__col--header"
              >
                {{ column.title }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in extendedItems" :key="item.id">
              <td 
                v-for="column in columns" 
                :key="column.key" 
                :class="`fm-table__col fm-table__col--${column.key}`"
              >
                <span v-if="extendedTokensByRefs[column.key]?.validationErrors?.length" class="fm-validation">
                  INVALID
                </span>
                <span v-else>
                  {{ item[column.key] || '' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { evaluateTokenNodes, getExtendedTokens, type ExtendedFormulaEntry } from '@/shared/src'
import { generateItems, generateFormulaFields, supportedColumns, supportedRefs } from '@/shared-demo/gen'
import FormulaInput from './FormulaInput.vue'

const fields = ref(generateFormulaFields())

const addField = () => {
  fields.value.push({
    id: crypto.randomUUID(),
    referenceName: '',
    formula: ''
  })
}

const formulasByRefs = computed(() => fields.value.reduce((out: Record<string, string>, field) => {
  if (field.referenceName) {
    out[field.referenceName] = field.formula
  }
  return out
}, {}))

const extendedTokens = computed(() => getExtendedTokens(formulasByRefs.value, supportedRefs))

const extendedTokensByRefs = computed(() => Object.values(extendedTokens.value).reduce((out: Record<string, ExtendedFormulaEntry>, entry) => {
  out[entry.referenceNameOrig] = entry
  return out
}, {}))

const extendedTokensOrdered = computed(() => Object.values(extendedTokens.value).sort((a, b) => a.order - b.order))

const columns = computed(() => [
  ...supportedColumns, 
  ...fields.value.map(field => ({ key: field.referenceName, title: field.referenceName, type: 'formula' }))
])

const items = ref(generateItems())
const extendedItems = computed(() => items.value.map((item) => {
  const extendedItem: Record<string, string> = {}
  Object.entries(item).forEach(([key, value]) => {
    extendedItem[key] = (value === 0 ? 0 : (value || '')).toString()
  })
  extendedTokensOrdered.value.forEach((entry) => {
    extendedItem[entry.referenceNameOrig] = evaluateTokenNodes(entry.tokenNodes, (prop: string) => (extendedItem[prop] || '').toString()) 
  })
  return extendedItem
}))
</script>

