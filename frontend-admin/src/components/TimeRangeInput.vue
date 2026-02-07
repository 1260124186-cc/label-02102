<template>
  <div class="time-range">
    <div class="time-range__field">
      <label class="time-range__label" :for="'start-' + uid">起始时间 (秒)</label>
      <input
        :id="'start-' + uid"
        type="number"
        class="time-range__input"
        :value="localStart"
        @input="onStartChange"
        min="0"
        step="0.1"
        placeholder="0"
      />
    </div>

    <span class="time-range__separator">
      <svg class="time-range__separator-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M5 12h14M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>

    <div class="time-range__field">
      <label class="time-range__label" :for="'end-' + uid">结束时间 (秒)</label>
      <input
        :id="'end-' + uid"
        type="number"
        class="time-range__input"
        :value="localEnd"
        @input="onEndChange"
        min="0"
        step="0.1"
        placeholder="不限"
      />
    </div>

    <button
      class="time-range__btn"
      @click="applyRange"
      :disabled="!isValid"
      type="button"
    >
      <svg class="time-range__btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      应用
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  startTime: { type: Number, default: 0 },
  endTime: { type: Number, default: 0 }
})

const emit = defineEmits(['update:startTime', 'update:endTime', 'apply'])

const uid = Math.random().toString(36).slice(2, 9)
const localStart = ref(props.startTime)
const localEnd = ref(props.endTime)

const isValid = computed(() => {
  if (localEnd.value > 0 && localEnd.value <= localStart.value) {
    return false
  }
  return true
})

const onStartChange = (e) => {
  localStart.value = parseFloat(e.target.value) || 0
}

const onEndChange = (e) => {
  localEnd.value = parseFloat(e.target.value) || 0
}

const applyRange = () => {
  if (isValid.value) {
    emit('update:startTime', localStart.value)
    emit('update:endTime', localEnd.value)
    emit('apply', { start: localStart.value, end: localEnd.value })
  }
}
</script>

<style scoped>
.time-range {
  display: flex;
  align-items: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-section);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--border-color);
}

.time-range__field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.time-range__label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.time-range__input {
  width: 120px;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  font-family: 'SF Mono', Monaco, monospace;
  background: var(--bg-card);
  color: var(--text-primary);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.time-range__input::placeholder {
  color: var(--text-muted);
  font-family: var(--font-family);
}

.time-range__input:hover {
  border-color: var(--border-color-hover);
}

.time-range__input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.time-range__separator {
  display: flex;
  align-items: center;
  padding-bottom: var(--spacing-sm);
  color: var(--text-muted);
}

.time-range__separator-icon {
  width: 20px;
  height: 20px;
}

.time-range__btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-primary);
  color: var(--text-inverse);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
}

.time-range__btn:hover:not(:disabled) {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
}

.time-range__btn:active:not(:disabled) {
  transform: translateY(0);
}

.time-range__btn:disabled {
  background: var(--text-muted);
}

.time-range__btn-icon {
  width: 16px;
  height: 16px;
}

@media (max-width: 640px) {
  .time-range {
    flex-wrap: wrap;
  }

  .time-range__field {
    flex: 1;
    min-width: 100px;
  }

  .time-range__input {
    width: 100%;
  }

  .time-range__btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
