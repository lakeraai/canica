import { UMAP as Umap } from "umap-js"
import { euclidean } from "umap-js/dist/umap"

import { Algo } from "./algo"
import { DistanceFn, Point } from "./types"

export class UMAP extends Algo {
  umap: Umap
  iter: number = 0
  focus = null

  constructor({ distanceFn = euclidean }: { distanceFn?: DistanceFn }) {
    super()
    this.umap = new Umap({ distanceFn: distanceFn })
  }

  step = () => {
    this.umap.step()
    this.iter++
  }

  getSolution = (): Point[] => {
    if (this.umap.getEmbedding()[0].length !== 2) {
      throw new Error("Expected 2D embedding")
    }
    const result: Point[] = this.umap.getEmbedding().map((p) => [p[0], p[1]])

    // Center result so it has 0 mean
    const [D, N] = [result[0].length, result.length]
    let centeredResult: Point[] = result

    for (let d = 0; d < D; d++) {
      // Compute mean for dimension d by accumulating over all points and dividing by N
      const mean = result.reduce((acc, p) => acc + p[d], 0) / N
      // Subtract mean from all points
      for (let i = 0; i < N; i++) {
        centeredResult[i][d] -= mean
      }
    }
    return centeredResult
  }

  initDataRaw(embeddings: number[][]): void {
    this.X = embeddings
    this.umap = new Umap()
    const nEpochs = this.umap.initializeFit(embeddings)
    for (let i = 0; i < 0.75 * nEpochs; i++) {
      this.step()
    }
  }
}
