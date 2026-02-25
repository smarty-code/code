import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';

const COLORS = {
  page: '#1D1F25',
  card: '#28292D',
  panel: '#34363B',
  accent: '#F66C3F',
  black: '#000000',
  white: '#FFFFFF',
  mutedText: '#B3B3B8',
  softBg: '#C7BCB6',
};

const GOAL_TEMPLATES = [
  { id: 'goal-a', title: 'Goal A • Product Design', targetMinutes: 360, color: '#F66C3F' },
  { id: 'goal-b', title: 'Goal B • Deep Work', targetMinutes: 280, color: '#7E8BFF' },
  { id: 'goal-c', title: 'Goal C • Skill Building', targetMinutes: 240, color: '#58B57E' },
];

const TABS = [
  { key: 'home', label: 'Home' },
  { key: 'goals', label: 'Goal Space' },
  { key: 'analytics', label: 'Analytics' },
];

function formatClock(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, '0');
  return `${mins}:${secs}`;
}

function toDateKey(date) {
  return new Date(date).toISOString().slice(0, 10);
}

function computeGoalStats(goals, sessions) {
  return goals.map((goal) => {
    const related = sessions.filter((session) => session.goalId === goal.id);
    const totalSeconds = related.reduce((sum, session) => sum + session.durationSec, 0);
    const progress = Math.min(1, totalSeconds / (goal.targetMinutes * 60));

    const daySet = new Set(related.map((session) => toDateKey(session.startedAt)));
    const sortedDays = [...daySet].sort();
    let streak = 0;
    if (sortedDays.length) {
      let cursor = new Date(sortedDays[sortedDays.length - 1]);
      for (let i = sortedDays.length - 1; i >= 0; i -= 1) {
        const expected = toDateKey(cursor);
        if (sortedDays[i] !== expected) {
          break;
        }
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      }
    }

    return {
      ...goal,
      totalMinutes: Math.round(totalSeconds / 60),
      progress,
      streak,
    };
  });
}

function buildHeatmap(sessions) {
  const minutesPerDay = sessions.reduce((acc, session) => {
    const key = toDateKey(session.startedAt);
    const mins = Math.round(session.durationSec / 60);
    acc[key] = (acc[key] || 0) + mins;
    return acc;
  }, {});

  const days = [];
  const now = new Date();
  for (let i = 83; i >= 0; i -= 1) {
    const day = new Date(now);
    day.setDate(now.getDate() - i);
    const key = toDateKey(day);
    days.push({
      key,
      value: minutesPerDay[key] || 0,
    });
  }

  const max = Math.max(1, ...days.map((item) => item.value));

  return { days, max };
}

