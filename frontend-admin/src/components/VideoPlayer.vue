<template>
  <div class="video-player">
    <div class="video-player__header">
      <h3 class="video-player__title">{{ title }}</h3>
      <span v-if="duration > 0" class="video-player__duration">
        {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
      </span>
    </div>

    <div class="video-player__container">
      <div v-if="!videoSrc" class="video-player__placeholder">
        <svg class="video-player__placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="video-player__placeholder-text">请选择视频文件或输入 URL</span>
      </div>
      <video
        v-else
        ref="videoRef"
        class="video-player__video"
        :src="videoSrc"
        @loadedmetadata="onLoadedMetadata"
        @timeupdate="onTimeUpdate"
        @error="onError"
        @waiting="isBuffering = true"
        @canplay="isBuffering = false"
      />
      <div v-if="isBuffering" class="video-player__loading">
        <div class="video-player__spinner"></div>
      </div>
    </div>

    <div class="video-player__source">
      <div class="video-player__tabs">
        <button
          :class="['video-player__tab', { 'video-player__tab--active': sourceType === 'file' }]"
          @click="sourceType = 'file'"
          type="button"
        >
          <svg class="video-player__tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          本地文件
        </button>
        <button
          :class="['video-player__tab', { 'video-player__tab--active': sourceType === 'url' }]"
          @click="sourceType = 'url'"
          type="button"
        >
          <svg class="video-player__tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          URL 地址
        </button>
      </div>

      <div v-if="sourceType === 'file'" class="video-player__file">
        <label class="video-player__file-btn">
          <input
            type="file"
            accept="video/*"
            @change="onFileSelect"
            hidden
          />
          <svg class="video-player__file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>{{ fileName || '点击选择视频文件' }}</span>
        </label>
      </div>

      <div v-else class="video-player__url">
        <input
          type="text"
          class="video-player__url-input"
          v-model="urlInput"
          placeholder="输入直接视频文件 URL（.mp4, .webm）"
          @keyup.enter="loadUrl"
        />
        <button
          class="video-player__url-btn"
          @click="loadUrl"
          :disabled="!urlInput.trim()"
          type="button"
        >
          加载
        </button>
      </div>
      <p class="video-player__hint">
        ⚠️ 仅支持直接视频文件链接，不支持 B站/YouTube 等平台链接
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'

const props = defineProps({
  title: { type: String, default: '视频' }
})

const emit = defineEmits(['ready', 'timeupdate', 'error'])

const videoRef = ref(null)
const videoSrc = ref('')
const sourceType = ref('file')
const fileName = ref('')
const urlInput = ref('')
const duration = ref(0)
const currentTime = ref(0)
const isBuffering = ref(false)

// 保存当前的 ObjectURL 以便释放
let currentObjectUrl = null

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 释放之前的 ObjectURL
const revokeObjectUrl = () => {
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl)
    currentObjectUrl = null
  }
}

const onFileSelect = (e) => {
  const file = e.target.files[0]
  if (file) {
    // 释放之前的 ObjectURL
    revokeObjectUrl()

    fileName.value = file.name
    currentObjectUrl = URL.createObjectURL(file)
    videoSrc.value = currentObjectUrl
  }
}

const loadUrl = () => {
  if (urlInput.value.trim()) {
    // 释放之前的 ObjectURL（如果有）
    revokeObjectUrl()

    videoSrc.value = urlInput.value.trim()
    fileName.value = ''
  }
}

const onLoadedMetadata = () => {
  if (videoRef.value) {
    duration.value = videoRef.value.duration
    emit('ready', videoRef.value)
  }
}

const onTimeUpdate = () => {
  if (videoRef.value) {
    currentTime.value = videoRef.value.currentTime
    emit('timeupdate', currentTime.value)
  }
}

const onError = () => {
  emit('error', '视频加载失败，请检查文件或 URL 是否有效')
}

// 组件卸载时释放 ObjectURL
onUnmounted(() => {
  revokeObjectUrl()
})

defineExpose({
  getVideoElement: () => videoRef.value
})
</script>

<style scoped>
.video-player {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  background: var(--bg-card);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-color);
}

.video-player__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--border-color);
}

.video-player__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
}

.video-player__duration {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-family: 'SF Mono', Monaco, monospace;
  background: var(--bg-section);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
}

.video-player__container {
  position: relative;
  aspect-ratio: 16 / 9;
  background: var(--bg-video);
  border-radius: var(--border-radius-md);
  overflow: hidden;
}

.video-player__placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  color: var(--text-muted);
}

.video-player__placeholder-icon {
  width: 48px;
  height: 48px;
  opacity: 0.4;
}

.video-player__placeholder-text {
  font-size: var(--font-size-sm);
}

.video-player__video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.video-player__loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
}

.video-player__spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.video-player__source {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding-top: var(--spacing-sm);
}

.video-player__tabs {
  display: flex;
  gap: var(--spacing-sm);
  background: var(--bg-section);
  padding: var(--spacing-xs);
  border-radius: var(--border-radius-md);
}

.video-player__tab {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  flex: 1;
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background: transparent;
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.video-player__tab:hover {
  color: var(--text-primary);
  background: var(--bg-card);
}

.video-player__tab--active {
  background: var(--bg-card);
  color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.video-player__tab-icon {
  width: 16px;
  height: 16px;
}

.video-player__file-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--bg-section);
  border: 2px dashed var(--border-color);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.video-player__file-btn:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.video-player__file-icon {
  width: 20px;
  height: 20px;
}

.video-player__url {
  display: flex;
  gap: var(--spacing-sm);
}

.video-player__url-input {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  background: var(--bg-card);
  color: var(--text-primary);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.video-player__url-input::placeholder {
  color: var(--text-muted);
}

.video-player__url-input:hover {
  border-color: var(--border-color-hover);
}

.video-player__url-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.video-player__url-btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--color-primary);
  color: var(--text-inverse);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: background var(--transition-fast), transform var(--transition-fast);
}

.video-player__url-btn:hover:not(:disabled) {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
}

.video-player__url-btn:active:not(:disabled) {
  transform: translateY(0);
}

.video-player__url-btn:disabled {
  background: var(--text-muted);
}

.video-player__hint {
  margin: 0;
  font-size: var(--font-size-xs);
  color: var(--color-warning);
  text-align: center;
}
</style>
