<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGraphStore } from '@/stores/graph'
import { useUiStore } from '@/stores/ui'
import { useThemeStore } from '@/stores/theme'
import { X, Search } from 'lucide-vue-next'
import * as LucideAll from 'lucide-vue-next'

const graphStore = useGraphStore()
const uiStore = useUiStore()
const themeStore = useThemeStore()

const searchQuery = ref('')

interface IconEntry {
  name: string
  kebabName: string
  component: any
}

const SKIP = new Set([
  'default', 'createLucideIcon', 'LucideIcon', 'Icon', 'IconNode', 'IconProps',
  'Icons', 'IconsList', 'aliases', 'toKebabCase', 'lucide',
  '__esModule', '__esModule',
])

function toKebabCase(pascal: string): string {
  return pascal.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

const ICONS: IconEntry[] = (() => {
  const list: IconEntry[] = []
  const seen = new Set<string>()
  const keys = Object.keys(LucideAll)
  for (const key of keys) {
    if (SKIP.has(key)) continue
    if (key.startsWith('use') || key.startsWith('create')) continue
    if (typeof (LucideAll as any)[key] !== 'function' && typeof (LucideAll as any)[key] !== 'object') continue
    const kebab = toKebabCase(key)
    if (seen.has(kebab)) continue
    seen.add(kebab)
    list.push({ name: key, kebabName: kebab, component: (LucideAll as any)[key] })
  }
  return list.sort((a, b) => a.kebabName.localeCompare(b.kebabName))
})()

const ALIASES: Record<string, string[]> = {
  trash: ['delete', 'remove', 'bin', 'garbage'],
  delete: ['trash', 'remove'],
  settings: ['config', 'gear', 'options', 'preferences', 'cog'],
  gear: ['settings', 'config'],
  cog: ['settings', 'gear'],
  config: ['settings', 'options'],
  save: ['disk', 'floppy', 'store', 'write'],
  edit: ['pencil', 'write', 'modify', 'change'],
  pencil: ['edit', 'write'],
  folder: ['directory', 'dir', 'file-folder'],
  image: ['photo', 'picture', 'img', 'photograph'],
  photo: ['image', 'picture'],
  mail: ['email', 'letter', 'envelope', 'message'],
  email: ['mail', 'envelope'],
  message: ['chat', 'talk', 'comment', 'mail'],
  chat: ['message', 'talk'],
  bell: ['notification', 'alert', 'ring'],
  notification: ['bell', 'alert'],
  search: ['find', 'lookup', 'magnifier', 'magnifying-glass'],
  find: ['search', 'lookup'],
  plus: ['add', 'new', 'create', 'plus-sign'],
  add: ['plus', 'new', 'create'],
  minus: ['remove', 'subtract', 'less'],
  x: ['close', 'cancel', 'cross', 'remove'],
  close: ['x', 'cancel', 'exit'],
  cancel: ['close', 'x', 'exit'],
  exit: ['close', 'x', 'logout'],
  check: ['success', 'ok', 'done', 'tick', 'accept'],
  success: ['check', 'ok', 'done'],
  home: ['house', 'main', 'start'],
  user: ['person', 'account', 'profile', 'member'],
  account: ['user', 'profile'],
  profile: ['user', 'person'],
  calendar: ['date', 'schedule', 'event'],
  date: ['calendar', 'schedule'],
  clock: ['time', 'timer', 'watch'],
  time: ['clock', 'timer', 'hour'],
  map: ['location', 'gps', 'map-pin'],
  location: ['map', 'pin', 'gps'],
  pin: ['map-pin', 'location'],
  moon: ['night', 'dark', 'dark-mode'],
  night: ['moon', 'dark'],
  sun: ['day', 'light', 'bright'],
  day: ['sun', 'light'],
  star: ['favorite', 'bookmark-star', 'rate'],
  favorite: ['star', 'like'],
  heart: ['like', 'love', 'favorite'],
  like: ['heart', 'love'],
  lock: ['secure', 'password', 'private', 'locked'],
  unlock: ['open-lock', 'unlocked'],
  key: ['password', 'login', 'access'],
  password: ['lock', 'key', 'login'],
  arrowup: ['arrow-up', 'up-arrow', 'up'],
  arrowdown: ['arrow-down', 'down-arrow', 'down'],
  arrowleft: ['arrow-left', 'left-arrow', 'left'],
  arrowright: ['arrow-right', 'right-arrow', 'right'],
  up: ['arrow-up', 'uparrow'],
  down: ['arrow-down', 'downarrow'],
  left: ['arrow-left', 'leftarrow'],
  right: ['arrow-right', 'rightarrow'],
  download: ['save', 'export', 'get'],
  upload: ['import', 'put', 'send'],
  share: ['link', 'social'],
  copy: ['duplicate', 'clone', 'paste-source'],
  paste: ['clipboard-paste', 'insert'],
  cut: ['scissors', 'clipboard-cut'],
  refresh: ['reload', 'sync', 'rotate-cw'],
  reload: ['refresh', 'reboot'],
  zoom: ['magnify', 'zoom-in', 'zoom-out'],
  maximize: ['fullscreen', 'expand'],
  minimize: ['minimise', 'shrink', 'collapse'],
  fullscreen: ['maximize', 'expand'],
  move: ['drag', 'pan', 'move-3d'],
  code: ['coding', 'programming', 'script'],
  terminal: ['console', 'shell', 'command-line', 'cmd'],
  console: ['terminal', 'shell'],
  database: ['db', 'sql', 'storage'],
  db: ['database', 'sql'],
  cloud: ['cloud-computing', 'online'],
  file: ['document', 'doc'],
  document: ['file', 'doc'],
  tag: ['label', 'category', 'hashtag'],
  label: ['tag', 'category'],
  link: ['url', 'hyperlink', 'chain'],
  url: ['link', 'hyperlink'],
  camera: ['photo-camera', 'video-camera'],
  video: ['play', 'film', 'movie'],
  music: ['audio', 'song', 'note'],
  audio: ['music', 'sound'],
  phone: ['call', 'telephone', 'mobile'],
  call: ['phone', 'telephone'],
  wifi: ['internet', 'network', 'connection'],
  network: ['wifi', 'connection', 'graph'],
  battery: ['power', 'charge'],
  power: ['battery', 'on-off', 'toggle'],
  zap: ['lightning', 'bolt', 'electricity', 'energy'],
  lightning: ['zap', 'bolt', 'flash'],
  shield: ['security', 'protect', 'safety'],
  security: ['shield', 'protect'],
  alert: ['warning', 'bell', 'notification'],
  warning: ['alert', 'triangle', 'danger'],
  info: ['information', 'help'],
  help: ['question', 'info'],
  filter: ['sort-filter', 'search-filter'],
  list: ['bullet-list', 'ordered-list'],
  grid: ['grid-3x3', 'table'],
  layout: ['template', 'design', 'structure'],
  palette: ['color', 'paint', 'theme'],
  color: ['palette', 'paint'],
  send: ['paper-plane', 'submit', 'deliver'],
  paperclip: ['attach', 'attachment'],
  attach: ['paperclip', 'attachment'],
  printer: ['print', 'fax'],
  print: ['printer'],
  flag: ['report', 'mark', 'priority'],
  bookmark: ['save-bookmark', 'star', 'favorite-bookmark'],
  layers: ['stack', 'overlay', 'levels'],
  stack: ['layers', 'pile'],
  package: ['box', 'parcel', 'delivery'],
  box: ['package', 'cube', 'container'],
  archive: ['zip', 'compress', 'backup'],
  backup: ['archive', 'save-backup'],
  activity: ['pulse', 'heartbeat', 'chart-line'],
  pulse: ['activity', 'heartbeat'],
  barchart: ['bar-chart', 'chart-bar', 'statistics', 'analytics'],
  piechart: ['pie-chart', 'chart-pie', 'analytics'],
  chart: ['graph', 'analytics', 'diagram'],
  analytics: ['chart', 'stats', 'graph'],
  trending: ['trend', 'arrow-trend', 'progress'],
  progress: ['trending', 'bar', 'loading'],
  target: ['goal', 'bullseye', 'aim'],
  bullseye: ['target', 'aim'],
  crosshair: ['target', 'aim', 'focus'],
  compass: ['direction', 'navigation', 'navigate'],
  navigation: ['compass', 'navigate', 'gps'],
  scissors: ['cut', 'clip'],
  type: ['text', 'font', 'typography'],
  text: ['type', 'font'],
  font: ['type', 'text'],
  pentool: ['pen-tool', 'pen', 'draw'],
  pen: ['write', 'pencil', 'edit'],
  mousepointer: ['mouse-pointer', 'cursor', 'pointer', 'select'],
  cursor: ['pointer', 'mouse'],
  pointer: ['cursor', 'mouse', 'select'],
  rotate: ['refresh', 'spin'],
  server: ['host', 'backend', 'server-rack'],
  host: ['server', 'backend'],
  cpu: ['processor', 'chip', 'microchip'],
  processor: ['cpu', 'chip'],
  harddrive: ['hard-drive', 'hdd', 'storage-disk'],
  hdd: ['hard-drive', 'disk'],
  external: ['external-link', 'open-outside'],
}

function buildAliasMap(): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>()
  const add = (k: string, v: string) => {
    const key = k.toLowerCase()
    const val = v.toLowerCase()
    if (!map.has(key)) map.set(key, new Set())
    map.get(key)!.add(val)
  }
  for (const main of Object.keys(ALIASES)) {
    for (const alias of ALIASES[main]) {
      add(main, alias)
      add(alias, main)
      for (const alias2 of ALIASES[main]) {
        if (alias !== alias2) add(alias, alias2)
      }
    }
  }
  return map
}

