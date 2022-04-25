/** Client Side Charts
 *  - Used to show application summary
 */
import Chart from 'chart.js/auto';
import { formatInt } from "../../utils/format"
import { toFloat } from "../../utils/convertCalc"

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
        ctx.fillStyle = "#777";

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

const barChartConfig = (labels, data, backgroundColor = null) => {
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
          ctx.fillStyle = backgroundColor || CHART_BACKGROUND_COLOR;

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

const createBarChart = (canvas, config) => {
  canvas.style.width = BAR_WIDTH
  canvas.style.height = BAR_HEIGHT
  canvas.style.borderRADIUS = "25px"
  return new Chart(canvas, config)
}

export { createBarChart, barChartConfig }