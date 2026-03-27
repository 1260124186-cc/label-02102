import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import TimeRangeInput from '../TimeRangeInput.vue'

describe('TimeRangeInput', () => {
  it('should render correctly', () => {
    const wrapper = mount(TimeRangeInput)
    expect(wrapper.find('.time-range').exists()).toBe(true)
  })

  it('should initialize with default values', () => {
    const wrapper = mount(TimeRangeInput)
    expect(wrapper.vm.localStart).toBe(0)
    expect(wrapper.vm.localEnd).toBe(0)
  })

  it('should initialize with provided props', () => {
    const wrapper = mount(TimeRangeInput, {
      props: {
        startTime: 10,
        endTime: 50
      }
    })
    expect(wrapper.vm.localStart).toBe(10)
    expect(wrapper.vm.localEnd).toBe(50)
  })

  it('should be valid when end time is greater than start time', () => {
    const wrapper = mount(TimeRangeInput, {
      props: {
        startTime: 10,
        endTime: 50
      }
    })
    expect(wrapper.vm.isValid).toBe(true)
  })

  it('should be invalid when end time is less than or equal to start time', () => {
    const wrapper = mount(TimeRangeInput, {
      props: {
        startTime: 50,
        endTime: 10
      }
    })
    expect(wrapper.vm.isValid).toBe(false)
  })

  it('should be valid when end time is 0', () => {
    const wrapper = mount(TimeRangeInput, {
      props: {
        startTime: 10,
        endTime: 0
      }
    })
    expect(wrapper.vm.isValid).toBe(true)
  })

  it('should update localStart when start input changes', async () => {
    const wrapper = mount(TimeRangeInput)
    const input = wrapper.findAll('.time-range__input')[0]
    
    await input.setValue(20)
    await input.trigger('input')
    
    expect(wrapper.vm.localStart).toBe(20)
  })

  it('should update localEnd when end input changes', async () => {
    const wrapper = mount(TimeRangeInput)
    const input = wrapper.findAll('.time-range__input')[1]
    
    await input.setValue(60)
    await input.trigger('input')
    
    expect(wrapper.vm.localEnd).toBe(60)
  })

  it('should emit events when apply is clicked with valid range', async () => {
    const wrapper = mount(TimeRangeInput, {
      props: {
        startTime: 10,
        endTime: 50
      }
    })
    
    await wrapper.find('.time-range__btn').trigger('click')
    
    expect(wrapper.emitted('update:startTime')).toBeTruthy()
    expect(wrapper.emitted('update:endTime')).toBeTruthy()
    expect(wrapper.emitted('apply')).toBeTruthy()
    expect(wrapper.emitted('apply')[0][0]).toEqual({ start: 10, end: 50 })
  })

  it('should disable apply button when range is invalid', () => {
    const wrapper = mount(TimeRangeInput, {
      props: {
        startTime: 50,
        endTime: 10
      }
    })
    
    expect(wrapper.find('.time-range__btn').attributes('disabled')).toBeDefined()
  })
})
