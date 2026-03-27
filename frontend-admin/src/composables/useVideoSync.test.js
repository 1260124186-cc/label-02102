import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, ref } from 'vue'
import { useVideoSync } from './useVideoSync'

describe('useVideoSync', () => {
  let wrapper
  let vm

  // Mock video element
  const createMockVideoElement = (duration = 100) => ({
    play: vi.fn().mockResolvedValue(),
    pause: vi.fn(),
    currentTime: 0,
    duration,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  })

  const createTestComponent = () => defineComponent({
    setup() {
      const videoSync = useVideoSync()
      return { videoSync }
    },
    template: '<div></div>'
  })

  beforeEach(() => {
    wrapper = mount(createTestComponent())
    vm = wrapper.vm
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should initialize with default values', () => {
    expect(vm.videoSync.isPlaying.value).toBe(false)
    expect(vm.videoSync.isLoading.value).toBe(false)
    expect(vm.videoSync.currentTime.value).toBe(0)
    expect(vm.videoSync.startTime.value).toBe(0)
    expect(vm.videoSync.endTime.value).toBe(0)
    expect(vm.videoSync.duration.value).toBe(0)
  })

  it('should set video elements and update duration', () => {
    const video1 = createMockVideoElement()
    const video2 = createMockVideoElement(120)

    vm.videoSync.setVideo1(video1)
    vm.videoSync.setVideo2(video2)

    expect(vm.videoSync.video1.value).toStrictEqual(video1)
    expect(vm.videoSync.video2.value).toStrictEqual(video2)
    expect(vm.videoSync.duration.value).toBe(120)
  })

  it('should return true when has video elements', () => {
    expect(vm.videoSync.hasVideo()).toBe(null)

    const mockVideo = createMockVideoElement()
    vm.videoSync.setVideo1(mockVideo)
    expect(vm.videoSync.hasVideo()).toBeTruthy()
  })

  it('should set time range correctly', () => {
    vm.videoSync.setTimeRange(10, 50)
    expect(vm.videoSync.startTime.value).toBe(10)
    expect(vm.videoSync.endTime.value).toBe(50)

    // Test invalid end time (less than start time)
    vm.videoSync.setTimeRange(30, 20)
    expect(vm.videoSync.startTime.value).toBe(30)
    expect(vm.videoSync.endTime.value).toBe(0)

    // Test negative start time
    vm.videoSync.setTimeRange(-5, 20)
    expect(vm.videoSync.startTime.value).toBe(0)
  })

  it('should play videos synchronously', async () => {
    const video1 = createMockVideoElement()
    const video2 = createMockVideoElement()

    vm.videoSync.setVideo1(video1)
    vm.videoSync.setVideo2(video2)
    vm.videoSync.setTimeRange(10, 50)

    const result = await vm.videoSync.play()

    expect(result.success).toBe(true)
    expect(video1.currentTime).toBe(10)
    expect(video2.currentTime).toBe(10)
    expect(video1.play).toHaveBeenCalled()
    expect(video2.play).toHaveBeenCalled()
    expect(vm.videoSync.isPlaying.value).toBe(true)
  })

  it('should fail to play when no videos are selected', async () => {
    const result = await vm.videoSync.play()
    expect(result.success).toBe(false)
    expect(result.message).toBe('请先选择至少一个视频')
  })

  it('should pause videos and stop sync', async () => {
    const video1 = createMockVideoElement()
    const video2 = createMockVideoElement()

    vm.videoSync.setVideo1(video1)
    vm.videoSync.setVideo2(video2)

    // First play to set isPlaying to true
    await vm.videoSync.play()
    expect(vm.videoSync.isPlaying.value).toBe(true)

    vm.videoSync.pause()

    expect(video1.pause).toHaveBeenCalled()
    expect(video2.pause).toHaveBeenCalled()
    expect(vm.videoSync.isPlaying.value).toBe(false)
  })

  it('should reset videos to start time', async () => {
    const video1 = createMockVideoElement()
    const video2 = createMockVideoElement()

    vm.videoSync.setVideo1(video1)
    vm.videoSync.setVideo2(video2)
    vm.videoSync.setTimeRange(10, 50)

    await vm.videoSync.play()
    video1.currentTime = 30
    video2.currentTime = 30

    vm.videoSync.reset()

    expect(video1.pause).toHaveBeenCalled()
    expect(video2.pause).toHaveBeenCalled()
    expect(video1.currentTime).toBe(10)
    expect(video2.currentTime).toBe(10)
    expect(vm.videoSync.isPlaying.value).toBe(false)
  })

  it('should pause and reset when reaching end time', async () => {
    const video1 = createMockVideoElement()
    const video2 = createMockVideoElement()
    const mockCallback = vi.fn()

    vm.videoSync.setVideo1(video1)
    vm.videoSync.setVideo2(video2)
    vm.videoSync.setTimeRange(10, 50)
    vm.videoSync.onPlaybackEnd(mockCallback)

    await vm.videoSync.play()

    video1.currentTime = 51
    video2.currentTime = 51

    // Fast-forward timer to trigger sync loop
    vi.advanceTimersByTime(100)

    expect(video1.pause).toHaveBeenCalled()
    expect(video2.pause).toHaveBeenCalled()
    expect(video1.currentTime).toBe(10)
    expect(video2.currentTime).toBe(10)
    expect(mockCallback).toHaveBeenCalled()
    expect(vm.videoSync.isPlaying.value).toBe(false)
  })

  it('should handle playback errors gracefully', async () => {
    const video1 = createMockVideoElement()
    const video2 = createMockVideoElement()

    // Make play fail
    video1.play.mockRejectedValue(new Error('Play error'))

    vm.videoSync.setVideo1(video1)
    vm.videoSync.setVideo2(video2)

    const result = await vm.videoSync.play()

    expect(result.success).toBe(false)
    expect(result.message).toBe('播放失败，请检查视频文件')
    expect(vm.videoSync.isLoading.value).toBe(false)
  })
})
