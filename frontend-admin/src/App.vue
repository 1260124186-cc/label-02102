<template>
  <div class="app">
    <header class="app-header">
      <div class="app-header__container">
        <div class="app-header__brand">
          <span class="app-header__icon">🎬</span>
          <div class="app-header__text">
            <h1 class="app-header__title">视频对比播放器</h1>
            <p class="app-header__subtitle">同步播放两个视频，轻松对比差异</p>
          </div>
        </div>
      </div>
    </header>

    <main class="app-main">
      <div class="app-main__container">
        <VideoCompare />
      </div>
    </main>

    <footer class="app-footer">
      <div class="app-footer__container">
        <p class="app-footer__text">
          <span class="app-footer__tech">Vue 3 + Vite</span>
          <span class="app-footer__divider">|</span>
          <span>双视频同步播放器</span>
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import VideoCompare from './components/VideoCompare.vue'
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-page);
}

/* Header 区域 */
.app-header {
  background: linear-gradient(135deg, var(--bg-header) 0%, #0f172a 100%);
  padding: var(--spacing-lg) var(--spacing-md);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.app-header__container {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.app-header__brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.app-header__icon {
  font-size: 40px;
  line-height: 1;
}

.app-header__text {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.app-header__title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-inverse);
  margin: 0;
  letter-spacing: -0.02em;
}

.app-header__subtitle {
  font-size: var(--font-size-sm);
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

/* Main 区域 */
.app-main {
  flex: 1;
  padding: var(--spacing-xl) var(--spacing-md);
}

.app-main__container {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* Footer 区域 */
.app-footer {
  background-color: var(--bg-footer);
  padding: var(--spacing-lg) var(--spacing-md);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.app-footer__container {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  text-align: center;
}

.app-footer__text {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.app-footer__tech {
  color: rgba(255, 255, 255, 0.6);
}

.app-footer__divider {
  color: var(--text-muted);
  opacity: 0.5;
}

/* 响应式 */
@media (max-width: 768px) {
  .app-header__title {
    font-size: var(--font-size-lg);
  }

  .app-header__icon {
    font-size: 32px;
  }
}
</style>
