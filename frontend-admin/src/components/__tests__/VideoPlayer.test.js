import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VideoPlayer from '../VideoPlayer.vue'

describe('VideoPlayer', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(VideoPlayer, {
      props: {
        title: '测试视频'
      }
    })
  })

  it('should render correctly with title', () => {
    expect(wrapper.find('.video-player__title').text()).toBe('测试视频')
  })

  it('should show placeholder when no video source', () => {
    expect(wrapper.find('.video-player__placeholder').exists()).toBe(true)
  })

  it('should switch between file and url tabs', async () => {
    const tabs = wrapper.findAll('.video-player__tab')

    expect(tabs[0].classes()).toContain('video-player__tab--active')
    expect(tabs[1].classes()).not.toContain('video-player__tab--active')

    await tabs[1].trigger('click')

    expect(tabs[1].classes()).toContain('video-player__tab--active')
    expect(wrapper.find('.video-player__url').exists()).toBe(true)
  })

  it('should show file input by default', () => {
    expect(wrapper.find('.video-player__file').exists()).toBe(true)
  })

  it('should show url input when url tab is clicked', async () => {
    const urlTab = wrapper.findAll('.video-player__tab')[1]
    await urlTab.trigger('click')

    expect(wrapper.find('.video-player__url').exists()).toBe(true)
  })

  it('should format time correctly', () => {
    expect(wrapper.vm.formatTime(65)).toBe('01:05')
    expect(wrapper.vm.formatTime(0)).toBe('00:00')
    expect(wrapper.vm.formatTime(3600)).toBe('60:00')
  })

  it('should expose getVideoElement method', () => {
    expect(typeof wrapper.vm.getVideoElement).toBe('function')
  })

  it('should show hint text about supported video links', () => {
    expect(wrapper.find('.video-player__hint').text()).toContain('仅支持直接视频文件链接')
  })
})
