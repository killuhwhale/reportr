import { toFloat } from "./convertCalc"

const groupBySortBy = (list, groupBy, sortBy) => {
  let grouped = {}
  if (!list || !groupBy) {
    // eslint-disable-next-line 
    throw `Parameter null or undefined:  ${list}, ${groupBy}, ${sortBy}`
  }
  if (!(list instanceof Array)) {
    console.log('List is not a list: ', list)
    return grouped
  }
  list.forEach(item => {
    let key = item[groupBy]
    if (!key || key.length === 0) {
      // eslint-disable-next-line 
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
    // eslint-disable-next-line 
    throw "List is null or undefined"
  }
  if (!(list instanceof Array)) {
    console.log('List is not a list: ', list)
    return grouped
  }
  if (groupKeys.length === 0) {
    return grouped
  }

  try {
    list.forEach(item => {
      let key = groupKeys.map(gkey => item[gkey]).join('')
      if (key.length === 0) {
        // eslint-disable-next-line 
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
    // eslint-disable-next-line 
    throw "groupByKeys::Failed to create entry in object"
  }
  return grouped
}

const nestedGroupBy = (list, groupByKeys) => {
  let grouped = {}
  if (!list || !groupByKeys) {
    // eslint-disable-next-line 
    throw `Parameter null or undefined:  ${list}, ${groupByKeys}`
  }

  if (!(list instanceof Array)) {
    console.log('List is not a list: ', list)
    return grouped
  }

  list.forEach(item => {
    let key = item[groupByKeys[0]]
    let nestedKey = item[groupByKeys[1]]
    if (!key || key.length === 0) {
      // eslint-disable-next-line 
      throw 'Key is empty'
    }

    if (grouped[key] && grouped[key][nestedKey]) {
      grouped[key][nestedKey].push(item)

    } else if (grouped[key]) {
      grouped[key][nestedKey] = [item]
    }
    else {
      grouped[key] = {}
      grouped[key][nestedKey] = [item]
    }
  })
  return grouped
}

const percentageAsMGKG = (num) => {
  // Used for harvest and manures as their concentrations are percentages of mg/ kg
  num = toFloat(num)
  return formatFloat(num * 1e4)
}

// Formats a number accorind to precision as a string with commas
const formatFloat = (num, precision = 2) => {
  if (num === null || num === undefined) {
    console.warn("Null or undefined received.")
    return 0.00
  }
  if (precision < 0 || precision > 4) {
    precision = 2
  }

  num = typeof (num) === typeof ('') ? parseFloat(num.replaceAll(',', '')) : num
  return num.toLocaleString("en-US", { maximumFractionDigits: precision, minimumFractionDigits: precision });
}

const formatInt = (num) => {
  if (num === null || num === undefined) {
    console.warn("Null or undefined received.")
    return 0
  }
  num = typeof (num) === typeof ('') ? parseInt(num.replaceAll(',', '')) : parseInt(num)
  return new Intl.NumberFormat().format(num)
}

const naturalCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base'
})

const splitDate = (date) => {
  if (date === undefined) return ''
  try {
    const ans = date.split('T')[0]
    if (ans)
      return ans
  } catch (e) {
    console.log("Failed to split date: ", e)
  }
  return ''
}

const formatDate = (date) => {
  const _date = new Date(`${date}T00:00`)
  const day = _date.getDate()
  const month = _date.getMonth()
  const year = _date.getFullYear()
  return `${month + 1}/${day}/${year}`
}

const naturalSort = (a, b) => {
  return naturalCollator.compare(a, b)
}

const naturalSortBy = (a, b, s) => {
  return naturalSort(a[s], b[s])
}

const naturalSortByKeys = (a, b, keys) => {
  let keyA = ''
  let keyB = ''
  keys.forEach(key => {
    keyA += a[key]
    keyB += b[key]
  })
  return naturalSort(keyA, keyB)
}

const sortByKeys = (a, b, keys) => {
  let keyA = ''
  let keyB = ''
  keys.forEach(key => {
    keyA += a[key]
    keyB += b[key]
  })
  return naturalSort(keyA, keyB)
}


export {
  naturalSortByKeys, sortByKeys, nestedGroupBy, groupBySortBy, groupByKeys,
  formatFloat, formatInt, naturalSort, naturalSortBy, formatDate, splitDate, percentageAsMGKG
}