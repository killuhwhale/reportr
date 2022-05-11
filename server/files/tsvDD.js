const { NO_LOGO } = require('../constants')
const { Spaces } = require('../spaces/spaces')
const { WASTEWATER } = require('../tsv/serverTsv')
const getDateTime = () => {
  const curDate = new Date()
  return `${curDate.getUTCMonth() + 1}/${curDate.getUTCDate()}/${curDate.getUTCFullYear()} ${curDate.getUTCHours()}:${curDate.getUTCMinutes()}:${curDate.getUTCSeconds()}`
}

const line = (len) => {
  return {
    table: {
      // headerRows: 1,
      heights: 1,
      widths: [len],
      body: [
        [{
          border: [false, true, false, false],
          text: ''
        }]
      ]
    },

  }
}

class TSVDD {
  // 17 cols
  // colWidths = [
  //   '5%', '5%', '5%', '5%', '5%', '5%', '5%', '5%', '5%', '5%',
  //   '5%', '5%', '5%', '5%', '5%', '5%', '5%'
  // ]
  colWidths = null

  constructor(dairyTitle, tsvType, aboveHeader, header, dataRows, company_id) {
    this.dairyTitle = dairyTitle
    this.tsvType = tsvType
    this.aboveHeaderRows = this.generateAboveHeader(aboveHeader)
    this.aboveHeaderValues = this.extractValuesFromAboveHeaderArr(aboveHeader)
    this.headerRows = this.generateHeader(header)
    this.dataRows = this.generateDataRows(dataRows)
    this.logo = null
    this.colWidths = this.selectTableWidths(header)
    this.company_id = company_id
  }

  selectTableWidths(header) {
    if (this.tsvType === WASTEWATER) {
      return ['5%', '10%', '10%', '5%', '5%',
        '9%', '10%', '5%', '5%', '5%',
        '8%', '8%', '5%', '5%', '5%',]
    }
    return Array(header.length).fill('*')
  }

  transformRows(rows, cellFormat) {
    let transformedRows = []
    for (let row of rows) {
      let tmpRow = []
      for (let i = 0; i < row.length; i++) {
        const cell = row[i]
        tmpRow.push(cellFormat(cell, i))
      }
      transformedRows.push(tmpRow)
    }
    return transformedRows
  }

  transformRows1D(row, cellFormat) {
    let transformedRow = []
    for (let cell of row) {
      transformedRow.push(cellFormat(cell))
    }
    return transformedRow
  }

  generateAboveHeader(rows) {
    return this.transformRows(rows, (cell, i) => {
      return {
        colSpan: (i == 0 || i == 3) ? 3 : 1, // hacky
        text: { text: cell, fontSize: 8 },
        border: [false, false, false, false]
      }
    })
  }

  generateHeader(rows) {
    return this.transformRows1D(rows, (cell, i) => {
      return {
        fillColor: '#c6d9f0',
        text: { text: cell, fontSize: 6, alignment: 'center' },
        border: [true, true, true, true],
        bold: true
      }
    })

  }

  generateDataRows(rows) {
    return this.transformRows(rows, (cell, i) => {
      return {
        // fillColor: gray,
        text: { text: cell, fontSize: 6 },
        border: [true, true, true, true],
        alignment: 'center'
      }
    })
  }

  extractValuesFromAboveHeaderArr(aboveHeaderRows) {
    let aboveHeaderVals = []
    for (let row of aboveHeaderRows) {
      let newRow = []
      for (let item of row) {
        if (!/^\s*$/.test(item)) {
          newRow.push(item)
        }
      }
      aboveHeaderVals.push(newRow)
    }
    return aboveHeaderVals

  }

  aboveHeaderTable() {
    const rows = this.aboveHeaderValues
    return {
      // headlineLevel: key,
      table: {
        widths: ['15%', '15%', '10%', '45%', '15%',],

        body: [
          [
            {
              text: `${rows[0][0]}`,
              border: [false, false, false, false],
              fontSize: 8
            },
            {
              text: `${rows[0][1]}`,
              border: [false, false, false, false],
              fontSize: 8
            },
            {
              text: '',
              border: [false, false, false, false],
              fontSize: 8
            },
            {
              text: '',
              border: [false, false, false, false],
              fontSize: 8
            },
            {
              text: `${rows[0][2]} ${rows[0][3]}`,
              border: [false, false, false, false],
              fontSize: 8
            },
          ], [
            {
              text: `${rows[1][0]}`,
              border: [false, false, false, false],
              fontSize: 8
            },
            {
              text: `${rows[1][1]}`,
              border: [false, false, false, false],
              fontSize: 8
            },
            {
              text: '',
              border: [false, false, false, false],
              fontSize: 8
            },
            {
              text: '',
              border: [false, false, false, false],
              fontSize: 8
            },
            {
              text: '',
              border: [false, false, false, false],
              fontSize: 8
            },
          ],
        ]
      }
    }
  }

  table(colWidths) {
    return {
      // headlineLevel: key,
      table: {
        widths: colWidths,

        body: [
          this.headerRows,
          ...this.dataRows
        ]
      }
    }
  }

  async getLogo() {
    const logo = await Spaces.getCompanyLogo(this.company_id, true)
    if (logo.error) {
      this.logo = NO_LOGO
      return (logo.error)
    }
    this.logo = logo
  }

  imageElement(img, w, h) {
    return {
      image: img,
      width: w,
      height: h,

      margin: [0, 5]
    }
  }

  async generateDD() {
    const table = this.table(this.colWidths)
    const aboveHeaderTable = this.aboveHeaderTable()
    await this.getLogo()


    const footerTitle = `What should go here`
    const footerImg = this.imageElement(this.logo, 100, 30)
    const curDateTime = getDateTime()

    return {
      pageMargins: [36, 72, 36, 82],
      header: {
        headlineLevel: "header",
        margin: [36, 36],
        columns: [
          {
            width: '*',
            table: {
              widths: ['*'],
              body: [
                [{
                  text: [
                    { text: `${this.dairyTitle}\n`, alignment: "center", bold: true, fontSize: 10 },
                    { text: `${this.tsvType}`, alignment: "center", italics: true, fontSize: 10 }
                  ]
                }]
              ]
            },

          },
        ]
      },
      footer: (currentPage, pageCount) => {
        return {
          headlineLevel: 'footer',
          margin: [36, 0],
          stack: [
            line(792 - 72),
            {
              margin: [0, 2, 0, 0],
              columns: [

                {
                  width: '*',
                  text: {
                    text: footerTitle,
                    alignment: "center",
                    fontSize: 8
                  }
                }
              ]
            },
            {
              margin: [0, 2, 0, 0],
              columns: [
                {
                  width: parseInt((720 / 2) - 50),
                  text: '',
                },
                {
                  width: '*',
                  stack: [footerImg],
                },

              ]
            },
            {
              margin: [0, 2, 0, 0],
              columns: [
                {
                  width: '*',
                  text: {
                    text: curDateTime, alignment: "left", fontSize: 10
                  },

                },
                {
                  width: '*',
                  text: {
                    text: `Page ${currentPage.toString()} of ${pageCount}\n`, alignment: "right", fontSize: 10

                  },
                },
              ]
            }
          ]
        }
      },
      content: { stack: [aboveHeaderTable, table] },
      pageOrientation: 'landscape',
      pageSize: 'LETTER',
    }
  }

}


module.exports.TSVDD = TSVDD
