export default {
  addCommas: (x) => {
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
  },
}


export const groupBySortBy = (list, groupBy, sortBy) => {
  let grouped = {}
  list.forEach(item => {
    let key = `${item[groupBy]}`
    if (grouped[key]) {
      grouped[key].push(item)
    } else {
      grouped[key] = [item]
    }
  })

  // Sort each list by sortBy 
  Object.keys(grouped).forEach(key => {
    grouped[key].sort((a, b) => {
      return a[sortBy] > b[sortBy] ? 1 : -1
    })
  })
  return grouped
}