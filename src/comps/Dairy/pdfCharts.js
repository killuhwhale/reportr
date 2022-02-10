import Chart from 'chart.js/auto';
import pdfMake from "pdfmake/build/pdfmake"
import dd from "./pdf"
import pdfFonts from "pdfmake/build/vfs_fonts"
import { getAnnualReportData } from "./pdfDB"

import { formatInt } from "../../utils/format"
import { toFloat } from "../../utils/convertCalc"

export default function mTea() { }



pdfMake.vfs = pdfFonts.pdfMake.vfs
const HORIBAR_WIDTH = '600px'
const HORIBAR_HEIGHT = '300px'
const BAR_WIDTH = '500px'
const BAR_HEIGHT = '333px'
const CHART_BACKGROUND_COLOR = "#f7f7f7"
const RADIUS = 40
const PAD = 10

Chart.register({
  id: 'testyplugzzz',
  afterDraw: (chartInstance) => {
    var ctx = chartInstance.ctx;
    // render the value of the chart above the bar
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';

    chartInstance.data.datasets.forEach((dataset, di) => {
      for (var i = 0; i < dataset.data.length; i++) {
        // rewrite text if it is too close to edge for hoizontal bar chart
        if (isNaN(dataset.data[i])) {
          console.log("Error num?", dataset.data[i])
          console.log(dataset.data)
          return
        }
        let bar = chartInstance._metasets[di].data[i]
        let maxX = chartInstance.scales.x.maxWidth
        // let maxY = chartInstance.scales.y.maxHeight
        let numChars = dataset.data[i].toString().length
        let singleCharLen = 4
        var xOffset = (500 - bar.x) / 500 < 0.03 ? ((numChars * -singleCharLen) - 10) : 0;

        let num = formatInt(Math.round(toFloat(dataset.data[i])))

        // Format number, All should be rounded integers, if over 1000, show 412,000 as  412K

        // num = num && num >= 1e4 ? `${formatInt(num / 1000)}K` : formatInt(num)

        if (chartInstance.scales.x.type === "logarithmic") {
          ctx.fillText(num, bar.x + xOffset + 10, bar.y);
        } else {
          // Vertical bars, when the numbers are too big, they overlap,
          ctx.fillText(num, bar.x, bar.y);
        }
      }
    });
  }
})


const barChartConfig = (labels, data) => {
  return {
    type: 'bar',

    data: {
      labels: labels, // [x, y, z]
      datasets: [{
        label: "Applied",
        minBarLength: 1,
        backgroundColor: ['#ff3b4d'],
        data: data[0]
      },
      {
        label: "Anticipated",
        minBarLength: 1,
        backgroundColor: ['#76ff0e'],
        data: data[1]
      },
      {
        label: "Harvest",
        minBarLength: 1,
        backgroundColor: ['#2363f5'],
        data: data[2]
      }
      ]
    },
    options: {
      showDatapoints: true,
      plugins: {
        title: {
          display: true,
          text: 'Nutrient Budget',
          font: {
            size: 20,
          },
          // PADding: {
          //   top: 10,
          //   bottom: 30
          // }
        },
        subtitle: {
          display: true,
          text: 'lbs/ acre',
          font: {
            size: 16,
          },
          // PADding: {
          //   top: 10,
          //   bottom: 30
          // }
        },
        tooltip: {
          enabled: true
        },
      },
      scales: {
        y: {
          type: 'logarithmic',
          color: "#0f0",
          position: 'left', // `axis` is determined by the position as `'y'`
          title: {
            text: "lbs / acre",
            display: true,
            font: {
              size: 18
            }

          },
          x: {
            ticks: {
              display: true,
              fontSize: 50,
            },
            // position: 'left', // `axis` is determined by the position as `'y'`

          },
          // ticks: {
          //   // Include a dollar sign in the ticks
          //   callback: function (value, index, values) {
          //     return `${value} lbs/ton`
          //   }
          // }
        }
      },
    },
    plugins: [
      {
        id: 'custom_canvas_background_color',
        beforeDraw: (chart) => {
          const ctx = chart.canvas.getContext('2d');
          ctx.save();
          ctx.globalCompositeOperation = 'destination-over';
          ctx.fillStyle = CHART_BACKGROUND_COLOR;

          // Top line and top right corner
          ctx.lineTo(PAD, 0, chart.width - PAD, 0)
          ctx.arcTo(chart.width, 0, chart.width, PAD, RADIUS)

          // Right wall and bottom right corner
          ctx.lineTo(chart.width, PAD, chart.width, chart.height - PAD)
          ctx.arcTo(chart.width, chart.height, chart.width - PAD, chart.height, RADIUS)

          // Bottom line and bottom left corner
          ctx.lineTo(chart.width - PAD, chart.height, PAD, chart.height) // right wall
          ctx.arcTo(0, chart.height, 0, chart.height - PAD, RADIUS)

          // Left wall and top left corner
          ctx.lineTo(0, chart.height - PAD, 0, PAD) // right wall
          ctx.arcTo(0, 0, PAD, 0, RADIUS)

          // Close the rectangle....
          ctx.lineTo(PAD, 0, PAD + 2, 0)

          ctx.fill()
          ctx.restore();
        }
      }
    ]
  }
}


