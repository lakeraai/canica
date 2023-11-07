/**
 * Based on Andrej Karpathy's tsnejs: https://github.com/karpathy/tsnejs/
 */

import Prando from "prando"

import { Algo } from "./algo"
import { Point } from "./types"

// utility function
const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw message || "Assertion failed"
  }
}

// return 0 mean unit standard deviation random number
let return_v = false
let v_val = 0.0
const gaussRandom = (prng: Prando): number => {
  if (return_v) {
    return_v = false
    return v_val
  }
  const u = 2 * prng.next() - 1
  const v = 2 * prng.next() - 1
  const r = u * u + v * v
  if (r == 0 || r > 1) return gaussRandom(prng)
  const c = Math.sqrt((-2 * Math.log(r)) / r)
  v_val = v * c // cache this for next function call for efficiency
  return_v = true
  return u * c
}

// return random normal number
const randn = (mu: number, std: number, prng: Prando) => {
  return mu + gaussRandom(prng) * std
}

// utilitity that creates contiguous vector of zeros of size n
const zeros = function (n: number): Float64Array {
  return new Float64Array(n) // typed arrays are faster
}

// utility that returns 2d array filled with random numbers
// or with value s, if provided
const randn2d = (
  n: number,
  d: number,
  s: number | undefined = undefined,
  prng: Prando,
): number[][] => {
  const x: number[][] = []
  for (let i = 0; i < n; i++) {
    const xhere = []
    for (let j = 0; j < d; j++) {
      if (typeof s !== "undefined") {
        xhere.push(s)
      } else {
        xhere.push(randn(0.0, 1e-4, prng))
      }
    }
    x.push(xhere)
  }
  return x
}

// compute L2 distance between two vectors
const L2 = (x1: number[], x2: number[]) => {
  let d = 0
  for (let i = 0; i < x1.length; i++) {
    d += (x1[i] - x2[i]) * (x1[i] - x2[i])
  }
  return d
}

// compute pairwise distance in all vectors in X
const xtod = (X: number[][]) => {
  const N = X.length
  const dist = zeros(N * N) // allocate contiguous array
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      const d = L2(X[i], X[j])
      dist[i * N + j] = d
      dist[j * N + i] = d
    }
  }
  return dist
}

// compute (p_{i|j} + p_{j|i})/(2n)
const d2p = (D: Float64Array, perplexity: number, tol: number) => {
  const Nf = Math.sqrt(D.length) // this better be an integer
  const N = Math.floor(Nf)
  assert(N === Nf, "D should have square number of elements.")
  const Htarget = Math.log(perplexity) // target entropy of distribution
  const P = zeros(N * N) // temporary probability matrix

  const prow = zeros(N) // a temporary storage compartment
  for (let i = 0; i < N; i++) {
    let betamin = -Infinity
    let betamax = Infinity
    let beta = 1 // initial value of precision
    let done = false
    const maxtries = 50

    // perform binary search to find a suitable precision beta
    // so that the entropy of the distribution is appropriate
    let num = 0
    while (!done) {
      //debugger;

      // compute entropy and kernel row with beta precision
      let psum = 0.0
      for (let j = 0; j < N; j++) {
        let pj = Math.exp(-D[i * N + j] * beta)
        if (i === j) {
          pj = 0
        } // we dont care about diagonals
        prow[j] = pj
        psum += pj
      }
      // normalize p and compute entropy
      let Hhere = 0.0
      for (let j = 0; j < N; j++) {
        let pj = 0
        if (psum != 0) {
          pj = prow[j] / psum
        }
        prow[j] = pj
        if (pj > 1e-7) Hhere -= pj * Math.log(pj)
      }

      // adjust beta based on result
      if (Hhere > Htarget) {
        // entropy was too high (distribution too diffuse)
        // so we need to increase the precision for more peaky distribution
        betamin = beta // move up the bounds
        if (betamax === Infinity) {
          beta = beta * 2
        } else {
          beta = (beta + betamax) / 2
        }
      } else {
        // converse case. make distrubtion less peaky
        betamax = beta
        if (betamin === -Infinity) {
          beta = beta / 2
        } else {
          beta = (beta + betamin) / 2
        }
      }

      // stopping conditions: too many tries or got a good precision
      num++
      if (Math.abs(Hhere - Htarget) < tol) {
        done = true
      }
      if (num >= maxtries) {
        done = true
      }
    }

    // console.log('data point ' + i + ' gets precision ' + beta + ' after ' + num + ' binary search steps.');
    // copy over the final prow to P at row i
    for (let j = 0; j < N; j++) {
      P[i * N + j] = prow[j]
    }
  } // end loop over examples i

  // symmetrize P and normalize it to sum to 1 over all ij
  const Pout = zeros(N * N)
  const N2 = N * 2
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      Pout[i * N + j] = Math.max((P[i * N + j] + P[j * N + i]) / N2, 1e-100)
    }
  }

  return Pout
}

