<template>
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="visible" class="toast-wrapper">
        <div :class="['toast', `toast--${type}`]">
          <span class="toast__icon-wrapper">
            <svg v-if="type === 'success'" class="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else-if="type === 'error'" class="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else-if="type === 'warning'" class="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else class="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <span class="toast__message">{{ message }}</span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  message: { type: String, default: '' },
  type: { type: String, default: 'info' },
  duration: { type: Number, default: 3000 },
  show: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])

const visible = ref(false)

watch(() => props.show, (newVal) => {
  if (newVal) {
    visible.value = true
    setTimeout(() => {
      visible.value = false
      emit('close')
    }, props.duration)
  }
}, { immediate: true })
</script>

<style scoped>
.toast-wrapper {
  position: fixed;
  top: var(--spacing-lg);
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
}

.toast {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--border-radius-md);
  background: var(--bg-card);
  box-shadow: var(--shadow-lg);
  font-size: var(--font-size-sm);
  border: 1px solid var(--border-color);
}

.toast--success {
  border-left: 4px solid var(--color-success);
}

.toast--success .toast__icon-wrapper {
  color: var(--color-success);
  background: var(--color-success-light);
}

.toast--error {
  border-left: 4px solid var(--color-error);
}

.toast--error .toast__icon-wrapper {
  color: var(--color-error);
  background: var(--color-error-light);
}

.toast--warning {
  border-left: 4px solid var(--color-warning);
}

.toast--warning .toast__icon-wrapper {
  color: var(--color-warning);
  background: var(--color-warning-light);
}

.toast--info {
  border-left: 4px solid var(--color-info);
}

.toast--info .toast__icon-wrapper {
  color: var(--color-info);
  background: var(--color-info-light);
}

.toast__icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
}

.toast__icon {
  width: 18px;
  height: 18px;
}

.toast__message {
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
}

/* 动画 */
.toast-enter-active,
.toast-leave-active {
  transition: all var(--transition-normal);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-16px);
}
</style>
