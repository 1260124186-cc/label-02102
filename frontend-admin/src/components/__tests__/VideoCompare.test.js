import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VideoCompare from '../VideoCompare.vue'

describe('VideoCompare', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(VideoCompare, {
      global: {
        stubs: {
          VideoPlayer: true,
          ControlPanel: true,
          TimeRangeInput: true,
          ToastMessage: true
        }
      }
    })
  })

  it('should render correctly', () => {
    expect(wrapper.find('.video-compare').exists()).toBe(true)
  })

  it('should have two video players', () => {
    const videoPlayers = wrapper.findAllComponents({ name: 'VideoPlayer' })
    expect(videoPlayers).toHaveLength(2)
  })

  it('should have control panel', () => {
    expect(wrapper.findComponent({ name: 'ControlPanel' }).exists()).toBe(true)
  })

  it('should have time range input', () => {
    expect(wrapper.findComponent({ name: 'TimeRangeInput' }).exists()).toBe(true)
  })

  it('should have toast message', () => {
    expect(wrapper.findComponent({ name: 'ToastMessage' }).exists()).toBe(true)
  })
})