const aliasMap = buildAliasMap()

function tokenize(s: string): string[] {
  return s.toLowerCase().split(/[\s\-_.]+/).filter(t => t.length > 0)
}

function matches(entry: IconEntry, query: string): boolean {
  if (!query) return true
  const q = query.toLowerCase().trim()
  if (!q) return true
  const kebab = entry.kebabName.toLowerCase()
  const name = entry.name.toLowerCase()

  if (kebab.includes(q) || name.includes(q)) return true
  if (kebab === q || name === q) return true

  const qTokens = tokenize(q)
  const entryTokens = tokenize(kebab)
  let allHit = true
  for (const qt of qTokens) {
    let hit = false
    for (const et of entryTokens) {
      if (et === qt || et.startsWith(qt) || et.includes(qt)) { hit = true; break }
    }
    if (!hit) { allHit = false; break }
  }
  if (allHit) return true

  for (const qt of qTokens) {
    const aliases = aliasMap.get(qt)
    if (aliases) {
      for (const a of aliases) {
        if (kebab.includes(a) || name.includes(a)) return true
        for (const et of entryTokens) {
          if (et === a || et.startsWith(a)) return true
        }
      }
    }
  }

  return false
}

const filteredIcons = computed(() => {
  const q = searchQuery.value.trim()
  if (!q) return ICONS.slice(0, 96)
  return ICONS.filter(ic => matches(ic, q))
})

