<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { Bold, Italic, Underline, Link } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editorRef = ref<HTMLDivElement | null>(null)
const fontSize = ref(14)

let savedRange: Range | null = null

function saveSelection() {
  try {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0)
      if (editorRef.value && editorRef.value.contains(range.commonAncestorContainer)) {
        savedRange = range.cloneRange()
        return
      }
    }
  } catch {}
  if (editorRef.value) {
    const range = document.createRange()
    range.selectNodeContents(editorRef.value)
    range.collapse(false)
    savedRange = range
  }
}

function restoreSelection() {
  if (!savedRange) return
  try {
    const sel = window.getSelection()
    if (!sel) return
    sel.removeAllRanges()
    sel.addRange(savedRange)
  } catch {}
}

function focusEditor() {
  editorRef.value?.focus()
}

function applyStyleToRange(apply: (el: HTMLElement) => void) {
  saveSelection()
  focusEditor()
  restoreSelection()
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return
  const range = sel.getRangeAt(0)
  if (range.collapsed) return

  try {
    const wrapper = document.createElement('span')
    wrapper.style.display = 'inline'
    apply(wrapper)
    const fragment = range.extractContents()
    const childNodes = Array.from(fragment.childNodes)
    for (const n of childNodes) wrapper.appendChild(n)
    range.insertNode(wrapper)

    if (wrapper.childNodes.length === 1) {
      const only = wrapper.firstChild as HTMLElement
      if (only && only.nodeType === 1 && only.tagName === 'SPAN' && (only as HTMLElement).style) {
        apply(only as HTMLElement)
        wrapper.replaceWith(only)
      }
    }

    const newRange = document.createRange()
    newRange.selectNodeContents(wrapper)
    sel.removeAllRanges()
    sel.addRange(newRange)
    savedRange = newRange.cloneRange()
  } catch {}
  emitInput()
}

function toggleStyle(property: string, value: string) {
  saveSelection()
  focusEditor()
  restoreSelection()
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return

  const range = sel.getRangeAt(0)
  const container = range.commonAncestorContainer
  const parentEl = container.nodeType === 1 ? (container as HTMLElement) : container.parentElement

  let alreadyStyled = false
  if (parentEl) {
    let el: HTMLElement | null = parentEl
    while (el && el !== editorRef.value) {
      const style = (el as HTMLElement).style
      if (style && style.getPropertyValue(property) === value) {
        alreadyStyled = true
        break
      }
      el = el.parentElement
    }
  }

  if (alreadyStyled) {
    try {
      const wrapper = range.startContainer.parentElement
      if (wrapper && wrapper.style && wrapper.style.getPropertyValue(property) === value) {
        wrapper.style.removeProperty(property)
        if (!wrapper.getAttribute('style')) {
          const frag = document.createDocumentFragment()
          while (wrapper.firstChild) frag.appendChild(wrapper.firstChild)
          wrapper.replaceWith(frag)
        }
        emitInput()
        return
      }
    } catch {}
  }

  applyStyleToRange((el) => {
    el.style.setProperty(property, value)
  })
}

function setBold() {
  toggleStyle('font-weight', '700')
}

function setItalic() {
  toggleStyle('font-style', 'italic')
}

function setUnderline() {
  toggleStyle('text-decoration', 'underline')
}

function applyFontSize() {
  applyStyleToRange((el) => {
    el.style.fontSize = fontSize.value + 'px'
  })
}

function applyColor() {
  const color = prompt('Enter color (hex, rgb, or named):', '#ffffff')
  if (!color) return
  applyStyleToRange((el) => {
    el.style.color = color
  })
}

function applyLink() {
  saveSelection()
  focusEditor()
  restoreSelection()
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return
  const url = prompt('Enter URL:')
  if (!url) return
  const range = sel.getRangeAt(0)
  try {
    const a = document.createElement('a')
    a.href = url
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    a.textContent = range.toString() || url
    range.deleteContents()
    range.insertNode(a)
  } catch {
    try {
      applyStyleToRange((el) => {
        el.innerHTML = `<a href="${encodeURI(url)}" target="_blank" rel="noopener noreferrer">${el.innerHTML || url}</a>`
      })
    } catch {}
  }
  emitInput()
}

function emitInput() {
  nextTick(() => {
    if (editorRef.value) emit('update:modelValue', editorRef.value.innerHTML)
  })
}

watch(() => props.modelValue, (val) => {
  if (editorRef.value && editorRef.value.innerHTML !== val) {
    editorRef.value.innerHTML = val
  }
})
</script>

<template>
  <div class="rounded border" :style="{ borderColor: 'var(--input-border)' }">
    <div
      class="flex items-center gap-0.5 p-1 border-b"
      :style="{ background: 'var(--input-bg)', borderColor: 'var(--input-border)' }"
    >
      <button
        @mousedown.prevent="setBold"
        class="p-1.5 rounded hover:bg-white/10"
        :style="{ color: 'var(--text-primary)' }"
        title="Bold"
      >
        <Bold :size="14" />
      </button>
      <button
        @mousedown.prevent="setItalic"
        class="p-1.5 rounded hover:bg-white/10"
        :style="{ color: 'var(--text-primary)' }"
        title="Italic"
      >
        <Italic :size="14" />
      </button>
      <button
        @mousedown.prevent="setUnderline"
        class="p-1.5 rounded hover:bg-white/10"
        :style="{ color: 'var(--text-primary)' }"
        title="Underline"
      >
        <Underline :size="14" />
      </button>
      <select
        v-model="fontSize"
        @mousedown.prevent
        @change="applyFontSize"
        class="ml-1 px-1 py-0.5 text-xs rounded border outline-none"
        :style="{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }"
      >
        <option v-for="s in [10, 12, 14, 16, 18, 20, 24, 28, 32]" :key="s" :value="s">{{ s }}px</option>
      </select>
      <button
        @mousedown.prevent="applyColor"
        class="p-1.5 rounded hover:bg-white/10 ml-1"
        :style="{ color: 'var(--text-primary)' }"
        title="Color"
      >
        <div class="w-3.5 h-3.5 rounded-sm border" :style="{ background: 'var(--accent)', borderColor: 'var(--input-border)' }" />
      </button>
      <button
        @mousedown.prevent="applyLink"
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
      spellcheck="false"
      @input="emitInput"
      @mouseup="saveSelection"
      @keyup="saveSelection"
      @focusout="saveSelection"
      class="p-2 text-sm min-h-[80px] outline-none"
      :style="{ color: 'var(--text-primary)', background: 'var(--input-bg)' }"
      v-html="modelValue"
    />
  </div>
</template>
