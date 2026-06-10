import { computed, ref } from 'vue';

function parseToken() {
  try {
    const token = localStorage.getItem('jwt_token');
    if (!token) return null;
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

// Singleton reactivo — se actualiza en cada refresh()
const _payload = ref(parseToken());

export function useAuth() {
  const role     = computed(() => _payload.value?.tipo_usuario ?? 'User');
  const isAdmin  = computed(() => _payload.value?.tipo_usuario === 'Admin');
  const userName = computed(() => _payload.value?.name || _payload.value?.email || 'Usuario');
  const userEmail= computed(() => _payload.value?.email || '');
  const userUid  = computed(() => _payload.value?.uid || '');

  function refresh() {
    _payload.value = null;          // fuerza reactividad
    _payload.value = parseToken();
  }

  return { role, isAdmin, userName, userEmail, userUid, refresh };
}