// Annual Report Section 
const createCharts = (props, area) => {
  let nutrientLabels = ["N", "P", "K", "Salt"]
  let nutrientBudgetB = props[0]
  let summary = props[1]

  // Extract data for chart
  let nutrientData = Object.keys(nutrientBudgetB).map(key => {
    const ev = nutrientBudgetB[key]
    return { key: key, data: [ev.total_app, ev.anti_harvests, ev.actual_harvests] }
  })

  let totalNutrientAppAntiHarvestData = [summary.total_app, summary.anti_harvests, summary.actual_harvests]
  // console.log("Creating Overall Summary Chart:", totalNutrientAppAntiHarvestData, summary)
  let materialLabels = [
    'Existing soil nutrient content',
    'Plowdown credit',
    'Commercial fertilizer / Other',
    'Dry Manure',
    'Process wastewater',
    'Fresh water',
    'Atmospheric deposition',
  ]
  //              n,p,k,salt from each source plus the label
  let materialData = [0, 0, 0, 0].map((_, i) => {
    return [
      summary.soils[i], // Existing soil content
      summary.plows[i], // Plowdown credit
      summary.fertilizers[i],
      summary.manures[i],
      summary.wastewaters[i],
      summary.freshwaters[i],
      i === 0 ? summary.atmospheric_depo : 0, // Atmoshperic depo is only for nitrogen.
      i === 0 ? 'Nitrogen' : i === 1 ? 'Phosphorus' : i === 2 ? 'Potassium' : 'Salt'
    ]
  })

  return new Promise((resolve, rej) => {
    let nutrientPromises = []
    let totalNutrientAppAntiHarvestDataPromise = []
    let materialPromises = []

    try {
      // B. Nutirent Budget Harvest Data
      nutrientPromises = nutrientData.map((row, i) => {
        return createBarChartImage(row.key, nutrientLabels, row.data, area)
      })

      // Two Single Summary Charts
      totalNutrientAppAntiHarvestDataPromise = createBarChartImage(
        'totalNutrientAppAntiHarvestData',
        nutrientLabels,
        totalNutrientAppAntiHarvestData,
        area
      )

      materialPromises = materialData.map((row, i) => {
        let key = row && row.length === 8 ? row[row.length - 1] : ''
        return createHoriBarChartImage(key, materialLabels, row.slice(0, -1), row.slice(-1), area)
      })

    } catch (e) {
      console.log(e)
      rej(e)
    }

    Promise.all([...nutrientPromises, totalNutrientAppAntiHarvestDataPromise, ...materialPromises])
      .then((res) => {
        resolve(Object.fromEntries(res))
      })
      .catch(err => {
        console.log(err)
        rej(err)
      })

  })

}

