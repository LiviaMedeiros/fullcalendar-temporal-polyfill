import { numSign } from '../utils/math'
import { padZeros } from '../utils/string'
import { eraOrigins } from './eraOrigins'

export interface CalendarImplFields { // like DateFields, but without monthCode
  era: string | undefined,
  eraYear: number | undefined,
  year: number,
  month: number,
  day: number
}

export abstract class CalendarImpl {
  constructor(
    public id: string,
  ) {}

  // ISO -> Calendar-dependent

  abstract computeFields(epochMilli: number): CalendarImplFields

  // Calendar-dependent computation
  // caller is responsible for constraining given values

  abstract epochMilliseconds(year: number, month: number, day: number): number
  abstract daysInMonth(year: number, month: number): number
  abstract monthsInYear(year: number): number
  abstract inLeapYear(year: number): boolean
  abstract guessYearForMonthDay(monthCode: string, day: number): number
  abstract normalizeISOYearForMonthDay(isoYear: number): number

  // month -> monthCode
  monthCode(month: number, _year: number): string {
    return 'M' + padZeros(month, 2)
  }

  // monthCode -> month
  // not responsible for constraining
  convertMonthCode(monthCode: string, _year: number): number {
    return parseInt(monthCode.substr(1)) // chop off 'M'
  }
}

// eraYear -> year
export function convertEraYear(
  calendarID: string,
  eraYear: number,
  era: string,
  fromDateTimeFormat?: boolean,
): number {
  const idBase = calendarID.split('-')[0]
  let origin = eraOrigins[idBase]?.[era]

  if (origin === undefined) {
    if (fromDateTimeFormat) {
      origin = 0
    } else {
      throw new Error('Unkown era ' + era)
    }
  }

  // see the origin format in the config file
  return (origin + eraYear) * (numSign(origin) || 1)
}

// TODO: somehow combine with convertEraYear
export function hasEras(calendarID: string): boolean {
  const idBase = calendarID.split('-')[0]
  return eraOrigins[idBase] !== undefined
}
