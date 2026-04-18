export type Node = {
  id: string
  x: number
  z: number
  floor: number
}

export type Edge = {
  from: string
  to: string
  cost: number
}

export const nodes: Record<string, Node> = {
  N0: { id: "N0", x: 0, z: 0, floor: 0 },
  N1: { id: "N1", x: 100, z: 0, floor: 0 },
  N2: { id: "N2", x: 100, z: 80, floor: 0 },

  // 階段（1階）
  STAIRS_1F: { id: "STAIRS_1F", x: 150, z: 50, floor: 0 },

  // 階段（2階）
  STAIRS_2F: { id: "STAIRS_2F", x: 150, z: 50, floor: 50 }
}

export const edges: Edge[] = [
  // 同一階の移動
  { from: "N0", to: "N1", cost: 100 },
  { from: "N1", to: "N2", cost: 80 },
  { from: "N1", to: "STAIRS_1F", cost: 60 },

  // 階段で上下接続
  { from: "STAIRS_1F", to: "STAIRS_2F", cost: 20 }
]