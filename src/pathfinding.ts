import { nodes, edges } from './graph'

function heuristic(a: any, b: any) {
  return Math.sqrt(
    (a.x - b.x) ** 2 +
    (a.z - b.z) ** 2 +
    (a.floor - b.floor) ** 2
  )
}

export function findPath(startId: string, goalId: string) {
  const openSet = new Set([startId])
  const cameFrom: Record<string, string> = {}

  const gScore: Record<string, number> = {}
  const fScore: Record<string, number> = {}

  Object.keys(nodes).forEach(id => {
    gScore[id] = Infinity
    fScore[id] = Infinity
  })

  gScore[startId] = 0
  fScore[startId] = heuristic(nodes[startId], nodes[goalId])

  while (openSet.size > 0) {
    let current = [...openSet].reduce((a, b) =>
      fScore[a] < fScore[b] ? a : b
    )

    if (current === goalId) {
      const path: string[] = []
      while (current) {
        path.unshift(current)
        current = cameFrom[current]
      }
      return path
    }

    openSet.delete(current)

    const neighbors = edges
      .filter(e => e.from === current)
      .map(e => ({ id: e.to, cost: e.cost }))

    for (const n of neighbors) {
      const tentative = gScore[current] + n.cost

      if (tentative < gScore[n.id]) {
        cameFrom[n.id] = current
        gScore[n.id] = tentative
        fScore[n.id] =
          tentative + heuristic(nodes[n.id], nodes[goalId])
        openSet.add(n.id)
      }
    }
  }

  return null
}