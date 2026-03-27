import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { useVideoSync } from './useVideoSync'

describe('useVideoSync', () => {
  let videoSync
  let wrapper

  // Mock video element
  const createMockVideoElement = () => ({
    play: vi.fn().mockResolvedValue(),
    pause: vi.fn(),
    currentTime: 0,
    duration: 100
  })

  const createTestComponent = () => defineComponent({
    setup() {
      videoSync = useVideoSync()
      return { videoSync }
    },
    template: '<div></div>'
  })

  beforeEach(() => {
    wrapper = mount(createTestComponent())
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  it('should initialize with default values', () => {
    expect(videoSync.isPlaying).toBe(false)
    expect(videoSync.isLoading).toBe(false)
    expect(videoSync.currentTime).toBe(0)
    expect(videoSync.startTime).toBe(0)
    expect(videoSync.endTime).toBe(0)
    expect(videoSync.duration).toBe(0)
  })

  it('should set video elements and update duration', () => {
    const video1 = createMockVideoElement()
    const video2 = createMockVideoElement()

    videoSync.setVideo1(video1)
    videoSync.setVideo2(video2)

    expect(videoSync.video1).toBe(video1)
    expect(videoSync.video2).toBe(video2)
    expect(videoSync.duration).toBe(100)
  })

  it('should return true when has video elements', () => {
    expect(videoSync.hasVideo()).toBe(false)

    videoSync.setVideo1(createMockVideoElement())
    expect(videoSync.hasVideo()).toBe(true)
  })

  it('should set time range correctly', () => {
    videoSync.setTimeRange(10, 50)
    expect(videoSync.startTime).toBe(10)
    expect(videoSync.endTime).toBe(50)

    // Test invalid end time (less than start time)
    videoSync.setTimeRange(30, 20)
    expect(videoSync.startTime).toBe(30)
    expect(videoSync.endTime).toBe(0)

    // Test negative start time
    videoSync.setTimeRange(-5, 20)
    expect(videoSync.startTime).toBe(0)
  })

  it('should play videos synchronously', async () => {
    const video1 = createMockVideoElement()
    const video2 = createMockVideoElement()

    videoSync.setVideo1(video1)
    videoSync.setVideo2(video2)
    videoSync.setTimeRange(10, 50)

    const result = await videoSync.play()

    expect(result.success).toBe(true)
    expect(video1.currentTime).toBe(10)
    expect(video2.currentTime).toBe(10)
    expect(video1.play).toHaveBeenCalled()
    expect(video2.play).toHaveBeenCalled()
    expect(videoSync.isPlaying).toBe(true)
  })

  it('should fail to play when no videos are selected', async () => {
    const result = await videoSync.play()
    expect(result.success).toBe(false)
    expect(result.message).toBe('请先选择至少一个视频')
  })

  it('should pause videos and stop sync', () => {
    const video1 = createMockVideoElement()
    const video2 = createMockVideoElement()

    videoSync.setVideo1(video1)
    videoSync.setVideo2(video2)
    // @ts-ignore
    videoSync.isPlaying = true

    videoSync.pause()

    expect(video1.pause).toHaveBeenCalled()
    expect(video2.pause).toHaveBeenCalled()
    expect(videoSync.isPlaying).toBe(false)
  })

  it('should reset videos to start time', () => {
    const video1 = createMockVideoElement()
    const video2 = createMockVideoElement()

    videoSync.setVideo1(video1)
    videoSync.setVideo2(video2)
    videoSync.setTimeRange(10, 50)
    video1.currentTime = 30
    video2.currentTime = 30

    videoSync.reset()

    expect(video1.pause).toHaveBeenCalled()
    expect(video2.pause).toHaveBeenCalled()
    expect(video1.currentTime).toBe(10)
    expect(video2.currentTime).toBe(10)
    expect(videoSync.isPlaying).toBe(false)
  })

  it('should correct drift when videos are out of sync', () => {
    const video1 = createMockVideoElement()
    const video2 = createMockVideoElement()

    videoSync.setVideo1(video1)
    videoSync.setVideo2(video2)
    // @ts-ignore
    videoSync.isPlaying = true

    video1.currentTime = 10
    video2.currentTime = 10.2 // Within threshold, no correction

    videoSync.correctDrift()
    expect(video2.currentTime).toBe(10.2)

    video2.currentTime = 10.3 // Exceeds threshold, should correct

    videoSync.correctDrift()
    expect(video2.currentTime).toBe(10)
  })

  it('should pause and reset when reaching end time', async () => {
    const video1 = createMockVideoElement()
    const video2 = createMockVideoElement()
    const mockCallback = vi.fn()

    videoSync.setVideo1(video1)
    videoSync.setVideo2(video2)
    videoSync.setTimeRange(10, 50)
    videoSync.onPlaybackEnd(mockCallback)

    await videoSync.play()

    video1.currentTime = 51
    video2.currentTime = 51

    // Fast-forward timer to trigger sync loop
    vi.advanceTimersByTime(100)

    expect(video1.pause).toHaveBeenCalled()
    expect(video2.pause).toHaveBeenCalled()
    expect(video1.currentTime).toBe(10)
    expect(video2.currentTime).toBe(10)
    expect(mockCallback).toHaveBeenCalled()
    expect(videoSync.isPlaying).toBe(false)
  })

  it('should update current time while playing', async () => {
    const video1 = createMockVideoElement()
    const video2 = createMockVideoElement()

    videoSync.setVideo1(video1)
    videoSync.setVideo2(video2)
    videoSync.setTimeRange(10, 50)

    await videoSync.play()

    video1.currentTime = 20
    video2.currentTime = 20

    // Fast-forward timer to trigger sync loop
    vi.advanceTimersByTime(100)

    expect(videoSync.currentTime).toBe(20)
  })

  it('should handle playback errors gracefully', async () => {
    const video1 = createMockVideoElement()
    const video2 = createMockVideoElement()

    // Make play fail
    video1.play.mockRejectedValue(new Error('Play error'))

    videoSync.setVideo1(video1)
    videoSync.setVideo2(video2)

    const result = await videoSync.play()

    expect(result.success).toBe(false)
    expect(result.message).toBe('播放失败，请检查视频文件')
    expect(videoSync.isLoading).toBe(false)
  })
})
