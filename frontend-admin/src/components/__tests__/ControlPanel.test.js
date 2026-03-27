import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ControlPanel from '../ControlPanel.vue'

describe('ControlPanel', () => {
  it('should render correctly', () => {
    const wrapper = mount(ControlPanel)
    expect(wrapper.find('.control-panel').exists()).toBe(true)
  })

  it('should show play button when not playing', () => {
    const wrapper = mount(ControlPanel, {
      props: {
        isPlaying: false
      }
    })
    expect(wrapper.find('.control-panel__btn').text()).toContain('播放')
  })

  it('should show pause button when playing', () => {
    const wrapper = mount(ControlPanel, {
      props: {
        isPlaying: true
      }
    })
    expect(wrapper.find('.control-panel__btn').text()).toContain('暂停')
  })

  it('should show loading spinner when loading', () => {
    const wrapper = mount(ControlPanel, {
      props: {
        isLoading: true
      }
    })
    expect(wrapper.find('.control-panel__spinner').exists()).toBe(true)
  })

  it('should emit play event when play button is clicked and not playing', async () => {
    const wrapper = mount(ControlPanel, {
      props: {
        isPlaying: false
      }
    })
    await wrapper.find('.control-panel__btn').trigger('click')
    expect(wrapper.emitted('play')).toBeTruthy()
  })

  it('should emit pause event when pause button is clicked and playing', async () => {
    const wrapper = mount(ControlPanel, {
      props: {
        isPlaying: true
      }
    })
    await wrapper.find('.control-panel__btn').trigger('click')
    expect(wrapper.emitted('pause')).toBeTruthy()
  })

  it('should emit reset event when reset button is clicked', async () => {
    const wrapper = mount(ControlPanel)
    await wrapper.findAll('.control-panel__btn')[1].trigger('click')
    expect(wrapper.emitted('reset')).toBeTruthy()
  })

  it('should format time correctly', () => {
    const wrapper = mount(ControlPanel)
    expect(wrapper.vm.formatTime(65)).toBe('01:05')
    expect(wrapper.vm.formatTime(0)).toBe('00:00')
    expect(wrapper.vm.formatTime(3600)).toBe('60:00')
  })

  it('should calculate effective end time correctly', () => {
    const wrapper = mount(ControlPanel, {
      props: {
        endTime: 50,
        duration: 100
      }
    })
    expect(wrapper.vm.effectiveEndTime).toBe(50)
  })

  it('should use duration as effective end time when endTime is not set', () => {
    const wrapper = mount(ControlPanel, {
      props: {
        endTime: 0,
        duration: 100
      }
    })
    expect(wrapper.vm.effectiveEndTime).toBe(100)
  })

  it('should calculate progress percentage correctly', () => {
    const wrapper = mount(ControlPanel, {
      props: {
        currentTime: 25,
        startTime: 0,
        endTime: 100
      }
    })
    expect(wrapper.vm.progressPercent).toBe(25)
  })

  it('should calculate progress percentage with start time offset', () => {
    const wrapper = mount(ControlPanel, {
      props: {
        currentTime: 50,
        startTime: 25,
        endTime: 75
      }
    })
    expect(wrapper.vm.progressPercent).toBe(50)
  })

  it('should return 0 progress when effective end time is 0', () => {
    const wrapper = mount(ControlPanel, {
      props: {
        currentTime: 50,
        endTime: 0,
        duration: 0
      }
    })
    expect(wrapper.vm.progressPercent).toBe(0)
  })
})
