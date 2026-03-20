export const ACHIEVEMENTS = [
  {
    id: 'first-build',
    label: '初次完成',
    description: '完成第一個模型',
    icon: '🏆',
    condition: { type: 'first-completion' }
  },
  {
    id: 'speed-runner',
    label: '速度之星',
    description: '在3分鐘內完成任意模型',
    icon: '⚡',
    condition: { type: 'speed-run', maxMs: 180000 }
  },
  {
    id: 'collector',
    label: '收藏家',
    description: '完成所有三個模型',
    icon: '🌟',
    condition: { type: 'all-models' }
  }
];
