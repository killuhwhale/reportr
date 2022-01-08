
import { jest } from '@jest/globals';


import { toFloat, zeroTimeDate, daysBetween, MG_KG, KG_MG } from "../../utils/convertCalc"



test('Format a number to a float', () => {
    expect(toFloat("123,000"))
        .toEqual(123000)
    expect(toFloat("123,000.00"))
        .toEqual(123000)
    expect(toFloat("123,000.01"))
        .toEqual(123000.01)
    expect(toFloat(".001"))
        .toEqual(.001)
    expect(toFloat("1,234.001"))
        .toEqual(1234.001)
    expect(toFloat(".001ASD"))
        .toEqual(.001)
    expect(toFloat(null))
        .toEqual(0)
    expect(toFloat(undefined))
        .toEqual(0)
    expect(() => toFloat('asd.001'))
        .toThrow()
})


test("Create a date with time at 00:00:00", () => {
    // Thu Dec 30 2021 23:47:35 GMT-0800 (Pacific Standard Time) 
    const ts = 1640936855439
    const date = new Date(ts)
    expect(zeroTimeDate(date))
        .toEqual(new Date('12/30/2021'))

    expect(() => zeroTimeDate(null))
        .toThrow()
    expect(() => zeroTimeDate(undefined))
        .toThrow()
})


test('Days between two dates', () => {
    const a = new Date('12/25/2021')
    const b = new Date('12/30/2021')

    expect(daysBetween(a, b))
        .toEqual(5)

    expect(daysBetween(b, a))
        .toEqual(5)

    expect(() => daysBetween(null, b))
        .toThrow()
    expect(() => daysBetween(a, null))
        .toThrow()

})