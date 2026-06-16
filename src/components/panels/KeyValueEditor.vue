<script setup lang="ts">
import { computed } from 'vue'
import { X } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: Record<string, string>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, string>]
}>()

const pairs = computed(() => Object.entries(props.modelValue).map(([key, value]) => ({ key, value })))

function updatePair(index: number, field: 'key' | 'value', val: string) {
  const entries = Object.entries(props.modelValue)
  entries[index][field] = val
  emit('update:modelValue', Object.fromEntries(entries))
}

function removePair(index: number) {
  const entries = Object.entries(props.modelValue)
  entries.splice(index, 1)
  emit('update:modelValue', Object.fromEntries(entries))
}

function addPair() {
  const entries = Object.entries(props.modelValue)
  let newKey = 'key'
  let counter = 1
  while (props.modelValue.hasOwnProperty(newKey)) {
    newKey = `key${counter}`
    counter++
  }
  entries.push([newKey, ''])
  emit('update:modelValue', Object.fromEntries(entries))
}
</script>

<template>
  <div class="space-y-1.5">
    <div v-for="(pair, i) in pairs" :key="i" class="flex items-center gap-1">
      <input
        :value="pair.key"
        @input="updatePair(i, 'key', ($event.target as HTMLInputElement).value)"
        class="flex-1 min-w-0 px-2 py-1 text-xs rounded border outline-none"
        :style="{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }"
      />
      <input
        :value="pair.value"
        @input="updatePair(i, 'value', ($event.target as HTMLInputElement).value)"
        class="flex-1 min-w-0 px-2 py-1 text-xs rounded border outline-none"
        :style="{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }"
      />
      <button
        @click="removePair(i)"
        class="p-1 rounded hover:bg-red-500/20"
        :style="{ color: 'var(--danger)' }"
      >
        <X :size="14" />
      </button>
    </div>
    <button
      @click="addPair"
      class="w-full text-xs py-1 rounded border border-dashed"
      :style="{ borderColor: 'var(--input-border)', color: 'var(--text-secondary)' }"
    >
      + 添加
    </button>
  </div>
</template>
