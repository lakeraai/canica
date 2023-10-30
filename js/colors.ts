// Partially based on the Plotly color section:
// https://github.com/plotly/plotly.py/blob/master/packages/python/plotly/_plotly_utils/colors/__init__.py

// -----
// Colormaps and Colorscales:
// A colormap or a colorscale is a correspondence from values to colors.

// There are typically two main types of colormaps that exist: numerical and
// categorical colormaps.

// Numerical:
// ----------
// Numerical colormaps are used when the coloring column being used takes a
// spectrum of values or numbers.

// A classic example from the Plotly library:
// ```
// rainbow_colorscale =  [
//     [0, 'rgb(150,0,90)'], [0.125, 'rgb(0,0,200)'],
//     [0.25, 'rgb(0,25,255)'], [0.375, 'rgb(0,152,255)'],
//     [0.5, 'rgb(44,255,150)'], [0.625, 'rgb(151,255,0)'],
//     [0.75, 'rgb(255,234,0)'], [0.875, 'rgb(255,111,0)'],
//     [1, 'rgb(255,0,0)']
// ]
// ```

// Notice that this colorscale is a list of lists with each inner list containing
// a number and a color. These left hand numbers in the nested lists go from 0 to
// 1, and they are like pointers tell you when a number is mapped to a specific
// color.

// If you have a column of numbers `col_num` that you want to plot, and you know

// ```
// min(col_num) = 0
// max(col_num) = 100
// ```

// then if you pull out the number `12.5` in the list and want to figure out what
// color the corresponding chart element (bar, scatter plot, etc) is going to be,
// you'll figure out that proportionally 12.5 to 100 is the same as 0.125 to 1.
// So, the point will be mapped to 'rgb(0,0,200)'.

// All other colors between the pinned values in a colorscale are linearly
// interpolated.

// Categorical:
// ------------
// Alternatively, a categorical colormap is used to assign a specific value in a
// color column to a specific color everytime it appears in the dataset.

// A column of strings in a panadas.dataframe that is chosen to serve as the
// color index would naturally use a categorical colormap. However, you can
// choose to use a categorical colormap with a column of numbers.

export class Color {
  r: number = 0
  g: number = 0
  b: number = 0

  constructor(num1: number, g?: number, b?: number) {
    // num1 can either be a hex number or the red value of an RGB color
    if (g === undefined || b === undefined) {
      // num1 is a hex number
      this.fromHex(num1)
    } else {
      // num1 is the red value of an RGB color
      this.fromRGB(num1, g, b)
    }
  }

  fromRGB(r: number, g: number, b: number) {
    this.r = r
    this.g = g
    this.b = b
  }

  fromHex(hex: number) {
    this.r = (hex >> 16) & 0xff
    this.g = (hex >> 8) & 0xff
    this.b = hex & 0xff
  }

  toHex(): number {
    return (this.r << 16) + (this.g << 8) + this.b
  }
}

type ColorScale = [number, Color][]

// This is a map of numerical colormaps
const COLOR_SCALES: { [key: string]: ColorScale } = {
  Viridis: [
    [0, new Color(0x440154)],
    [0.06274509803921569, new Color(0x48186a)],
    [0.12549019607843137, new Color(0x472d7b)],
    [0.18823529411764706, new Color(0x424086)],
    [0.25098039215686274, new Color(0x3b528b)],
    [0.3137254901960784, new Color(0x33638d)],
    [0.3764705882352941, new Color(0x2c728e)],
    [0.4392156862745098, new Color(0x26828e)],
    [0.5019607843137255, new Color(0x21918c)],
    [0.5647058823529412, new Color(0x1fa088)],
    [0.6274509803921569, new Color(0x28ae80)],
    [0.6901960784313725, new Color(0x3fbc73)],
    [0.7529411764705882, new Color(0x5ec962)],
    [0.8156862745098039, new Color(0x84d44b)],
    [0.8784313725490196, new Color(0xaddc30)],
    [0.9411764705882353, new Color(0xd8e219)],
    [1, new Color(0xfde725)],
  ],
}

// This is a list of categorical colormaps
const CATEGORICAL_MAPS = {
  D3: [
    new Color(0x1f77b4),
    new Color(0xff7f0e),
    new Color(0x2ca02c),
    new Color(0xd62728),
    new Color(0x9467bd),
    new Color(0x8c564b),
    new Color(0xe377c2),
    new Color(0x7f7f7f),
    new Color(0xbcbd22),
    new Color(0x17becf),
  ],
}

// Returns the index of the rightmost element in the array that is less than val
const leftBisect = (arr: number[], val: number): number => {
  let right: number = 0
  while (arr[right] < val) {
    right += 1
  }
  return right - 1
}

// Determines the color of a numerical value given a color scale
const interpolate = (cscale: ColorScale, val: number): Color => {
  if (val > 1 || val < 0) {
    throw new Error("Value must be between 0 and 1")
  }

  // Edge cases
  if (val === 0) {
    return cscale[0][1]
  } else if (val === 1) {
    return cscale[cscale.length - 1][1]
  }

  // Find the two colors that the value is between
  const left = leftBisect(
    cscale.map((x) => x[0]),
    val,
  )
  const right = left + 1
  const [leftVal, leftColor] = cscale[left]
  const [rightVal, rightColor] = cscale[right]

  // Find interpolation fraction between the two _intensities_
  const fraction = (val - leftVal) / (rightVal - leftVal)

  // Interpolate between the two colors
  const r = Math.round(leftColor.r + (rightColor.r - leftColor.r) * fraction)
  const g = Math.round(leftColor.g + (rightColor.g - leftColor.g) * fraction)
  const b = Math.round(leftColor.b + (rightColor.b - leftColor.b) * fraction)
  return new Color(r, g, b)
}

// Heuristic to determine whether we should use a continuous or categorical colormap
// Dumb approach: if the variable is not numerical, use a categorical colouring
const useCategorical = (variable: number[] | string[] | undefined[]): boolean => {
  // Check that all values of the array are of the same type
  const firstType = typeof variable[0]
  if (!variable.every((value) => typeof value === firstType)) {
    throw new Error("Hue variable must contain values of the same type")
  }

  // Special case: if all values are the same, use a categorical colormap
  if (variable.every((value) => value === variable[0])) {
    return true
  }

  // Expected types are number, string and undefined
  if (firstType === "number") {
    return false
  } else if (firstType === "string" || firstType === "undefined") {
    return true
  } else {
    throw new Error("Number or string array expected for hue variable")
  }
}

const assignColorNumerical = (variable: number[]): Color[] => {
  const min = Math.min(...variable)
  const max = Math.max(...variable)
  const cmap = COLOR_SCALES.Viridis
  return variable.map((value) => {
    // Rescale so all values are between 0 and 1
    const scaled_value = (value - min) / (max - min + 1e-9)
    // Get the color
    return interpolate(cmap, scaled_value)
  })
}

const assignColorCategorical = (variable: any[]): Color[] => {
  // Get unique values
  const uniqueValues = [...new Set(variable)]
  const cmap = CATEGORICAL_MAPS.D3
  if (uniqueValues.length > cmap.length) {
    throw new Error("Too many unique values for categorical colormap")
  }

  const valueToColor: { [key: string]: Color } = {}
  uniqueValues.forEach((value, index) => {
    valueToColor[value] = cmap[index]
  })
  return variable.map((value) => valueToColor[value])
}

export const getColors = (variable: any[]): Color[] => {
  if (useCategorical(variable)) {
    return assignColorCategorical(variable)
  }
  return assignColorNumerical(variable)
}
