export const BLUEPRINTS = [
  {
    id: 'house-01',
    name: '小屋',
    description: '建造一棟溫馨小屋',
    gridWidth: 8,
    gridHeight: 8,
    requiredParts: { wall: 4, roof: 2, door: 1, window: 2, floor: 1 },
    cells: [
      { x: 1, y: 7, partType: 'floor' },
      { x: 0, y: 5, partType: 'wall' },
      { x: 5, y: 5, partType: 'wall' },
      { x: 0, y: 6, partType: 'wall' },
      { x: 5, y: 6, partType: 'wall' },
      { x: 3, y: 6, partType: 'door' },
      { x: 1, y: 5, partType: 'window' },
      { x: 4, y: 5, partType: 'window' },
      { x: 2, y: 3, partType: 'roof' },
      { x: 3, y: 3, partType: 'roof' }
    ]
  },
  {
    id: 'car-01',
    name: '小汽車',
    description: '組裝一輛可愛小汽車',
    gridWidth: 6,
    gridHeight: 6,
    requiredParts: { body: 1, roof: 1, wheel: 4, window: 2, bumper: 1 },
    cells: [
      { x: 2, y: 3, partType: 'body' },
      { x: 2, y: 2, partType: 'roof' },
      { x: 1, y: 4, partType: 'wheel' },
      { x: 4, y: 4, partType: 'wheel' },
      { x: 1, y: 2, partType: 'wheel' },
      { x: 4, y: 2, partType: 'wheel' },
      { x: 1, y: 3, partType: 'window' },
      { x: 3, y: 3, partType: 'window' },
      { x: 0, y: 3, partType: 'bumper' }
    ]
  },
  {
    id: 'robot-01',
    name: '機器人',
    description: '打造一個機器人夥伴',
    gridWidth: 8,
    gridHeight: 10,
    requiredParts: { head: 1, body: 1, arm: 2, leg: 2, hand: 2, foot: 2, eye: 2 },
    cells: [
      { x: 3, y: 1, partType: 'head' },
      { x: 3, y: 4, partType: 'body' },
      { x: 1, y: 4, partType: 'arm' },
      { x: 5, y: 4, partType: 'arm' },
      { x: 2, y: 7, partType: 'leg' },
      { x: 4, y: 7, partType: 'leg' },
      { x: 0, y: 4, partType: 'hand' },
      { x: 6, y: 4, partType: 'hand' },
      { x: 2, y: 9, partType: 'foot' },
      { x: 4, y: 9, partType: 'foot' },
      { x: 2, y: 1, partType: 'eye' },
      { x: 4, y: 1, partType: 'eye' }
    ]
  }
];
