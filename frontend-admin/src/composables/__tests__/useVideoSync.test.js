import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useVideoSync } from '../useVideoSync'

describe('useVideoSync', () => {
  let videoSync
  let mockVideo1
  let mockVideo2

  beforeEach(() => {
    vi.useFakeTimers()
    mockVideo1 = {
      currentTime: 0,
      duration: 100,
      play: vi.fn().mockResolvedValue(true),
      pause: vi.fn()
    }
    mockVideo2 = {
      currentTime: 0,
      duration: 100,
      play: vi.fn().mockResolvedValue(true),
      pause: vi.fn()
    }
    videoSync = useVideoSync()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should initialize with default values', () => {
    expect(videoSync.isPlaying.value).toBe(false)
    expect(videoSync.isLoading.value).toBe(false)
    expect(videoSync.currentTime.value).toBe(0)
    expect(videoSync.startTime.value).toBe(0)
    expect(videoSync.endTime.value).toBe(0)
    expect(videoSync.duration.value).toBe(0)
  })

  it('should set video elements correctly', () => {
    videoSync.setVideo1(mockVideo1)
    videoSync.setVideo2(mockVideo2)

    expect(videoSync.video1.value).toStrictEqual(mockVideo1)
    expect(videoSync.video2.value).toStrictEqual(mockVideo2)
    expect(videoSync.duration.value).toBe(100)
  })

  it('should return false when no video is available', () => {
    expect(videoSync.hasVideo()).toBe(false)
  })

  it('should return true when at least one video is available', () => {
    videoSync.setVideo1(mockVideo1)
    expect(videoSync.hasVideo()).toBe(true)
  })

  it('should set time range correctly', () => {
    videoSync.setTimeRange(10, 50)
    expect(videoSync.startTime.value).toBe(10)
    expect(videoSync.endTime.value).toBe(50)
  })

  it('should handle invalid time range', () => {
    videoSync.setTimeRange(50, 10)
    expect(videoSync.startTime.value).toBe(50)
    expect(videoSync.endTime.value).toBe(0)
  })

  it('should handle negative start time', () => {
    videoSync.setTimeRange(-10, 50)
    expect(videoSync.startTime.value).toBe(0)
    expect(videoSync.endTime.value).toBe(50)
  })

  it('should return error when playing without videos', async () => {
    const result = await videoSync.play()
    expect(result.success).toBe(false)
    expect(result.message).toBe('请先选择至少一个视频')
  })

  it('should play both videos successfully', async () => {
    videoSync.setVideo1(mockVideo1)
    videoSync.setVideo2(mockVideo2)

    const result = await videoSync.play()

    expect(result.success).toBe(true)
    expect(videoSync.isPlaying.value).toBe(true)
    expect(mockVideo1.play).toHaveBeenCalled()
    expect(mockVideo2.play).toHaveBeenCalled()
  })

  it('should pause both videos', () => {
    videoSync.setVideo1(mockVideo1)
    videoSync.setVideo2(mockVideo2)
    videoSync.isPlaying.value = true

    videoSync.pause()

    expect(videoSync.isPlaying.value).toBe(false)
    expect(mockVideo1.pause).toHaveBeenCalled()
    expect(mockVideo2.pause).toHaveBeenCalled()
  })

  it('should reset videos to start time', () => {
    videoSync.setVideo1(mockVideo1)
    videoSync.setVideo2(mockVideo2)
    videoSync.setTimeRange(10, 50)

    videoSync.reset()

    expect(mockVideo1.currentTime).toBe(10)
    expect(mockVideo2.currentTime).toBe(10)
    expect(videoSync.isPlaying.value).toBe(false)
  })

  it('should check if end time is set', () => {
    expect(videoSync.hasEndTime()).toBe(false)

    videoSync.setTimeRange(10, 50)
    expect(videoSync.hasEndTime()).toBe(true)
  })

  it('should get max current time', () => {
    videoSync.setVideo1(mockVideo1)
    videoSync.setVideo2(mockVideo2)

    mockVideo1.currentTime = 10
    mockVideo2.currentTime = 20

    expect(videoSync.getMaxCurrentTime()).toBe(20)
  })

  it('should get master time', () => {
    videoSync.setVideo1(mockVideo1)
    videoSync.setVideo2(mockVideo2)

    mockVideo1.currentTime = 10
    mockVideo2.currentTime = 20

    expect(videoSync.getMasterTime()).toBe(10)
  })

  it('should get master time from video2 when video1 is not available', () => {
    videoSync.setVideo2(mockVideo2)
    mockVideo2.currentTime = 20

    expect(videoSync.getMasterTime()).toBe(20)
  })

  it('should correct drift when threshold exceeded', () => {
    videoSync.setVideo1(mockVideo1)
    videoSync.setVideo2(mockVideo2)
    videoSync.isPlaying.value = true

    mockVideo1.currentTime = 10
    mockVideo2.currentTime = 10.2

    videoSync.correctDrift()

    expect(mockVideo2.currentTime).toBe(10)
  })

  it('should not correct drift when below threshold', () => {
    videoSync.setVideo1(mockVideo1)
    videoSync.setVideo2(mockVideo2)
    videoSync.isPlaying.value = true

    mockVideo1.currentTime = 10
    mockVideo2.currentTime = 10.1

    videoSync.correctDrift()

    expect(mockVideo2.currentTime).toBe(10.1)
  })

  it('should handle playback end callback', () => {
    const mockCallback = vi.fn()
    videoSync.onPlaybackEnd(mockCallback)

    videoSync.setVideo1(mockVideo1)
    videoSync.setTimeRange(10, 20)

    mockVideo1.currentTime = 20

    videoSync.checkAndHandleEndTime()

    expect(mockCallback).toHaveBeenCalled()
  })

  it('should stop playback when end time reached', () => {
    videoSync.setVideo1(mockVideo1)
    videoSync.setVideo2(mockVideo2)
    videoSync.setTimeRange(10, 20)
    videoSync.isPlaying.value = true

    mockVideo1.currentTime = 20

    videoSync.checkAndHandleEndTime()

    expect(videoSync.isPlaying.value).toBe(false)
  })

  it('should update duration when videos are set', () => {
    mockVideo1.duration = 60
    mockVideo2.duration = 120

    videoSync.setVideo1(mockVideo1)
    videoSync.setVideo2(mockVideo2)

    expect(videoSync.duration.value).toBe(120)
  })
})
