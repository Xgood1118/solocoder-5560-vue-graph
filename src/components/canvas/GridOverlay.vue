<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
</script>

<template>
  <g>
    <defs>
      <pattern
        id="grid-pattern"
        width="20"
        height="20"
        patternUnits="userSpaceOnUse"
      >
        <circle
          cx="10"
          cy="10"
          r="1.5"
          :fill="themeStore.themeColors.gridDot"
        />
      </pattern>
    </defs>
    <rect
      x="-2000"
      y="-2000"
      width="7000"
      height="7000"
      fill="url(#grid-pattern)"
      pointer-events="none"
    />
  </g>
</template>
