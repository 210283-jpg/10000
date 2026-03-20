/**
 * PartDefinition catalog.
 * Keys match the part types used in blueprints.js requiredParts.
 */
export const PARTS = {
  wall:   { type: 'wall',   label: '牆壁', icon: '🧱', color: '#D4A373', dimensions: { width: 1, height: 1 } },
  roof:   { type: 'roof',   label: '屋頂', icon: '🔺', color: '#E76F51', dimensions: { width: 1, height: 1 } },
  door:   { type: 'door',   label: '門',   icon: '🚪', color: '#606C38', dimensions: { width: 1, height: 1 } },
  window: { type: 'window', label: '窗戶', icon: '🪟', color: '#90E0EF', dimensions: { width: 1, height: 1 } },
  floor:  { type: 'floor',  label: '地板', icon: '🟫', color: '#A0856C', dimensions: { width: 1, height: 1 } },
  body:   { type: 'body',   label: '車身', icon: '🔷', color: '#4361EE', dimensions: { width: 1, height: 1 } },
  wheel:  { type: 'wheel',  label: '車輪', icon: '⚙️',  color: '#333333', dimensions: { width: 1, height: 1 } },
  bumper: { type: 'bumper', label: '保險桿', icon: '▬', color: '#CCC', dimensions: { width: 1, height: 1 } },
  head:   { type: 'head',   label: '頭部', icon: '🟪', color: '#6930C3', dimensions: { width: 1, height: 1 } },
  arm:    { type: 'arm',    label: '手臂', icon: '🫷', color: '#6930C3', dimensions: { width: 1, height: 1 } },
  leg:    { type: 'leg',    label: '腿部', icon: '🦵', color: '#6930C3', dimensions: { width: 1, height: 1 } },
  hand:   { type: 'hand',   label: '手掌', icon: '✋', color: '#7B2D8B', dimensions: { width: 1, height: 1 } },
  foot:   { type: 'foot',   label: '腳掌', icon: '👣', color: '#7B2D8B', dimensions: { width: 1, height: 1 } },
  eye:    { type: 'eye',    label: '眼睛', icon: '👁️',  color: '#00F5FF', dimensions: { width: 1, height: 1 } },
};