const totalIconsCount = ICONS.length
const matchedIconsCount = computed(() => filteredIcons.value.length)

function close() {
  uiStore.showIconSearch = false
}

function selectIcon(kebabName: string) {
  if (uiStore.selectedNodeIds.length === 1) {
    graphStore.updateNode(uiStore.selectedNodeIds[0], { iconRef: kebabName })
  }
  close()
}
</script>

<template>
  <div v-if="uiStore.showIconSearch" class="modal-overlay" @click.self="close">
    <div
      class="modal-content"
      :style="{ background: themeStore.themeColors.panelBg, border: `1px solid ${themeStore.themeColors.panelBorder}`, maxWidth: '560px' }"
    >
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-semibold" :style="{ color: themeStore.themeColors.textPrimary }">搜索图标</h2>
        <div class="flex items-center gap-3">
          <span class="text-xs" :style="{ color: themeStore.themeColors.textSecondary }">
            {{ matchedIconsCount }} / {{ totalIconsCount }}
          </span>
          <button @click="close" class="p-1 rounded hover:bg-white/10" :style="{ color: themeStore.themeColors.textSecondary }">
            <X :size="20" />
          </button>
        </div>
      </div>

      <div class="relative mb-3">
        <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2" :style="{ color: themeStore.themeColors.textSecondary }" />
        <input
          v-model="searchQuery"
          placeholder="搜索图标名称或关键字（如 delete、gear、photo）..."
          class="w-full pl-9 pr-3 py-2 text-sm rounded-lg border outline-none"
          :style="{ background: themeStore.themeColors.inputBg, borderColor: themeStore.themeColors.inputBorder, color: themeStore.themeColors.textPrimary }"
          autofocus
        />
      </div>

      <div class="grid grid-cols-8 gap-1.5 max-h-80 overflow-y-auto pr-1">
        <button
          v-for="icon in filteredIcons"
          :key="icon.kebabName"
          @click="selectIcon(icon.kebabName)"
          class="flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-colors hover:bg-white/10"
          :style="{ color: themeStore.themeColors.textSecondary }"
          :title="icon.kebabName"
        >
          <component :is="icon.component" :size="20" />
          <span class="text-[9px] truncate w-full text-center">{{ icon.kebabName }}</span>
        </button>
      </div>

      <div v-if="searchQuery && matchedIconsCount === 0" class="mt-2 text-center text-xs" :style="{ color: themeStore.themeColors.textSecondary }">
        没有匹配的图标，请尝试其他关键字。
      </div>
    </div>
  </div>
</template>
