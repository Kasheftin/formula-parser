<template>
  <div class="fm-input">
    <div
      :class="{
        'fm-input__wrapper--focused': isFocused
      }"
      class="fm-input__wrapper"
    >
      <textarea
        ref="textareaRef"
        v-model="modelValue"
        class="fm-input__textarea"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        rows="1"
        @focus="isFocused = true"
        @blur="isFocused = false"
      />
      <div class="fm-input__highlight">
        <span
          v-for="(highlightEntry, highlightEntryIndex) in highlight"
          :key="highlightEntry.value + highlightEntryIndex"
          :class="highlightEntry.css"
        >
          {{ highlightEntry.value }}
        </span>
      </div>
    </div>
    <div class="fm-input__validation">
      {{ props.validationErrors?.map(error => error.errorType).join(', ') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, computed, watch, onMounted } from 'vue'
import type { Token, ValidationError } from '../../shared/src'

type Props = {
  modelValue: string,
  tokens?: Token[],
  validationErrors?: ValidationError[]
}

const props = defineProps<Props>()
const emit = defineEmits(['update:model-value'])
const isFocused = ref(false)
const modelValue = ref('')
const textareaRef = ref<HTMLTextAreaElement>()

const updateHeight = () => {
  const el = textareaRef.value
  if (el) {
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
    setTimeout(() => {
      el.style.height = 'auto'
      el.style.height = el.scrollHeight + 'px'
    }, 0)
  }
}

const highlight = computed(() => {
  const errorsByTokenIndexes = props.validationErrors?.reduce((out: Record<number, boolean>, error) => {
    if (error.tokenIndex || error.tokenIndex === 0) {
      out[error.tokenIndex] = true
    }
    return out
  }, {})
  return props.tokens?.map((token, tokenIndex) => ({
    value: token.value,
    css: `fm-input__highlight--${token.type}` + (errorsByTokenIndexes?.[tokenIndex] ? ' fm-input__highlight--error' : '')
  }))
})

watch(() => props.modelValue, (value) => {
  modelValue.value = value
}, { immediate: true })

watch(modelValue, (value) => {
  emit('update:model-value', value)
  updateHeight()
}, { immediate: true })

onMounted(updateHeight)

</script>
