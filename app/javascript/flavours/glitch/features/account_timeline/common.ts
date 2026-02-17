import { isServerFeatureEnabled } from '@/flavours/glitch/utils/environment';

export function isRedesignEnabled() {
  return isServerFeatureEnabled('profile_redesign');
}
