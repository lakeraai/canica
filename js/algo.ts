import { Index, Point, Vector } from "./types"

const cosineSimilarity = (x1: number[], x2: number[]) => {
  let dot = 0
  let mag1 = 0
  let mag2 = 0
  for (let i = 0; i < x1.length; i++) {
    dot += x1[i] * x2[i]
    mag1 += x1[i] * x1[i]
    mag2 += x2[i] * x2[i]
  }
  return dot / (Math.sqrt(mag1) * Math.sqrt(mag2))
}

export abstract class Algo {
  iter: number = 0
  stopOptimization: boolean = false
  lastSolution: Point[] | undefined = undefined
  stopTolerance: number = 1e-5
  maxIter: number = 1000
  X: Vector[] = []
  neighborhoodIndices: Set<Index> | null = null
  focusedIndex: Index | null = null

  abstract step(): void

  abstract getSolution(): Point[]

  abstract initDataRaw(embeddings: Vector[]): void

  focusNeighbours(focusedIndex: Index | null, neighbourFrac: number): void {
    if (focusedIndex === null) return
    this.focusedIndex = focusedIndex

    const focusedEmbedding = this.X[focusedIndex]
    const similarities = this.X.map((x) => cosineSimilarity(x, focusedEmbedding))

    const neighbourCnt = Math.floor(neighbourFrac * similarities.length)
    // Determine the number of neighbours to select. At least 5, at most all.
    const nNeighbors = Math.min(Math.max(5, neighbourCnt), similarities.length)
    // Sort array indices in descending order.
    const sortedIndices = similarities
      .map((val, ind) => {
        return { ind, val }
      })
      .sort((a, b) => b.val - a.val)
      .map((obj) => obj.ind)
    this.neighborhoodIndices = new Set(sortedIndices.slice(0, nNeighbors))
  }

  embeddingChange(currentSolution: Point[]): number {
    if (this.lastSolution === undefined) {
      return Infinity
    }
    let sqChange = 0
    for (let i = 0; i < currentSolution.length; i++) {
      for (let d = 0; d < currentSolution[i].length; d++) {
        // We compute the (squared) relative change in embedding position
        sqChange +=
          ((currentSolution[i][d] - this.lastSolution[i][d]) /
            (Math.abs(this.lastSolution[i][d]) + 1e-9)) **
          2
      }
    }
    return sqChange / (currentSolution.length * currentSolution[0].length)
  }

  updateLastSolution(solution: Point[]): void {
    // Deep copy of the solution
    this.lastSolution = JSON.parse(JSON.stringify(solution))
  }

  checkIfConverged(): void {
    const solution: Point[] = this.getSolution()
    // Stop if the embedding has converged.
    if (this.embeddingChange(solution) < this.stopTolerance) {
      this.stopOptimization = true
    }
    // Stop if the maximum number of iterations is reached
    if (this.iter > this.maxIter) {
      this.stopOptimization = true
    }
    this.updateLastSolution(solution)
  }

  computeFinalSolution(): void {
    while (!this.stopOptimization) {
      this.step()
      this.iter++
      this.checkIfConverged()
    }
  }
}
