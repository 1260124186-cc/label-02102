import { ref, watch } from 'vue'

export function useVideoSync() {
  const video1Ref = ref(null)
  const video2Ref = ref(null)
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const startTime = ref(0)
  const endTime = ref(0)
  const isLoading = ref(false)

  // 同步播放
  const play = () => {
    if (!video1Ref.value && !video2Ref.value) return

    isLoading.value = true
    const promises = []

    if (video1Ref.value) {
      video1Ref.value.currentTime = startTime.value
      promises.push(video1Ref.value.play())
    }
    if (video2Ref.value) {
      video2Ref.value.currentTime = startTime.value
      promises.push(video2Ref.value.play())
    }

    Promise.all(promises)
      .then(() => {
        isPlaying.value = true
        isLoading.value = false
      })
      .catch(() => {
        isLoading.value = false
      })
  }

  // 同步暂停
  const pause = () => {
    if (video1Ref.value) video1Ref.value.pause()
    if (video2Ref.value) video2Ref.value.pause()
    isPlaying.value = false
  }

  // 重置到起始时间
  const reset = () => {
    pause()
    if (video1Ref.value) video1Ref.value.currentTime = startTime.value
    if (video2Ref.value) video2Ref.value.currentTime = startTime.value
    currentTime.value = startTime.value
  }

  // 同步跳转
  const seek = (time) => {
    const targetTime = Math.max(startTime.value, Math.min(time, endTime.value || Infinity))
    if (video1Ref.value) video1Ref.value.currentTime = targetTime
    if (video2Ref.value) video2Ref.value.currentTime = targetTime
    currentTime.value = targetTime
  }

  // 时间更新处理
  const onTimeUpdate = (time) => {
    currentTime.value = time
    // 检查是否到达结束时间
    if (endTime.value > 0 && time >= endTime.value) {
      pause()
      reset()
    }
  }

  // 设置时间范围
  const setTimeRange = (start, end) => {
    startTime.value = Math.max(0, start)
    endTime.value = end > start ? end : 0
    reset()
  }

  return {
    video1Ref,
    video2Ref,
    isPlaying,
    currentTime,
    startTime,
    endTime,
    isLoading,
    play,
    pause,
    reset,
    seek,
    onTimeUpdate,
    setTimeRange
  }
}
