<script setup lang="ts">
import { ref, watch } from 'vue'
import { Bold, Italic, Underline, Link } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editorRef = ref<HTMLDivElement | null>(null)
const fontSize = ref(14)

watch(() => props.modelValue, (val) => {
  if (editorRef.value && editorRef.value.innerHTML !== val) {
    editorRef.value.innerHTML = val
  }
})

function onInput() {
  if (editorRef.value) {
    emit('update:modelValue', editorRef.value.innerHTML)
  }
}

function execCmd(command: string, value?: string) {
  document.execCommand(command, false, value)
  editorRef.value?.focus()
  onInput()
}

function applyFontSize() {
  execCmd('fontSize', '7')
  const fontElements = editorRef.value?.querySelectorAll('font[size="7"]')
  fontElements?.forEach(el => {
    const span = document.createElement('span')
    span.style.fontSize = fontSize.value + 'px'
    span.innerHTML = el.innerHTML
    el.replaceWith(span)
  })
  onInput()
}

function applyLink() {
  const url = prompt('URL:')
  if (url) {
    execCmd('createLink', url)
  }
}
</script>

<template>
  <div class="rounded border" :style="{ borderColor: 'var(--input-border)' }">
    <div
      class="flex items-center gap-0.5 p-1 border-b"
      :style="{ background: 'var(--input-bg)', borderColor: 'var(--input-border)' }"
    >
      <button
        @click="execCmd('bold')"
        class="p-1.5 rounded hover:bg-white/10"
        :style="{ color: 'var(--text-primary)' }"
        title="Bold"
      >
        <Bold :size="14" />
      </button>
      <button
        @click="execCmd('italic')"
        class="p-1.5 rounded hover:bg-white/10"
        :style="{ color: 'var(--text-primary)' }"
        title="Italic"
      >
        <Italic :size="14" />
      </button>
      <button
        @click="execCmd('underline')"
        class="p-1.5 rounded hover:bg-white/10"
        :style="{ color: 'var(--text-primary)' }"
        title="Underline"
      >
        <Underline :size="14" />
      </button>
      <select
        v-model="fontSize"
        @change="applyFontSize"
        class="ml-1 px-1 py-0.5 text-xs rounded border outline-none"
        :style="{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }"
      >
        <option v-for="s in [10, 12, 14, 16, 18, 20, 24, 28, 32]" :key="s" :value="s">{{ s }}px</option>
      </select>
      <button
        @click="execCmd('foreColor', 'var(--text-primary)')"
        class="p-1.5 rounded hover:bg-white/10 ml-1"
        :style="{ color: 'var(--text-primary)' }"
        title="Color"
      >
        <div class="w-3.5 h-3.5 rounded-sm border" :style="{ background: 'var(--accent)', borderColor: 'var(--input-border)' }" />
      </button>
      <button
        @click="applyLink"
        class="p-1.5 rounded hover:bg-white/10"
        :style="{ color: 'var(--text-primary)' }"
        title="Link"
      >
        <Link :size="14" />
      </button>
    </div>
    <div
      ref="editorRef"
      contenteditable="true"
      @input="onInput"
      class="p-2 text-sm min-h-[80px] outline-none"
      :style="{ color: 'var(--text-primary)', background: 'var(--input-bg)' }"
      v-html="modelValue"
    />
  </div>
</template>
