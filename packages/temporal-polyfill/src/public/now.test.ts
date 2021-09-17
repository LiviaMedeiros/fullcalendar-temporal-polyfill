import { advanceTo } from 'jest-date-mock'
import { Now } from './now'
import { PlainDateTime } from './plainDateTime'

test('can get epoch ms', () => {
  advanceTo(0)
  expect(Now.instant().epochMilliseconds).toBe(0)
})

test('can make PlainDateTime', () => {
  advanceTo(0)
  expect(Now.plainDateTimeISO()).toEqual(new PlainDateTime(1970, 1, 1))
})