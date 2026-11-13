<script setup lang="ts">
import { monthlyBudget } from '~/lib/budget';
import { byCategory } from '~/lib/categories';
import { dayOf, daysIn, monthName, thisMonth, today } from '~/lib/dates';
import { money, moneyWhole, plural, sum } from '~/lib/format';

definePageMeta({ layout: 'dashboard' });
useHead({ title: 'Where it goes' });

const { user, month } = useApp();
const { expenses, error } = useExpenses(() => month.value);
const trend = useTrend(() => month.value);
const fmt = (v: number) => money(v, user.value.currency);

const view = computed(() => {
  const list = expenses.value;
  if (!list?.length) return null;
  const total = sum(list);
  const budget = monthlyBudget(user.value);
  const n = daysIn(month.value);
  const daysCounted = month.value === thisMonth() ? dayOf(today()) : n;
  const cats = byCategory(list);
  const top = cats[0]!;
  return {
    total,
    budget,
    budgetPerDay: budget > 0 ? Math.round(budget / n) : 0,
    daysCounted,
    cats,
    top,
    topShare: Math.round((top.amount / total) * 100),
    biggest: [...list].sort((a, b) => b.amount - a.amount).slice(0, 5),
    quietDays: daysCounted - new Set(list.map((e) => e.date)).size,
    count: list.length,
  };
});
</script>

<template>
  <div>
    <PageHead title="Where it goes"><MonthSwitch /></PageHead>
    <AppCard v-if="error"><p class="error">{{ error }}</p></AppCard>
    <AppCard v-else-if="!expenses"><SkeletonRows :rows="5" /></AppCard>
    <AppCard v-else-if="!view">
      <p class="empty">No expenses in {{ monthName(month) }} yet. Add some and the breakdown appears here.</p>
    </AppCard>
    <div v-else class="stack">
      <div class="tiles">
        <StatTile
          label="Total spent"
          :value="fmt(view.total)"
          :detail="
            view.budget > 0
              ? `${Math.round((view.total / view.budget) * 100)}% of ${moneyWhole(view.budget, user.currency)} budget`
              : plural(view.count, 'expense')
          "
        />
        <StatTile label="Average per day" :value="fmt(Math.round(view.total / view.daysCounted))" :detail="`over ${plural(view.daysCounted, 'day')}`" />
        <StatTile label="Top category" :value="view.top.name" :detail="`${fmt(view.top.amount)} · ${view.topShare}%`" />
        <StatTile label="Days with no spending" :value="String(view.quietDays)" :detail="`of ${view.daysCounted}`" />
      </div>

      <div class="cols">
        <AppCard title="By category"><CategoryBars :parts="view.cats" :currency="user.currency" /></AppCard>
        <AppCard title="Share of spending"><Donut :parts="view.cats" :currency="user.currency" /></AppCard>
      </div>

      <AppCard title="Day by day">
        <DailyChart :month="month" :expenses="expenses" :budget-per-day="view.budgetPerDay" :currency="user.currency" />
      </AppCard>

      <div class="cols">
        <AppCard title="Last 6 months">
          <TrendBars v-if="trend" :months="trend" :current="month" :currency="user.currency" />
          <SkeletonRows v-else :rows="3" />
        </AppCard>
        <AppCard title="Biggest expenses">
          <div class="list">
            <ExpenseRow v-for="e in view.biggest" :key="e.id" :expense="e" show-date />
          </div>
        </AppCard>
      </div>
    </div>
  </div>
</template>
