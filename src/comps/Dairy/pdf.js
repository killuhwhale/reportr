import { formatFloat } from "../../utils/format"

const gray = "#eeeeee"
const darkGray = "#cecece"


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
const longAddressLine = (props) => {
  return {
    stack: [
      {
        table: {
          // headerRows: 1,
          heights: 0,
          widths: ['55%', '15%', '15%', '15%'],
          margin: 0,
          body: [
            [{
              border: [false, false, false, false],
              text: { text: props.street, fontSize: 9, margin: 0, font: 'Roboto' }
            },
            {
              border: [false, false, false, false],
              text: { text: props.city, fontSize: 9 }
            },
            {
              border: [false, false, false, false],
              text: { text: props.county, fontSize: 9 }
            },
            {
              border: [false, false, false, false],
              text: { text: props.zipCode, fontSize: 9 }
            }
            ]
          ]
        },

      },
      {
        table: {
          // headerRows: 1,
          heights: 1,
          widths: ['55%', '15%', '15%', '15%'],
          body: [
            [{
              border: [false, true, false, false],
              text: { text: 'Number and Street', fontSize: 8 }
            },
            {
              border: [false, true, false, false],
              text: { text: 'City', fontSize: 8 }
            },
            {
              border: [false, true, false, false],
              text: { text: 'County', fontSize: 8 }
            },
            {
              border: [false, true, false, false],
              text: { text: 'Zip Code', fontSize: 8 }
            }
            ]
          ]
        },

      }

    ]


  }

}
const nameTelephoneLine = (props) => {
  return {
    table: {
      widths: ['15%', '55%', '10%', '20%'],
      body: [
        [
          {
            border: [false, false, false, false],
            text: 'Operator name:', fontSize: 9
          },
          {
            border: [false, false, false, true],
            text: props.title, fontSize: 9
          },
          {
            border: [false, false, false, false],
            text: 'Telephone no.:', fontSize: 9
          },
          {
            border: [false, false, false, true],
            text: props.primary_phone, fontSize: 9
          },
        ]
      ]
    }
  }
}
const image = (img, w, h) => {
  return {
    // you'll most often use dataURI images on the browser side
    // if no width/height/fit is provided, the original size will be used
    image: img,
    // fit: [150, 150], // fit inside a rect
    width: w,
    height: h,

    margin: [0, 5]
  }
}

const ownOperatorTable = (key, props, is_owner) => {
  return {
    headlineLevel: key,
    table: {
      widths: ["100%"],

      body: [
        [
          {
            fillColor: gray,
            text: props.title,
            fontSize: 9
          }
        ],
        [{
          border: [true, false, true, false],
          stack: [
            nameTelephoneLine(props)
          ]
        }],
        [
          {
            border: [true, false, true, false],
            stack: [longAddressLine({
              street: props.street,
              city: props.city,
              county: props.county,
              zipCode: props.city_zip,
            })]
          }
        ],
        [{
          border: [true, false, true, true],
          text: `This ${is_owner ? 'owner' : 'operator'} is ${props.is_responsible ? '' : 'not '}responsible for paying permit fees.`,
          fontSize: 9

        }],
        [
          {
            headlineLevel: key,
            border: [false], // empty row for margin between list of tables.
            text: ` `, fontSize: 4
          }
        ]
      ]
    }
  }
}
const dairyInformationA = (props) => {
  let tmpRow = []
  let parcelTableBody = []
  // if there are less that 6 parcels process differently.)(single row)
  if (props && typeof props.parcels === typeof [] && props.parcels.length > 6) {
    props.parcels.forEach((parcel, i) => {
      let c = i % 6
      let r = parseInt(i / 6)
      console.log(r, c, parcel.pnumber)

      if (i != 0 && c === 0) {
        parcelTableBody.push(tmpRow)
        console.log("Pushing 1", tmpRow)
        tmpRow = []
      }
      let border = null
      if (r === 0 && c === 0) {
        border = [true, true, false, false] // top left corner 
      } else if (r === 0 && c > 0 && c < 6 - 1) {
        border = [false, true, false, false] // top middle
      } else if (r === 0 && c === 6 - 1) {
        border = [false, true, true, false] // top right corner 
      } else if (c === 0) {
        border = [true, false, false, false] // left middle  
      } else if (c === 6 - 1) {
        border = [false, false, true, false] // right middle 
      } else {
        border = [false, false, false, false] //  middle 
      }

      tmpRow.push({
        border: border,
        text: parcel.pnumber, fontSize: 8
      })

      if (i === props.parcels.length - 1) {
        console.log("Pushing last el row", tmpRow)
        parcelTableBody.push(tmpRow)
      }
    })
    let lastRow = parcelTableBody[parcelTableBody.length - 1]
    let numEmptyCells = 6 - lastRow.length
    for (let i = 0; i < numEmptyCells; i++) {
      lastRow.push({
        border: [],
        text: '', fontSize: 8
      })
    }

    lastRow = lastRow.map((el, i) => {
      let border = [false, false, false, false]
      if (i == 0) {
        border = [true, false, false, true] // bottom left
      } else if (i == 5) {
        border = [false, false, true, true] // bottom right
      } else {
        border = [false, false, false, true] // bottom middle
      }
      el.border = border
      return el
    })
    // replace last row with updated row
    parcelTableBody[parcelTableBody.length - 1] = lastRow
  } else if (props && typeof props.parcels === typeof []) {
    parcelTableBody = [props.parcels.map((parcel, i) => {

      let border = null
      if (i === 0) {
        border = [true, true, false, true] // left 
      } else if (i > 0 && i < 6 - 1) {
        border = [false, true, false, true] // middle
      } else if (i === 6 - 1) {
        border = [false, true, true, true] // right 
      }
      return {
        border: border,
        text: parcel.pnumber, fontSize: 8
      }
    })]

    // Fill potentail empty cells in row
    let numEmpty = 6 - props.parcels.length
    for (let i = 0; i < numEmpty; i++) {
      parcelTableBody[0].push({
        border: [false, true, false, true],
        text: '', fontSize: 8
      })
    }
    parcelTableBody[0][0].border = [true, true, false, true]
    parcelTableBody[0][6 - 1].border = [false, true, true, true]
  }
  const table = {
    margin: [20, 0, 0, 0], // Parcels
    stack: [
      {
        table: {
          widths: ['16%', '16%', '16%', '16%', '16%', '16%',],
          body: parcelTableBody
        }
      }
    ]
  }

  // Table can be filled in with empty cells, if there are no pacels do not render table but a message
  const content = props && typeof props.parcels === typeof [] && props.parcels.length > 0 ?
    table : { alignment: 'center', text: { text: 'No Parcels entered.', fontSize: 9, italics: true } }

  return {
    // pageBreak: 'before', // super useful soltion just dont need on the first one
    stack: [{
      margin: 0,
      stack: [ // Header and first row - unindented
        {
          margin: 0,
          table: {
            widths: ['100%'],
            body: [
              [{
                // border: [false, false, false, false],
                text: 'DAIRY FACILITY INFORMATION', alignment: 'center', fontSize: 10
              }]
            ]
          }
        },
        {
          table: {
            margin: [0, 0],
            widths: ['35%', '65%'],
            heights: [1],
            body: [
              [
                {// row 1

                  border: [false, false, false, false],
                  text: {
                    text: 'A. NAME OF DAIRY OR BUSINESS OPERATING THE DAIRY:', bold: true, fontSize: 9,

                  }
                },
                {
                  border: [false, false, false, true],
                  text: {
                    text: props.title, fontSize: 9,
                  }
                }
              ]
            ]
          }
        }
      ]
    },
    {
      margin: [10, 0, 0, 0], // content - indented
      stack: [
        {
          table: {
            widths: ["100%"],
            body: [
              [{
                border: [false],
                text: 'Physical Address of dairy:', fontSize: 8
              }],
              [{
                border: [false],
                stack: [
                  longAddressLine({
                    street: props.street,
                    city: props.city,
                    county: props.county,
                    zipCode: props.city_zip,
                  })
                ]
              }
              ]
            ]
          }
        },
        {
          table: {
            margin: [0, 0],
            widths: ['auto', '*'],
            heights: [1],
            body: [
              [{// row 1

                border: [false, false, false, false],
                text: {
                  text: 'Street and nearest cross street (if no address):', fontSize: 8,

                }
              },
              {
                border: [false, false, false, true],
                text: {
                  text: props.cross_street, fontSize: 9, lineHeight: 0.1
                }
              }]
            ]
          }
        },
        {
          table: {
            margin: [0, 0],
            widths: ['auto', 'auto', '*'],
            heights: [1],
            body: [
              [{// row 1

                border: [false, false, false, false],
                text: {
                  text: 'Date facility was originally placed in operation:', fontSize: 8,

                }
              },
              {
                border: [false, false, false, true],
                text: {
                  text: props.began ? props.began.split("T")[0] : '', fontSize: 9, lineHeight: 0.1
                }
              },
              {
                border: [false, false, false, false],
                text: {
                  text: '', fontSize: 9, lineHeight: 0.1
                }
              }
              ]
            ]
          }
        },
        {
          table: {
            margin: [0, 0],
            widths: ['35%', '30%', '35%'],
            body: [
              [
                {// row 1

                  border: [false, false, false, false],
                  text: {
                    text: 'Regional Water Quality Control Board Basin Plan designation: ', fontSize: 8,

                  }
                },
                {
                  border: [false, false, false, true],
                  text: {
                    text: props.basin_plan, fontSize: 9, lineHeight: 0.1
                  }
                },
                {
                  border: [false, false, false, false],
                  text: {
                    text: '', fontSize: 9, lineHeight: 0.1
                  }
                }
              ]
            ]
          }
        },
        {
          table: {
            margin: [0, 0],
            widths: ['100%'],
            heights: [1],
            body: [
              [{// row 1

                border: [false, false, false, false],
                text: {
                  text: 'County Assessor Parcel Number(s) for dairy facility:', fontSize: 8,

                }
              },
              ]
            ]
          }
        },
      ]
    },
      content
    ]
  }
}
const dairyInformationB = (props) => {
  const content = props && typeof props.operators === typeof [] && props.operators.length > 0 ?
    props.operators.map((operator, i) => {
      return ownOperatorTable(`owneropTableB${i}`, operator, false)
    })
    : [{ margin: [10, 5], text: { text: 'No operators entered.', fontSize: 9, italics: true } }]

  return {
    stack: [
      {
        margin: [0, 5, 0, 5],
        stack: [
          {
            text: 'B. OPERATORS', bold: true, fontSize: 9
          }
        ]
      },
      {
        margin: [15, 0, 0, 0],
        stack: content
      }

    ]
  }
}
const dairyInformationC = (props) => {
  const content = props && typeof props.owners === typeof [] && props.owners.length > 0 ? props.owners.map((owner, i) => {
    return ownOperatorTable(`ownerTableA${i}`, owner, true)
  })
    : [{ margin: [10, 5], text: { text: 'No owners entered.', fontSize: 9, italics: true } }]

  return {
    stack: [
      {
        margin: [0, 5, 0, 5],
        stack: [
          {
            text: 'C. OWNERS', bold: true, fontSize: 9
          }
        ]
      },
      {
        margin: [15, 0, 0, 0],
        stack: content
      }
    ]
  }
}