const createHoriBarChartImage = (key, labels, data, title, area) => {
  let canvas = document.createElement('canvas')
  canvas.style.width = HORIBAR_WIDTH
  canvas.style.height = HORIBAR_HEIGHT
  area.appendChild(canvas)
  return new Promise((res, rej) => {
    if (key.length <= 0) {
      rej('Error: invalid key for horizontal bar chart. Data:', data)
      return
    }
    let chart = null
    chart = new Chart(canvas, {
      type: 'bar',

      data: {
        labels: labels, // [x, y, z]
        datasets: [{
          label: title,
          minBarLength: 1,
          backgroundColor: ['#bb9e63', "#ff69ff", "#82d7d7", "#f2f25c", "#8787ff", "#0fa", "#f00"],
          data: data
        }
        ]
      },
      options: {
        showDatapoints: true,
        indexAxis: 'y',
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: title,
            font: {
              size: 20,
            },
            // PADding: {
            //   top: 10,
            //   bottom: 30
            // }
          },
          subtitle: {
            display: true,
            text: `lbs of ${title} applied`,
            font: {
              size: 16,
            },
            // PADding: {
            //   top: 10,
            //   bottom: 30
            // }
          },
          tooltip: {
            enabled: false
          },
        },

        scales: {
          x: {
            type: 'logarithmic',
            color: "#0f0",
            // position: 'left', // `axis` is determined by the position as `'y'`
            title: {
              text: "lbs",
              display: true,
              font: {
                size: 14
              }
            },
            // ticks: {
            //   // Include a dollar sign in the ticks
            //   callback: function (value, index, values) {
            //     return `${value} lbs/ton`
            //   }
            // }
          }
        },
        animation: {
          onComplete: () => {
            const img = chart.toBase64Image('image/png', 1)
            area.removeChild(canvas)
            res([
              key, img
            ])
          }
        },
      },
      plugins: [
        {
          id: 'custom_canvas_background_color',
          beforeDraw: (chart) => {
            const ctx = chart.canvas.getContext('2d');
            ctx.save();
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = CHART_BACKGROUND_COLOR

            // Top line and top right corner
            ctx.lineTo(PAD, 0, chart.width - PAD, 0)
            ctx.arcTo(chart.width, 0, chart.width, PAD, RADIUS)

            // Right wall and bottom right corner
            ctx.lineTo(chart.width, PAD, chart.width, chart.height - PAD)
            ctx.arcTo(chart.width, chart.height, chart.width - PAD, chart.height, RADIUS)

            // Bottom line and bottom left corner
            ctx.lineTo(chart.width - PAD, chart.height, PAD, chart.height) // right wall
            ctx.arcTo(0, chart.height, 0, chart.height - PAD, RADIUS)

            // Left wall and top left corner
            ctx.lineTo(0, chart.height - PAD, 0, PAD) // right wall
            ctx.arcTo(0, 0, PAD, 0, RADIUS)

            // Close the rectangle....
            ctx.lineTo(PAD, 0, PAD + 2, 0)

            ctx.fill()
            ctx.restore();
          }
        }
      ]
    })

  })
}
const createBarChartImage = (key, labels, data, area) => {
  let canvas = document.createElement('canvas')
  canvas.style.width = BAR_WIDTH
  canvas.style.height = BAR_HEIGHT
  canvas.style.borderRADIUS = "25px"
  area.appendChild(canvas)

  return new Promise((res, rej) => {
    const config = barChartConfig(labels, data)
    let chart = null
    config.options.showDatapoints = false
    config.options.plugins.tooltip = false
    config.options.animation = {
      onComplete: () => {
        const img = chart.toBase64Image('image/png', 1)
        area.removeChild(canvas)
        res([
          key, img
        ])
      }
    }
    chart = createBarChart(canvas, config)
  })
}

const createBarChart = (canvas, config) => {
  canvas.style.width = BAR_WIDTH
  canvas.style.height = BAR_HEIGHT
  canvas.style.borderRADIUS = "25px"
  return new Chart(canvas, config)
}




const generatePDF = (area, dairy_id) => {



  return new Promise((resolve, reject) => {
    getAnnualReportData(dairy_id)
      .then(arPDFData => {
        const props = arPDFData
        createCharts([props.nutrientBudgetB.allEvents, props.naprbalA], area)
          .then(images => {
            // pdfMake.createPdf(dd(props)).download();
            pdfMake.createPdf(dd(props, images)).open()
            resolve('Success')
          })
          .catch(err => {
            console.log(err)
            reject(err)
          })
      })
      .catch(err => {
        console.log(err)
        reject('Information not found.')
      })
  })
}

export { generatePDF, createBarChart, barChartConfig }