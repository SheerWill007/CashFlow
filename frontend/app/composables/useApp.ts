import type { Ref } from 'vue';
import { api } from '~/lib/api';
import { thisMonth } from '~/lib/dates';
import type { Expense, MeResponse, TrendPoint, User } from '~/lib/types';

/** Session state for the dashboard: who is logged in, which month is shown, and a change counter. */
export function useApp() {
  const me = useState<MeResponse | null>('me', () => null);
  const month = useState('month', thisMonth);
  const version = useState('version', () => 0);

  /** Only use inside the dashboard layout, which renders pages after the user has loaded. */
  const user = computed(() => me.value?.user as User);
  const categories = computed(() => me.value?.categories ?? []);
  const currencies = computed(() => me.value?.currencies ?? []);

  const setUser = (u: User) => {
    if (me.value) me.value = { ...me.value, user: u };
  };
  const changed = () => version.value++;

  async function leave() {
    // Logging out also clears the cookie, so the login page won't bounce back here.
    await api('POST', '/api/logout').catch(() => {});
    me.value = null;
    await navigateTo('/login', { replace: true });
  }

  return { me, user, categories, currencies, month, version, setUser, changed, leave };
}

function useFetched<T>(url: () => string) {
  const { version } = useApp();
  const data = ref<T | null>(null) as Ref<T | null>;
  const error = ref('');
  watch(
    [url, version],
    async (_, __, onCleanup) => {
      let alive = true;
      onCleanup(() => (alive = false));
      error.value = '';
      try {
        const result = await api<T>('GET', url());
        if (alive) data.value = result;
      } catch (e) {
        if (alive) error.value = e instanceof Error ? e.message : 'Something went wrong';
      }
    },
    { immediate: true },
  );
  return { data, error };
}

/** Expenses for a month; null while a different month is still loading. */
export function useExpenses(month: () => string) {
  const { data, error } = useFetched<{ expenses: Expense[] }>(() => `/api/expenses?month=${month()}`);
  const expenses = computed(() => {
    const list = data.value?.expenses;
    return list && list.every((e) => e.date.startsWith(month())) ? list : null;
  });
  return { expenses, error };
}

export function useTrend(month: () => string) {
  const { data } = useFetched<{ months: TrendPoint[] }>(() => `/api/trend?month=${month()}`);
  return computed(() => {
    const months = data.value?.months;
    return months && months[months.length - 1]?.month === month() ? months : null;
  });
}
