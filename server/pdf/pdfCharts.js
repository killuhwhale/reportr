const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const { formatInt } = require("../utils/format")
const { toFloat } = require("../utils/convertUtil")

const HORIBAR_WIDTH = 600
const HORIBAR_HEIGHT = 300
const BAR_WIDTH = 500
const BAR_HEIGHT = 333
const CHART_BACKGROUND_COLOR = "#f7f7f7"
const RADIUS = 40
const PAD = 10



class PDFChart {
    #config = null
    #width = 400
    #height = 400

    constructor() { }

    setLabels(labels) {
        this.labels = labels
    }

    setData(data) {
        this.data = data
    }

    setSize(w, h) {
        this.#width = w
        this.#height = h
    }

    drawValuesPlugin() {
        return {
            id: 'draw_values',
            afterDraw: (chartInstance) => {
                var ctx = chartInstance.ctx;
                // render the value of the chart above the bar
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                chartInstance.data.datasets.forEach((dataset, di) => {
                    for (var i = 0; i < dataset.data.length; i++) {
                        if (isNaN(dataset.data[i])) {
                            console.log("Error num?", dataset.data[i])
                            console.log(dataset.data)
                            return
                        }
                        // rewrite text if it is too close to edge for hoizontal bar chart
                        ctx.fillStyle = "#000";

                        let bar = chartInstance._metasets[di].data[i]
                        let num = formatInt(Math.round(toFloat(dataset.data[i])))
                        let singleCharLen = 4

                        // Horizontal Chart
                        if (chartInstance.scales.x.type === "logarithmic") {
                            if (toFloat(num) >= 1e6) num = `${formatInt(toFloat(num) / 1e6)}M`
                            let maxX = chartInstance.scales.x.right
                            let numChars = num.toString().length
                            singleCharLen = 3
                            let xOffset = (maxX - bar.x) / maxX < 0.03 ? ((numChars * -singleCharLen) - 10) : 0;

                            ctx.fillText(num, bar.x + xOffset, bar.y);

                            // Veritcal Charts
                        } else {
                            /**
                             *  top: 32,
                                bottom: 304.6,
                                left: 0,
                                right: 98.6,
                                width: 98.6,
                                height: 272.6,


                                if the top is at 32,

                                a bar y pos of 99 is really tall and 
                                                110 is smaller,
                                                the closer to 32, 
                                                99 - 32 =    67 / 304 ==> .22
                                                90 - 32 =    58 / 304 ==>  .19


                             */
                            // Vertical bars, when the numbers are too big, they overlap,
                            let isLargeNum = toFloat(num) >= 1e4

                            let yPos = chartInstance.scales.y

                            let yOffsetCalc = (bar.y - yPos.top) / (yPos.bottom - yPos.top)
                            let yOffset = yOffsetCalc < 0.10 ? (6 * singleCharLen) : 0;


                            console.log(`num: (${num}) yOffsetCalc: ${yOffsetCalc}  bar.y: ${bar.y} yOffset: ${yOffset}`)
                            // Summary Chart
                            if (isLargeNum) {
                                num = `${formatInt(toFloat(num) / 1000)}`

                                // Write num on top of 'K' for large numbers
                                let numY = bar.y - (singleCharLen * 3) + yOffset
                                let kY = bar.y + yOffset
                                ctx.fillText(num, bar.x, numY);
                                ctx.fillText('K', bar.x, kY);

                                // Field Charts w/ title and subtitle
                            } else {

                                ctx.fillText(num, bar.x, bar.y + yOffset);
                            }
                        }
                    }
                });
            }
        }
    }

