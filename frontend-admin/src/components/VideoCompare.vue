<template>
  <div class="video-compare">
    <section class="video-compare__players">
      <VideoPlayer
        ref="player1Ref"
        title="视频 A"
        @ready="onVideo1Ready"
        @error="showError"
      />
      <VideoPlayer
        ref="player2Ref"
        title="视频 B"
        @ready="onVideo2Ready"
        @error="showError"
      />
    </section>

    <section class="video-compare__settings">
      <div class="video-compare__card">
        <div class="video-compare__card-header">
          <svg class="video-compare__card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <h2 class="video-compare__card-title">播放时间范围</h2>
        </div>
        <TimeRangeInput
          v-model:startTime="startTime"
          v-model:endTime="endTime"
          @apply="onApplyTimeRange"
        />
      </div>

      <ControlPanel
        :isPlaying="isPlaying"
        :isLoading="isLoading"
        :currentTime="currentTime"
        :startTime="startTime"
        :endTime="endTime"
        :duration="duration"
        @play="play"
        @pause="pause"
        @reset="reset"
      />
    </section>

    <ToastMessage
      :show="toast.show"
      :message="toast.message"
      :type="toast.type"
      @close="toast.show = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import VideoPlayer from './VideoPlayer.vue'
import ControlPanel from './ControlPanel.vue'
import TimeRangeInput from './TimeRangeInput.vue'
import ToastMessage from './ToastMessage.vue'
import { useVideoSync } from '../composables/useVideoSync'

const player1Ref = ref(null)
const player2Ref = ref(null)

// 使用视频同步逻辑
const {
  isPlaying,
  isLoading,
  currentTime,
  startTime,
  endTime,
  duration,
  setVideo1,
  setVideo2,
  play: syncPlay,
  pause,
  reset,
  setTimeRange,
  onPlaybackEnd
} = useVideoSync()

const toast = reactive({
  show: false,
  message: '',
  type: 'info'
})

const showToast = (message, type = 'info') => {
  toast.message = message
  toast.type = type
  toast.show = true
}

const showError = (message) => {
  showToast(message, 'error')
}

// 注册播放结束回调
onPlaybackEnd(() => {
  showToast('播放完成', 'info')
})

const onVideo1Ready = (videoEl) => {
  setVideo1(videoEl)
  showToast('视频 A 加载完成', 'success')
}

const onVideo2Ready = (videoEl) => {
  setVideo2(videoEl)
  showToast('视频 B 加载完成', 'success')
}

const onApplyTimeRange = ({ start, end }) => {
  setTimeRange(start, end)
  reset()
  showToast(`时间范围已设置: ${start}s - ${end > 0 ? end + 's' : '结束'}`, 'success')
}

const play = async () => {
  const result = await syncPlay()
  showToast(result.message, result.success ? 'success' : 'warning')
}
</script>

<style scoped>
.video-compare {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.video-compare__players {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
}

@media (max-width: 1024px) {
  .video-compare__players {
    grid-template-columns: 1fr;
  }
}

.video-compare__settings {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.video-compare__card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--bg-card);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-color);
}

.video-compare__card-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--border-color);
}

.video-compare__card-icon {
  width: 20px;
  height: 20px;
  color: var(--color-primary);
}

.video-compare__card-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
}
</style>
