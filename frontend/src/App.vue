<template>
  <div id="app-root">
    <AppSplash v-if="!splashDone" @finish="splashDone = true" />
    <RouteProgressBar />
    <router-view />
    <ToastStack />
    <ConfirmDialog />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AppSplash from '@/components/ui/AppSplash.vue';
import RouteProgressBar from '@/components/ui/RouteProgressBar.vue';
import ToastStack from '@/components/ui/ToastStack.vue';
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';

const splashDone = ref(false);
</script>

<style>
#app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
