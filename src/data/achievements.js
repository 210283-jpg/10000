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
    label: '神速建造',
    description: '在3分鐘內完成任意模型！',
    icon: '⚡',
    condition: { type: 'speed-run', maxMs: 180000 },
  },
  {
    id: 'collector',
    label: '全收集家',
    description: '完成所有3個基礎模型！',
    icon: '🌟',
    condition: { type: 'all-models' },
  },
];
