import { Duration } from 'temporal-polyfill'

// Unfortunately neccesary as typescript does not include typings for ecma drafts
// TODO: Remove when ListFormat becomes part of the official spec
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Intl {
    interface ListFormatOptions {
      localeMatcher?: 'best fit' | 'lookup'
      type?: 'conjunction' | 'disjunction' | 'unit'
      style?: 'long' | 'short' | 'narrow'
    }

    interface ListFormatPart<T = string> {
      type: 'literal' | 'element'
      value: T
    }

    class ListFormat {
      constructor(locales?: string | string[], options?: Intl.ListFormatOptions)
      public formatToParts: (elements: string[]) => Intl.ListFormatPart[]
      public format: (items: [string?]) => string
    }
  }
}

const largestCommonString = (a: string, b: string): string => {
  const [short, long] = a.length < b.length ? [a, b] : [b, a]

  // Iterates from full short string by removing last character each iteration
  for (let i = short.length; i >= 0; i--) {
    const sub = short.substring(0, i)

    // If condition holds, its isn't possible for there to be a larger string in the loop
    if (long.includes(sub)) {
      return sub
    }
  }

  return ''
}

type DurationFormatOptions = { style: 'long' | 'short' | 'narrow' }

type DurationLike = Partial<Duration>

const getLiteralPartsValue = (
  arr: Array<Intl.RelativeTimeFormatPart>,
  index: number
): string => {
  return arr[index].type === 'literal' ? arr[index].value : ''
}

const combinePartsArrays = (
  arr: Array<Array<Intl.RelativeTimeFormatPart>>,
  listFormatter: Intl.ListFormat
): Array<Intl.RelativeTimeFormatPart> => {
  let partsArr: Array<Intl.RelativeTimeFormatPart> = []

  // Used to make ListFormat easier to work with
  let combinedArr: Array<string> = []

  // Flatten 2D array into 1D
  arr.forEach((innerArr) => {
    const [before, value, after] = innerArr
    partsArr = [...partsArr, before, value, after]
    combinedArr = [
      ...combinedArr,
      `${before.value}${value.value}${after.value}`,
    ]
  })

  // Append literal seperators into before part of the next element using ListFormat
  let arrCounter = 0
  listFormatter.formatToParts(combinedArr).forEach(({ type, value }) => {
    // Increment which unit to look at every time we encounter an element
    if (type === 'element') {
      arrCounter++
      return
    } else {
      // the '*3' is to account for each unit being three elements(before/value/after)
      const temp = partsArr[arrCounter * 3]
      partsArr[arrCounter * 3] = { ...temp, value: `${value}${temp.value}` }
    }
  })

  return partsArr
}

export class DurationFormat {
  private timeFormatter: Intl.RelativeTimeFormat
  private listFormatter: Intl.ListFormat

  constructor(
    readonly locale: string = 'en-us',
    { style }: DurationFormatOptions = { style: 'long' }
  ) {
    this.timeFormatter = new Intl.RelativeTimeFormat(locale, {
      numeric: 'always',
      style,
    })

    this.listFormatter = new Intl.ListFormat(locale, {
      style,
      type: style !== 'long' ? 'unit' : 'conjunction',
    })
  }

  formatToParts(
    durationLike: Duration | DurationLike
  ): Array<Intl.RelativeTimeFormatPart> {
    const duration =
      durationLike instanceof Duration
        ? durationLike
        : Duration.from(durationLike)

    // Storage array
    const arr: Array<Array<Intl.RelativeTimeFormatPart>> = []

    for (const key in duration) {
      const val = duration[key]

      if (val !== 0 && key !== 'milliseconds') {
        const forwardParts = this.timeFormatter.formatToParts(
          val,
          key as Intl.RelativeTimeFormatUnit
        )
        const backwardParts = this.timeFormatter.formatToParts(
          -val,
          key as Intl.RelativeTimeFormatUnit
        )

        // Extract largest common string from formatted parts
        const before = largestCommonString(
          getLiteralPartsValue(forwardParts, 0),
          getLiteralPartsValue(backwardParts, 0)
        )
        const after = largestCommonString(
          getLiteralPartsValue(forwardParts, forwardParts.length - 1),
          getLiteralPartsValue(backwardParts, backwardParts.length - 1)
        )

        arr.push([
          // Append pretext into accumulator
          {
            type: 'literal',
            value: before,
          },
          // Append actual value into accumulator
          forwardParts[forwardParts[0].type === 'literal' ? 1 : 0],
          // Append posttext into accumulator
          { type: 'literal', value: after },
        ])
      }
    }

    // Flatten 2D array into 1D
    const flatArr = combinePartsArrays(arr, this.listFormatter)

    // Remove empty items
    return flatArr.filter(({ type, value }) => {
      return type !== 'literal' || value !== ''
    })
  }

  format(durationLike: Duration | DurationLike): string {
    const parts = this.formatToParts(durationLike)
    return parts
      .map((val) => {
        return val.value
      })
      .join('')
  }
}
