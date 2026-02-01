/**
 * 引导完成状态：未完成时每次打开先进入欢迎/引导页
 */
const ONBOARDING_DONE_KEY = 'mushi_onboarding_done';

export function getOnboardingDone() {
  try {
    return !!localStorage.getItem(ONBOARDING_DONE_KEY);
  } catch {
    return false;
  }
}

export function setOnboardingDone() {
  try {
    localStorage.setItem(ONBOARDING_DONE_KEY, '1');
  } catch (e) {
    console.warn('[onboarding] setOnboardingDone failed', e);
  }
}

export function clearOnboardingDone() {
  try {
    localStorage.removeItem(ONBOARDING_DONE_KEY);
  } catch {}
}
