<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGraphStore } from '@/stores/graph'
import { useUiStore } from '@/stores/ui'
import { useThemeStore } from '@/stores/theme'
import { X, Search } from 'lucide-vue-next'
import {
  Home, Settings, User, Users, Folder, File, FileText, Image, Camera, Video,
  Music, Mic, Phone, Mail, MessageSquare, MessageCircle, Bell, Calendar,
  Clock, MapPin, Globe, Wifi, Bluetooth, Battery, Zap, Sun, Moon, Star,
  Heart, ThumbsUp, ThumbsDown, Smile, Frown, Eye, Lock, Unlock, Key,
  Shield, AlertTriangle, CheckCircle, XCircle, Info, HelpCircle, Plus,
  Minus, X as XIcon, ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Download, Upload, Share,
  Copy, Trash, Edit, Save, RefreshCw, RotateCw, ZoomIn, ZoomOut,
  Maximize, Minimize, Move, MousePointer, PenTool, Type, Palette,
  Layout, Grid, List, Filter, SortAsc, Code, Terminal, Database,
  Server, Cpu, HardDrive, Cloud, Archive, Package, Box, Layers,
  Bookmark, Flag, Tag, Link, ExternalLink, Paperclip, Send, Printer,
  Scissors, Target, Crosshair, Compass, Activity, BarChart, PieChart,
  TrendingUp, TrendingDown
} from 'lucide-vue-next'

const graphStore = useGraphStore()
const uiStore = useUiStore()
const themeStore = useThemeStore()

const searchQuery = ref('')

interface IconEntry {
  name: string
  component: any
}

const icons: IconEntry[] = [
  { name: 'home', component: Home },
  { name: 'settings', component: Settings },
  { name: 'user', component: User },
  { name: 'users', component: Users },
  { name: 'folder', component: Folder },
  { name: 'file', component: File },
  { name: 'file-text', component: FileText },
  { name: 'image', component: Image },
  { name: 'camera', component: Camera },
  { name: 'video', component: Video },
  { name: 'music', component: Music },
  { name: 'mic', component: Mic },
  { name: 'phone', component: Phone },
  { name: 'mail', component: Mail },
  { name: 'message-square', component: MessageSquare },
  { name: 'message-circle', component: MessageCircle },
  { name: 'bell', component: Bell },
  { name: 'calendar', component: Calendar },
  { name: 'clock', component: Clock },
  { name: 'map-pin', component: MapPin },
  { name: 'globe', component: Globe },
  { name: 'wifi', component: Wifi },
  { name: 'bluetooth', component: Bluetooth },
  { name: 'battery', component: Battery },
  { name: 'zap', component: Zap },
  { name: 'sun', component: Sun },
  { name: 'moon', component: Moon },
  { name: 'star', component: Star },
  { name: 'heart', component: Heart },
  { name: 'thumbs-up', component: ThumbsUp },
  { name: 'thumbs-down', component: ThumbsDown },
  { name: 'smile', component: Smile },
  { name: 'frown', component: Frown },
  { name: 'eye', component: Eye },
  { name: 'lock', component: Lock },
  { name: 'unlock', component: Unlock },
  { name: 'key', component: Key },
  { name: 'shield', component: Shield },
  { name: 'alert-triangle', component: AlertTriangle },
  { name: 'check-circle', component: CheckCircle },
  { name: 'x-circle', component: XCircle },
  { name: 'info', component: Info },
  { name: 'help-circle', component: HelpCircle },
  { name: 'plus', component: Plus },
  { name: 'minus', component: Minus },
  { name: 'chevron-up', component: ChevronUp },
  { name: 'chevron-down', component: ChevronDown },
  { name: 'chevron-left', component: ChevronLeft },
  { name: 'chevron-right', component: ChevronRight },
  { name: 'arrow-up', component: ArrowUp },
  { name: 'arrow-down', component: ArrowDown },
  { name: 'arrow-left', component: ArrowLeft },
  { name: 'arrow-right', component: ArrowRight },
  { name: 'download', component: Download },
  { name: 'upload', component: Upload },
  { name: 'share', component: Share },
  { name: 'copy', component: Copy },
  { name: 'trash', component: Trash },
  { name: 'edit', component: Edit },
  { name: 'save', component: Save },
  { name: 'refresh-cw', component: RefreshCw },
  { name: 'zoom-in', component: ZoomIn },
  { name: 'zoom-out', component: ZoomOut },
  { name: 'maximize', component: Maximize },
  { name: 'minimize', component: Minimize },
  { name: 'move', component: Move },
  { name: 'mouse-pointer', component: MousePointer },
  { name: 'pen-tool', component: PenTool },
  { name: 'type', component: Type },
  { name: 'palette', component: Palette },
  { name: 'layout', component: Layout },
  { name: 'grid', component: Grid },
  { name: 'list', component: List },
  { name: 'filter', component: Filter },
  { name: 'code', component: Code },
  { name: 'terminal', component: Terminal },
  { name: 'database', component: Database },
  { name: 'server', component: Server },
  { name: 'cpu', component: Cpu },
  { name: 'hard-drive', component: HardDrive },
  { name: 'cloud', component: Cloud },
  { name: 'archive', component: Archive },
  { name: 'package', component: Package },
  { name: 'box', component: Box },
  { name: 'layers', component: Layers },
  { name: 'bookmark', component: Bookmark },
  { name: 'flag', component: Flag },
  { name: 'tag', component: Tag },
  { name: 'link', component: Link },
  { name: 'external-link', component: ExternalLink },
  { name: 'paperclip', component: Paperclip },
  { name: 'send', component: Send },
  { name: 'printer', component: Printer },
  { name: 'scissors', component: Scissors },
  { name: 'target', component: Target },
  { name: 'compass', component: Compass },
  { name: 'activity', component: Activity },
  { name: 'bar-chart', component: BarChart },
  { name: 'trending-up', component: TrendingUp },
  { name: 'trending-down', component: TrendingDown },
]

