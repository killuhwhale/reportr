const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

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

    setVerticalConfig(labels, data, backgroundColor = null) {
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
        this.pdfChart.setVerticalConfig(this.nutrientLabels, this.totalNutrientAppAntiHarvestData, null)
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



