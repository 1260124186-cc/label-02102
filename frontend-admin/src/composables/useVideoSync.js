import { ref } from 'vue'

/**
 * 视频同步播放逻辑
 * 提供双视频同步播放、暂停、重置等功能
 */
export function useVideoSync() {
  const video1 = ref(null)
  const video2 = ref(null)
  const isPlaying = ref(false)
  const isLoading = ref(false)
  const currentTime = ref(0)
  const startTime = ref(0)
  const endTime = ref(0)

  // 设置视频元素引用
  const setVideo1 = (videoEl) => {
    video1.value = videoEl
  }

  const setVideo2 = (videoEl) => {
    video2.value = videoEl
  }

  // 检查是否有可用视频
  const hasVideo = () => {
    return video1.value || video2.value
  }

  // 检查是否设置了时间范围
  const hasTimeRange = () => {
    return startTime.value > 0 || endTime.value > 0
  }

  // 同步播放
  const play = async () => {
    if (!hasVideo()) {
      return { success: false, message: '请先选择至少一个视频' }
    }

    if (!hasTimeRange()) {
      return { success: false, message: '请先设置播放起始时间' }
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
      return { success: true, message: '开始同步播放' }
    } catch (err) {
      return { success: false, message: '播放失败，请检查视频文件' }
    } finally {
      isLoading.value = false
    }
  }

  // 同步暂停
  const pause = () => {
    if (video1.value) video1.value.pause()
    if (video2.value) video2.value.pause()
    isPlaying.value = false
  }

  // 重置到起始时间
  const reset = () => {
    pause()
    if (video1.value) video1.value.currentTime = startTime.value
    if (video2.value) video2.value.currentTime = startTime.value
    currentTime.value = startTime.value
  }

  // 更新当前时间
  const updateCurrentTime = (time) => {
    currentTime.value = time
  }

  // 检查是否到达结束时间
  const checkEndTime = (time) => {
    return endTime.value > 0 && time >= endTime.value
  }

  // 设置时间范围
  const setTimeRange = (start, end) => {
    startTime.value = Math.max(0, start)
    endTime.value = end > start ? end : 0
  }

  return {
    video1,
    video2,
    isPlaying,
    isLoading,
    currentTime,
    startTime,
    endTime,
    setVideo1,
    setVideo2,
    hasVideo,
    play,
    pause,
    reset,
    updateCurrentTime,
    checkEndTime,
    setTimeRange
  }
}