const sign = (x: number) => {
  return x > 0 ? 1 : x < 0 ? -1 : 0
}

export class TSNE extends Algo {
  perplexity: number
  dim: number
  epsilon: number
  iter: number

  N: number = -1
  P: Float64Array = new Float64Array(0)
  Y: Point[] = []
  X: number[][] = []
  gains: number[][] = []
  ystep: number[][] = []

  focusWarmupIter = 100
  focusPullCoef = 0.02

  focus: {
    index: number
    weights: number[]
    center: Point
    fromIter: number
  } | null = null

  prng: Prando

  constructor({
    dim = 2,
    perplexity = 30,
    epsilon = 10,
    randomSeed = 0,
  }: {
    dim?: number
    perplexity?: number
    epsilon?: number
    randomSeed?: number
  }) {
    super()
    this.perplexity = perplexity // effective number of nearest neighbors
    this.dim = dim // by default 2-D tSNE
    this.epsilon = epsilon // learning rate
    this.iter = 0
    this.prng = new Prando(randomSeed)
  }

  // this function takes a set of high-dimensional points
  // and creates matrix P from them using gaussian kernel
  initDataRaw(X: number[][]) {
    const N = X.length
    const D = X[0].length
    assert(N > 0, " X is empty? You must have some data!")
    assert(D > 0, " X[0] is empty? Where is the data?")
    const dists = xtod(X) // convert X to distances using gaussian kernel
    this.X = X
    this.P = d2p(dists, this.perplexity, 1e-4) // attach to object
    this.N = N // back up the size of the dataset
    this.initSolution() // refresh this
  }

