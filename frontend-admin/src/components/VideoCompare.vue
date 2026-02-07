<template>
  <div class="video-compare">
    <section class="video-compare__players">
      <VideoPlayer
        ref="player1Ref"
        title="视频 A"
        @ready="onVideo1Ready"
        @timeupdate="onTimeUpdate"
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

const player1Ref = ref(null)
const player2Ref = ref(null)
const video1 = ref(null)
const video2 = ref(null)

const isPlaying = ref(false)
const isLoading = ref(false)
const currentTime = ref(0)
const startTime = ref(0)
const endTime = ref(0)

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

const onVideo1Ready = (videoEl) => {
  video1.value = videoEl
  showToast('视频 A 加载完成', 'success')
}

const onVideo2Ready = (videoEl) => {
  video2.value = videoEl
  showToast('视频 B 加载完成', 'success')
}

const onTimeUpdate = (time) => {
  currentTime.value = time
  if (endTime.value > 0 && time >= endTime.value) {
    pause()
    reset()
    showToast('播放完成', 'info')
  }
}

const onApplyTimeRange = ({ start, end }) => {
  startTime.value = start
  endTime.value = end
  reset()
  showToast(`时间范围已设置: ${start}s - ${end > 0 ? end + 's' : '结束'}`, 'success')
}

const play = async () => {
  if (!video1.value && !video2.value) {
    showToast('请先选择至少一个视频', 'warning')
    return
  }

  isLoading.value = true

  try {
    const promises = []

    if (video1.value) {
      video1.value.currentTime = startTime.value
      promises.push(video1.value.play())
    }
    if (video2.value) {
      video2.value.currentTime = startTime.value
      promises.push(video2.value.play())
    }

    await Promise.all(promises)
    isPlaying.value = true
    showToast('开始同步播放', 'success')
  } catch (err) {
    showToast('播放失败，请检查视频文件', 'error')
  } finally {
    isLoading.value = false
  }
}

const pause = () => {
  if (video1.value) video1.value.pause()
  if (video2.value) video2.value.pause()
  isPlaying.value = false
}

const reset = () => {
  pause()
  if (video1.value) video1.value.currentTime = startTime.value
  if (video2.value) video2.value.currentTime = startTime.value
  currentTime.value = startTime.value
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
