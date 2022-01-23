
import { jest } from '@jest/globals';

const { round, formatFloat, groupByKeys, groupBySortBy } = require('../../utils/format')

test('Format string or number to string w/ commas', () => {
    expect(formatFloat("123,000", 2)).toEqual("123,000.00")
    expect(formatFloat(123000, 1)).toEqual("123,000.0")
    expect(formatFloat("123,000", 0)).toEqual("123,000")
    expect(formatFloat("123,000", -1)).toEqual("123,000.00")
    expect(formatFloat("123000.0123", 2)).toEqual("123,000.01")
    expect(formatFloat("123000.0123", 1)).toEqual("123,000.0")
    expect(formatFloat("123000.123", 1)).toEqual("123,000.1")
    expect(formatFloat(123000.123, 1)).toEqual("123,000.1")
})

test('Group obejcts by keys', () => {
    const items = [
        {
            title: 'Test 1',
            field_id: 1,
            crop_id: 1,
            date: 0
        },
        {
            title: 'Test 2',
            field_id: 1,
            crop_id: 2,
            date: 1
        },
        {
            title: 'Test 3',
            field_id: 1,
            crop_id: 3,
            date: 2
        },
        {
            title: 'Test 4',
            field_id: 2,
            crop_id: 1,
            date: 0
        },
        {
            title: 'Test 5',
            field_id: 2,
            crop_id: 2,
            date: 1
        },
    ]

    expect(groupByKeys(items, ['field_id']))
        .toEqual({
            "1": [
                {
                    title: 'Test 1',
                    field_id: 1,
                    crop_id: 1,
                    date: 0
                },
                {
                    title: 'Test 2',
                    field_id: 1,
                    crop_id: 2,
                    date: 1
                },
                {
                    title: 'Test 3',
                    field_id: 1,
                    crop_id: 3,
                    date: 2
                }
            ],
            "2": [
                {
                    title: 'Test 4',
                    field_id: 2,
                    crop_id: 1,
                    date: 0
                },
                {
                    title: 'Test 5',
                    field_id: 2,
                    crop_id: 2,
                    date: 1
                },
            ]
        })


    expect(groupByKeys(items, ['crop_id', "date"]))
        .toEqual({
            "10": [
                {
                    title: 'Test 1',
                    field_id: 1,
                    crop_id: 1,
                    date: 0
                },
                {
                    title: 'Test 4',
                    field_id: 2,
                    crop_id: 1,
                    date: 0
                },

            ],
            '21': [
                {
                    title: 'Test 2',
                    field_id: 1,
                    crop_id: 2,
                    date: 1
                },
                {
                    title: 'Test 5',
                    field_id: 2,
                    crop_id: 2,
                    date: 1
                },
            ],
            '32': [
                {
                    title: 'Test 3',
                    field_id: 1,
                    crop_id: 3,
                    date: 2
                }
            ]
        })

    expect(groupByKeys(items, []))
        .toEqual({})

    expect(() => groupByKeys(items, null))
        .toThrow()
    expect(() => groupByKeys(items, undefined))
        .toThrow()
    expect(() => groupByKeys(items, ['']))
        .toThrow()
})

test('Group objects by a key and sort by key', () => {
    const items = [
        {
            title: 'Test 1',
            field_id: 1,
            crop_id: 1,
            date: 0
        },
        {
            title: 'Test 2',
            field_id: 1,
            crop_id: 2,
            date: 1
        },
        {
            title: 'Test 3',
            field_id: 1,
            crop_id: 3,
            date: 2
        },
        {
            title: 'Test 4',
            field_id: 2,
            crop_id: 1,
            date: 0
        },
        {
            title: 'Test 5',
            field_id: 2,
            crop_id: 2,
            date: 1
        },
    ]

    expect(groupBySortBy(items, 'crop_id', 'date'))
        .toEqual({
            '1': [
                {
                    title: 'Test 1',
                    field_id: 1,
                    crop_id: 1,
                    date: 0
                },
                {
                    title: 'Test 4',
                    field_id: 2,
                    crop_id: 1,
                    date: 0
                },
            ],
            '2': [
                {
                    title: 'Test 2',
                    field_id: 1,
                    crop_id: 2,
                    date: 1
                },
                {
                    title: 'Test 5',
                    field_id: 2,
                    crop_id: 2,
                    date: 1
                },
            ],
            '3': [
                {
                    title: 'Test 3',
                    field_id: 1,
                    crop_id: 3,
                    date: 2
                },
            ],
        })
    expect(() => groupBySortBy(items, '', 'date'))
        .toThrow()
    expect(() => groupBySortBy(null, 'date', 'date'))
        .toThrow()
    expect(() => groupBySortBy(undefined, 'date', 'date'))
        .toThrow()
    expect(() => groupBySortBy(items, '1337', 'date'))
        .toThrow()
})