  // this function takes a given distance matrix and creates
  // matrix P from them.
  // D is assumed to be provided as a list of lists, and should be symmetric
  initDataDist(D: number[][]) {
    const N = D.length
    assert(N > 0, " X is empty? You must have some data!")
    // convert D to a (fast) typed array version
    const dists = zeros(N * N) // allocate contiguous array
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const d = D[i][j]
        dists[i * N + j] = d
        dists[j * N + i] = d
      }
    }
    this.P = d2p(dists, this.perplexity, 1e-4)
    this.N = N
    this.initSolution() // refresh this
  }

  // (re)initializes the solution to random
  initSolution() {
    // generate random solution to t-SNE
    this.Y = randn2d(this.N, 2, undefined, this.prng) as Point[] // the solution
    this.gains = randn2d(this.N, this.dim, 1.0, this.prng) // step gains to accelerate progress in unchanging directions
    this.ystep = randn2d(this.N, this.dim, 0.0, this.prng) // momentum accumulator
    this.iter = 0
  }

  // return pointer to current solution
  getSolution(): Point[] {
    return this.Y
  }

  // perform a single step of optimization to improve the embedding
  step() {
    this.iter += 1
    const N = this.N

    const cg = this.costGrad(this.Y) // evaluate gradient
    const cost = cg.cost
    const grad = cg.grad

    // perform gradient step
    const ymean = zeros(this.dim)
    for (let i = 0; i < N; i++) {
      for (let d = 0; d < this.dim; d++) {
        const gid = grad[i][d]
        const sid = this.ystep[i][d]
        const gainid = this.gains[i][d]

        // compute gain update
        let newgain = sign(gid) === sign(sid) ? gainid * 0.8 : gainid + 0.2
        if (newgain < 0.01) newgain = 0.01 // clamp
        this.gains[i][d] = newgain // store for next turn

        // compute momentum step direction
        const momval = this.iter < 250 ? 0.5 : 0.8
        const newsid = momval * sid - this.epsilon * newgain * grad[i][d]
        this.ystep[i][d] = newsid // remember the step we took

        // step!
        this.Y[i][d] += newsid

        ymean[d] += this.Y[i][d] // accumulate mean so that we can center later
      }
    }

    // reproject Y to be zero mean
    for (let i = 0; i < N; i++) {
      for (let d = 0; d < this.dim; d++) {
        this.Y[i][d] -= ymean[d] / N
      }
    }

    //if(this.iter%100===0) console.log('iter ' + this.iter + ', cost: ' + cost);
    return cost // return current cost
  }

  // for debugging: gradient check
  debugGrad() {
    const N = this.N

    const cg = this.costGrad(this.Y) // evaluate gradient
    const grad = cg.grad

    const e = 1e-5
    for (let i = 0; i < N; i++) {
      for (let d = 0; d < this.dim; d++) {
        const yold = this.Y[i][d]

        this.Y[i][d] = yold + e
        const cg0 = this.costGrad(this.Y)

        this.Y[i][d] = yold - e
        const cg1 = this.costGrad(this.Y)

        const analytic = grad[i][d]
        const numerical = (cg0.cost - cg1.cost) / (2 * e)
        console.log(
          i +
            "," +
            d +
            ": gradcheck analytic: " +
            analytic +
            " vs. numerical: " +
            numerical,
        )

        this.Y[i][d] = yold
      }
    }
  }

  // return cost and gradient, given an arrangement
  costGrad(Y: number[][]) {
    const N = this.N
    const dim = this.dim // dim of output space
    const P = this.P

    const pmul = this.iter < 100 ? 4 : 1 // trick that helps with local optima

    // compute current Q distribution, unnormalized first
    const Qu = zeros(N * N)
    let qsum = 0.0
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        let dsum = 0.0
        for (let d = 0; d < dim; d++) {
          const dhere = Y[i][d] - Y[j][d]
          dsum += dhere * dhere
        }
        const qu = 1.0 / (1.0 + dsum) // Student t-distribution
        Qu[i * N + j] = qu
        Qu[j * N + i] = qu
        qsum += 2 * qu
      }
    }
    // normalize Q distribution to sum to 1
    const NN = N * N
    const Q = zeros(NN)
    for (let q = 0; q < NN; q++) {
      Q[q] = Math.max(Qu[q] / qsum, 1e-100)
    }

    let cost = 0.0
    const grad = []
    for (let i = 0; i < N; i++) {
      const gsum = new Array(dim) // init grad for point i
      for (let d = 0; d < dim; d++) {
        gsum[d] = 0.0
      }
      for (let j = 0; j < N; j++) {
        cost += -P[i * N + j] * Math.log(Q[i * N + j]) // accumulate cost (the non-constant portion at least...)
        const premult = 4 * (pmul * P[i * N + j] - Q[i * N + j]) * Qu[i * N + j]
        for (let d = 0; d < dim; d++) {
          gsum[d] += premult * (Y[i][d] - Y[j][d])
        }
      }

      if (this.focus !== null) {
        const warmupProgress = Math.min(
          1,
          (this.iter - this.focus.fromIter) / this.focusWarmupIter,
        )
        const curPull = this.focusPullCoef * Math.pow(warmupProgress, 3)

        for (let j = 0; j < 2; j++) {
          gsum[j] += (Y[i][j] - this.focus.center[j]) * this.focus.weights[i] * curPull
        }
      }

      grad.push(gsum)
    }

    return { cost: cost, grad: grad }
  }
}
