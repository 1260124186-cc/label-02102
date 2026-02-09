import { ref, onUnmounted } from 'vue'

/**
 * 视频同步播放逻辑
 * 提供双视频同步播放、暂停、重置等功能
 * 包含持续对齐与漂移修正机制
 */
export function useVideoSync() {
  const video1 = ref(null)
  const video2 = ref(null)
  const isPlaying = ref(false)
  const isLoading = ref(false)
  const currentTime = ref(0)
  const startTime = ref(0)
  const endTime = ref(0)
  const duration = ref(0) // 视频总时长

  // 同步相关配置
  const SYNC_INTERVAL = 100 // 同步检查间隔 (ms)
  const DRIFT_THRESHOLD = 0.15 // 漂移阈值 (秒)，超过此值触发修正

  let syncIntervalId = null
  let onPlaybackEndCallback = null

  // 设置视频元素引用
  const setVideo1 = (videoEl) => {
    video1.value = videoEl
    updateDuration()
  }

  const setVideo2 = (videoEl) => {
    video2.value = videoEl
    updateDuration()
  }

  // 更新视频总时长（取两个视频中较长的，确保完整播放）
  const updateDuration = () => {
    const durations = []
    if (video1.value && video1.value.duration) durations.push(video1.value.duration)
    if (video2.value && video2.value.duration) durations.push(video2.value.duration)
    duration.value = durations.length > 0 ? Math.max(...durations) : 0
  }

  // 检查是否有可用视频
  const hasVideo = () => {
    return video1.value || video2.value
  }

  // 检查是否设置了结束时间
  const hasEndTime = () => {
    return endTime.value > 0
  }

  // 获取任意可用视频的最大当前时间（用于结束检测）
  const getMaxCurrentTime = () => {
    const times = []
    if (video1.value) times.push(video1.value.currentTime)
    if (video2.value) times.push(video2.value.currentTime)
    return times.length > 0 ? Math.max(...times) : 0
  }

  // 获取主视频当前时间（优先使用 video1，不存在则用 video2）
  const getMasterTime = () => {
    if (video1.value) return video1.value.currentTime
    if (video2.value) return video2.value.currentTime
    return 0
  }

  // 漂移修正：将从视频对齐到主视频
  const correctDrift = () => {
    if (!isPlaying.value) return
    if (!video1.value || !video2.value) return

    const masterTime = video1.value.currentTime
    const drift = Math.abs(video2.value.currentTime - masterTime)

    // 如果漂移超过阈值，进行修正
    if (drift > DRIFT_THRESHOLD) {
      video2.value.currentTime = masterTime
    }
  }

  // 检查是否到达结束时间（在同步监控中调用）
  const checkAndHandleEndTime = () => {
    if (endTime.value <= 0) return false

    // 使用任意视频的最大时间来判断，避免单一视频卡住导致无法停止
    const maxTime = getMaxCurrentTime()
    if (maxTime >= endTime.value) {
      pause()
      resetToStart()
      if (onPlaybackEndCallback) {
        onPlaybackEndCallback()
      }
      return true
    }
    return false
  }

  // 同步监控循环
  const syncLoop = () => {
    if (!isPlaying.value) return

    // 更新当前时间显示
    currentTime.value = getMasterTime()

    // 检查结束时间
    if (checkAndHandleEndTime()) return

    // 漂移修正
    correctDrift()
  }

  // 启动同步监控
  const startSyncMonitor = () => {
    stopSyncMonitor()
    syncIntervalId = setInterval(syncLoop, SYNC_INTERVAL)
  }

  // 停止同步监控
  const stopSyncMonitor = () => {
    if (syncIntervalId) {
      clearInterval(syncIntervalId)
      syncIntervalId = null
    }
  }

  // 重置到起始时间（内部使用，不触发回调）
  const resetToStart = () => {
    if (video1.value) video1.value.currentTime = startTime.value
    if (video2.value) video2.value.currentTime = startTime.value
    currentTime.value = startTime.value
  }

  // 同步播放
  const play = async () => {
    if (!hasVideo()) {
      return { success: false, message: '请先选择至少一个视频' }
    }

    isLoading.value = true

    try {
      const promises = []

      // 先同步设置起始时间
      if (video1.value) {
        video1.value.currentTime = startTime.value
      }
      if (video2.value) {
        video2.value.currentTime = startTime.value
      }

      // 同时开始播放
      if (video1.value) {
        promises.push(video1.value.play())
      }
      if (video2.value) {
        promises.push(video2.value.play())
      }

      await Promise.all(promises)
      isPlaying.value = true

      // 启动同步监控（包含结束时间检测）
      startSyncMonitor()

      return { success: true, message: '开始同步播放' }
    } catch (err) {
      return { success: false, message: '播放失败，请检查视频文件' }
    } finally {
      isLoading.value = false
    }
  }

  // 同步暂停
  const pause = () => {
    stopSyncMonitor()
    if (video1.value) video1.value.pause()
    if (video2.value) video2.value.pause()
    isPlaying.value = false
  }

  // 重置到起始时间
  const reset = () => {
    pause()
    resetToStart()
  }

  // 设置时间范围
  const setTimeRange = (start, end) => {
    startTime.value = Math.max(0, start)
    endTime.value = end > start ? end : 0
  }

  // 设置播放结束回调
  const onPlaybackEnd = (callback) => {
    onPlaybackEndCallback = callback
  }

  // 组件卸载时清理
  onUnmounted(() => {
    stopSyncMonitor()
  })

  return {
    video1,
    video2,
    isPlaying,
    isLoading,
    currentTime,
    startTime,
    endTime,
    duration,
    setVideo1,
    setVideo2,
    hasVideo,
    play,
    pause,
    reset,
    setTimeRange,
    onPlaybackEnd
  }
}
