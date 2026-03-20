/**
 * AchievementDefinition list.
 */
export const ACHIEVEMENTS = [
  {
    id: 'first-build',
    label: '初次建造',
    description: '完成你的第一個模型！',
    icon: '🏆',
    condition: { type: 'first-completion' },
  },
  {
    id: 'speed-runner',
    label: '閃電速度',
    description: '在 3 分鐘內完成任何模型！',
    icon: '⚡',
    condition: { type: 'speed-run', maxMs: 180000 },
  },
  {
    id: 'collector',
    label: '收藏家',
    description: '完成所有 3 個基礎模型！',
    icon: '🌟',
    condition: { type: 'all-models' },
  },
];