const filteredIcons = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return icons
  return icons.filter(ic => ic.name.includes(q))
})

function close() {
  uiStore.showIconSearch = false
}

function selectIcon(name: string) {
  if (uiStore.selectedNodeIds.length === 1) {
    graphStore.updateNode(uiStore.selectedNodeIds[0], { iconRef: name })
  }
  close()
}
</script>

<template>
  <div v-if="uiStore.showIconSearch" class="modal-overlay" @click.self="close">
    <div
      class="modal-content"
      :style="{ background: themeStore.themeColors.panelBg, border: `1px solid ${themeStore.themeColors.panelBorder}`, maxWidth: '520px' }"
    >
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold" :style="{ color: themeStore.themeColors.textPrimary }">搜索图标</h2>
        <button @click="close" class="p-1 rounded hover:bg-white/10" :style="{ color: themeStore.themeColors.textSecondary }">
          <X :size="20" />
        </button>
      </div>

      <div class="relative mb-3">
        <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2" :style="{ color: themeStore.themeColors.textSecondary }" />
        <input
          v-model="searchQuery"
          placeholder="搜索图标..."
          class="w-full pl-9 pr-3 py-2 text-sm rounded-lg border outline-none"
          :style="{ background: themeStore.themeColors.inputBg, borderColor: themeStore.themeColors.inputBorder, color: themeStore.themeColors.textPrimary }"
        />
      </div>

      <div class="grid grid-cols-8 gap-1.5 max-h-80 overflow-y-auto">
        <button
          v-for="icon in filteredIcons"
          :key="icon.name"
          @click="selectIcon(icon.name)"
          class="flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors"
          :style="{ color: themeStore.themeColors.textSecondary }"
          :title="icon.name"
        >
          <component :is="icon.component" :size="20" />
          <span class="text-[9px] truncate w-full text-center">{{ icon.name }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
