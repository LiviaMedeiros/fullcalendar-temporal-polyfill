import { PlainMonthDay } from '../public/plainMonthDay'
import { CompareResult, DateISOFields, MonthDayLikeFields } from '../public/types'
import { compareValues } from '../utils/math'
import { DateEssentials } from './date'

export type MonthDayFields = {
  year: number
  month: number
  monthCode: string
  day: number
}

export type MonthDayEssentials = {
  monthCode: string
  day: number
}

export const monthDayFieldMap = {
  year: Number,
  month: Number,
  monthCode: String,
  day: Number,
}

export function createMonthDay(isoFields: DateISOFields): PlainMonthDay {
  return new PlainMonthDay(
    isoFields.isoMonth,
    isoFields.isoDay,
    isoFields.calendar,
    isoFields.isoYear,
  )
}

export function overrideMonthDayFields(
  overrides: Partial<MonthDayFields>,
  base: MonthDayEssentials, // PlainMonthDay,
): MonthDayLikeFields {
  const merged = { day: overrides.day ?? base.day } as MonthDayFields

  if (overrides.monthCode !== undefined) {
    merged.monthCode = overrides.monthCode

    if (overrides.month !== undefined) {
      merged.month = overrides.month
    }

    // TODO: try to preserve reference year?
    // merged.year = overrides.year ?? base.getISOFields().isoYear

  } else if (overrides.month !== undefined) {
    merged.month = overrides.month

    // if not defined, will throw error in Calendar::monthDayFromFields
    merged.year = overrides.year!

  } else {
    merged.monthCode = base.monthCode
  }

  return merged
}

export function monthDaysEqual(a: PlainMonthDay, b: PlainMonthDay): boolean {
  return a.monthCode === b.monthCode &&
    a.day === b.day &&
    a.calendar.id === b.calendar.id
}

// unlike other utils, operated with *DateEssentials* fields
export function compareMonthDayFields(d0: DateEssentials, d1: DateEssentials): CompareResult {
  return compareValues(d0.month, d1.month) ||
    compareValues(d0.day, d1.day)
}