const availableNutrientsA = (props) => {
  return {
    pageBreak: 'before', // super useful soltion just dont need on the first one

    stack: [
      {
        table: {
          widths: ['*'],
          body: [
            [{
              text: {
                text: 'AVAILABLE NUTRIENTS', alignment: 'center', fontSize: 10
              }
            }]
          ]
        }
      },
      {
        table: {
          widths: ['100%'],
          body: [
            [{// row 1
              border: [false, false, false, false],
              text: {
                text: 'A. HERD INFORMATION:', bold: true, fontSize: 9,
              }
            },
            ]
          ]
        }
      },
      {
        table: {
          widths: ["25%", "10%", "10%", "15%", "20%", "10%", "*"],
          // widths: ['*', '*', '*', '*', '*', '*', '*'], // Interesting, if I use the above percents, hella stuff below looks worse....
          body: [
            [
              { // row 1
                text: '', fontSize: 8
              },
              { // row 1
                fillColor: gray,
                text: 'Milk Cows', fontSize: 8
              },
              { // row 1
                fillColor: gray,
                text: 'Dry Cows', fontSize: 8
              },
              { // row 1
                fillColor: gray,
                text: 'Bred Heifers (15-24 mo.)', fontSize: 8
              },
              { // row 1
                fillColor: gray,
                text: 'Heifers (7-14 mo. to breeding)', fontSize: 8
              },
              { // row 1
                fillColor: gray,
                text: 'Calves (4-6 mo.)', fontSize: 8
              },
              { // row 1
                fillColor: gray,
                text: 'Calves (0-3 mo.)', fontSize: 8
              },
            ],
            [
              { // row 2
                text: 'Number open confinement'
              },
              { // row 2
                text: props.herdInfo.milk_cows[0]
              },
              { // row 2
                text: props.herdInfo.dry_cows[0]
              },
              { // row 2
                text: props.herdInfo.bred_cows[0]
              },
              { // row 2
                text: props.herdInfo.cows[0]
              },
              { // row 2
                text: props.herdInfo.calf_old[0]
              },
              { // row 2
                text: props.herdInfo.calf_young[0]
              },

            ],
            [
              { // row 3
                text: 'Number under roof'
              },
              { // row 2
                text: props.herdInfo.milk_cows[1]
              },
              { // row 2
                text: props.herdInfo.dry_cows[1]
              },
              { // row 2
                text: props.herdInfo.bred_cows[1]
              },
              { // row 2
                text: props.herdInfo.cows[1]
              },
              { // row 2
                text: props.herdInfo.calf_old[1]
              },
              { // row 2
                text: props.herdInfo.calf_young[1]
              },

            ],
            [
              { // row 4
                text: 'Maximum number'
              },
              { // row 
                text: props.herdInfo.milk_cows[2]
              },
              { // row 
                text: props.herdInfo.dry_cows[2]
              },
              { // row 
                text: props.herdInfo.bred_cows[2]
              },
              { // row 
                text: props.herdInfo.cows[2]
              },
              { // row 
                text: props.herdInfo.calf_old[2]
              },
              { // row 
                text: props.herdInfo.calf_young[2]
              },

            ],
            [
              { // row 5
                text: 'Average number'
              },
              { // row 
                text: props.herdInfo.milk_cows[3]
              },
              { // row 
                text: props.herdInfo.dry_cows[3]
              },
              { // row 
                text: props.herdInfo.bred_cows[3]
              },
              { // row 
                text: props.herdInfo.cows[3]
              },
              { // row 
                text: props.herdInfo.calf_old[3]
              },
              { // row 
                text: props.herdInfo.calf_young[3]
              },

            ],
            [
              { // row 6
                text: 'Avg live weight (lbs)'
              },
              { // row 
                text: props.herdInfo.milk_cows[4]
              },
              { // row 
                text: props.herdInfo.dry_cows[4]
              },
              { // row 
                text: props.herdInfo.bred_cows[4]
              },
              { // row 
                text: props.herdInfo.cows[4]
              },
              { // row 6
                fillColor: darkGray,

                text: ''
              },
              { // row 6
                text: '',
                fillColor: darkGray,

              },

            ]

          ]
        }
      },
      {
        margin: [0, 5, 0, 5],
        table: {
          widths: ['15%', '*'],
          body: [
            [{// row 1
              border: [false, false, false, false],
              text: {
                text: 'Predominant milk cow breed:', fontSize: 8,
              }
            },
            {
              border: [false, false, false, true],
              text: {
                text: props.p_breed, fontSize: 9
              }
            }]
          ]
        }
      },
      {
        table: {
          widths: ['15%', '5%', '80%'],
          body: [
            [
              {// row 1

                border: [false, false, false, false],
                text: {
                  text: 'Average milk production:', fontSize: 8,

                }
              },
              {
                border: [false, false, false, true],
                text: {
                  text: props.herdInfo.milk_cows[5], alignment: 'right', fontSize: 9
                }
              },
              {

                border: [false, false, false, false],
                text: {
                  text: 'pounds per cow per day', alignment: "left", fontSize: 9, lineHeight: 0.1
                }
              }
            ]
          ]
        }
      },
    ]
  }
}
const availableNutrientsB = (props) => {
  // Numbers are strings formatted from Intl javascript formatting library, need to parse to do math.
  let n_ammonia_loss = (parseFloat(props.herdCalc[1].replaceAll(',', '')) * 0.7).toFixed(2)

  return {
    // pageBreak: 'before', // super useful soltion just dont need on the first one
    stack: [{
      margin: 0,
      stack: [ // Header and first row - unindented
        {
          table: {
            margin: [0, 0],
            widths: ['*'],
            heights: [1],
            body: [
              [{// row 1
                border: [false, false, false, false],
                text: {
                  text: 'B. MANURE GENERATED:', bold: true, fontSize: 9,
                }
              },
              ]
            ]
          }
        }
      ]
    },
    {
      margin: [10, 0, 0, 0], // content - indented
      stack: [
        {
          table: {
            widths: ["21%", "10%", "*"],
            body: [
              [
                {
                  border: [false],
                  text: {
                    text: 'Total manure excreted by the herd:',
                    fontSize: 9,
                  }
                },
                {
                  border: [false, false, false, true],
                  text: {
                    text: props.herdCalc[0],
                    fontSize: 9,
                  }
                },
                {
                  border: [false],
                  text: {
                    text: 'tons per reporting period',
                    italics: true,
                    fontSize: 9,
                  }
                }
              ],
            ]
          }
        },
        {
          table: {
            widths: ['22%', "10%", '15%', "26%", '10%', '*'],
            body: [
              [
                {
                  border: [false],
                  text: {
                    text: 'Total nitrogen from manure:',
                    alignment: 'left',
                  },
                  fontSize: 9,
                },
                {
                  border: [false, false, false, true],
                  text: {
                    text: props.herdCalc[1],
                    fontSize: 9,
                  }
                },
                {
                  border: [false],
                  text: {
                    text: 'lbs per reporting period',
                    italics: true,
                    fontSize: 9,
                  }
                },
                {
                  border: [false],
                  text: {
                    text: 'After ammonia losses (30% loss applied):',
                    fontSize: 9,
                  }
                },
                {
                  border: [false, false, false, true],
                  text: {
                    text: n_ammonia_loss,
                    fontSize: 9,
                  }
                },
                {
                  border: [false],
                  text: {
                    text: 'lbs per reporting period',
                    italics: true,
                    fontSize: 9,
                  }
                },
              ]
            ]
          }
        },
        {
          table: {
            widths: ['21%', '10%', '*'],
            body: [
              [
                {
                  border: [false],
                  text: {
                    text: 'Total phosphorus from manure:',
                    fontSize: 9,
                  }
                },
                {
                  border: [false, false, false, true],
                  text: {
                    text: props.herdCalc[2],
                    fontSize: 9,
                  }
                },
                {
                  border: [false],
                  text: {
                    text: 'lbs per reporting period',
                    italics: true,
                    fontSize: 9,
                  }
                }
              ],
              [
                {
                  border: [false],
                  text: {
                    text: 'Total potassium from manure:',
                    fontSize: 9,
                  }
                },
                {
                  border: [false, false, false, true],
                  text: {
                    text: props.herdCalc[3],
                    fontSize: 9,
                  }
                },
                {
                  border: [false],
                  text: {
                    text: 'lbs per reporting period',
                    italics: true,
                    fontSize: 9,
                  }
                }
              ],
              [
                {
                  border: [false],
                  text: {
                    text: 'Total salt from manure:',
                    fontSize: 9,
                  }
                },
                {
                  border: [false, false, false, true],
                  text: {
                    text: props.herdCalc[4],
                    fontSize: 9,
                  }
                },
                {
                  border: [false],
                  text: {
                    text: 'lbs per reporting period',
                    italics: true,
                    fontSize: 9,
                  }
                }
              ],
            ]
          }
        }
      ]
    },
    ]
  }
}
const availableNutrientsC = (props) => {
  return {
    // pageBreak: 'before', // super useful soltion just dont need on the first one
    headlineLevel: "availableNutrientsC",
    columns: [
      {
        margin: 0,
        width: "60%",
        stack: [ // Header and first row - unindented
          {
            table: {
              margin: [0, 0],
              widths: ['98%'],
              body: [
                [{// row 1
                  border: [false, false, false, false],
                  text: {
                    text: 'C. PROCESS WASTEWATER GENERATED:', bold: true, fontSize: 9,
                  }
                },
                ]
              ]
            }
          },
          {
            margin: [10, 0, 0, 0],
            table: {
              widths: ["45%", "30%", "25%"],
              body: [
                [
                  {
                    border: [false],
                    text: {
                      text: 'Process wastewater generated:',
                      fontSize: 9,
                    }
                  },
                  {
                    border: [false, false, false, true],
                    text: {
                      text: props.generated[0],
                      fontSize: 9,
                    }
                  },
                  {
                    border: [false],
                    text: {
                      text: 'gallons',
                      italics: true,
                      fontSize: 9,
                    }
                  }
                ],
                [
                  {
                    border: [false],
                    text: {
                      text: 'Total nitrogen generated:',
                      fontSize: 9,
                    }
                  },
                  {
                    border: [false, false, false, true],
                    text: {
                      text: props.generated[1],
                      fontSize: 9,
                    }
                  },
                  {
                    border: [false],
                    text: {
                      text: 'gallons',
                      italics: true,
                      fontSize: 9,
                    }
                  }
                ],
                [
                  {
                    border: [false],
                    text: {
                      text: 'Total phosphorus generated:',
                      fontSize: 9,
                    }
                  },
                  {
                    border: [false, false, false, true],
                    text: {
                      text: props.generated[2],
                      fontSize: 9,
                    }
                  },
                  {
                    border: [false],
                    text: {
                      text: 'gallons',
                      italics: true,
                      fontSize: 9,
                    }
                  }
                ],
                [
                  {
                    border: [false],
                    text: {
                      text: 'Total potassium generated:',
                      fontSize: 9,
                    }
                  },
                  {
                    border: [false, false, false, true],
                    text: {
                      text: props.generated[3],
                      fontSize: 9,
                    }
                  },
                  {
                    border: [false],
                    text: {
                      text: 'gallons',
                      italics: true,
                      fontSize: 9,
                    }
                  }
                ],
                [
                  {
                    border: [false],
                    text: {
                      text: 'Total salt generated:',
                      fontSize: 9,
                    }
                  },
                  {
                    border: [false, false, false, true],
                    text: {
                      text: props.generated[4],
                      fontSize: 9,
                    }
                  },
                  {
                    border: [false],
                    text: {
                      text: 'gallons',
                      italics: true,
                      fontSize: 9,
                    }
                  }
                ],
              ]
            }
          },
        ]
      },
      {
        margin: [0, 20, 80, 0], // content - indented
        width: "40%",
        stack: [
          {
            table: {
              widths: ['10%', "30%", '60%'],

              body: [
                [
                  {
                    border: [true, true, false, false],
                    text: {
                      text: ``,
                      fontSize: 9,
                    }
                  },
                  {
                    border: [false, true, false, false],
                    text: {
                      text: props.applied[0],
                      fontSize: 9,
                    }
                  },
                  {
                    border: [false, true, true, false],
                    text: {
                      text: `gallons applied`,
                      italics: true,
                      fontSize: 9,
                    }
                  },
                ],
                [
                  {
                    border: [true, false, false, false],
                    text: {
                      text: `+`,
                      fontSize: 12,
                    }
                  },
                  {
                    border: [false, false, false, false],
                    text: {
                      text: props.exported[0],
                      fontSize: 9,
                    }
                  },
                  {
                    border: [false, false, true, false],
                    text: {
                      text: `gallons exported`,
                      italics: true,
                      fontSize: 9,
                    }
                  },
                ],
                [
                  {
                    border: [true, false, false, true],
                    text: {
                      text: `-`,
                      fontSize: 12,
                    }
                  },
                  {
                    border: [false, false, false, true],
                    text: {
                      text: props.imported[0],
                      fontSize: 9,
                    }
                  },
                  {
                    border: [false, false, true, true],
                    text: {
                      text: `gallons imported`,
                      italics: true,
                      fontSize: 9,
                    }
                  },
                ],
                [
                  {
                    headlineLevel: "availableNutrientsC",
                    border: [true, false, false, true],
                    text: {
                      text: `=`,
                      fontSize: 12,
                    }
                  },
                  {
                    border: [false, false, false, true],
                    text: {
                      text: props.generated[0],
                      fontSize: 9,
                    }
                  },
                  {
                    border: [false, false, true, true],
                    text: {
                      text: `gallons generated`,
                      italics: true,
                      fontSize: 9,
                    }
                  },
                ],

              ]
            }
          }

        ]
      },
    ]
  }
}
const availableNutrientsD = (props) => {
  let sources = props.sources.map(source => {
    return [
      {
        text: {
          text: source.src_desc, fontSize: 9,
        }
      },
      {
        text: {
          text: source.src_type, fontSize: 9,
        }
      },
    ]
  })
  const fullBody = [
    [
      {// row 1
        fillColor: gray,
        text: {
          text: 'Source Description', fontSize: 9,
        }
      },
      {// row 1
        fillColor: gray,
        text: {
          text: 'Type', fontSize: 9,
        }
      },
    ],
    ...sources,
  ]
  const emptyBody = [
    [
      {// row 1
        border: [false, false, false, false],
        colSpan: 2,
        text: {
          text: 'No freshwater sources entered.', fontSize: 9,
        }
      },
    ]
  ]
  const body = props.sources.length > 0 ? fullBody : emptyBody

  return {
    stack: [
      {
        table: {
          widths: ['*'],
          body: [
            [{// row 1
              border: [false, false, false, false],
              text: {
                text: 'D. FRESH WATER SOURCES:', bold: true, fontSize: 9,
              }
            },
            ]
          ]
        },

      },
      {
        margin: [10, 0, 0, 0],
        table: {
          widths: ['75%', '*'],
          body: body
        }
      },
    ]
  }
}
const availableNutrientsE = (props) => {
  let sources = props && props.sources && typeof props.sources === typeof [] && props.sources.length > 0 ? props.sources : []

  sources = sources.map(source => {
    return [
      {
        text: {
          text: source.src_desc, fontSize: 9,
        }
      }, { text: '' }
    ]
  })
  const fullBody = [
    [
      {// row 1
        fillColor: gray,
        text: {
          text: 'Source Description', fontSize: 9,
        }
      },
    ],
    ...sources,
  ]

  const emptyBody = [
    [
      {// row 1
        border: [false, false, false, false],
        colSpan: 2,
        text: {
          text: 'No subsurface (tile) drainage entered.', fontSize: 9, italics: true
        }
      }
    ]
  ]
  // const body = props.sources.length > 0 ? fullBody : emptyBody
  const body = sources.length > 0 ? fullBody : emptyBody


  return {
    // pageBreak: 'before', // super useful soltion just dont need on the first one
    stack: [
      {
        text: '     ',
      },
      {
        table: {
          widths: ['100%'],
          body: [
            [{// row 1
              border: [false, false, false, false],
              text: {
                text: 'E. SUBSURFACE (TILE) DRAINAGE SOURCES:', bold: true, fontSize: 9,
              }
            }]
          ]
        },
      },
      {
        margin: [10, 0, 0, 0],
        table: {
          widths: ['100%', '*'],
          body: body
        }
      },
    ]
  }
}

const availableNutrientsFTableDryManure = (props) => {
  const row = (props) => {
    return [
      {// row 1
        text: {
          text: props.import_date && props.import_date.length > 0 ? props.import_date.split("T")[0] : '',
          fontSize: 8,
        }
      },
      {// row 
        text: {
          text: props.import_desc, fontSize: 8,
        }
      },
      {// row 1
        text: {
          text: props.amount_imported, fontSize: 8,
        }
      },
      {// row 1
        text: {
          text: props.method_of_reporting, fontSize: 8,
        }
      },
      {// row 1
        text: {
          text: props.moisture, fontSize: 8,
        }
      },
      {// row 1
        text: {
          text: props.n_con, fontSize: 8,
        }
      },
      {// row 1
        text: {
          text: props.p_con, fontSize: 8,
        }
      },
      {// row 1
        text: {
          text: props.k_con, fontSize: 8,
        }
      },
      {// row 1
        text: {
          text: '', fontSize: 8,
        }
      },
      {// row 1
        text: {
          text: props.salt_con, fontSize: 8,
        }
      }, { text: '' }
    ]
  }
  let rows = props.map(n_import => {
    return row(n_import)
  })
  let body = [
    [
      {// row 1
        fillColor: gray,
        text: {
          text: 'Date', fontSize: 9,
        }
      },
      {// row 
        fillColor: gray,
        text: {
          text: 'Material Type/ Description', fontSize: 9,
        }
      },
      {// row 1
        fillColor: gray,
        text: {
          text: 'Quantity (tons)', fontSize: 9,
        }
      },
      {// row 1
        fillColor: gray,
        text: {
          text: 'Reporting basis', fontSize: 9,
        }
      },
      {// row 1
        fillColor: gray,
        text: {
          text: 'Moisture (%)', fontSize: 9,
        }
      },
      {// row 1
        fillColor: gray,
        text: {
          text: 'N (mg/kg)', fontSize: 9,
        }
      },
      {// row 1
        fillColor: gray,
        text: {
          text: 'P (mg/kg)', fontSize: 9,
        }
      },
      {// row 1
        fillColor: gray,
        text: {
          text: 'K (mg/kg)', fontSize: 9,
        }
      },
      {// row 1
        fillColor: gray,
        text: {
          text: 'Salt (mg/kg)', fontSize: 9,
        }
      },
      {// row 1
        fillColor: gray,
        text: {
          text: 'TFS (%)', fontSize: 9,
        }
      },
    ],
    ...rows
  ]
  const table = {
    margin: [10, 0, 0, 5],
    table: {
      widths: ['15%', '15%', '15%', '15%', '7%', '7%', '7%', '7%', '6%', "6%", '*'],
      body: body
    }
  }
  return rows && rows.length > 0 ? table : { margin: [10, 5], text: { text: 'No dry manure nutrient imports entered.', fontSize: 7, italics: true } }
}
const availableNutrientsFTableWastewater = (props) => {
  const row = (props) => {
    return [
      {// row 1
        text: {
          text: props.import_date && props.import_date.length > 0 ? props.import_date.split("T")[0] : '',
          fontSize: 8,
        }
      },
      {// row 
        text: {
          text: props.import_desc, fontSize: 8,
        }
      },
      {// row 1
        text: {
          text: props.amount_imported, fontSize: 8,
        }
      },

      {// row 1
        text: {
          text: props.n_con, fontSize: 8,
        }
      },
      {// row 1
        text: {
          text: props.p_con, fontSize: 8,
        }
      },
      {// row 1
        text: {
          text: props.k_con, fontSize: 8,
        }
      },
      {// row 1
        text: {
          text: props.salt_con, fontSize: 8,
        }
      },
      {// row 1
        text: {
          text: props.salt_con, fontSize: 8,
        }
      }, { text: '' }
    ]
  }
  let rows = props.map(n_import => {
    return row(n_import)
  })
  let body = [
    [
      {// row 1
        fillColor: gray,
        text: {
          text: 'Date', fontSize: 9,
        }
      },
      {// row 
        fillColor: gray,
        text: {
          text: 'Material Type/ Description', fontSize: 9,
        }
      },
      {// row 1
        fillColor: gray,
        text: {
          text: 'Quantity (gals)', fontSize: 9,
        }
      },
      {// row 1
        fillColor: gray,
        text: {
          text: 'N (mg/L)', fontSize: 9,
        }
      },
      {// row 1
        fillColor: gray,
        text: {
          text: 'P (mg/L)', fontSize: 9,
        }
      },
      {// row 1
        fillColor: gray,
        text: {
          text: 'K (mg/L)', fontSize: 9,
        }
      },
      {// row 1
        fillColor: gray,
        text: {
          text: 'Salt (mg/L)', fontSize: 9,
        }
      },
      {// row 1
        fillColor: gray,
        text: {
          text: 'TDS (mg/L)', fontSize: 9,
        }
      },
    ],
    ...rows
  ]
  const table = {
    margin: [10, 0, 0, 5],
    table: {
      widths: ['15%', '15%', '15%', '15%', '10%', '10%', '10%', "10%", '*'],
      body: body
    }
  }
  return rows && rows.length > 0 ? table : { margin: [10, 5], text: { text: 'No process wastewater nutrient imports entered.', fontSize: 7, italics: true } }
}
const availableNutrientsFTableFertilizer = (props) => {
  const row = (props) => {
    const unit = props && props.material_type && typeof props.material_type === typeof '' &&
      props.material_type.toLowerCase().indexOf('solid') >= 0 ? 'tons' : 'gals'


    return [
      {// row 1
        text: {
          text: props.import_date && props.import_date.length > 0 ? props.import_date.split("T")[0] : '',
          fontSize: 8,
        }
      },
      {// row 
        text: {
          text: props.import_desc, fontSize: 8,
        }
      },
      {// row 1
        text: {
          text: `${props.amount_imported} ${unit}`, fontSize: 8,
        }
      },
      {// row 1
        text: {
          text: unit === 'tons' ? props.method_of_reporting : '', fontSize: 8,
        }
      },
      {// row 1
        text: {
          text: unit === 'tons' ? props.moisture : '', fontSize: 8,
        }
      },
      {// row 1
        text: {
          text: props.n_con, fontSize: 8,
        }
      },
      {// row 1
        text: {
          text: props.p_con, fontSize: 8,
        }
      },
      {// row 1
        text: {
          text: props.k_con, fontSize: 8,
        }
      },
      {// row 1
        text: {
          text: props.salt_con, fontSize: 8,
        }
      }, { text: '' }
    ]
  }
  let rows = props.map(n_import => {
    return row(n_import)
  })
  let body = [
    [
      {// row 1
        fillColor: gray,
        text: {
          text: 'Date', fontSize: 9,
        }
      },
      {// row 
        fillColor: gray,
        text: {
          text: 'Material Type/ Description', fontSize: 9,
        }
      },
      {// row 1
        fillColor: gray,
        text: {
          text: 'Quantity', fontSize: 9,
        }
      },
      {// row 1
        fillColor: gray,
        text: {
          text: 'Reporting basis', fontSize: 9,
        }
      },
      {// row 1
        fillColor: gray,
        text: {
          text: 'Moisture (%)', fontSize: 9,
        }
      },
      {// row 1
        fillColor: gray,
        text: {
          text: 'N (%)', fontSize: 9,
        }
      },
      {// row 1
        fillColor: gray,
        text: {
          text: 'P (%)', fontSize: 9,
        }
      },
      {// row 1
        fillColor: gray,
        text: {
          text: 'K (%)', fontSize: 9,
        }
      },
      {// row 1
        fillColor: gray,
        text: {
          text: 'Salt (%)', fontSize: 9,
        }
      },
    ],
    ...rows
  ]
  const table = {
    margin: [10, 0, 0, 5],
    table: {
      widths: ['15%', '15%', '15%', '15%', '8%', '8%', '8%', '8%', '8%', '*'],
      body: body
    }
  }

  return rows && rows.length > 0 ? table : { margin: [10, 5], text: { text: 'No commercial fertilizer nutrient imports entered.', fontSize: 7, italics: true } }
}

