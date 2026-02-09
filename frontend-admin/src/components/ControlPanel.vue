<template>
  <div class="control-panel">
    <div class="control-panel__actions">
      <button
        :class="['control-panel__btn', 'control-panel__btn--primary', { 'control-panel__btn--loading': isLoading }]"
        @click="onPlayPause"
        :disabled="isLoading"
        type="button"
      >
        <span v-if="isLoading" class="control-panel__spinner"></span>
        <svg v-else-if="isPlaying" class="control-panel__icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
        </svg>
        <svg v-else class="control-panel__icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
        <span>{{ isPlaying ? '暂停' : '播放' }}</span>
      </button>

      <button
        class="control-panel__btn control-panel__btn--secondary"
        @click="$emit('reset')"
        type="button"
      >
        <svg class="control-panel__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>重置</span>
      </button>
    </div>

    <div class="control-panel__progress">
      <div class="control-panel__progress-header">
        <span class="control-panel__progress-label">播放进度</span>
        <span class="control-panel__progress-time">
          {{ formatTime(currentTime) }}
          <template v-if="effectiveEndTime > 0">
            / {{ formatTime(effectiveEndTime) }}
          </template>
        </span>
      </div>
      <div class="control-panel__progress-track">
        <div
          class="control-panel__progress-fill"
          :style="{ width: progressPercent + '%' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isPlaying: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  currentTime: { type: Number, default: 0 },
  startTime: { type: Number, default: 0 },
  endTime: { type: Number, default: 0 },
  duration: { type: Number, default: 0 }
})

const emit = defineEmits(['play', 'pause', 'reset'])

// 计算实际的结束时间（优先使用设置的 endTime，否则使用视频总时长）
const effectiveEndTime = computed(() => {
  if (props.endTime > 0) return props.endTime
  if (props.duration > 0) return props.duration
  return 0
})

const progressPercent = computed(() => {
  const end = effectiveEndTime.value
  if (end <= 0) return 0
  const range = end - props.startTime
  if (range <= 0) return 0
  const current = props.currentTime - props.startTime
  return Math.min(100, Math.max(0, (current / range) * 100))
})

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const onPlayPause = () => {
  if (props.isPlaying) {
    emit('pause')
  } else {
    emit('play')
  }
}
</script>

<style scoped>
.control-panel {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--bg-card);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-color);
}

.control-panel__actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
}

.control-panel__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
}

.control-panel__btn--primary {
  background: var(--color-primary);
  color: var(--text-inverse);
  min-width: 140px;
}

.control-panel__btn--primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.control-panel__btn--primary:active:not(:disabled) {
  transform: translateY(0);
}

.control-panel__btn--primary:disabled {
  background: var(--color-primary);
}

.control-panel__btn--loading {
  pointer-events: none;
}

.control-panel__btn--secondary {
  background: var(--bg-section);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.control-panel__btn--secondary:hover {
  background: var(--bg-card);
  border-color: var(--border-color-hover);
  transform: translateY(-1px);
}

.control-panel__btn--secondary:active {
  transform: translateY(0);
}

.control-panel__icon {
  width: 20px;
  height: 20px;
}

.control-panel__spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.control-panel__progress {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.control-panel__progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.control-panel__progress-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.control-panel__progress-time {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  font-family: 'SF Mono', Monaco, monospace;
}

.control-panel__progress-track {
  height: 8px;
  background: var(--bg-section);
  border-radius: 4px;
  overflow: hidden;
}

.control-panel__progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-hover));
  border-radius: 4px;
  transition: width var(--transition-fast);
}
</style>
