<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'
import { useGraphStore } from '@/stores/graph'
import { useUiStore } from '@/stores/ui'
import { useThemeStore } from '@/stores/theme'
import { useKeyboard } from '@/composables/useKeyboard'
import { saveDocument, loadDocument } from '@/utils/persistence'
import { applyThemeToDom } from '@/utils/themes'
import TopBar from '@/components/toolbar/TopBar.vue'
import Toolbar from '@/components/toolbar/Toolbar.vue'
import SvgCanvas from '@/components/canvas/SvgCanvas.vue'
import EdgeRenderer from '@/components/edges/EdgeRenderer.vue'
import PropertyPanel from '@/components/panels/PropertyPanel.vue'
import NodeCreatePanel from '@/components/panels/NodeCreatePanel.vue'
import ContextMenu from '@/components/menus/ContextMenu.vue'
import TemplateModal from '@/components/modals/TemplateModal.vue'
import ExportModal from '@/components/modals/ExportModal.vue'
import ImportModal from '@/components/modals/ImportModal.vue'
import IconSearch from '@/components/modals/IconSearch.vue'
import SearchBar from '@/components/panels/SearchBar.vue'

const graphStore = useGraphStore()
const uiStore = useUiStore()
const themeStore = useThemeStore()

useKeyboard()

const canvasContainerRef = ref<HTMLDivElement | null>(null)

let saveTimer: ReturnType<typeof setTimeout> | null = null

function debouncedSave() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    saveDocument(graphStore.document)
  }, 500)
}

watch(() => graphStore.document, debouncedSave, { deep: true })

watch(() => themeStore.themeColors, () => {
  applyThemeToDom(themeStore.currentTheme)
}, { immediate: true })

onMounted(async () => {
  const savedTheme = localStorage.getItem('graph-editor-theme')
  if (savedTheme) themeStore.setTheme(savedTheme as any)
  applyThemeToDom(themeStore.currentTheme)

  let loaded = false
  const docId = localStorage.getItem('graph-editor-current-doc')
  if (docId) {
    const doc = await loadDocument(docId)
    if (doc && doc.nodes && doc.nodes.length > 0) {
      graphStore.setDocument(doc)
      loaded = true
    }
  }

  if (!loaded) {
    const { templates } = await import('@/utils/templates')
    const flowchart = templates[0]
    const newDoc = {
      id: 'doc_' + Date.now(),
      name: flowchart.name,
      templateId: flowchart.id,
      nodes: JSON.parse(JSON.stringify(flowchart.nodes)),
      edges: JSON.parse(JSON.stringify(flowchart.edges)),
      groups: JSON.parse(JSON.stringify(flowchart.groups)),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    graphStore.setDocument(newDoc)
    localStorage.setItem('graph-editor-current-doc', newDoc.id)
    saveDocument(newDoc)
  }
})

watch(() => graphStore.document.id, (newId) => {
  localStorage.setItem('graph-editor-current-doc', newId)
})
</script>

<template>
  <div class="w-full h-full relative overflow-hidden" :style="{ background: themeStore.themeColors.canvasBg }">
    <TopBar />
    <Toolbar />

    <div ref="canvasContainerRef" class="absolute inset-0" :style="{ top: '40px' }">
      <SvgCanvas>
        <template #edges>
          <EdgeRenderer
            v-for="edge in graphStore.edges"
            :key="edge.id"
            :edge="edge"
          />
        </template>
      </SvgCanvas>
    </div>

    <SearchBar v-if="uiStore.showSearchBar" />
    <PropertyPanel />
    <NodeCreatePanel />
    <ContextMenu />
    <TemplateModal />
    <ExportModal />
    <ImportModal />
    <IconSearch />
  </div>
</template>