    setChartBackgroundColor() {
        return {
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
    }

    setVerticalConfig(labels, data, backgroundColor = null, isTotalSummary = false) {
        this.#config = {
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
                        display: !isTotalSummary,
                        text: 'Nutrient Budget',
                        font: {
                            size: 20,
                        },
                    },
                    subtitle: {
                        display: !isTotalSummary,
                        text: 'lbs/ acre',
                        font: {
                            size: 16,
                        },
                    },
                    tooltip: {
                        enabled: false
                    },
                },
                scales: {
                    y: {
                        type: 'logarithmic',
                        color: "#0f0",
                        position: 'left', // `axis` is determined by the position as `'y'`
                        title: {
                            text: isTotalSummary ? 'lbs' : "lbs / acre",
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
                    }
                },
            },
            plugins: [
                this.setChartBackgroundColor(),
                this.drawValuesPlugin()
            ]
        }
    }

    setHorizontalConfig(title, labels, data) {
        this.#config = {
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
                        title: {
                            text: "lbs",
                            display: true,
                            font: {
                                size: 14
                            }
                        },
                    }
                },
                //   animation: {
                //     onComplete: () => {
                //       const img = chart.toBase64Image('image/png', 1)
                //       area.removeChild(canvas)
                //       res([
                //         key, img
                //       ])
                //     }
                //   },
            },
            plugins: [
                this.setChartBackgroundColor(),
                this.drawValuesPlugin()
            ]
        }
    }


    // ChartJS is using single Cavnas each one needs to process...
    // Right now only the one without a loop is processing
    // Need to make these asynchonous call synchronously......

    async renderChart() {

        const chartCallback = (ChartJS) => {
            ChartJS.defaults.responsive = true;
            ChartJS.defaults.maintainAspectRatio = false;
        };
        const chartJSNodeCanvas = new ChartJSNodeCanvas({
            width: this.#width,
            height: this.#height,
            chartCallback
        });
        try {
            // return await chartJSNodeCanvas.renderToBuffer(this.#config);
            return await chartJSNodeCanvas.renderToDataURL(this.#config);

        } catch (e) {
            console.log(e)
            return { error: e.toString() }
        }
    }
}




class ChartGenerater {
    constructor() {
        this.pdfChart = new PDFChart()
        this.nutrientLabels = ["N", "P", "K", "Salt"]
        this.nutrientBudgetB = null
        this.summary = null
        this.totalNutrientAppAntiHarvestData = null
        this.nutrientData = []
        this.materialData = []
        this.materialLabels = [
            'Existing soil nutrient content',
            'Plowdown credit',
            'Commercial fertilizer / Other',
            'Dry Manure',
            'Process wastewater',
            'Fresh water',
            'Atmospheric deposition',
        ]

        this.results = {}
    }

    hasChartData() {
        return this.nutrientBudgetB &&
            this.summary &&
            this.totalNutrientAppAntiHarvestData &&
            this.nutrientData
    }

    setData(nutrientBudgetB, summary) {
        this.nutrientBudgetB = nutrientBudgetB
        this.summary = summary
        this.totalNutrientAppAntiHarvestData = [summary.total_app, summary.anti_harvests, summary.actual_harvests]
        this.createNutrientData()
        this.createMaterialData()
    }


    createNutrientData() {
        this.nutrientData = Object.keys(this.nutrientBudgetB)
            .map(key => {
                const ev = this.nutrientBudgetB[key]
                return {
                    key: key,
                    data: [ev.total_app, ev.anti_harvests, ev.actual_harvests]
                }
            })
    }

    createMaterialData() {
        this.materialData = [0, 0, 0, 0].map((_, i) => {
            return [
                this.summary.soils[i], // Existing soil content
                this.summary.plows[i], // Plowdown credit
                this.summary.fertilizers[i],
                this.summary.manures[i],
                this.summary.wastewaters[i],
                this.summary.freshwaters[i],
                i === 0 ? this.summary.atmospheric_depo : 0, // Atmoshperic depo is only for nitrogen.
                i === 0 ? 'Nitrogen' : i === 1 ? 'Phosphorus' : i === 2 ? 'Potassium' : 'Salt'
            ]
        })
    }



    async generateCharts() {
        if (!this.hasChartData()) return { error: 'No data call setData()' }
        // TODO() Test will promise.all([])
        try {
            await this.generateBarCharts()
            await this.generateSummaryBarCharts()
            await this.generateHorizontalBarCharts()

            return this.results
        } catch (e) {
            console.log('Error with generating charts', e)
        }
    }

    async generateBarCharts() {
        for (let row of this.nutrientData) {
            this.pdfChart.setSize(BAR_WIDTH, BAR_HEIGHT)
            this.pdfChart.setVerticalConfig(this.nutrientLabels, row.data, null)
            const imageBuffer = await this.pdfChart.renderChart()
            this.results[row.key] = imageBuffer
        }
    }


    async generateSummaryBarCharts() {
        this.pdfChart.setVerticalConfig(this.nutrientLabels, this.totalNutrientAppAntiHarvestData, null, true)
        const imageBuffer = await this.pdfChart.renderChart()
        this.results['totalNutrientAppAntiHarvestData'] = imageBuffer
    }

    async generateHorizontalBarCharts() {
        for (let row of this.materialData) {
            let data = row.slice(0, -1)
            let title = row.slice(-1)
            let key = row && row.length === 8 ? row[row.length - 1] : ''
            this.pdfChart.setHorizontalConfig(title, this.materialLabels, data)

            const imageBuffer = await this.pdfChart.renderChart()
            this.results[key] = imageBuffer

        }


    }

}


module.exports.ChartGenerater = new ChartGenerater()