const availableNutrientsF = (props) => {

  let fertilizerTable = availableNutrientsFTableFertilizer(props.commercial)
  let dryManureTable = availableNutrientsFTableDryManure(props.dry)
  let wastewaterTable = availableNutrientsFTableWastewater(props.process)
  return {
    // pageBreak: 'before', // super useful soltion just dont need on the first one
    stack: [
      {
        table: {
          widths: ['100%'],
          body: [
            [{// row 1
              border: [false, false, false, false],
              text: {
                text: 'F. NUTRIENT IMPORTS:', bold: true, fontSize: 9,
              }
            },
            ],
          ]
        },

      },
      dryManureTable,
      wastewaterTable,
      fertilizerTable,
      {
        margin: [10, 0, 0, 0],
        table: {
          widths: ['25%', '10%', '10%', '10%', '10%', '35%',],
          body: [
            [
              {// row 
                fillColor: gray,
                text: {
                  text: 'Material Type', fontSize: 9,
                }
              },
              {// row 1
                fillColor: gray,
                text: {
                  text: 'N (lbs)', fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                fillColor: gray,
                text: {
                  text: 'P (lbs)', fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                fillColor: gray,
                text: {
                  text: 'K (lbs)', fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                fillColor: gray,
                text: {
                  text: 'Salt (lbs)', fontSize: 9,
                  alignment: 'right',
                }
              },
            ],
            [
              {// row 
                text: {
                  text: 'Commercial fertilizer / Other', fontSize: 9,
                }
              },
              {// row 1
                text: {
                  text: formatFloat(props.commercialTotals[0]), fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                text: {
                  text: formatFloat(props.commercialTotals[1]), fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                text: {
                  text: formatFloat(props.commercialTotals[2]), fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                text: {
                  text: formatFloat(props.commercialTotals[3]), fontSize: 9,
                  alignment: 'right',
                }
              },
            ],
            [
              {// row 
                text: {
                  text: 'Dry Manure', fontSize: 9,
                }
              },
              {// row 1
                text: {
                  text: formatFloat(props.dryTotals[0]), fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                text: {
                  text: formatFloat(props.dryTotals[1]), fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                text: {
                  text: formatFloat(props.dryTotals[2]), fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                text: {
                  text: formatFloat(props.dryTotals[3]), fontSize: 9,
                  alignment: 'right',
                }
              },
            ],
            [
              {// row 
                text: {
                  text: 'Process wastewater', fontSize: 9,
                }
              },
              {// row 1
                text: {
                  text: formatFloat(props.processTotals[0]), fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                text: {
                  text: formatFloat(props.processTotals[1]), fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                text: {
                  text: formatFloat(props.processTotals[2]), fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                text: {
                  text: formatFloat(props.processTotals[3]), fontSize: 9,
                  alignment: 'right',
                }
              },
            ],
            [
              {// row 
                fillColor: gray,
                text: {
                  text: 'Total Import for all materials', fontSize: 9,
                }
              },
              {// row 1
                fillColor: gray,
                text: {
                  text: formatFloat(props.total[0]), fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                fillColor: gray,
                text: {
                  text: formatFloat(props.total[1]), fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                fillColor: gray,
                text: {
                  text: formatFloat(props.total[2]), fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                fillColor: gray,
                text: {
                  text: formatFloat(props.total[3]), fontSize: 9,
                  alignment: 'right',

                }
              },
            ],

          ]
        }
      },
    ]
  }
}
const availableNutrientsGSolidTableRow = (props) => {
  return [
    {// row 1
      text: {
        // text: '05/20/2020',
        text: typeof (props.last_date_hauled) == typeof ('') ? props.last_date_hauled.split("T")[0] : '',
        fontSize: 8,
        alignment: 'center',
      }
    },
    {// row 
      text: {
        // text: 'Corral Solids',
        text: props.material_type,
        fontSize: 8,
      }
    },
    {// row 1
      text: {
        // text: '1,898.00 ton',
        text: formatFloat(props.amount_hauled),
        fontSize: 8,
        alignment: "right",
      }
    },
    {// row 1
      text: {
        // text: 'Dry-weight',
        text: props.reporting_method,
        fontSize: 8,
        alignment: "right",
      }
    },
    {// row 1
      text: {
        // text: '56.00',
        text: formatFloat(props.moisture),
        fontSize: 8,
        alignment: "right",
      }
    },
    {// row 1
      text: {
        // text: '0.0000', density not in sheet or DB
        text: '',
        fontSize: 8,
        alignment: "right",
      }
    },
    {// row 1
      text: {
        // text: '19,400.00',
        text: formatFloat(props.n_con_mg_kg),
        fontSize: 8,
        alignment: "right",
      }
    },
    {// row 1
      text: {
        // text: '5,280.00',
        text: formatFloat(props.p_con_mg_kg),
        fontSize: 8,
        alignment: "right",
      }
    },
    {// row 1
      text: {
        // text: '21,800.00',
        text: formatFloat(props.k_con_mg_kg),
        fontSize: 8,
        alignment: "right",
      }
    },
    {// row 1
      text: {
        // text: '0.00',
        text: '',
        fontSize: 8,
        alignment: "right",
      }
    },
    {// row 1
      text: {
        // text: '0.00',
        text: formatFloat(props.tfs),
        fontSize: 8,
        alignment: "right",
      }
    }, { text: '' }
  ]
}
const availableNutrientsGLiquidTableRow = (props) => {
  return [
    {// row 1

      text: {
        text: props.last_date_hauled ? props.last_date_hauled.split("T")[0] : '',
        fontSize: 8,
        alignment: 'center',
      }
    },
    {// row 
      text: {
        text: props.material_type,
        fontSize: 8,
      }
    },
    {// row 1
      text: {
        text: props.amount_hauled,
        fontSize: 8,
        alignment: "right",
      }
    },
    {// row 1
      text: {
        text: props.kn_con_mg_l,
        fontSize: 8,
        alignment: "right",
      }
    },
    {// row 1
      text: {
        text: props.nh4_con_mg_l,
        fontSize: 8,
        alignment: "right",
      }
    },
    {// row 1
      text: {
        text: props.nh3_con_mg_l,
        fontSize: 8,
        alignment: "right",
      }
    },
    {// row 1
      text: {
        text: props.no3_con_mg_l,
        fontSize: 8,
        alignment: "right",
      }
    },
    {// row 1
      text: {
        text: props.p_con_mg_l,
        fontSize: 8,
        alignment: "right",
      }
    },
    {// row 1
      text: {
        text: props.k_con_mg_l,
        fontSize: 8,
        alignment: "right",
      }
    },
    {// row 1
      text: {
        text: props.ec_umhos_cm,
        fontSize: 8,
        alignment: "right",
      }
    },
    {// row 1
      headlineLevel: "rowAvailableNutrientsGLiquidTableRow",
      text: {
        headlineLevel: "rowAvailableNutrientsGLiquidTableRow",
        text: props.tds,
        fontSize: 8,
        alignment: "right",
      }
    }, { text: '' }
  ]
}
const availableNutrientsG = (props) => {
  let exportSolidRows = props.dry.map(row => {
    return availableNutrientsGSolidTableRow(row)
  })
  let exportLiquidRows = props.process.map(row => {
    return availableNutrientsGLiquidTableRow(row)
  })



  const _solidTable = {
    margin: [10, 5, 0, 0],
    table: {
      widths: ['10%', '15%', '10%', '10%', '9%', '15%', '6%', '6%', '6%', '8%', '5%', '*'],
      body: [
        [
          {
            fillColor: gray,
            text: {
              text: "Date", fontSize: 9,
            }
          },
          {
            fillColor: gray,
            text: {
              text: "Material type", fontSize: 9,
            }
          },
          {
            fillColor: gray,
            text: {
              text: "Quantity", fontSize: 9,
            }
          },
          {
            fillColor: gray,
            text: {
              text: "Reporting basis", fontSize: 8,
            }
          },
          {
            fillColor: gray,
            text: {
              text: "Moisture (%)", fontSize: 8,
            }
          },
          {
            fillColor: gray,
            text: {
              text: "Density (lbs/cu ft)", fontSize: 8,
            }
          },
          {
            fillColor: gray,
            text: {
              text: "N (mg/kg)", fontSize: 8,
            }
          },
          {
            fillColor: gray,
            text: {
              text: "P (mg/kg)", fontSize: 8,
            }
          },
          {
            fillColor: gray,
            text: {
              text: "K (mg/kg)", fontSize: 8,
            }
          },

          {
            fillColor: gray,
            text: {
              text: "Salt (mg/kg)", fontSize: 8,
            }
          },
          {
            fillColor: gray,
            text: {
              text: "TFS (%)", fontSize: 8,
            }
          },
        ],
        ...exportSolidRows
      ]
    }
  }

  const _liquidTable = {
    margin: [10, 5, 0, 0],
    table: {
      widths: ['10%', '15%', '10%', '10%', '9%', '15%', '6%', '6%', '6%', '8%', '5%', '*'],
      body: [
        [
          {
            fillColor: gray,
            text: {
              text: "Date", fontSize: 9,
            }
          },
          {
            fillColor: gray,
            text: {
              text: "Material type", fontSize: 9,
            }
          },
          {
            fillColor: gray,
            text: {
              text: "Quantity", fontSize: 9,
            }
          },
          {
            fillColor: gray,
            text: {
              text: "Kjeldahl-N (mg/L)", fontSize: 8,
            }
          },
          {
            fillColor: gray,
            text: {
              text: "Ammonium-N (mg/L)", fontSize: 8,
            }
          },
          {
            fillColor: gray,
            text: {
              text: "Ammonia-N (mg/L)", fontSize: 8,
            }
          },
          {
            fillColor: gray,
            text: {
              text: "Nitrate-N (mg/L)", fontSize: 8,
            }
          },
          {
            fillColor: gray,
            text: {
              text: "P (mg/L)", fontSize: 8,
            }
          },
          {
            fillColor: gray,
            text: {
              text: "K (mg/L)", fontSize: 8,
            }
          },

          {
            fillColor: gray,
            text: {
              text: "EC (µmhos/cm)", fontSize: 8,
            }
          },
          {
            fillColor: gray,
            text: {
              text: "TDS (mg/L)", fontSize: 8,
            }
          },
        ],
        ...exportLiquidRows,
      ]
    }
  }


  const solidTable = exportSolidRows.length > 0 ? _solidTable : { margin: [10, 5], border: [false, false], colSpan: 11, text: { text: 'No solid exports entered.', fontSize: 7, italics: true } }
  const liquidTable = exportLiquidRows.length > 0 ? _liquidTable : { margin: [10, 5], border: [false, false], colSpan: 11, text: { text: 'No liquid exports entered.', fontSize: 7, italics: true } }

  return {
    // pageBreak: 'before', // super useful soltion just dont need on the first one
    stack: [
      {
        table: {
          widths: ['*'],
          body: [
            [{// row 1
              border: [false, false, false, false],
              text: {
                text: 'G. NUTRIENT EXPORTS:', bold: true, fontSize: 9,
              }
            },
            ],
          ]
        },

      },
      solidTable,
      liquidTable,
      {
        margin: [10, 5, 5, 10],
        table: {
          widths: ['25%', '10%', '10%', '10%', '10%', '34%',],
          body: [
            [
              {// row 
                fillColor: gray,
                text: {
                  text: 'Material Type', fontSize: 9,
                }
              },
              {// row 1
                fillColor: gray,
                text: {
                  text: 'N (%)', fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                fillColor: gray,
                text: {
                  text: 'P (%)', fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                fillColor: gray,
                text: {
                  text: 'K (%)', fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                fillColor: gray,
                text: {
                  text: 'Salt (%)', fontSize: 9,
                  alignment: 'right',
                }
              },
            ],

            [
              {// row 
                text: {
                  text: 'Dry Manure', fontSize: 9,
                }
              },
              {// row 1
                text: {
                  text: formatFloat(props.dryTotal[0]), fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                text: {
                  text: formatFloat(props.dryTotal[1]), fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                text: {
                  text: formatFloat(props.dryTotal[2]), fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                text: {
                  text: formatFloat(props.dryTotal[3]), fontSize: 9,
                  alignment: 'right',
                }
              },
            ],
            [
              {// row 
                text: {
                  text: 'Process wastewater', fontSize: 9,
                }
              },
              {// row 1
                text: {
                  text: formatFloat(props.processTotal[0]), fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                text: {
                  text: formatFloat(props.processTotal[1]), fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                text: {
                  text: formatFloat(props.processTotal[2]), fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                text: {
                  text: formatFloat(props.processTotal[3]), fontSize: 9,
                  alignment: 'right',
                }
              },
            ],
            [
              {// row 
                fillColor: gray,
                text: {
                  text: 'Total Import for all materials', fontSize: 9,
                }
              },
              {// row 1
                fillColor: gray,
                text: {
                  text: formatFloat(props.total[0]), fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                fillColor: gray,
                text: {
                  text: formatFloat(props.total[1]), fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                fillColor: gray,
                text: {
                  text: formatFloat(props.total[2]), fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                fillColor: gray,
                text: {
                  text: formatFloat(props.total[3]), fontSize: 9,
                  alignment: 'right',

                }
              },
            ],

          ]
        }
      },
    ]
  }
}


const applicationAreaATableRow = (props) => {
  // console.log(props)
  return [
    { // row 1
      text: props.title, fontSize: 8
    },
    { // row 1
      text: props.acres, fontSize: 8,
      alignment: 'right',
    },
    { // row 1
      text: props.cropable, fontSize: 8,
      alignment: 'right',
    },
    { // row 1
      text: props.harvest_count, fontSize: 8,
      alignment: 'right',
    },
    { // row 1
      text: props.waste_type, fontSize: 8
    },
    { // row 1
      text: props.parcels.join(" "), fontSize: 8
    }, { text: '' }
  ]
}
const applicationAreaA = (props) => {

  let rows = props && typeof props.fields === typeof [] ? props.fields.map(row => {
    return applicationAreaATableRow(row)
  }) : []

  const _table = {
    width: "*",
    table: {
      widths: ["25%", "10%", "10%", "10%", "20%", "25%", '*'],
      body: [
        [
          { // row 1
            fillColor: gray,
            text: 'Field Name', fontSize: 8
          },
          { // row 1
            fillColor: gray,
            text: 'Controlled acres', fontSize: 8
          },
          { // row 1
            fillColor: gray,
            text: 'Cropable acres', fontSize: 8
          },
          { // row 1
            fillColor: gray,
            text: 'Total harvests', fontSize: 8
          },
          { // row 1
            fillColor: gray,
            text: 'Type of waste applied', fontSize: 8
          },
          { // row 1
            fillColor: gray,
            text: 'Parcel Number', fontSize: 8
          },
        ],
        ...rows,
        [
          { // row 1
            fillColor: gray,
            text: 'Totals for areas that were used for applications', fontSize: 7
          },
          { // row 1
            fillColor: gray,
            text: props.total_for_apps[0], fontSize: 8,
            alignment: 'right'
          },
          { // row 1
            fillColor: gray,
            text: props.total_for_apps[1], fontSize: 8,
            alignment: 'right'
          },
          { // row 1
            fillColor: gray,
            text: props.total_for_apps[2], fontSize: 8,
            alignment: 'right'
          },
          { // row 1
            fillColor: gray,
            text: '', fontSize: 8
          },
          { // row 1
            fillColor: gray,
            text: '', fontSize: 8
          },
        ],
        [
          { // row 1
            fillColor: gray,
            text: 'Totals for areas that were not used for applications', fontSize: 7
          },
          { // row 1
            fillColor: gray,
            text: props.total_NOT_for_apps[0], fontSize: 8,
            alignment: 'right'
          },
          { // row 1
            fillColor: gray,
            text: props.total_NOT_for_apps[1], fontSize: 8,
            alignment: 'right'
          },
          { // row 1
            fillColor: gray,
            text: props.total_NOT_for_apps[2], fontSize: 8,
            alignment: 'right'
          },
          { // row 1
            fillColor: gray,
            text: '', fontSize: 8
          },
          { // row 1
            fillColor: gray,
            text: '', fontSize: 8
          },
        ],
        [
          { // row 1
            fillColor: gray,
            text: 'Land application area totals', fontSize: 7
          },
          { // row 1
            fillColor: gray,
            text: props.total_app_area[0], fontSize: 8,
            alignment: 'right'
          },
          { // row 1
            fillColor: gray,
            text: props.total_app_area[1], fontSize: 8,
            alignment: 'right'
          },
          { // row 1
            fillColor: gray,
            text: props.total_app_area[2], fontSize: 8,
            alignment: 'right'
          },
          { // row 1
            fillColor: gray,
            text: '', fontSize: 8
          },
          { // row 1
            fillColor: gray,
            text: '', fontSize: 8
          },
        ],
      ]
    }
  }

  const table = rows.length > 0 ? _table : { margin: [10, 5], text: { text: 'No land application areas entered.', italics: true, fontSize: 7 } }
  return {
    pageBreak: 'before', // super useful soltion just dont need on the first one

    stack: [
      {
        table: {
          widths: ['100%', '*'],
          body: [
            [{

              text: 'APPLICATION AREA', alignment: 'center', fontSize: 10
            }, { text: '', border: [false, false, false, false], }],
          ]
        }
      },
      {
        width: "98%",
        table: {
          widths: ['98%'],
          body: [
            [{// row 1
              border: [false, false, false, false],
              text: {
                text: 'A. LIST OF LAND APPLICATION AREAS:', bold: true, fontSize: 9,
              }
            },
            ]
          ]
        }
      },
      {
        margin: [10, 0, 0, 10],
        columns: [
          table
        ]
      },
    ]
  }
}
const applicationAreaBFieldHarvestTableSubTableRow = (props) => {
  const harvest_date = props.harvest_date ? props.harvest_date.split('T')[0] : ''
  return [
    {
      text: {
        text: harvest_date,
        fontSize: 8,
      }
    },
    {
      text: {
        text: `${props.actual_yield} tons`,
        fontSize: 8,
      }
    },
    {
      text: {
        text: props.method_of_reporting,
        fontSize: 8,
      }
    },
    {
      text: {
        text: '',
        fontSize: 8,
      }
    },
    {
      text: {
        text: `${props.actual_moisture}%`,
        fontSize: 8,
      }
    },
    {
      text: {
        text: props.actual_n,
        fontSize: 8,
      }
    },
    {
      text: {
        text: props.actual_p,
        fontSize: 8,
      }
    },
    {
      text: {
        text: props.actual_k,
        fontSize: 8,
      }
    },
    {
      text: {
        text: '',
        fontSize: 8,
      }
    },
    {
      text: {
        text: `${props.tfs}%`,
        fontSize: 8,
      }
    },
  ]
}
// For each field, this shows each crops plant date, and corresponding harvests
const applicationAreaBFieldHarvestTableSubTable = (props) => {
  let cropHeader = props.harvests && props.harvests.length > 0 ? props.harvests[0] : {}
  let plant_date = cropHeader.plant_date ? cropHeader.plant_date.split("T")[0] : 'No date entered'

  let rows = props.harvests.map(harvestEvent => {
    return applicationAreaBFieldHarvestTableSubTableRow(harvestEvent)
  })
  return [{
    margin: [5, 1, 5, 0],
    border: [true, false, true, false],
    colSpan: 2,

    table: {
      widths: ['98%'],
      body: [
        [
          {
            fillColor: gray,
            text: {
              text: `${plant_date} ${cropHeader.croptitle}`,
              fontSize: 9,
            }
          }
        ],
        [
          {
            border: [true, false, true, false],

            table: {
              widths: ['5%', '50%', '10%', '10%', '10%', '10%',],
              body: [
                [
                  {
                    border: [false, false, false, false],
                    text: {
                      text: 'Crop:',
                      fontSize: 8,
                      alignment: 'left',
                    }
                  },
                  {
                    border: [false, false, false, true],
                    text: {
                      text: cropHeader.croptitle,
                      fontSize: 8,
                    }
                  },
                  {
                    border: [false, false, false, false],
                    text: {
                      text: 'Acres planted:',
                      fontSize: 8,
                    }
                  },
                  {
                    border: [false, false, false, true],
                    text: {
                      text: cropHeader.acres_planted,
                      fontSize: 8,
                    }
                  },
                  {
                    border: [false, false, false, false],
                    text: {
                      text: 'Plant date:',
                      fontSize: 8,
                    }
                  },
                  {
                    border: [false, false, false, true],
                    text: {
                      text: plant_date,
                      fontSize: 8,
                    }
                  }

                ]
              ]
            }
          }
        ],
        [
          {
            border: [true, false, true, false],
            table: {
              widths: ['10%', '10%', '10%', '12%', '9%', '9%', '10%', '10%', '10%', '9%'],
              body: [
                [
                  {
                    fillColor: gray,
                    text: {
                      text: 'Harvest date',
                      fontSize: 8
                    }
                  },
                  {
                    fillColor: gray,
                    text: {
                      text: 'Yield',
                      fontSize: 8
                    }
                  },
                  {
                    fillColor: gray,
                    text: {
                      text: 'Reporting Basis',
                      fontSize: 8
                    }
                  },
                  {
                    fillColor: gray,
                    text: {
                      text: 'Density (lbs/cu ft)',
                      fontSize: 8
                    }
                  },
                  {
                    fillColor: gray,
                    text: {
                      text: 'Moisture (%)',
                      fontSize: 8
                    }
                  },
                  {
                    fillColor: gray,
                    text: {
                      text: 'N (mg/kg)',
                      fontSize: 8
                    }
                  },
                  {
                    fillColor: gray,
                    text: {
                      text: 'P (mg/kg)',
                      fontSize: 8
                    }
                  },
                  {
                    fillColor: gray,
                    text: {
                      text: 'K (mg/kg)',
                      fontSize: 8
                    }
                  },
                  {
                    fillColor: gray,
                    text: {
                      text: 'Salt (mg/kg)',
                      fontSize: 8
                    }
                  },
                  {
                    fillColor: gray,
                    text: {
                      text: 'TFS (%)',
                      fontSize: 8
                    }
                  },
                ],
                ...rows,
              ]
            }
          }
        ],
        [
          {
            margin: [0, 0, 138, 0],
            border: [true, false, true, true],
            table: {
              widths: ['22%', '14%', '14%', '16%', '16%', '16%'],
              body: [
                [
                  {
                    text: {
                      text: '',
                      fontSize: 8,
                    },
                  },
                  {
                    fillColor: gray,
                    text: {
                      text: 'Yield (tons/acre)',
                      fontSize: 8,
                    },
                  },
                  {
                    fillColor: gray,
                    text: {
                      text: 'Total N (lbs/acre)',
                      fontSize: 8,
                    },
                  },
                  {
                    fillColor: gray,
                    text: {
                      text: 'Total P (lbs/acre)',
                      fontSize: 8,
                    },
                  },
                  {
                    fillColor: gray,
                    text: {
                      text: 'Total K (lbs/acre)',
                      fontSize: 8,
                    },
                  },
                  {
                    fillColor: gray,
                    text: {
                      text: 'Total Salt (lbs/acre)',
                      fontSize: 8,
                    },
                  },

                ],
                [
                  {
                    text: {
                      text: 'Anticipated harvest content',
                      fontSize: 8,
                    },
                  },
                  {
                    text: {
                      text: props.antiTotals[0],
                      fontSize: 8,
                    },
                  },
                  {
                    text: {
                      text: props.antiTotals[1],
                      fontSize: 8,
                    },
                  },
                  {
                    text: {
                      text: props.antiTotals[2],
                      fontSize: 8,
                    },
                  },
                  {
                    text: {
                      text: props.antiTotals[3],
                      fontSize: 8,
                    },
                  },
                  {
                    text: {
                      text: props.antiTotals[4],
                      fontSize: 8,
                    },
                  },
                ],
                [
                  {
                    border: [true, true, true, true],
                    text: {
                      text: 'Total actual harvest content',
                      fontSize: 8,
                    },
                  },
                  {
                    border: [true, true, true, true],
                    text: {
                      text: props.totals[0],
                      fontSize: 8,
                    },
                  },
                  {
                    border: [true, true, true, true],
                    text: {
                      text: props.totals[1],
                      fontSize: 8,
                    },
                  },
                  {
                    border: [true, true, true, true],
                    text: {
                      text: props.totals[2],
                      fontSize: 8,
                    },
                  },
                  {
                    border: [true, true, true, true],
                    text: {
                      text: props.totals[3],
                      fontSize: 8,
                    },
                  },
                  {
                    border: [true, true, true, true],
                    text: {
                      text: props.totals[4],
                      fontSize: 8,
                    },
                  },
                ]
              ]
            }
          }
        ]
      ]
    }
  }]
}
const applicationAreaBFieldHarvestTable = (props) => {
  // list of objects
  let allHarvestEvents = Object.keys(props).map(key => props[key]) // Key: Plant_date, now this is a list of {antiTotals, harvests, totals}
  let headerEvent = allHarvestEvents && allHarvestEvents.length > 0 ? allHarvestEvents[0] : {} // Neeed for information about field, {antiTotals, harvests, totals}
  let headerEventHarvestInfo = headerEvent && headerEvent.harvests && headerEvent.harvests.length > 0 ? headerEvent.harvests[0] : {} // First harvest objects in

  let events = allHarvestEvents.map(event => {
    return applicationAreaBFieldHarvestTableSubTable(event) // returns list of table objects Header: plantdate: crop title
  })

  let body = [
    [
      {
        border: [true, true, false, true],
        fillColor: gray,
        text: {
          text: headerEventHarvestInfo.fieldtitle,
          fontSize: 10,
        }
      }, { text: '', fillColor: gray, border: [false, true, true, true] } // empty cell

    ],
    [
      {
        border: [true, false, false, false],
        text: {
          text: 'Field name:',
          fontSize: 10,
          alignment: 'right'
        }
      },
      {
        border: [false, false, true, true],
        text: {
          text: headerEventHarvestInfo.fieldtitle,
          fontSize: 9,
        }
      }
    ],
    ...events,
    [{ text: '', border: [true, false, false, true] }, { text: '', border: [false, false, true, true] }] // empty row
  ]

  return {
    margin: [10, 0, 0, 10],
    table: {
      widths: ['8%', '90%'],
      body: body
    }
  }  
}
const applicationAreaB = (props) => {

  // stack of table for each field
  let harvestTable = Object.keys(props.groupedHarvests).map(key => {
    return applicationAreaBFieldHarvestTable(props.groupedHarvests[key]) // returns a table for a field with multiple field harvest events
  })


  harvestTable = harvestTable.length > 0 ? harvestTable : [{ margin: [10, 5], border: [false, false], text: { text: 'No harvests entered.', fontSize: 7, italics: true } }]
  return {
    pageBreak: 'before', // super useful soltion just dont need on the first one
    stack: [
      {
        table: {
          widths: ['*'],
          body: [
            [
              {// row 1
                border: [false, false, false, false],
                text: {
                  text: 'B. CROPS AND HARVETS:', bold: true, fontSize: 9,
                }
              },
            ],
          ]
        }
      },
      ...harvestTable,
    ]
  }
}


const nutrientBudgetBTable = (props, img, i) => {
  let plant_date = props.headerInfo && props.headerInfo.plant_date ? props.headerInfo.plant_date.split('T')[0] : ''

  // Format values
  props = Object.fromEntries(Object.keys(props).map(key => {
    let val = props[key]
    if ([
      'soils',
      'plows',
      'fertilizers',
      'manures',
      'wastewaters',
      'freshwaters',
      'anti_harvests',
      'actual_harvests',
      'freshwater_app',
      'wastewater_app',
      'total_app',
      'total_app',
      'nutrient_bal',
      'nutrient_bal_ratio',].indexOf(key) >= 0) {
      return [key, val.map(l => formatFloat(l))]
    }
    return [key, val]
  }))

  return {
    columns: [
      {// Main Table
        pageBreak: i === 0 ? '' : 'before',
        table: {
          widths: ['98%'],
          body: [
            [{// 1st row header
              fillColor: gray,
              text: {
                text: `${props.headerInfo.fieldtitle} - ${plant_date}: ${props.headerInfo.croptitle}`,
                fontSize: 9,
              }
            }],
            [{
              border: [true, false, true, false],
              table: {
                widths: ['8%', '15%', '5%', '15%', '8%', '15%'],
                body: [
                  [
                    {
                      border: [false, false, false, false],
                      text: {
                        text: 'Field name:', fontSize: 8,
                      }
                    },
                    {
                      border: [false, false, false, true],
                      text: {
                        text: props.headerInfo.fieldtitle, fontSize: 8,
                      }
                    },
                    {
                      border: [false, false, false, false],
                      text: {
                        text: 'Crop:', fontSize: 8,
                      }
                    },
                    {
                      border: [false, false, false, true],
                      text: {
                        text: props.headerInfo.croptitle, fontSize: 8,
                      }
                    },
                    {
                      border: [false, false, false, false],
                      text: {
                        text: 'Plant date:', fontSize: 8,
                      }
                    },
                    {
                      border: [false, false, false, true],
                      text: {
                        text: plant_date, fontSize: 8,
                      }
                    },
                  ]
                ]
              }
            }],
            [{
              border: [true, false, true, false],
              columns: [
                image(img, 575, 180),
              ]
            }
            ],
            [
              {
                border: [true, false, true, true],
                columns: [
                  {
                    width: "60%",
                    table: {
                      widths: ["40%", "15%", "15%", "15%", "15%"],
                      body: [
                        [
                          {
                            text: {
                              text: '', fontSize: 8,
                            }
                          },
                          {
                            fillColor: gray,
                            text: {
                              text: 'Total N (lbs/acre)', fontSize: 8,
                            }
                          },
                          {
                            fillColor: gray,
                            text: {
                              text: 'Total P (lbs/acre)', fontSize: 8,
                            }
                          },
                          {
                            fillColor: gray,
                            text: {
                              text: 'Total K (lbs/acre)', fontSize: 8,
                            }
                          },
                          {
                            fillColor: gray,
                            text: {
                              text: 'Total salt (lbs/acre)', fontSize: 8,
                            }
                          },
                        ],
                        [
                          {
                            border: [true, false, true, false],
                            text: {
                              text: 'Existing soil nutrient content', fontSize: 8,
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.soils[0], fontSize: 8,
                            }
                          },

                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.soils[1], fontSize: 8,
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.soils[2], fontSize: 8,
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.soils[3], fontSize: 8,
                            }
                          },

                        ],
                        [
                          {
                            border: [true, false, true, false],
                            text: {
                              text: 'Plowdown credit', fontSize: 8,
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.plows[0], fontSize: 8,
                            }
                          },

                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.plows[1], fontSize: 8,
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.plows[2], fontSize: 8,
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.plows[3], fontSize: 8,
                            }
                          },
                        ],
                        [
                          {
                            border: [true, false, true, false],
                            text: {
                              text: 'Commerical fertilizer / Other', fontSize: 7,
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.fertilizers[0], fontSize: 8,
                            }
                          },

                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.fertilizers[1], fontSize: 8,
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.fertilizers[2], fontSize: 8,
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.fertilizers[3], fontSize: 8,
                            }
                          },
                        ],
                        [
                          {
                            border: [true, false, true, false],
                            text: {
                              text: 'Dry manure', fontSize: 8,
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.manures[0], fontSize: 8,
                            }
                          },

                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.manures[1], fontSize: 8,
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.manures[2], fontSize: 8,
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.manures[3], fontSize: 8,
                            }
                          },
                        ],
                        [
                          {
                            border: [true, false, true, false],
                            text: {
                              text: 'Process wastewater', fontSize: 8,
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.wastewaters[0], fontSize: 8,
                            }
                          },

                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.wastewaters[1], fontSize: 8,
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.wastewaters[2], fontSize: 8,
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.wastewaters[3], fontSize: 8,
                            }
                          },
                        ],
                        [
                          {
                            border: [true, false, true, false],
                            text: {
                              text: 'Fresh water', fontSize: 8,
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.freshwaters[0], fontSize: 8,
                            }
                          },

                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.freshwaters[1], fontSize: 8,
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.freshwaters[2], fontSize: 8,
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.freshwaters[3], fontSize: 8,
                            }
                          },
                        ],
                        [
                          {
                            border: [true, false, true, true],
                            text: {
                              text: 'Atmospheric deposition', fontSize: 8,
                            }
                          },
                          {
                            border: [true, false, true, true],
                            text: {
                              text: props.atmospheric_depo, fontSize: 8,
                            }
                          },

                          {
                            border: [true, false, true, true],
                            text: {
                              text: '0.00', fontSize: 8,
                            }
                          },
                          {
                            border: [true, false, true, true],
                            text: {
                              text: '0.00', fontSize: 8,
                            }
                          },
                          {
                            border: [true, false, true, true],
                            text: {
                              text: '0.00', fontSize: 8,
                            }
                          },
                        ],
                        [
                          {
                            border: [true, false, true, false],
                            text: {
                              text: 'Total nutrients applied', fontSize: 8,
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.total_app[0], fontSize: 8,
                            }
                          },

                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.total_app[1], fontSize: 8,
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.total_app[2], fontSize: 8,
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.total_app[3], fontSize: 8,
                            }
                          },
                        ],
                        [
                          {
                            border: [true, false, true, false],
                            text: {
                              text: 'Anticipated crop nutrient removal', fontSize: 8,
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.anti_harvests[0], fontSize: 8,
                            }
                          },

                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.anti_harvests[1], fontSize: 8,
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.anti_harvests[2], fontSize: 8,
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.anti_harvests[3], fontSize: 8,
                            }
                          },
                        ],
                        [
                          {
                            border: [true, false, true, true],
                            text: {
                              text: 'Actual crop nutrient removal', fontSize: 8,
                            }
                          },
                          {
                            border: [true, false, true, true],
                            text: {
                              text: props.actual_harvests[0], fontSize: 8,
                            }
                          },

                          {
                            border: [true, false, true, true],
                            text: {
                              text: props.actual_harvests[1], fontSize: 8,
                            }
                          },
                          {
                            border: [true, false, true, true],
                            text: {
                              text: props.actual_harvests[2], fontSize: 8,
                            }
                          },
                          {
                            border: [true, false, true, true],
                            text: {
                              text: props.actual_harvests[3], fontSize: 8,
                            }
                          },
                        ],
                        [
                          {
                            border: [true, false, true, false],
                            text: {
                              text: 'Nutrient balance', fontSize: 8,
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.nutrient_bal[0], fontSize: 8,
                            }
                          },

                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.nutrient_bal[1], fontSize: 8,
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.nutrient_bal[2], fontSize: 8,
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.nutrient_bal[3], fontSize: 8,
                            }
                          },
                        ],
                        [
                          {
                            border: [true, false, true, true],
                            text: {
                              text: 'Applied to removed ratio', fontSize: 8,
                            }
                          },
                          {
                            border: [true, false, true, true],
                            text: {
                              text: props.nutrient_bal_ratio[0], fontSize: 8,
                            }
                          },

                          {
                            border: [true, false, true, true],
                            text: {
                              text: props.nutrient_bal_ratio[1], fontSize: 8,
                            }
                          },
                          {
                            border: [true, false, true, true],
                            text: {
                              text: props.nutrient_bal_ratio[2], fontSize: 8,
                            }
                          },
                          {
                            border: [true, false, true, true],
                            text: {
                              text: props.nutrient_bal_ratio[3], fontSize: 8,
                            }
                          },
                        ],

                      ]
                    }
                  },
                  , {
                    width: "40%",
                    stack: [
                      {
                        table: {
                          widths: ['40%', '30%'],
                          body: [
                            [
                              {
                                fillColor: gray,
                                border: [true, true, false, true],
                                text: {
                                  text: 'Fresh water applied', fontSize: 8,
                                }
                              },
                              {
                                fillColor: gray,
                                border: [false, true, true, true], text: ''
                              }
                            ],
                            [
                              {
                                border: [true, false, false, false],
                                text: {
                                  text: props.freshwater_app[0], fontSize: 8,
                                  alignment: 'right',
                                }
                              },
                              {
                                border: [false, false, true, false],
                                text: {
                                  text: 'gallons', fontSize: 8,
                                  alignment: 'left', italics: true,
                                }
                              },
                            ],
                            [
                              {
                                border: [true, false, false, false],
                                text: {
                                  text: props.freshwater_app[1], fontSize: 8,
                                  alignment: 'right',
                                }
                              },
                              {
                                border: [false, false, true, false],
                                text: {
                                  text: 'acre-inches', fontSize: 8,
                                  alignment: 'left', italics: true,
                                }
                              },
                            ],
                            [
                              {
                                border: [true, false, false, true],
                                text: {
                                  text: props.freshwater_app[2], fontSize: 8,
                                  alignment: 'right',
                                }
                              },
                              {
                                border: [false, false, true, true],
                                text: {
                                  text: 'inces/acre', fontSize: 8,
                                  alignment: 'left', italics: true,
                                }
                              },
                            ],
                          ]
                        }
                      },
                      {
                        table: {
                          widths: ['40%', '30%'],
                          body: [
                            [
                              {
                                fillColor: gray,
                                border: [true, true, true, true],
                                colSpan: 2,
                                text: {
                                  text: 'Process  wastewater applied', fontSize: 8,
                                }
                              },
                              {
                                fillColor: gray,
                                border: [false, true, true, true], text: ''
                              }
                            ],
                            [
                              {
                                border: [true, false, false, false],
                                text: {
                                  text: props.wastewater_app[0], fontSize: 8,
                                  alignment: 'right',
                                }
                              },
                              {
                                border: [false, false, true, false],
                                text: {
                                  text: 'gallons', fontSize: 8,
                                  alignment: 'left', italics: true,
                                }
                              },
                            ],
                            [
                              {
                                border: [true, false, false, false],
                                text: {
                                  text: props.wastewater_app[1], fontSize: 8,
                                  alignment: 'right',
                                }
                              },
                              {
                                border: [false, false, true, false],
                                text: {
                                  text: 'acre-inches', fontSize: 8,
                                  alignment: 'left', italics: true,
                                }
                              },
                            ],
                            [
                              {
                                border: [true, false, false, true],
                                text: {
                                  text: props.wastewater_app[2], fontSize: 8,
                                  alignment: 'right',
                                }
                              },
                              {
                                border: [false, false, true, true],
                                text: {
                                  text: 'inces/acre', fontSize: 8,
                                  alignment: 'left', italics: true,
                                }
                              },
                            ],
                          ]
                        }
                      },
                      {
                        table: {
                          widths: ['40%', '30%'],
                          body: [
                            [
                              {
                                fillColor: gray,
                                border: [true, true, false, true],
                                text: {
                                  text: 'Total harvests for the crop', fontSize: 8,
                                }
                              },
                              {
                                fillColor: gray,
                                border: [false, true, true, true], text: ''
                              }
                            ],
                            [
                              {
                                border: [true, false, false, true],
                                text: {
                                  text: props.totalHarvests, fontSize: 8,
                                  alignment: 'right',
                                }
                              },
                              {
                                border: [false, false, true, true],
                                text: {
                                  text: 'harvest', fontSize: 8,
                                  alignment: 'left', italics: true,
                                }
                              },
                            ],
                          ]
                        }
                      },
                    ]
                  }
                ]
              }
            ]
          ]
        }
      }
    ]
  }
}
const nutrientBudgetA = (props) => {
  let tables = []
  Object.keys(props.allEvents).map(fieldIDKey => {
    let fieldAppsByPlantDate = props.allEvents[fieldIDKey]
    Object.keys(fieldAppsByPlantDate).map(plantDatekey => {
      let headerInfo = {}
      let rows = []

      Object.keys(fieldAppsByPlantDate[plantDatekey]).forEach(appKey => {
        let app = fieldAppsByPlantDate[plantDatekey][appKey]
        let appEventHeader = app && app.appDatesObjList && app.appDatesObjList.length > 0 ? app.appDatesObjList[0] : {}
        headerInfo = appEventHeader
        let totals = app.totals
        const innerRows = app.appDatesObjList.map(ev => {

          let unit = ev.tds ? 'gals' : 'tons'
          if (!ev.tds && !ev.tfs) {
            // commerical fertilizer
            //Check if it container the word liquid
            unit = ev.material_type.toLowerCase().includes('solid') || ev.material_type.toLowerCase().includes('dry') ? 'tons' : 'gals'
          }

          return [
            {
              text: {
                text: ev.src_desc ? ev.src_desc : ev.app_desc ? ev.app_desc : ev.material_type.toLowerCase().includes('commercial') ? 'Commercial' : ev.material_type, fontSize: 8,
              }

            },
            {
              text: {
                text: ev.material_type ? ev.material_type : ev.src_type, fontSize: 8,
              }
            },
            {
              text: {
                text: ev.n_lbs_acre, fontSize: 8,
              }
            },
            {
              text: {
                text: ev.p_lbs_acre, fontSize: 8,
              }
            },
            {
              text: {
                text: ev.k_lbs_acre, fontSize: 8,
              }
            },
            {
              text: {
                text: ev.salt_lbs_acre, fontSize: 8,
              }
            },
            {
              text: {
                text: `${ev.amount_applied} ${unit}`, fontSize: 8,
              }
            },
          ]
        })

        rows.push([// MainSubTable App_date/ method/ precip before during after... 
          {
            text: {
              text: appEventHeader.app_date ? appEventHeader.app_date.split('T')[0] : '', fontSize: 8,
            }
          },
          {
            text: {
              text: appEventHeader.app_method, fontSize: 8,
            }
          },
          {
            text: {
              text: appEventHeader.precip_before, fontSize: 8,
            }
          },
          {
            text: {
              text: appEventHeader.precip_during, fontSize: 8,
            }
          },
          {
            text: {
              text: appEventHeader.precip_after, fontSize: 8,
            }
          },
        ])
        rows.push([// sub table of MainSubTable
          {
            colSpan: 5,
            table: {
              widths: ['25%', '20%', '10%', '10%', '10%', '10%', '15%'],
              body: [
                [// header
                  {
                    fillColor: gray,
                    text: {
                      text: 'Source description', fontSize: 8,
                    }
                  },
                  {
                    fillColor: gray,
                    text: {
                      text: 'Material Type', fontSize: 8,
                    }
                  },
                  {
                    fillColor: gray,
                    text: {
                      text: 'N  (lbs/acre)', fontSize: 8,
                    }
                  },
                  {
                    fillColor: gray,
                    text: {
                      text: 'P (lbs/acre)', fontSize: 8,
                    }
                  },
                  {
                    fillColor: gray,
                    text: {
                      text: 'K (lbs/acre)', fontSize: 8,
                    }
                  },
                  {
                    fillColor: gray,
                    text: {
                      text: 'Salt (lbs/acre)', fontSize: 8,
                    }
                  },
                  {
                    fillColor: gray,
                    text: {
                      text: 'Amount', fontSize: 8,
                    }
                  },
                ],// rows
                ...innerRows,
                [// fotter totals
                  {
                    fillColor: gray,
                    text: {
                      text: 'Application event totals', fontSize: 8,
                    }
                  },
                  {
                    fillColor: gray,
                    text: {
                      text: ' ', fontSize: 8,
                    }
                  },
                  {
                    fillColor: gray,
                    text: {
                      text: totals[0], fontSize: 8,
                    }
                  },
                  {
                    fillColor: gray,
                    text: {
                      text: totals[1], fontSize: 8,
                    }
                  },
                  {
                    fillColor: gray,
                    text: {
                      text: totals[2], fontSize: 8,
                    }
                  },
                  {
                    fillColor: gray,
                    text: {
                      text: totals[3], fontSize: 8,
                    }
                  },
                  {
                    fillColor: gray,
                    text: {
                      text: " ", fontSize: 8,
                    }
                  },
                ],
              ]
            }
          }
        ])
      })

      tables.push({
        margin: [0, 5, 0, 5],
        columns: [
          {
            width: "98%",
            margin: [10, 0, 0, 0],
            table: {
              widths: ["100%"],
              body: [
                [ // each row is a table with  application dat table where ea row is a table of the entry
                  { // row 1
                    fillColor: gray,
                    // text: 'Field 1 - 11/01/01/2019: Oats, silage-soft dough',
                    text: `${headerInfo.fieldtitle} - ${headerInfo.plant_date ? headerInfo.plant_date.split('T')[0] : ''}: ${headerInfo.croptitle}`,
                    fontSize: 8
                  },
                ],
                [
                  {
                    stack: [
                      {
                        columns: [
                          {
                            table: {
                              widths: ["10%", '65%', '10%', '15%'],
                              body: [
                                [
                                  {
                                    border: [false, false, false, false],
                                    text: {
                                      text: 'Field name:', fontSize: 8,
                                    }
                                  },
                                  {
                                    border: [false, false, false, true],
                                    colSpan: 3,
                                    text: {
                                      text: headerInfo.fieldtitle, fontSize: 8,
                                    }
                                  }
                                ],
                                [
                                  {
                                    border: [false, false, false, false],
                                    text: {
                                      text: 'Crop:', fontSize: 8,
                                    }
                                  },
                                  {
                                    border: [false, false, false, true],
                                    text: {
                                      text: headerInfo.croptitle, fontSize: 8,
                                    }
                                  },
                                  {
                                    border: [false, false, false, false],
                                    text: {
                                      text: 'Plant date:', fontSize: 8,
                                      alignment: 'right',
                                    }
                                  },
                                  {
                                    border: [false, false, false, true],
                                    text: {
                                      text: headerInfo.plant_date ? headerInfo.plant_date.split('T')[0] : '', fontSize: 8,
                                    }
                                  }

                                ]
                              ]
                            }
                          }
                        ]
                      },
                      {
                        columns: [
                          {
                            margin: [0, 5, 0, 5],
                            table: {
                              widths: ["10%", '30%', '20%', '20%', '20%'],
                              body: [
                                [
                                  {
                                    fillColor: gray,
                                    text: {
                                      text: 'Application date', fontSize: 8,
                                    }
                                  },
                                  {
                                    fillColor: gray,
                                    text: {
                                      text: 'Application method', fontSize: 8,
                                    }
                                  },
                                  {
                                    fillColor: gray,
                                    text: {
                                      text: 'Precipitation 24 hours prior:', fontSize: 8,
                                    }
                                  },
                                  {
                                    fillColor: gray,
                                    text: {
                                      text: 'Precipitation during application', fontSize: 8,
                                    }
                                  },
                                  {
                                    fillColor: gray,
                                    text: {
                                      text: 'Precipitation 24 hours following', fontSize: 8,
                                    }
                                  }

                                ],
                                ...rows,
                              ]
                            }
                          }
                        ]
                      }
                    ]
                  }
                ],

              ]
            }
          }
        ]
      })
    })
  })

  let body = tables.length > 0 ? {
    margin: [0, 5, 0, 5],
    stack: [
      ...tables
    ]
  } : { margin: [10, 5], text: { text: 'No land application areas entered.', fontSize: 7, italics: true } }

  return {
    pageBreak: 'before', // super useful soltion just dont need on the first on
    stack: [
      {
        columns: [ // Header and first row - unindented
          {
            width: "98%",
            table: {
              widths: ['100%'],
              body: [
                [{
                  // border: [false, false, false, false],
                  text: 'Nutrient Budget', alignment: 'center', fontSize: 10
                }]
              ]
            }
          },
        ]
      },
      {
        columns: [
          {
            width: "98%",
            table: {
              widths: ['100%'],
              body: [
                [{// row 1
                  border: [false, false, false, false],
                  text: {
                    text: 'A. LAND APPLICATIONS:', bold: true, fontSize: 9,
                  }
                },
                ]
              ]
            }
          }
        ]
      },
      body
    ]
  }
}
const nutrientBudgetB = (props, images) => {
  // const tables = [nutrientBudgetBTable(props, images)]
  let allEvents = props && props.allEvents ? props.allEvents : {}

  let tables = Object.keys(allEvents).map((key, i) => {
    return nutrientBudgetBTable(allEvents[key], images[key], i)
  })

  tables = tables.length > 0 ? tables : [{ margin: [10, 5], text: { text: 'No applications entered.' }, italics: true, fontSize: 7 }]

  return {
    pageBreak: 'before',
    stack: [
      {
        columns: [
          {
            width: "98%",
            table: {
              widths: ['100%'],
              body: [
                [{// row 1
                  border: [false, false, false, false],
                  text: {
                    text: 'B. NUTRIENT BUDGET', bold: true, fontSize: 9,
                  }
                },
                ]
              ]
            }
          }
        ]
      },
      ...tables
    ]
  }
}

const nutrientAnalysisA = (props) => {

  let tables = props.map(analysis => {
    return {
      margin: [10, 0, 0, 5],
      table: {
        widths: ['100%'],
        body: [
          [
            {// row 1
              fillColor: gray,
              text: {
                text: analysis.sample_desc, bold: true, fontSize: 9,
              }
            },
          ],
          [
            {
              border: [true, false, true, false],
              table: {
                widths: ['25%', '75%'],
                body: [
                  [
                    {
                      border: [false, false, false, false],
                      text: {
                        text: "Sample source and description:", fontSize: 8,
                      }
                    },
                    {
                      border: [false, false, false, true],
                      text: {
                        text: analysis.sample_desc, fontSize: 8,
                      }
                    }
                  ],
                ]
              }
            }
          ],
          [
            {
              border: [true, false, true, false],
              table: {
                widths: ['8%', '10%', '8%', '10%', '13%', '15%', '13%', '15%'],
                body: [
                  [
                    {
                      border: [false, false, false, false],
                      text: {
                        text: "Sample date:", fontSize: 8,
                      }
                    },
                    {
                      border: [false, false, false, true],
                      text: {
                        text: analysis.sample_date ? analysis.sample_date.split('T')[0] : '', fontSize: 8,
                      }
                    },
                    {
                      border: [false, false, false, false],
                      text: {
                        text: "Material type:", fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      border: [false, false, false, true],
                      text: {
                        text: analysis.material_type, fontSize: 8,
                      }
                    },
                    {
                      border: [false, false, false, false],
                      text: {
                        text: "Source of analysis:", fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      border: [false, false, false, true],
                      text: {
                        text: analysis.src_of_analysis, fontSize: 8,
                      }
                    },
                    {
                      border: [false, false, false, false],
                      text: {
                        text: "Method of Reporting:", fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      border: [false, false, false, true],
                      text: {
                        text: analysis.method_of_reporting, fontSize: 8,
                      }
                    }
                  ],
                ]
              }
            }
          ],
          [
            {
              border: [true, false, true, false],
              table: {
                widths: ['5%', '10%'],
                body: [
                  [
                    {
                      border: [false, false, false, false],
                      text: {
                        text: "Moisture:", fontSize: 8,
                      }
                    },
                    {
                      border: [false, false, false, true],
                      text: {
                        text: `${analysis.moisture}%`, fontSize: 8,
                        alignment: 'right',
                      }
                    }
                  ],
                ]
              }
            }
          ],
          [
            {
              border: [true, false, true, true],
              table: {
                widths: ['5%', '10%', '10%', '10%', '10%', '10%', '10%', '10%', '10%', '10%', '5%',],
                body: [
                  [
                    {
                      text: {
                        text: "", fontSize: 8,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "Total N (mg/kg)", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "Total P (mg/kg)", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "Total K (mg/kg)", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "Calcium (mg/kg)", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "Magnesium (mg/kg)", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "Sodium (mg/kg)", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "Sulfur (mg/kg)", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "Chloride (mg/kg)", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "Total Salt (mg/kg)", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "TFS(%)", fontSize: 7,
                      }
                    }
                  ],
                  [
                    {
                      text: {
                        text: "Value", fontSize: 8, bold: true,
                      }
                    },
                    {
                      text: {
                        text: analysis.n_con, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: analysis.p_con, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: analysis.k_con, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: analysis.ca_con, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: analysis.mg_con, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: analysis.na_con, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: analysis.s_con, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: analysis.cl_con, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: " ", fontSize: 7,
                      }
                    },
                    {
                      text: {
                        text: analysis.tfs, fontSize: 7,
                        alignment: 'right',
                      }
                    }
                  ],
                  [
                    {
                      text: {
                        text: "DL", fontSize: 8, bold: true,
                      }
                    },
                    {
                      text: {
                        text: analysis.n_dl, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: analysis.p_dl, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: analysis.k_dl, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: analysis.ca_dl, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: analysis.mg_dl, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: analysis.na_dl, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: analysis.s_dl, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: analysis.cl_dl, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: " ", fontSize: 7,
                      }
                    },
                    {
                      text: {
                        text: analysis.tfs_dl, fontSize: 7,
                        alignment: 'right',
                      }
                    }
                  ],
                ]
              }
            }
          ]

        ]
      }
    }
  })

  tables = tables.length > 0 ? tables : [{ margin: [10, 5], text: { text: 'No manure analyses entered.', fontSize: 7, italics: true } }]
  return {
    pageBreak: 'before', // super useful soltion just dont need on the first on
    stack: [
      {
        width: "98%",
        table: {
          widths: ['100%'],
          body: [
            [{
              // border: [false, false, false, false],
              text: 'Nutrient Analyses', alignment: 'center', fontSize: 10
            }]
          ]
        }
      },
      {
        width: "98%",
        table: {
          widths: ['100%'],
          body: [
            [{
              border: [false, false, false, false],
              // border: [false, false, false, false],
              text: 'A. Manure Analyses', fontSize: 10, bold: true,
            }]
          ]
        }
      },
      ...tables



    ]
  }
}
const nutrientAnalysisB = (props) => {

  let tables = props.map((analysis, i) => {
    return {
      headlineLevel: `processWastewaterAnalyses${i}`,
      margin: [10, 0, 0, 5],
      table: {
        widths: ['98%'],
        body: [
          [
            {// row 1
              fillColor: gray,
              text: {
                text: analysis.sample_desc, bold: true, fontSize: 9,
              }
            },
          ],
          [
            {
              border: [true, false, true, false],
              table: {
                widths: ['25%', '73%'],
                body: [
                  [
                    {
                      border: [false, false, false, false],
                      text: {
                        text: "Sample source and description:", fontSize: 8,
                      }
                    },
                    {
                      border: [false, false, false, true],
                      text: {
                        text: analysis.sample_desc, fontSize: 8,
                      }
                    }
                  ],
                ]
              }
            }
          ],
          [
            {
              border: [true, false, true, false],
              table: {
                widths: ['8%', '10%', '8%', '10%', '13%', '15%', '8%', '8%'],
                body: [
                  [
                    {
                      border: [false, false, false, false],
                      text: {
                        text: "Sample date:", fontSize: 8,
                      }
                    },
                    {
                      border: [false, false, false, true],
                      text: {
                        text: analysis.sample_date ? analysis.sample_date.split('T')[0] : '', fontSize: 8,
                      }
                    },
                    {
                      border: [false, false, false, false],
                      text: {
                        text: "Material type:", fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      border: [false, false, false, true],
                      text: {
                        text: analysis.material_type, fontSize: 8,
                      }
                    },
                    {
                      border: [false, false, false, false],
                      text: {
                        text: "Source of analysis:", fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      border: [false, false, false, true],
                      text: {
                        text: analysis.sample_data_src, fontSize: 8,
                      }
                    },
                    {
                      border: [false, false, false, false],
                      text: {
                        text: "pH:", fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      border: [false, false, false, true],
                      text: {
                        text: analysis.ph, fontSize: 8,
                      }
                    }
                  ],
                ]
              }
            }
          ],
          [
            { // 16 cols, 18% dist
              border: [true, false, true, true],
              table: {
                widths: ['4%', '8%', '6%', '6%', '6%', '6%', '6%', '6%', '6%', '6%', '5%', '5%', '6%', '6%', '8%', '5%'],
                body: [
                  [
                    {
                      text: {
                        text: "", fontSize: 8,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "Kjeldahl-N (mg/L)", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "NH4-N (mg/L)", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "NH3-N (mg/L)", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "Nitrate-N (mg/L)", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "Total P (mg/L)", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "Total K (mg/L)", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "Calcium (mg/L)", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "Magnes. (mg/L)", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "Sodium (mg/L)", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "Bicarb. (mg/L)", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "Carb, (mg/L)", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "Sulfate (mg/L)", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "Chloride (mg/L)", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "EC (µmhos/cm)", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "TDS (mg/L)", fontSize: 7,
                      }
                    },

                  ],
                  [
                    {
                      text: {
                        text: "Value", fontSize: 8, bold: true,
                      }
                    },
                    {
                      text: {
                        text: analysis.kn_con, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: analysis.nh4_con, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: analysis.nh3_con, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: analysis.no3_con, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: analysis.p_con, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: analysis.k_con, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: analysis.ca_con, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: analysis.mg_con, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: analysis.na_con, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: analysis.hco3_con, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: analysis.co3_con, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: analysis.so4_con, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: analysis.cl_con, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: analysis.ec, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: analysis.tds, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                  ],
                  [
                    {
                      text: {
                        text: "DL", fontSize: 8, bold: true,
                      }
                    },
                    {
                      text: {
                        text: analysis.kn_dl, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: analysis.nh4_dl, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: analysis.nh3_dl, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: analysis.no3_dl, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: analysis.p_dl, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: analysis.k_dl, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: analysis.ca_dl, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: analysis.mg_dl, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: analysis.na_dl, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: analysis.hco3_dl, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: analysis.co3_dl, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: analysis.so4_dl, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: analysis.cl_dl, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: analysis.ec_dl, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                    {
                      headlineLevel: `processWastewaterAnalyses${i}`,
                      text: {
                        text: analysis.tds_dl, fontSize: 7,
                        alignment: 'right',
                      }
                    },
                  ],
                ]
              }
            }
          ]

        ]
      }
    }
  })
  tables = tables.length > 0 ? tables : [{ margin: [10, 5], text: { text: 'No process wastewater analyses entered.', fontSize: 7, italics: true } }]
  return {
    // pageBreak: 'before', // super useful soltion just dont need on the first on
    stack: [
      {
        width: "98%",
        table: {
          widths: ['98%'],
          body: [
            [{
              border: [false, false, false, false],
              // border: [false, false, false, false],
              text: 'B. PROCESS WASTEWATER ANALYSES', fontSize: 10, bold: true,
            }]
          ]
        }
      },
      ...tables



    ]
  }
}
const nutrientAnalysisC = (props) => {

  const subTable = (props, i) => {
    return [
      {
        border: [true, false, true, false],
        table: {
          widths: ['20%', '73%'],
          body: [
            [
              {
                border: [true, true, false, true],
                fillColor: gray,
                text: {
                  text: props.sample_desc, alignment: 'left',
                  fontSize: 9,
                }
              },
              {
                border: [false, true, true, true],
                fillColor: gray,
                text: ' '
              }
            ],
            [
              {
                border: [true, false, false, false],
                text: {
                  text: "Sample source and description:", fontSize: 8, alignment: 'right'
                }
              },
              {
                border: [false, false, true, true],
                text: {
                  text: props.sample_desc, fontSize: 8,
                  alignment: 'left'
                }
              }
            ],
            [
              {
                colSpan: 2,
                border: [true, false, true, false],
                table: {
                  widths: ['21%', '10%', '13%', '15%',],
                  body: [
                    [
                      {
                        border: [false, false, false, false],
                        text: {
                          text: "Sample date:", fontSize: 8,
                          alignment: 'right',
                        }
                      },
                      {
                        border: [false, false, false, true],
                        text: {
                          text: props.sample_date ? props.sample_date.split('T')[0] : '', fontSize: 8,
                        }
                      },
                      {
                        border: [false, false, false, false],
                        text: {
                          text: "Source of analysis:", fontSize: 8,
                          alignment: 'right',
                        }
                      },
                      {
                        border: [false, false, false, true],
                        text: {
                          text: props.src_of_analysis, fontSize: 8,
                        }
                      },
                    ],
                  ]
                }
              }, { text: ' ' }
            ],
            [
              {
                colSpan: 2,
                border: [true, false, true, true],
                table: {
                  widths: ['4%', '8%', '6%', '6%', '6%', '6%', '6%', '6%', '6%', '6%', '6%', '5%', '6%'],
                  body: [
                    [
                      {
                        text: {
                          text: "", fontSize: 8,
                        }
                      },
                      {
                        fillColor: gray,
                        text: {
                          text: "Total N (mg/L)", fontSize: 7,
                        }
                      },
                      {
                        fillColor: gray,
                        text: {
                          text: "NH4-N (mg/L)", fontSize: 7,
                        }
                      },
                      {
                        fillColor: gray,
                        text: {
                          text: "Nitrate-N (mg/L)", fontSize: 7,
                        }
                      },
                      {
                        fillColor: gray,
                        text: {
                          text: "Calcium (mg/L)", fontSize: 7,
                        }
                      },
                      {
                        fillColor: gray,
                        text: {
                          text: "Magnes. (mg/L)", fontSize: 7,
                        }
                      },
                      {
                        fillColor: gray,
                        text: {
                          text: "Sodium (mg/L)", fontSize: 7,
                        }
                      },
                      {
                        fillColor: gray,
                        text: {
                          text: "Bicarb. (mg/L)", fontSize: 7,
                        }
                      },
                      {
                        fillColor: gray,
                        text: {
                          text: "Carb, (mg/L)", fontSize: 7,
                        }
                      },
                      {
                        fillColor: gray,
                        text: {
                          text: "Sulfate (mg/L)", fontSize: 7,
                        }
                      },
                      {
                        fillColor: gray,
                        text: {
                          text: "Chloride (mg/L)", fontSize: 7,
                        }
                      },
                      {
                        fillColor: gray,
                        text: {
                          text: "EC (µmhos/cm)", fontSize: 7,
                        }
                      },
                      {
                        fillColor: gray,
                        text: {
                          text: "TDS (mg/L)", fontSize: 7,
                        }
                      },

                    ],
                    [
                      {
                        text: {
                          text: "Value", fontSize: 8, bold: true,
                        }
                      },
                      {
                        text: {
                          text: props.n_con, fontSize: 7,
                        }
                      },
                      {
                        text: {
                          text: props.nh4_con, fontSize: 7,
                        }
                      },
                      {
                        text: {
                          text: props.no2_con, fontSize: 7,
                        }
                      },
                      {
                        text: {
                          text: props.ca_con, fontSize: 7,
                        }
                      },
                      {
                        text: {
                          text: props.mg_con, fontSize: 7,
                        }
                      },
                      {
                        text: {
                          text: props.na_con, fontSize: 7,
                        }
                      },
                      {
                        text: {
                          text: props.hco3_con, fontSize: 7,
                        }
                      },
                      {
                        text: {
                          text: props.co3_con, fontSize: 7,
                        }
                      },
                      {
                        text: {
                          text: props.so4_con, fontSize: 7,
                        }
                      },
                      {
                        text: {
                          text: props.cl_con, fontSize: 7,
                        }
                      },
                      {
                        text: {
                          text: props.ec, fontSize: 7,
                        }
                      },
                      {
                        text: {
                          text: props.tds, fontSize: 7,
                        }
                      },
                    ],
                    [
                      {
                        text: {
                          text: "DL", fontSize: 8, bold: true,
                        }
                      },
                      {
                        text: {
                          text: props.n_dl, fontSize: 7,
                        }
                      },
                      {
                        text: {
                          text: props.nh4_dl, fontSize: 7,
                        }
                      },
                      {
                        text: {
                          text: props.no2_dl, fontSize: 7,
                        }
                      },
                      {
                        text: {
                          text: props.ca_dl, fontSize: 7,
                        }
                      },
                      {
                        text: {
                          text: props.mg_dl, fontSize: 7,
                        }
                      },
                      {
                        text: {
                          text: props.na_dl, fontSize: 7,
                        }
                      },
                      {
                        text: {
                          text: props.hco3_dl, fontSize: 7,
                        }
                      },
                      {
                        text: {
                          text: props.co3_dl, fontSize: 7,
                        }
                      },
                      {
                        text: {
                          text: props.so4_dl, fontSize: 7,
                        }
                      },
                      {
                        text: {
                          text: props.cl_dl, fontSize: 7,
                        }
                      },
                      {
                        text: {
                          text: props.ec_dl, fontSize: 7,
                        }
                      },
                      {
                        headlineLevel: `freshWaterAnalyses${i}`,
                        text: {
                          text: props.tds_dl, fontSize: 7,
                        }
                      },
                    ],
                  ]
                }
              }, { text: ' ' }
            ]
          ]
        }
      }
    ]
  }

  let tables = Object.keys(props).map((key, i) => {
    let analyses = props[key]
    let headerInfo = analyses && analyses[0] ? analyses[0] : {}
    const subTables = analyses.map((analysis) => {
      return subTable(analysis, i)
    })

    return {
      headlineLevel: `freshWaterAnalyses${i}`,
      margin: [10, 0, 0, 5],
      table: {
        widths: ['98%'],
        body: [
          [
            {// row 1
              fillColor: gray,
              text: {
                text: headerInfo.src_desc, bold: true, fontSize: 9,
              }
            },
          ],
          ...subTables,
          [
            {// row for bottom border
              border: [true, false, true, true],
              text: {
                text: '',
              }
            },
          ]
        ]
      }
    }
  })



  tables = tables.length > 0 ? tables : [{ margin: [10, 5], text: { text: 'No fresh water analyses entered.', fontSize: 7, italics: true } }]
  return {
    // pageBreak: 'before', // super useful soltion just dont need on the first on
    stack: [
      {
        width: "98%",
        table: {
          widths: ['98%'],
          body: [
            [{
              border: [false, false, false, false],
              // border: [false, false, false, false],
              text: 'C. FRESH WATER ANALYSES', fontSize: 10, bold: true,
            }]
          ]
        }
      },
      ...tables



    ]
  }
}
const nutrientAnalysisD = (props) => {
  const subTable = (props, i) => {
    return [
      {
        border: [true, false, true, false],
        table: {
          widths: ['20%', '73%'],
          body: [
            [
              {
                border: [true, true, false, true],
                fillColor: gray,
                text: {
                  text: props.sample_desc, alignment: 'left',
                  fontSize: 9,
                }
              },
              {
                border: [false, true, true, true],
                fillColor: gray,
                text: ' '
              }
            ],
            [
              {
                border: [true, false, false, false],
                text: {
                  text: "Sample source and description:", fontSize: 8, alignment: 'right'
                }
              },
              {
                border: [false, false, true, true],
                text: {
                  text: props.sample_desc, fontSize: 8,
                  alignment: 'left'
                }
              }
            ],
            [
              {
                colSpan: 2,
                border: [true, false, true, false],
                table: {
                  widths: ['21%', '10%', '13%', '15%',],
                  body: [
                    [
                      {
                        border: [false, false, false, false],
                        text: {
                          text: "Sample date:", fontSize: 8,
                          alignment: 'right',
                        }
                      },
                      {
                        border: [false, false, false, true],
                        text: {
                          text: props.sample_date ? props.sample_date.split('T')[0] : '', fontSize: 8,
                        }
                      },
                      {
                        border: [false, false, false, false],
                        text: {
                          text: "Source of analysis:", fontSize: 8,
                          alignment: 'right',
                        }
                      },
                      {
                        border: [false, false, false, true],
                        text: {
                          text: props.src_of_analysis, fontSize: 8,
                        }
                      },
                    ],
                  ]
                }
              }, { text: ' ' }
            ],
            [
              {
                colSpan: 2,
                border: [true, false, true, true],
                table: {
                  widths: ['8%', '16%', '12%', '12%', '12%', '12%', '12%', '12%'],
                  body: [
                    [
                      {
                        text: {
                          text: "", fontSize: 8,
                        }
                      },
                      {
                        fillColor: gray,
                        text: {
                          text: "Nitrate-N (mg/kg)", fontSize: 7,
                        }
                      },
                      {
                        fillColor: gray,
                        text: {
                          text: "Total P (mg/kg)", fontSize: 7,
                        }
                      },
                      {
                        fillColor: gray,
                        text: {
                          text: "Soluable P (mg/kg)", fontSize: 7,
                        }
                      },
                      {
                        fillColor: gray,
                        text: {
                          text: "K (mg/kg)", fontSize: 7,
                        }
                      },
                      {
                        fillColor: gray,
                        text: {
                          text: "EC (μmhos/cm)", fontSize: 7,
                        }
                      },
                      {
                        fillColor: gray,
                        text: {
                          text: "Organic matter (%)", fontSize: 7,
                        }
                      },
                      {
                        fillColor: gray,
                        text: {
                          text: "Total salt (mg/kg)", fontSize: 7,
                        }
                      }

                    ],
                    [
                      {
                        text: {
                          text: "Value", fontSize: 8, bold: true,
                        }
                      },
                      {
                        text: {
                          text: props.n_con, fontSize: 7,
                        }
                      },
                      {
                        text: {
                          text: props.total_p_con, fontSize: 7,
                        }
                      },
                      {
                        text: {
                          text: props.p_con, fontSize: 7,
                        }
                      },
                      {
                        text: {
                          text: props.k_con, fontSize: 7,
                        }
                      },
                      {
                        text: {
                          text: props.ec, fontSize: 7,
                        }
                      },
                      {
                        text: {
                          text: props.org_matter, fontSize: 7,
                        }
                      },
                      {
                        text: {
                          text: '', fontSize: 7,
                        }
                      },


                    ],
                    [
                      {
                        text: {
                          text: "DL", fontSize: 8, bold: true,
                        }
                      },
                      {
                        text: {
                          text: props.n_dl, fontSize: 7,
                        }
                      },
                      {
                        text: {
                          text: props.total_p_dl, fontSize: 7,
                        }
                      },
                      {
                        text: {
                          text: props.p_dl, fontSize: 7,
                        }
                      },
                      {
                        text: {
                          text: props.k_dl, fontSize: 7,
                        }
                      },
                      {
                        text: {
                          text: props.ec_dl, fontSize: 7,
                        }
                      },
                      {
                        text: {
                          text: props.org_matter_dl, fontSize: 7,
                        }
                      },

                      {
                        headlineLevel: `soilAnalyses${i}`,
                        text: {
                          text: '', fontSize: 7,
                        }
                      },
                    ],
                  ]
                }
              }, { text: ' ' }
            ]
          ]
        }
      }
    ]
  }

  props = props && typeof props === typeof {} ? props : {}

  const tables = Object.keys(props).map((key, i) => {
    let analyses = props[key]
    let headerInfo = analyses && analyses[0] ? analyses[0] : {}

    const subTables = analyses.map((analysis) => {
      return subTable(analysis, i)
    })

    return {
      headlineLevel: `soilAnalyses${i}`,
      margin: [10, 0, 0, 5],
      table: {
        widths: ['98%'],
        body: [
          [
            {// row 1
              fillColor: gray,
              text: {
                text: headerInfo.title, bold: true, fontSize: 9,
              }
            },
          ],
          ...subTables,
          [
            {// row for bottom border
              border: [true, false, true, true],
              text: {
                text: '',
              }
            },
          ]
        ]
      }
    }
  })


  const content = tables && tables.length > 0 ? tables : [{ margin: [10, 5], text: { text: 'No Soil analyses entered.', italics: true, fontSize: 7 } }]
  return {
    // pageBreak: 'before', // super useful soltion just dont need on the first on
    stack: [
      {
        width: "98%",
        table: {
          widths: ['100%'],
          body: [
            [{
              border: [false, false, false, false],
              // border: [false, false, false, false],
              text: 'D. SOIL ANALYSES', fontSize: 10, bold: true,
            }]
          ]
        }
      },
      ...content,
    ]
  }
}
const nutrientAnalysisE = (props) => {
  props = props && typeof props === typeof {} ? props : {}
  const tables = Object.keys(props).map((key, i) => {
    let harvests = props[key]
    let headerInfo = harvests && harvests[0] ? harvests[0] : {}

    const subTable = (props) => {
      return [
        {
          border: [true, false, true, false],
          table: {
            widths: ['20%', '73%'],
            body: [
              [
                {
                  border: [true, true, false, true],
                  fillColor: gray,
                  text: {
                    text: props.croptitle, alignment: 'left',
                    fontSize: 9,
                  }
                },
                {
                  border: [false, true, true, true],
                  fillColor: gray,
                  text: ''
                }
              ],
              [
                {
                  border: [true, false, false, false],
                  text: {
                    text: "Sample source and description:", fontSize: 8, alignment: 'right'
                  }
                },
                {
                  border: [false, false, true, true],
                  text: {
                    text: props.croptitle, fontSize: 8,
                    alignment: 'left'
                  }
                }
              ],
              [
                {
                  colSpan: 2,
                  border: [true, false, true, false],
                  table: {
                    widths: ['21%', '10%', '13%', '15%', '20%', '20%'],
                    body: [
                      [
                        {
                          border: [false, false, false, false],
                          text: {
                            text: "Sample date:", fontSize: 8,
                            alignment: 'right',
                          }
                        },
                        {
                          border: [false, false, false, true],
                          text: {
                            text: props.sample_date ? props.sample_date.split('T')[0] : '', fontSize: 8,
                          }
                        },
                        {
                          border: [false, false, false, false],
                          text: {
                            text: "Source of analysis:", fontSize: 8,
                            alignment: 'right',
                          }
                        },
                        {
                          border: [false, false, false, true],
                          text: {
                            text: props.src_of_analysis, fontSize: 8,
                          }
                        },
                        {
                          border: [false, false, false, false],
                          text: {
                            text: "Method of Reporting:", fontSize: 8,
                            alignment: 'right',
                          }
                        },
                        {
                          border: [false, false, false, true],
                          text: {
                            text: props.method_of_reporting, fontSize: 8,
                          }
                        },
                      ],
                    ]
                  }
                }, { text: '' }
              ],
              [
                {
                  colSpan: 2,
                  border: [true, false, true, false],
                  table: {
                    widths: ["20%", '20%', '20%'],
                    body: [
                      [
                        {
                          border: [false, false, false, false],
                          width: "40%",
                          text: {
                            text: "Moisture:", fontSize: 8,
                            alignment: 'right',
                          }
                        },
                        {
                          border: [false, false, false, true],
                          text: {
                            text: `${props.actual_moisture}%`, fontSize: 8,
                            alignment: 'left',
                          }
                        },
                        {
                          border: [false, false, false, false], text: ''
                        }
                      ]
                    ]
                  }
                },
                { text: '' }
              ],
              [
                {
                  colSpan: 2,
                  border: [true, false, true, true],
                  margin: [10, 0, 0, 0],
                  table: {
                    widths: ['4%', '10%', '10%', '10%', '10%', '10%'],
                    body: [
                      [
                        {
                          text: {
                            text: "", fontSize: 8,
                          }
                        },
                        {
                          fillColor: gray,
                          text: {
                            text: "Total N (mg/kg)", fontSize: 7,
                          }
                        },
                        {
                          fillColor: gray,
                          text: {
                            text: "Total P (mg/kg)", fontSize: 7,
                          }
                        },
                        {
                          fillColor: gray,
                          text: {
                            text: "Total K (mg/kg)", fontSize: 7,
                          }
                        },
                        {
                          fillColor: gray,
                          text: {
                            text: "Total salt (mg/kg)", fontSize: 7,
                          }
                        },
                        {
                          fillColor: gray,
                          text: {
                            text: "TFS (%)", fontSize: 7,
                          }
                        },


                      ],
                      [
                        {
                          text: {
                            text: "Value", fontSize: 8, bold: true,
                          }
                        },
                        {
                          text: {
                            text: props.actual_n, fontSize: 7,
                          }
                        },
                        {
                          text: {
                            text: props.actual_p, fontSize: 7,
                          }
                        },
                        {
                          text: {
                            text: props.actual_k, fontSize: 7,
                          }
                        },
                        {
                          text: {
                            text: '', fontSize: 7,
                          }
                        },
                        {
                          text: {
                            text: props.tfs, fontSize: 7,
                          }
                        },

                      ],
                      [
                        {
                          text: {
                            text: "DL", fontSize: 8, bold: true,
                          }
                        },
                        {
                          text: {
                            text: props.n_dl, fontSize: 7,
                          }
                        },
                        {
                          text: {
                            text: props.p_dl, fontSize: 7,
                          }
                        },
                        {
                          text: {
                            text: props.k_dl, fontSize: 7,
                          }
                        },
                        {
                          text: {
                            text: '', fontSize: 7,
                          }
                        },
                        {
                          headlineLevel: `ptAnalyses${i}`,
                          text: {
                            text: props.tfs_dl, fontSize: 7,
                          }
                        },
                      ],
                    ]
                  }
                }, { text: '' }
              ]
            ]
          }
        }
      ]
    }

    const subTables = harvests.map(harvest => subTable(harvest))

    return {
      headlineLevel: `ptAnalyses${i}`,
      margin: [10, 0, 0, 5],
      table: {
        widths: ['98%'],
        body: [
          [
            {// row 1
              fillColor: gray,
              text: {
                text: `${headerInfo.fieldtitle} - ${headerInfo.plant_date}: ${headerInfo.croptitle}`,
                bold: true, fontSize: 9,
              }
            },
          ],
          ...subTables,
          [
            {// bottom row border
              border: [true, false, true, true],
              text: ''
            },
          ]

        ]
      }
    }
  })
  const content = tables && tables.length > 0 ? tables : [{ margin: [10, 5], text: { text: 'No plant tissue analyses entered.', italics: true, fontSize: 7 } }]
  return {
    // pageBreak: 'before', // super useful soltion just dont need on the first on
    stack: [
      {
        width: "98%",
        table: {
          widths: ['98%'],
          body: [
            [{
              border: [false, false, false, false],
              text: 'E. PLANT TISSUE ANALYSES', fontSize: 10, bold: true,
            }]
          ]
        }
      },
      ...content
    ]
  }
}
const nutrientAnalysisF = (props) => {


  let tables = Object.keys(props).map((key, i) => {
    let analyses = props[key]

    let headerInfo = analyses && analyses[0] ? analyses[0] : {}

    const subTable = (props) => {
      return [
        {
          border: [true, false, true, false],
          table: {
            widths: ['20%', '73%'],
            body: [
              [
                {
                  border: [true, true, false, true],
                  fillColor: gray,
                  text: {
                    text: props.sample_desc, alignment: 'left',
                    fontSize: 9,
                  }
                },
                {
                  border: [false, true, true, true],
                  fillColor: gray,
                  text: ''
                }
              ],
              [
                {
                  border: [true, false, false, false],
                  text: {
                    text: "Sample source and description:", fontSize: 8, alignment: 'right'
                  }
                },
                {
                  border: [false, false, true, true],
                  text: {
                    text: props.sample_desc, fontSize: 8,
                    alignment: 'left'
                  }
                }
              ],
              [
                {
                  colSpan: 2,
                  border: [true, false, true, false],
                  table: {
                    widths: ['21%', '10%', '13%', '15%'],
                    body: [
                      [
                        {
                          border: [false, false, false, false],
                          text: {
                            text: "Sample date:", fontSize: 8,
                            alignment: 'right',
                          }
                        },
                        {
                          border: [false, false, false, true],
                          text: {
                            text: props.sample_date ? props.sample_date.split('T')[0] : '', fontSize: 8,
                          }
                        },
                        {
                          border: [false, false, false, false],
                          text: {
                            text: "Source of analysis:", fontSize: 8,
                            alignment: 'right',
                          }
                        },
                        {
                          border: [false, false, false, true],
                          text: {
                            text: props.src_of_analysis, fontSize: 8,
                          }
                        }
                      ],
                    ]
                  }
                }, { text: '' }
              ],
              [
                {
                  colSpan: 2,
                  border: [true, false, true, true],
                  margin: [10, 0, 0, 0],
                  table: {
                    widths: ['4%', '10%', '10%', '10%', '10%', '10%'],
                    body: [
                      [
                        {
                          text: {
                            text: "", fontSize: 8,
                          }
                        },
                        {
                          fillColor: gray,
                          text: {
                            text: "NH4-N (mg/L)", fontSize: 7,
                          }
                        },
                        {
                          fillColor: gray,
                          text: {
                            text: "Nitrate-N (mg/L)", fontSize: 7,
                          }
                        },
                        {
                          fillColor: gray,
                          text: {
                            text: "Total P (mg/L)", fontSize: 7,
                          }
                        },
                        {
                          fillColor: gray,
                          text: {
                            text: "EC (μmhos/cm)", fontSize: 7,
                          }
                        },
                        {
                          fillColor: gray,
                          text: {
                            text: "TDS (mg/L)", fontSize: 7,
                          }
                        },
                      ],
                      [
                        {
                          text: {
                            text: "Value", fontSize: 8, bold: true,
                          }
                        },
                        {
                          text: {
                            text: props.nh4_con, fontSize: 7,
                          }
                        },
                        {
                          text: {
                            text: props.no2_con, fontSize: 7,
                          }
                        },
                        {
                          text: {
                            text: props.p_con, fontSize: 7,
                          }
                        },
                        {
                          text: {
                            text: props.ec, fontSize: 7,
                          }
                        },
                        {
                          text: {
                            text: props.tds, fontSize: 7,
                          }
                        },

                      ],
                      [
                        {
                          text: {
                            text: "DL", fontSize: 8, bold: true,
                          }
                        },
                        {
                          text: {
                            text: props.nh4_dl, fontSize: 7,
                          }
                        },
                        {
                          text: {
                            text: props.no2_dl, fontSize: 7,
                          }
                        },
                        {
                          text: {
                            text: props.p_dl, fontSize: 7,
                          }
                        },
                        {
                          text: {
                            text: props.ec_dl, fontSize: 7,
                          }
                        },
                        {
                          headlineLevel: `drainAnalyses${i}`,
                          text: {
                            text: props.tds_dl, fontSize: 7,
                          }
                        },
                      ],
                    ]
                  }
                }, { text: '' }
              ]
            ]
          }
        }
      ]
    }

    const subTables = analyses.map(analysis => subTable(analysis))

    return {
      headlineLevel: `drainAnalyses${i}`,
      margin: [10, 0, 0, 5],
      table: {
        widths: ['98%'],
        body: [
          [
            {// row 1
              fillColor: gray,
              text: {
                text: headerInfo.src_desc,
                bold: true, fontSize: 9,
              }
            },
          ],
          ...subTables,
          [
            {// bottom row border
              border: [true, false, true, true],
              text: ''
            },
          ]

        ]
      }
    }
  })


  tables = tables.length > 0 ? tables : [{ margin: [10, 5], text: { text: 'No subsurface (tile) drainage analyses entered.', fontSize: 7, italics: true } }]
  return {
    // pageBreak: 'before', // super useful soltion just dont need on the first on
    stack: [
      {
        width: "98%",
        table: {
          widths: ['100%'],
          body: [
            [{
              border: [false, false, false, false],
              // border: [false, false, false, false],
              text: 'F. SUBSURFACE (TILE) DRAINAGE ANALYSES', fontSize: 10, bold: true,
            }],
          ]
        }
      },
      ...tables,


    ]
  }
}

//  naprbal NUTRIENT APPLICATIONS, POTENTIAL REMOVAL, AND BALANCE
const naprbalA = (props) => {

  props = props && typeof props === typeof {} && Object.keys(props).length > 0 ?
    Object.fromEntries(Object.keys(props).map(key => {
      let val = props[key]
      if ([
        'soils',
        'plows',
        'fertilizers',
        'manures',
        'wastewaters',
        'freshwaters',
        'anti_harvests',
        'actual_harvests',
        'freshwater_app',
        'wastewater_app',
        'total_app',
        'total_app',
        'nutrient_bal',
        'nutrient_bal_ratio',].indexOf(key) >= 0) {
        return [key, val.map(l => formatFloat(l))]
      }
      return [key, val]
    })) : {}

  return {
    pageBreak: 'before', // super useful soltion just dont need on the first on
    stack: [
      {
        width: "98%",
        table: {
          widths: ['98%'],
          body: [
            [{
              // border: [false, false, false, false],
              text: 'NUTRIENT APPLICATIONS, POTENTIAL REMOVAL, AND BALANCE', alignment: 'center', fontSize: 10
            }]
          ]
        }
      },
      {
        width: "98%",
        table: {
          widths: ['100%'],
          body: [
            [{
              border: [false, false, false, false],
              // border: [false, false, false, false],
              text: 'A. SUMMARY OF NUTRIENT APPLICATIONS, POTENTIAL REMOVAL, AND BALANCE', fontSize: 10, bold: true,
            }]
          ]
        }
      },
      {
        width: "98%",
        margin: [10, 0, 0, 0],
        table: {
          widths: ['20%', '15%', '15%', '15%', '15%'],
          body: [
            [
              {
                text: ''
              },
              {
                fillColor: gray,
                text: {
                  text: 'Total N (lbs)', fontSize: 8, alignment: 'right',
                }
              },
              {
                fillColor: gray,
                text: {
                  text: 'Total P (lbs)', fontSize: 8, alignment: 'right',
                }
              },
              {
                fillColor: gray,
                text: {
                  text: 'Total K (lbs)', fontSize: 8, alignment: 'right',
                }
              },
              {
                fillColor: gray,
                text: {
                  text: 'Total salt (lbs)', fontSize: 8, alignment: 'right',
                }
              },
            ],
            [
              {
                border: [true, false, true, false],
                text: 'Existing soil nutrient content', fontSize: 8,
              },
              {
                border: [true, false, true, false],
                text: {
                  text: props.soils[0], fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: props.soils[1], fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: props.soils[2], fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: props.soils[3], fontSize: 8, alignment: 'right',
                }
              },
            ],
            [
              {
                border: [true, false, true, false],
                text: 'Plowdown credit', fontSize: 8,
              },
              {
                border: [true, false, true, false],
                text: {
                  text: props.plows[0], fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: props.plows[1], fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: props.plows[2], fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: props.plows[3], fontSize: 8, alignment: 'right',
                }
              },
            ],
            [
              {
                border: [true, false, true, false],
                text: 'Commerical fertilizer /Other', fontSize: 8,
              },
              {
                border: [true, false, true, false],
                text: {
                  text: props.fertilizers[0], fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: props.fertilizers[1], fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: props.fertilizers[2], fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: props.fertilizers[3], fontSize: 8, alignment: 'right',
                }
              },
            ],
            [
              {
                border: [true, false, true, false],
                text: 'Dry Manure', fontSize: 8,
              },
              {
                border: [true, false, true, false],
                text: {
                  text: props.manures[0], fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: props.manures[1], fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: props.manures[2], fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: props.manures[3], fontSize: 8, alignment: 'right',
                }
              },
            ],
            [
              {
                border: [true, false, true, false],
                text: 'Process wastewater', fontSize: 8,
              },
              {
                border: [true, false, true, false],
                text: {
                  text: props.wastewaters[0], fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: props.wastewaters[1], fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: props.wastewaters[2], fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: props.wastewaters[3], fontSize: 8, alignment: 'right',
                }
              },
            ],
            [
              {
                border: [true, false, true, false],
                text: 'Fresh water', fontSize: 8,
              },
              {
                border: [true, false, true, false],
                text: {
                  text: props.freshwaters[0], fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: props.freshwaters[1], fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: props.freshwaters[2], fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: props.freshwaters[3], fontSize: 8, alignment: 'right',
                }
              },
            ],
            [
              {
                border: [true, false, true, true],
                text: 'Atmospheric deposition', fontSize: 8,
              },
              {
                border: [true, false, true, true],
                text: {
                  text: props.atmospheric_depo, fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, true],
                text: {
                  text: '0', fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, true],
                text: {
                  text: '0', fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, true],
                text: {
                  text: '0', fontSize: 8, alignment: 'right',
                }
              },
            ],
            [
              {
                border: [true, false, true, false],
                text: 'Total nutrients applied', fontSize: 8,
              },
              {
                border: [true, false, true, false],
                text: {
                  text: props.total_app[0], fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: props.total_app[1], fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: props.total_app[2], fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: props.total_app[3], fontSize: 8, alignment: 'right',
                }
              },
            ],
            [
              {
                border: [true, false, true, false],
                text: 'Anticipated crop nutrient removal', fontSize: 8,
              },
              {
                border: [true, false, true, false],
                text: {
                  text: props.anti_harvests[0], fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: props.anti_harvests[1], fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: props.anti_harvests[2], fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: props.anti_harvests[3], fontSize: 8, alignment: 'right',
                }
              },
            ],
            [
              {
                border: [true, false, true, true],
                text: 'Actual crop nutrient removal', fontSize: 8,
              },
              {
                border: [true, false, true, true],
                text: {
                  text: props.actual_harvests[0], fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, true],
                text: {
                  text: props.actual_harvests[1], fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, true],
                text: {
                  text: props.actual_harvests[2], fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, true],
                text: {
                  text: props.actual_harvests[3], fontSize: 8, alignment: 'right',
                }
              },
            ],
            [
              {
                border: [true, false, true, false],
                text: 'Nutrient balance', fontSize: 8,
              },
              {
                border: [true, false, true, false],
                text: {
                  text: props.nutrient_bal[0], fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: props.nutrient_bal[1], fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: props.nutrient_bal[2], fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: props.nutrient_bal[3], fontSize: 8, alignment: 'right',
                }
              },
            ],
            [
              {
                border: [true, false, true, true],
                text: 'Applied to removed ratio', fontSize: 8,
              },
              {
                border: [true, false, true, true],
                text: {
                  text: props.nutrient_bal_ratio[0], fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, true],
                text: {
                  text: props.nutrient_bal_ratio[1], fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, true],
                text: {
                  text: props.nutrient_bal_ratio[2], fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, true],
                text: {
                  text: props.nutrient_bal_ratio[3], fontSize: 8, alignment: 'right',
                }
              },
            ],

          ]
        }
      },




    ]
  }
}
const naprbalB = (props, img) => {
  return {
    stack: [
      {
        width: "98%",
        table: {
          widths: ['100%'],
          body: [
            [{
              border: [false, false, false, false],
              // border: [false, false, false, false],
              text: 'B. POUNDS OF NUTRIENT APPLIED VS. CROP REMOVAL', fontSize: 10, bold: true,
            }]
          ]
        }
      },
      {
        margin: [10, 0, 0, 0],
        columns: [
          {
            width: '90%',
            stack: [
              image(img, 475, 175),
            ]
          }
        ]
      }
    ]
  }
}
const naprbalC = (props, images) => {
  return {
    pageBreak: 'before', // super useful soltion just dont need on the first on
    stack: [
      {
        width: "98%",
        table: {
          widths: ['100%'],
          body: [
            [{
              border: [false, false, false, false],
              // border: [false, false, false, false],
              text: 'C. POUNDS OF NUTRIENT APPLIED BY MATERIAL TYPE', fontSize: 10, bold: true,
            }]
          ]
        }
      },
      {
        margin: [10, 0, 0, 0],
        stack: [
          {
            columns: [
              {
                width: '50%',
                stack: [
                  image(images.Nitrogen, 350, 175),
                ]
              },
              {
                width: '50%',
                stack: [
                  image(images.Phosphorus, 350, 175),
                ]
              }
            ]
          },
          {
            columns: [
              {
                width: '50%',
                stack: [
                  image(images.Potassium, 350, 175),
                ]
              },
              {
                width: '50%',
                stack: [
                  image(images.Salt, 350, 175),
                ]
              }
            ]
          },
        ]
      }
    ]
  }
}



const exceptionReportingATable = (props) => {
  props = props && typeof props === typeof [] ? props : []
  let rows = props.map((row, i) => {
    return [
      {
        text: {
          text: row.discharge_datetime, fontSize: 7,
        }
      },
      {
        text: {
          text: row.discharge_loc, fontSize: 7,
        }
      },
      {
        text: {
          text: row.ref_number, fontSize: 7,
        }
      },
      {
        text: {
          text: row.method_of_measuring, fontSize: 7,
        }
      },
      {
        text: {
          text: row.sample_location_reason, fontSize: 7,
        }
      },
      {
        text: {
          text: row.vol, fontSize: 7,
        }
      },
    ]
  })

  let body = [
    [
      {
        fillColor: gray,
        text: {
          text: 'Discharge date', fontSize: 7,
        }
      },
      {
        fillColor: gray,
        text: {
          text: 'Location', fontSize: 7,
        }
      },
      {
        fillColor: gray,
        text: {
          text: 'Map reference #', fontSize: 7,
        }
      },
      {
        fillColor: gray,
        text: {
          text: 'Method of measuring discharge', fontSize: 7,
        }
      },
      {
        fillColor: gray,
        text: {
          text: 'Rationale for sample locations', fontSize: 7,
        }
      },
      {
        fillColor: gray,
        text: {
          text: 'Volume', fontSize: 7,
        }
      },
    ],
    ...rows
  ]

  let table = {
    margin: [10, 5, 0, 5],
    table: {
      widths: ['16%', '16%', '16%', '16%', '16%', '16%'],
      body: body
    }
  }
  let noTable = {
    margin: [10, 10, 0, 10],
    text: {
      text: 'No manure or process wastewater discharges occurred during the reporting period.', italics: true, fontSize: 7
    }
  }

  return props && props.length > 0 ? table : noTable
}
const exceptionReportingBTable = (props) => {
  props = props && typeof props === typeof [] ? props : []
  let rows = props.map((row, i) => {
    return [
      {
        text: {
          text: row.discharge_datetime, fontSize: 7,
        }
      },
      {
        text: {
          text: row.discharge_loc, fontSize: 7,
        }
      },
      {
        text: {
          text: row.ref_number, fontSize: 7,
        }
      },
      {
        text: {
          text: row.method_of_measuring, fontSize: 7,
        }
      },
      {
        text: {
          text: row.sample_location_reason, fontSize: 7,
        }
      },
      {
        text: {
          text: row.duration_of_discharge, fontSize: 7,
        }
      },
      {
        text: {
          text: row.vol, fontSize: 7,
        }
      },
    ]
  })

  let body = [
    [
      {
        fillColor: gray,
        text: {
          text: 'Discharge date', fontSize: 7,
        }
      },
      {
        fillColor: gray,
        text: {
          text: 'Location', fontSize: 7,
        }
      },
      {
        fillColor: gray,
        text: {
          text: 'Map reference #', fontSize: 7,
        }
      },
      {
        fillColor: gray,
        text: {
          text: 'Method of measuring discharge', fontSize: 7,
        }
      },
      {
        fillColor: gray,
        text: {
          text: 'Rationale for sample locations', fontSize: 7,
        }
      },
      {
        fillColor: gray,
        text: {
          text: 'Duration (min)', fontSize: 7,
        }
      },
      {
        fillColor: gray,
        text: {
          text: 'Volume', fontSize: 7,
        }
      },
    ],
    ...rows
  ]

  let table = {
    margin: [10, 5, 0, 5],
    table: {
      widths: ['14%', '14%', '14%', '14%', '14%', '14%', '14%'],
      body: body
    }
  }
  let noTable = {
    margin: [10, 10, 0, 10],
    text: {
      text: 'No stormwater discharges occurred during the reporting period.', italics: true, fontSize: 7
    }
  }

  return props && props.length > 0 ? table : noTable
}
const exceptionReportingCTable = (props) => {
  props = props && typeof props === typeof [] ? props : []
  // Generate rows for Report, simple table :)
  let rows = props.map((row, i) => {
    return [
      {
        text: {
          text: row.discharge_datetime, fontSize: 7,
        }
      },
      {
        text: {
          text: row.discharge_loc, fontSize: 7,
        }
      },
      {
        text: {
          text: row.ref_number, fontSize: 7,
        }
      },
      {
        text: {
          text: row.method_of_measuring, fontSize: 7,
        }
      },
      {
        text: {
          text: row.sample_location_reason, fontSize: 7,
        }
      },
      {
        text: {
          text: row.discharge_src, fontSize: 7,
        }
      },
      {
        text: {
          text: row.vol, fontSize: 7,
        }
      },
    ]
  })

  let body = [
    [
      {
        fillColor: gray,
        text: {
          text: 'Discharge date', fontSize: 7,
        }
      },
      {
        fillColor: gray,
        text: {
          text: 'Location', fontSize: 7,
        }
      },
      {
        fillColor: gray,
        text: {
          text: 'Map reference #', fontSize: 7,
        }
      },
      {
        fillColor: gray,
        text: {
          text: 'Method of measuring discharge', fontSize: 7,
        }
      },
      {
        fillColor: gray,
        text: {
          text: 'Rationale for sample locations', fontSize: 7,
        }
      },
      {
        fillColor: gray,
        text: {
          text: 'Source of discharge', fontSize: 7,
        }
      },
      {
        fillColor: gray,
        text: {
          text: 'Volume', fontSize: 7,
        }
      },
    ],
    ...rows
  ]

  let table = {
    margin: [10, 10, 0, 10],
    table: {
      widths: ['14%', '14%', '14%', '14%', '14%', '14%', '14%'],
      body: body
    }
  }

  let noTable = {
    margin: [10, 5, 0, 5],
    text: {
      text: 'No manure or process wastewater discharges occurred during the reporting period.', italics: true, fontSize: 7
    }
  }

  return props && props.length > 0 ? table : noTable
}
const exceptionReportingABC = (props) => {

  return {
    pageBreak: 'before', // super useful soltion just dont need on the first on
    stack: [
      {
        table: {
          widths: ['98%'],
          body: [
            [{
              // border: [false, false, false, false],
              text: 'EXCEPTION REPORTING', alignment: 'center', fontSize: 10
            }]
          ]
        }
      },

      {
        text: { text: 'A. MANURE, PROCESS WASTEWATER, AND OTHER DAIRY WASTE DISCHARGES', fontSize: 10, bold: true, }
      },
      {
        text: {
          text: "The following is a summary of all manure and process wastewater discharges from the production area to surface water or to land areas (land application areas or otherwise)" +
            " when not in accordance with the facility's Nutrient Management Plan.", fontSize: 8
        }
      },
      exceptionReportingATable(props['Manure/process wastewater']),

      {
        text: { text: 'B. STORM WATER DISCHARGES', fontSize: 10, bold: true, }
      },
      {
        text: {
          text: "The following is a summary of all storm water discharges from the production area to surface water during the reporting period when not in accordance with the facility 's Nutrient" +
            " Management Plan.", fontSize: 8
        }
      },
      exceptionReportingBTable(props['Storm water']),

      {
        text: { text: 'C. LAND APPLICATION AREA TO SURFACE WATER DISCHARGES', fontSize: 10, bold: true, }
      },
      {
        text: {
          text: "The following is a summary of all discharges from the land application area to surface water that have occurred during the reporting period when not in accordance with the" +
            " facility's Nutrient Management Plan.", fontSize: 8
        }
      },
      exceptionReportingCTable(props['Land application']),
    ]
  }
}




//  nmpeaStatements NUTRIENT MANAGEMENT PLAN AND EXPORT AGREEMENT STATEMENTS
const nmpeaStatementsAB = (props) => {
  const q1 = `Was the facility's NMP updated in the reporting period?`
  const q2 = `Was the facility's NMP developed by a certified nutrient management planner (specialist) as specified in Attachment C of the General Order?`
  const q3 = `Was the facility's NMP approved by a certified nutrient management planner (specialist) as specified in Attachment C of the General Order?`
  const q4 = `Are there any written agreements with third parties to receive manure or process wastewater that are new or were revised within the reporting period?`

  return {
    stack: [
      {
        table: {
          widths: ['98%'],
          body: [
            [{
              text: 'NUTRIENT MANAGEMENT PLAN AND EXPORT AGREEMENT STATEMENTS', alignment: 'center', fontSize: 10
            }]
          ]
        }
      },
      {
        table: {
          widths: ['100%'],
          body: [
            [
              {
                border: [false, false, false, false],
                text: { text: 'A. NUTRIENT MANAGEMENT PLAN STATEMENTS', fontSize: 10, bold: true, }
              },
            ],
          ]
        }
      },
      {
        table: {
          widths: ['95%', '3%', '1%'],
          body: [
            [
              {
                border: [false, false, false, false],
                text: { text: q1, fontSize: 10 }
              },
              {
                border: [false, false, false, true],
                text: { text: props.nmp_updated ? 'Yes' : 'No', fontSize: 10 }
              },
              {
                border: [false, false, false, false],
                text: { text: ' ', fontSize: 10 }
              },
            ],
            [
              {
                border: [false, false, false, false],
                text: { text: q2, fontSize: 10 }
              },
              {
                border: [false, false, false, true],
                text: { text: props.nmp_developed ? 'Yes' : 'No', fontSize: 10 }
              },
              {
                border: [false, false, false, false],
                text: { text: ' ', fontSize: 10 }
              },
            ],
            [
              {
                border: [false, false, false, false],
                text: { text: q3, fontSize: 10 }
              },
              {
                border: [false, false, false, true],
                text: { text: props.nmp_approved ? 'Yes' : 'No', fontSize: 10 }
              },
              {
                border: [false, false, false, false],
                text: { text: ' ', fontSize: 10 }
              },
            ],
          ]
        }
      },
      {
        table: {
          widths: ['100%'],
          body: [
            [
              {
                border: [false, false, false, false],
                text: { text: 'B. EXPORT AGREEMENT STATEMENT', fontSize: 10 }
              },
            ],
          ]
        }
      },
      {
        table: {
          widths: ['95%', '3%', '1%'],
          body: [
            [
              {
                border: [false, false, false, false],
                text: { text: q4, fontSize: 10 }
              },
              {
                border: [false, false, false, true],
                text: { text: props.new_agreements ? 'Yes' : 'No', fontSize: 10 }
              },
              {
                border: [false, false, false, false],
                text: { text: ' ', fontSize: 10 }
              },
            ],

          ]
        }
      },
    ]
  }
}

const notesA = (props) => {
  const noNotesText = props.note

  return {
    pageBreak: 'before',
    stack: [
      {
        table: {
          widths: ['98%'],
          body: [
            [{
              text: 'ADDITIONAL NOTES', alignment: 'center', fontSize: 10,
            }]
          ]
        }
      },
      {
        table: {
          widths: ['100%'],
          body: [
            [
              {
                border: [false, false, false, false],
                text: { text: 'A. NOTES', fontSize: 10, bold: true }
              },
            ],
            [
              {
                border: [false, false, false, false],
                text: {
                  text: noNotesText, fontSize: 9, italics: true
                }
              }
            ],
          ]
        }
      },
    ]
  }
}
const certificationA = (props) => {
  console.log("Cert props", props)
  const certiText = `I certify under penalty of law that I have personally examined and am familiar with the information submitted in this document and all attachments and that, based on my inquiry
  of those individuals immediately responsible for obtaining the information, I believe that the information is true, accurate, and complete. I am aware that there are significant
  penalties for submitting false information, including the possibility of fine and imprisonment.`

  return {
    pageBreak: 'before',
    stack: [
      {
        table: {
          widths: ['98%'],
          body: [
            [{
              text: 'CERTIFICATION', alignment: 'center', fontSize: 10,
            }]
          ]
        }
      },
      {
        table: {
          widths: ['100%'],
          body: [
            [
              {
                border: [false, false, false, false],
                text: { text: 'A. CERTIFICATION', fontSize: 10, bold: true }
              },
            ],
            [
              {
                border: [false, false, false, false],
                margin: [10, 0, 0, 0],
                text: {
                  text: certiText, fontSize: 8, italics: true
                }
              }
            ],
          ]
        }
      },
      {
        margin: [10, 30, 0, 0],
        stack: [
          line(600),
        ]
      },
      {
        margin: [10, 0, 0, 0],
        columns:
          [
            {
              width: "50%",
              text: {
                text: 'SIGNATURE OF OWNER OF FACILITY ', fontSize: 7,
              }
            },
            {
              width: "50%",
              text: {
                text: 'SIGNATURE OF OPERATOR OF FACILITY', fontSize: 7,
              }
            },
          ],
      },
      {
        margin: [10, 15, 0, 0],
        columns:
          [
            {
              width: "50%",
              text: {
                text: props.ownertitle, fontSize: 10,
              }
            },
            {
              width: "50%",
              text: {
                text: props.operatortitle, fontSize: 10,
              }
            },
          ],
      },
      {
        margin: [10, 0, 0, 0],
        stack: [
          line(600),
        ]
      },
      {
        margin: [10, 0, 0, 0],
        columns:
          [
            {
              width: "50%",
              text: {
                text: 'PRINT OR TYPE NAMEY ', fontSize: 7,
              }
            },
            {
              width: "50%",
              text: {
                text: 'PRINT OR TYPE NAME', fontSize: 7,
              }
            },
          ],
      },
      {
        margin: [10, 15, 0, 0],
        stack: [
          line(600),
        ]
      },
      {
        margin: [10, 0, 0, 0],
        columns:
          [
            {
              width: "50%",
              text: {
                text: 'DATE ', fontSize: 7,
              }
            },
            {
              width: "50%",
              text: {
                text: 'DATE', fontSize: 7,
              }
            },
          ],
      }
    ]
  }
}
const attachmentsA = (props) => {
  const s1 = `Provide an Annual Dairy Facility Assessment (an update to the Preliminary Dairy Facility Assessment in Attachment A) for each reporting period. On the PDFA Final
  page, click on the ADFA Report button to generate an ADFA report after updating information as needed .`
  const s2 = `Provide copies of all manure/process wastewater tracking manifests for the reporting period, signed by both the owner/operator and the hauler.`
  const s3 = `Provide records documenting any corrective actions taken to correct deficiencies noted as a result of the inspections required in the Monitoring Requirements of the
  General Order. Deficiencies not corrected in 30 days must be accompanied by an explanation of the factors preventing immediate correction.`
  const s4 = `Dischargers that monitor supply wells or subsurface (tile) drainage systems, or that have monitoring well systems must submit monitoring results as directed in the
  General Order, Groundwater Reporting Section starting on page MRP-13.`
  const s5 = `Dischargers that are required to monitor storm water more frequently than required in the General Order must submit monitoring results as directed in the General Order,
  Storm Water Reporting Section on page MRP-14.`


  return {
    pageBreak: 'before',
    stack: [
      {
        table: {
          widths: ['98%'],
          body: [
            [{
              text: 'ATTACHMENTS', alignment: 'center', fontSize: 10,
            }]
          ]
        }
      },
      {
        table: {
          widths: ['100%'],
          body: [
            [
              {
                border: [false, false, false, false],
                text: { text: 'A. REQUIRED ATTACHMENTS', fontSize: 10, bold: true }
              },
            ],
          ]
        }
      },

      {
        margin: [10, 0, 0, 0],
        stack: [
          {
            text: {
              text: 'Annual Dairy Facility Assessment', fontSize: 10
            }
          },
          line(650),
          {
            margin: [5, 0, 0, 5],
            text: {
              text: s1, fontSize: 8
            }
          },
          {
            text: {
              text: 'Manure/Process Wastewater Tracking Manifests', fontSize: 10
            }
          },
          line(650),
          {
            margin: [5, 0, 0, 5],
            text: {
              text: s2, fontSize: 8
            }
          },
          {
            text: {
              text: 'Corrective Actions Documents', fontSize: 10
            }
          },
          line(650),
          {
            margin: [5, 0, 0, 5],
            text: {
              text: s3, fontSize: 8
            }
          },
          {
            text: {
              text: 'Groundwater Monitoring', fontSize: 10
            }
          },
          line(650),
          {
            margin: [5, 0, 0, 5],
            text: {
              text: s4, fontSize: 8
            }
          },
          {
            text: {
              text: 'Storm Water Monitoring', fontSize: 10
            }
          },
          line(650),
          {
            margin: [5, 0, 0, 5],
            text: {
              text: s5, fontSize: 8
            }
          },
        ]
      }
    ]
  }
}


/**
 *      ###############################
 *      #### DOCUMENT           ##############
 *  
 */

const getDateTime = () => {
  const curDate = new Date()
  return `${curDate.getUTCMonth() + 1}/${curDate.getUTCDate()}/${curDate.getUTCFullYear()} ${curDate.getUTCHours()}:${curDate.getUTCMinutes()}:${curDate.getUTCSeconds()}`
}

export default function dd(props, images) {
  const curDateTime = getDateTime()
  const dairyInfo = props && props.dairyInformationA ? props.dairyInformationA : {}
  const footerTitle = `${dairyInfo.title} | ${dairyInfo.street} | ${dairyInfo.city}, ${dairyInfo.city_state} ${dairyInfo.city_zip} | ${dairyInfo.county} | ${dairyInfo.basin_plan}`
  const periodStart = dairyInfo.period_start ? dairyInfo.period_start.split("T")[0] : ''
  const periodEnd = dairyInfo.period_end ? dairyInfo.period_end.split("T")[0] : ''
  const reportingPeriod = `Reporting peroid ${periodStart} to ${periodEnd}.`


  // DEPENDS ON COMPANY -- CHANGEABLE -- SWAPPABLE
  const pngLogo = `data:image/jpeg;base64,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`
 
  const footerImg = image(pngLogo, 100, 30)

  const body = [
    dairyInformationA(props.dairyInformationA),
    dairyInformationB(props.dairyInformationB),
    dairyInformationC(props.dairyInformationC),
    availableNutrientsA({ ...props.availableNutrientsAB, p_breed: props.dairyInformationA.p_breed }),   // bind last two rows and last row of table together...
    availableNutrientsB(props.availableNutrientsAB),  // bind this section together
    availableNutrientsC(props.availableNutrientsC), // bind this section together
    availableNutrientsD(props.availableNutrientsD),
    availableNutrientsE(props.availableNutrientsE), // subsurface tile drainage
    availableNutrientsF(props.availableNutrientsF),
    availableNutrientsG(props.availableNutrientsG),
    applicationAreaA(props.applicationAreaA),
    applicationAreaB(props.applicationAreaB),
    nutrientBudgetA(props.nutrientBudgetA),
    nutrientBudgetB(props.nutrientBudgetB, images), // Graph
    nutrientAnalysisA(props.nutrientAnalysis.manures),
    nutrientAnalysisB(props.nutrientAnalysis.wastewaters),
    nutrientAnalysisC(props.nutrientAnalysis.freshwaters),
    nutrientAnalysisD(props.nutrientAnalysis.soils), // soil
    nutrientAnalysisE(props.nutrientAnalysis.harvests), // 
    nutrientAnalysisF(props.nutrientAnalysis.drains), // Tile drainage analyses

    naprbalA(props.naprbalA),
    naprbalB(props, images.totalNutrientAppAntiHarvestData),
    naprbalC(props, images),

    // Minimal data below, need to create, answers to basic questions.
    exceptionReportingABC(props.exceptionReportingABC),
    nmpeaStatementsAB(props.nmpeaStatementsAB),
    notesA(props.notesA),
    certificationA(props.certificationA),
    attachmentsA(props),

  ]

  return {
    pageSize: {
      width: 792,
      height: 612,
      pageOrientation: 'landscape',
    },
    defaultStyle: {
      font: 'Roboto'
    },
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
                  { text: 'Annual Report - General Order No. R5-2007-0035\n', alignment: "center", bold: true, fontSize: 10 },
                  { text: reportingPeriod, alignment: "center", italics: true, fontSize: 10 }
                ]
              }]
            ]
          },

        },
      ]
    },
    footer: function (currentPage, pageCount) {
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
    content: body,
    pageBreakBefore: function (currentNode, followingNodesOnPage, nodesOnNextPage, previousNodesOnPage) {
      // If node has a headline and its not header or footer
      if (currentNode.headlineLevel && currentNode.headlineLevel.length > 0 && ['header', 'footer'].indexOf(currentNode.headlineLevel) < 0) {
        // if the row is the last one and there are more of them, break before...
        let childNodes = nodesOnNextPage.filter(el => el.headlineLevel === currentNode.headlineLevel)

        // // If its a table row, only break on last one
        // if( currentNode.headlineLevel.substring(0,3) === "row"){

        //   console.log("HeadlineLevel: ", currentNode.headlineLevel)
        //   console.log("Number of nodes on next page",childNodes.length)
        //   console.log("Num of nodes left of on page", followingNodesOnPage.length )
        //   if(followingNodesOnPage.length < 0){

        //     return childNodes.length > 0
        //   }else{
        //     // its a row but not the last one
        //     return false
        //   }

        // }
        // // This is not a row item...

        return childNodes.length > 0

      }



      // Header element and foot elemtn of a table or long entity need to have match keys under the ID.
      return false;
    }
  }
}