/**
 * Blueprint seed data for the 3 base models.
 * validPositions: 'any' = free placement anywhere on the grid.
 */
export const BLUEPRINTS = [
  {
    id: 'house-01',
    name: '小屋',
    thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"%3E%3Crect x="15" y="40" width="50" height="30" fill="%23D4A373"/%3E%3Cpolygon points="10,40 40,10 70,40" fill="%23E76F51"/%3E%3Crect x="32" y="50" width="16" height="20" fill="%23606C38"/%3E%3Crect x="18" y="48" width="12" height="10" fill="%2390E0EF"/%3E%3Crect x="50" y="48" width="12" height="10" fill="%2390E0EF"/%3E%3C/svg%3E',
    gridWidth: 8,
    gridHeight: 8,
    description: '建造一間溫馨的小屋！',
    requiredParts: {
      wall:   { quantity: 4, validPositions: 'any' },
      roof:   { quantity: 2, validPositions: 'any' },
      door:   { quantity: 1, validPositions: 'any' },
      window: { quantity: 2, validPositions: 'any' },
      floor:  { quantity: 1, validPositions: 'any' },
    },
  },
  {
    id: 'car-01',
    name: '小汽車',
    thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"%3E%3Crect x="5" y="35" width="70" height="25" rx="5" fill="%234361EE"/%3E%3Crect x="18" y="22" width="44" height="20" rx="4" fill="%234CC9F0"/%3E%3Ccircle cx="20" cy="62" r="10" fill="%23333"/%3E%3Ccircle cx="60" cy="62" r="10" fill="%23333"/%3E%3Ccircle cx="20" cy="62" r="5" fill="%23aaa"/%3E%3Ccircle cx="60" cy="62" r="5" fill="%23aaa"/%3E%3C/svg%3E',
    gridWidth: 6,
    gridHeight: 6,
    description: '組裝一輛酷炫的小汽車！',
    requiredParts: {
      body:   { quantity: 1, validPositions: 'any' },
      roof:   { quantity: 1, validPositions: 'any' },
      wheel:  { quantity: 4, validPositions: 'any' },
      window: { quantity: 2, validPositions: 'any' },
      bumper: { quantity: 1, validPositions: 'any' },
    },
  },
  {
    id: 'robot-01',
    name: '機器人',
    thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"%3E%3Crect x="25" y="8" width="30" height="25" rx="4" fill="%236930C3"/%3E%3Ccircle cx="33" cy="20" r="4" fill="%2300F5FF"/%3E%3Ccircle cx="47" cy="20" r="4" fill="%2300F5FF"/%3E%3Crect x="20" y="35" width="40" height="25" rx="3" fill="%237B2D8B"/%3E%3Crect x="5" y="36" width="13" height="20" rx="3" fill="%236930C3"/%3E%3Crect x="62" y="36" width="13" height="20" rx="3" fill="%236930C3"/%3E%3Crect x="23" y="62" width="12" height="16" rx="3" fill="%236930C3"/%3E%3Crect x="45" y="62" width="12" height="16" rx="3" fill="%236930C3"/%3E%3C/svg%3E',
    gridWidth: 8,
    gridHeight: 10,
    description: '打造一個友善的機器人！',
    requiredParts: {
      head: { quantity: 1, validPositions: 'any' },
      body: { quantity: 1, validPositions: 'any' },
      arm:  { quantity: 2, validPositions: 'any' },
      leg:  { quantity: 2, validPositions: 'any' },
      hand: { quantity: 2, validPositions: 'any' },
      foot: { quantity: 2, validPositions: 'any' },
      eye:  { quantity: 2, validPositions: 'any' },
    },
  },
];