export default function App() {
  const [tab, setTab] = useState('home');
  const [goals] = useState(GOAL_TEMPLATES);
  const [selectedGoalId, setSelectedGoalId] = useState(GOAL_TEMPLATES[0].id);
  const [durationInput, setDurationInput] = useState('25');
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState([
    { goalId: 'goal-a', durationSec: 1800, startedAt: new Date(Date.now() - 86400000 * 1).toISOString() },
    { goalId: 'goal-b', durationSec: 2400, startedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
    { goalId: 'goal-c', durationSec: 1500, startedAt: new Date(Date.now() - 86400000 * 4).toISOString() },
    { goalId: 'goal-a', durationSec: 2100, startedAt: new Date().toISOString() },
  ]);

  useEffect(() => {
    if (!running) {
      return undefined;
    }

    const timer = setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          clearInterval(timer);
          setRunning(false);
          setSessions((prev) => [
            ...prev,
            {
              goalId: selectedGoalId,
              durationSec: totalSeconds,
              startedAt: new Date().toISOString(),
            },
          ]);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [running, selectedGoalId, totalSeconds]);

  const goalStats = useMemo(() => computeGoalStats(goals, sessions), [goals, sessions]);
  const selectedGoal = goalStats.find((goal) => goal.id === selectedGoalId) || goalStats[0];
  const heatmap = useMemo(() => buildHeatmap(sessions), [sessions]);

  const applyDuration = () => {
    const parsed = Number(durationInput);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return;
    }
    const next = Math.min(360, Math.round(parsed)) * 60;
    setTotalSeconds(next);
    setRemainingSeconds(next);
    setRunning(false);
  };

  const resetTimer = () => {
    setRunning(false);
    setRemainingSeconds(totalSeconds);
  };

  const manuallyLogSession = () => {
    setSessions((prev) => [
      ...prev,
      {
        goalId: selectedGoalId,
        durationSec: totalSeconds - remainingSeconds,
        startedAt: new Date().toISOString(),
      },
    ]);
    resetTimer();
  };

  const totalFocusedMinutes = sessions.reduce((sum, session) => sum + Math.round(session.durationSec / 60), 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.page }}>
      <StatusBar barStyle="light-content" />
      <View style={{ flex: 1, paddingHorizontal: 18, paddingTop: 8, paddingBottom: 14 }}>
        <Text style={{ color: COLORS.white, fontSize: 30, fontWeight: '700', marginBottom: 2 }}>Lufga Focus</Text>
        <Text style={{ color: COLORS.mutedText, marginBottom: 14 }}>Time-track goals with a speaker-inspired UI system.</Text>

        {tab === 'home' && (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ backgroundColor: COLORS.card, borderRadius: 28, padding: 18, marginBottom: 14 }}>
              <Text style={{ color: COLORS.mutedText, marginBottom: 8 }}>Current Goal</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
                {goalStats.map((goal) => (
                  <Pressable
                    key={goal.id}
                    onPress={() => setSelectedGoalId(goal.id)}
                    style={{
                      backgroundColor: selectedGoalId === goal.id ? goal.color : COLORS.panel,
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 14,
                    }}
                  >
                    <Text style={{ color: COLORS.white, fontWeight: '600' }}>{goal.title.split('•')[0].trim()}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={{ color: COLORS.white, fontSize: 58, fontWeight: '300', textAlign: 'center', marginBottom: 8 }}>
                {formatClock(remainingSeconds)}
              </Text>

              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                <TextInput
                  value={durationInput}
                  onChangeText={setDurationInput}
                  keyboardType="numeric"
                  placeholder="Minutes"
                  placeholderTextColor={COLORS.mutedText}
                  style={{
                    flex: 1,
                    backgroundColor: COLORS.panel,
                    color: COLORS.white,
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                  }}
                />
                <Pressable
                  onPress={applyDuration}
                  style={{ backgroundColor: COLORS.softBg, borderRadius: 12, justifyContent: 'center', paddingHorizontal: 14 }}
                >
                  <Text style={{ color: COLORS.black, fontWeight: '700' }}>Set</Text>
                </Pressable>
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 8 }}>
                {[15, 25, 45].map((preset) => (
                  <Pressable
                    key={preset}
                    onPress={() => {
                      setDurationInput(String(preset));
                      setTotalSeconds(preset * 60);
                      setRemainingSeconds(preset * 60);
                      setRunning(false);
                    }}
                    style={{
                      backgroundColor: COLORS.panel,
                      borderRadius: 10,
                      paddingHorizontal: 10,
                      paddingVertical: 8,
                    }}
                  >
                    <Text style={{ color: COLORS.white }}>{preset}m</Text>
                  </Pressable>
                ))}
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
                <Pressable
                  onPress={() => setRunning((value) => !value)}
                  style={{
                    flex: 1,
                    backgroundColor: COLORS.accent,
                    borderRadius: 14,
                    paddingVertical: 12,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: COLORS.white, fontSize: 16, fontWeight: '700' }}>{running ? 'Pause' : 'Start'}</Text>
                </Pressable>
                <Pressable
                  onPress={resetTimer}
                  style={{
                    backgroundColor: COLORS.panel,
                    borderRadius: 14,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: COLORS.white, fontWeight: '600' }}>Reset</Text>
                </Pressable>
                <Pressable
                  onPress={manuallyLogSession}
                  disabled={remainingSeconds === totalSeconds}
                  style={{
                    backgroundColor: remainingSeconds === totalSeconds ? '#50525A' : '#58B57E',
                    borderRadius: 14,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: COLORS.white, fontWeight: '700' }}>Log</Text>
                </Pressable>
              </View>
            </View>

            <View style={{ backgroundColor: COLORS.card, borderRadius: 24, padding: 16 }}>
              <Text style={{ color: COLORS.white, fontSize: 18, fontWeight: '600' }}>Focus Snapshot</Text>
              <Text style={{ color: COLORS.mutedText, marginTop: 4 }}>
                {selectedGoal.title} • {selectedGoal.totalMinutes}/{selectedGoal.targetMinutes} min
              </Text>
              <View style={{ marginTop: 10, backgroundColor: COLORS.panel, borderRadius: 999, height: 12, overflow: 'hidden' }}>
                <View
                  style={{
                    width: `${Math.max(3, Math.round(selectedGoal.progress * 100))}%`,
                    height: '100%',
                    backgroundColor: selectedGoal.color,
                  }}
                />
              </View>
              <Text style={{ color: COLORS.white, marginTop: 8 }}>Current streak: {selectedGoal.streak} day(s)</Text>
            </View>
          </ScrollView>
        )}

        {tab === 'goals' && (
          <ScrollView showsVerticalScrollIndicator={false}>
            {goalStats.map((goal) => (
              <View
                key={goal.id}
                style={{
                  backgroundColor: COLORS.card,
                  borderRadius: 20,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: goal.id === selectedGoalId ? 1 : 0,
                  borderColor: goal.color,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ color: COLORS.white, fontSize: 17, fontWeight: '700' }}>{goal.title}</Text>
                  <Text style={{ color: COLORS.mutedText }}>{goal.totalMinutes}m</Text>
                </View>
                <Text style={{ color: COLORS.mutedText, marginBottom: 8 }}>Target {goal.targetMinutes} minutes this week</Text>
                <View style={{ backgroundColor: COLORS.panel, borderRadius: 999, height: 12, overflow: 'hidden' }}>
                  <View style={{ height: '100%', width: `${Math.round(goal.progress * 100)}%`, backgroundColor: goal.color }} />
                </View>
                <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: COLORS.white }}>🔥 {goal.streak} day streak</Text>
                  <Pressable
                    onPress={() => setSelectedGoalId(goal.id)}
                    style={{ backgroundColor: COLORS.panel, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 }}
                  >
                    <Text style={{ color: COLORS.white, fontWeight: '600' }}>Track with Timer</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {tab === 'analytics' && (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ backgroundColor: COLORS.card, borderRadius: 24, padding: 16, marginBottom: 12 }}>
              <Text style={{ color: COLORS.white, fontSize: 19, fontWeight: '700' }}>Analytics Space</Text>
              <Text style={{ color: COLORS.mutedText, marginTop: 4 }}>
                Total focused: {totalFocusedMinutes} minutes • Last 12 weeks
              </Text>

              <View style={{ marginTop: 14, flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
                {heatmap.days.map((item) => {
                  const intensity = item.value / heatmap.max;
                  const backgroundColor =
                    item.value === 0
                      ? '#3A3B41'
                      : intensity < 0.25
                        ? '#6B3B2B'
                        : intensity < 0.5
                          ? '#A64F30'
                          : intensity < 0.75
                            ? '#D86136'
                            : COLORS.accent;
                  return (
                    <View
                      key={item.key}
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 3,
                        backgroundColor,
                      }}
                    />
                  );
                })}
              </View>
              <Text style={{ color: COLORS.mutedText, marginTop: 10 }}>
                GitHub-style streak map: darker cells = more focused minutes.
              </Text>
            </View>

            <View style={{ backgroundColor: COLORS.card, borderRadius: 24, padding: 16 }}>
              <Text style={{ color: COLORS.white, fontSize: 17, fontWeight: '700', marginBottom: 8 }}>Recent sessions</Text>
              {sessions
                .slice()
                .reverse()
                .slice(0, 6)
                .map((session) => {
                  const goal = goalStats.find((item) => item.id === session.goalId);
                  return (
                    <View
                      key={`${session.startedAt}-${session.goalId}-${session.durationSec}`}
                      style={{
                        backgroundColor: COLORS.panel,
                        borderRadius: 12,
                        padding: 10,
                        marginBottom: 8,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Text style={{ color: COLORS.white }}>{goal?.title.split('•')[0].trim() || 'Goal'}</Text>
                      <Text style={{ color: COLORS.mutedText }}>
                        {Math.round(session.durationSec / 60)}m • {session.startedAt.slice(0, 10)}
                      </Text>
                    </View>
                  );
                })}
            </View>
          </ScrollView>
        )}

        <View
          style={{
            flexDirection: 'row',
            backgroundColor: COLORS.black,
            borderRadius: 18,
            marginTop: 10,
            padding: 6,
            gap: 8,
          }}
        >
          {TABS.map((item) => (
            <Pressable
              key={item.key}
              onPress={() => setTab(item.key)}
              style={{
                flex: 1,
                backgroundColor: tab === item.key ? COLORS.accent : 'transparent',
                borderRadius: 12,
                paddingVertical: 10,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: COLORS.white, fontWeight: tab === item.key ? '700' : '500' }}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
