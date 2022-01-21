
const groupBySortBy = (list, groupBy, sortBy) => {
  let grouped = {}
  if (!list || !groupBy) {
    throw `Parameter null or undefined:  ${list}, ${groupBy}, ${sortBy}`
  }

  list.forEach(item => {
    let key = item[groupBy]
    if (!key || key.length === 0) {
      throw 'Key is empty'
    }
    if (grouped[key]) {
      grouped[key].push(item)
    } else {
      grouped[key] = [item]
    }
  })

  // Sort each list by sortBy 
  if (sortBy && sortBy.length > 0) {
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => {
        // return a[sortBy] >= b[sortBy] ? -1 : 1
        return naturalSort(a[sortBy], b[sortBy])
      })
    })
  }
  return grouped
}

// Given a list of objects, this creates an object with the keys provided in 
// groupKeys where the value is a list of objects from the list 
const groupByKeys = (list, groupKeys) => {
  let grouped = {}
  if (!groupKeys || !list) {
    throw "List is null or undefined"
  }
  if (groupKeys.length == 0) {
    return grouped
  }

  try {
    list.forEach(item => {
      let key = groupKeys.map(gkey => item[gkey]).join('')
      if (key.length === 0) {
        throw 'Key is empty'
      }
      if (grouped[key]) {
        grouped[key].push(item)
      } else {
        grouped[key] = [item]
      }
    })
  } catch {
    console.error(`List: ${list} - Keys: ${groupKeys.toString()}`)
    console.log(list)
    throw "groupByKeys::Failed to create entry in object"
  }
  return grouped
}

// Formats a number accorind to precision as a string with commas
const formatFloat = (num, precision = 2) => {
  if (num === null || num === undefined) {
    console.warn("Null or undefined received.")
    return new Intl.NumberFormat().format(parseFloat('0').toFixed(precision))
  }
  if (precision < 0 || precision > 4) {
    precision = 2
  }
  num = typeof (num) === typeof ('') ? parseFloat(num.replaceAll(',', '')) : num
  return new Intl.NumberFormat().format(num.toFixed(precision))
}

const naturalCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base'
});

const naturalSort = (a, b) => {
  return naturalCollator.compare(a, b)
}

export { groupBySortBy, groupByKeys, formatFloat, naturalSort }