import { formatDate, formatFloat, formatInt, naturalSort, naturalSortBy, percentageAsMGKG } from "../../utils/format"
import { Logo } from "../../utils/Logo/logo"
import { round } from "mathjs"

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
          heights: 0,
          widths: ['55%', '15%', '15%', '15%'],
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
          text: {
            text: props.is_responsible ? `This ${is_owner ? 'owner' : 'operator'} is responsible for paying permit fees.` : "",
            fontSize: 9,
            bold: true,
          },

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
                  text: props.began ? formatDate(props.began.split("T")[0]) : '', fontSize: 9, lineHeight: 0.1
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
    pageBreak: 'before',
    stack: [
      {
        margin: [0, 5, 0, 5],
        stack: [
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    border: [false],
                    text: 'C. OWNERS', bold: true, fontSize: 9
                  }]
              ]
            }
          },
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
                text: `${props.herdInfo.p_breed} ${props.herdInfo.p_breed === 'Other' ? ": " + props.herdInfo.p_breed_other : ''}`, fontSize: 9
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
                      text: formatInt(props.generated[0]),
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
                      text: formatFloat(round(props.generated[1], 2)),
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
                      text: formatFloat(round(props.generated[2], 2)),
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
                      text: formatFloat(round(props.generated[3], 2)),
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
                      text: formatFloat(round(props.generated[4], 2)),
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
                      text: formatInt(props.applied[0]),
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
                      text: formatInt(props.exported[0]),
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
                      text: formatInt(props.imported[0]),
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
                      text: formatInt(props.generated[0]),
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
  let sources = props.sources.sort((a, b) => naturalSortBy(a, b, 'src_desc')).map(source => {
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

  sources = sources.sort((a, b) => naturalSortBy(a, b, 'src_desc')).map(source => {
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
          text: props.import_date && props.import_date.length > 0 ? formatDate(props.import_date.split("T")[0]) : '',
          fontSize: 8,
        }
      },
      {// row 
        text: {
          text: `${props.material_type}/ ${props.import_desc}`, fontSize: 8,
        }
      },
      {// row 1
        text: {
          text: props.amount_imported, fontSize: 8, alignment: 'right'
        }
      },
      {// row 1
        text: {
          text: props.method_of_reporting, fontSize: 8,
        }
      },
      {// row 1
        text: {
          text: props.moisture, fontSize: 8, alignment: 'right'
        }
      },
      {// row 1
        text: {
          text: percentageAsMGKG(props.n_con), fontSize: 8, alignment: 'right'
        }
      },
      {// row 1
        text: {
          text: percentageAsMGKG(props.p_con), fontSize: 8, alignment: 'right'
        }
      },
      {// row 1
        text: {
          text: percentageAsMGKG(props.k_con), fontSize: 8, alignment: 'right'
        }
      },
      {// row 1
        text: {
          text: formatFloat(0), fontSize: 8, alignment: 'right'
        }
      },
      {// row 1
        text: {
          text: props.salt_con, fontSize: 8, alignment: 'right'
        }
      }, { text: '' }
    ]
  }
  let rows = props.sort((a, b) => naturalSortBy(a, b, 'import_date')).map(n_import => {
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
          text: 'Quantity (tons)', fontSize: 9, alignment: 'right'
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
          text: 'Moisture (%)', fontSize: 9, alignment: 'right'
        }
      },
      {// row 1
        fillColor: gray,
        text: {
          text: 'N (mg/kg)', fontSize: 9, alignment: 'right'
        }
      },
      {// row 1
        fillColor: gray,
        text: {
          text: 'P (mg/kg)', fontSize: 9, alignment: 'right'
        }
      },
      {// row 1
        fillColor: gray,
        text: {
          text: 'K (mg/kg)', fontSize: 9, alignment: 'right'
        }
      },
      {// row 1
        fillColor: gray,
        text: {
          text: 'Salt (mg/kg)', fontSize: 9, alignment: 'right'
        }
      },
      {// row 1
        fillColor: gray,
        text: {
          text: 'TFS (%)', fontSize: 9, alignment: 'right'
        }
      },
    ],
    ...rows
  ]
  const table = {
    margin: [10, 0, 0, 5],
    table: {
      widths: ['10%', '25%', '10%', '15%', '7%', '7%', '7%', '7%', '6%', "6%", '*'],
      body: body
    }
  }
  return rows && rows.length > 0 ? table : { margin: [10, 5], text: { text: 'No dry manure nutrient imports entered.', fontSize: 8, italics: true } }
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
          text: `${props.material_type}/ ${props.import_desc}`, fontSize: 8,
        }
      },
      {// row 1
        text: {
          text: props.amount_imported, fontSize: 8, alignment: 'right'
        }
      },

      {// row 1
        text: {
          text: formatFloat(props.n_con * 10000), fontSize: 8, alignment: 'right'
        }
      },
      {// row 1
        text: {
          text: formatFloat(props.p_con * 10000), fontSize: 8, alignment: 'right'
        }
      },
      {// row 1
        text: {
          text: formatFloat(props.k_con * 10000), fontSize: 8, alignment: 'right'
        }
      },
      {// row 1
        text: {
          text: formatFloat(props.salt_con * 10000), fontSize: 8, alignment: 'right'
        }
      },
      {// row 1
        text: {
          text: props.salt_con, fontSize: 8, alignment: 'right'
        }
      }, { text: '' }
    ]
  }
  let rows = props.sort((a, b) => naturalSortBy(a, b, 'import_date')).map(n_import => {
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
          text: 'Quantity (gals)', fontSize: 9, alignment: 'right'
        }
      },
      {// row 1
        fillColor: gray,
        text: {
          text: 'N (mg/L)', fontSize: 9, alignment: 'right'
        }
      },
      {// row 1
        fillColor: gray,
        text: {
          text: 'P (mg/L)', fontSize: 9, alignment: 'right'
        }
      },
      {// row 1
        fillColor: gray,
        text: {
          text: 'K (mg/L)', fontSize: 9, alignment: 'right'
        }
      },
      {// row 1
        fillColor: gray,
        text: {
          text: 'Salt (mg/L)', fontSize: 9, alignment: 'right'
        }
      },
      {// row 1
        fillColor: gray,
        text: {
          text: 'TDS (mg/L)', fontSize: 9, alignment: 'right'
        }
      },
    ],
    ...rows
  ]
  const table = {
    margin: [10, 0, 0, 5],
    table: {
      widths: ['10%', '25%', '10%', '15%', '10%', '10%', '10%', "10%", '*'],
      body: body
    }
  }
  return rows && rows.length > 0 ? table : { margin: [10, 5], text: { text: 'No process wastewater nutrient imports entered.', fontSize: 8, italics: true } }
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
          text: `${props.material_type}/ ${props.import_desc}`, fontSize: 8,
        }
      },
      {// row 1
        text: {
          text: `${props.amount_imported} ${unit}`, fontSize: 8, alignment: 'right'
        }
      },
      {// row 1
        text: {
          text: unit === 'tons' ? props.method_of_reporting : '', fontSize: 8,
        }
      },
      {// row 1
        text: {
          text: unit === 'tons' ? props.moisture : '', fontSize: 8, alignment: 'right'
        }
      },
      {// row 1
        text: {
          text: props.n_con, fontSize: 8, alignment: 'right'
        }
      },
      {// row 1
        text: {
          text: props.p_con, fontSize: 8, alignment: 'right'
        }
      },
      {// row 1
        text: {
          text: props.k_con, fontSize: 8, alignment: 'right'
        }
      },
      {// row 1
        text: {
          text: props.salt_con, fontSize: 8, alignment: 'right'
        }
      }, { text: '' }
    ]
  }
  let rows = props.sort((a, b) => naturalSortBy(a, b, 'import_date')).map(n_import => {
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
          text: 'Quantity', fontSize: 9, alignment: 'right'
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
          text: 'Moisture (%)', fontSize: 9, alignment: 'right'
        }
      },
      {// row 1
        fillColor: gray,
        text: {
          text: 'N (%)', fontSize: 9, alignment: 'right'
        }
      },
      {// row 1
        fillColor: gray,
        text: {
          text: 'P (%)', fontSize: 9, alignment: 'right'
        }
      },
      {// row 1
        fillColor: gray,
        text: {
          text: 'K (%)', fontSize: 9, alignment: 'right'
        }
      },
      {// row 1
        fillColor: gray,
        text: {
          text: 'Salt (%)', fontSize: 9, alignment: 'right'
        }
      },
    ],
    ...rows
  ]
  const table = {
    margin: [10, 0, 0, 5],
    table: {
      widths: ['10%', '25%', '10%', '15%', '8%', '8%', '8%', '8%', '8%', '*'],
      body: body
    }
  }

  return rows && rows.length > 0 ? table : { margin: [10, 5], text: { text: 'No commercial fertilizer nutrient imports entered.', fontSize: 8, italics: true } }
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
        text: `${formatFloat(props.amount_hauled)} tons`,
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
        text: `${formatFloat(props.amount_hauled)} gals`,
        fontSize: 8,
        alignment: "right",
      }
    },
    {// row 1
      text: {
        text: formatFloat(props.kn_con_mg_l),
        fontSize: 8,
        alignment: "right",
      }
    },
    {// row 1
      text: {
        text: formatFloat(props.nh4_con_mg_l),
        fontSize: 8,
        alignment: "right",
      }
    },
    {// row 1
      text: {
        text: formatFloat(props.nh3_con_mg_l),
        fontSize: 8,
        alignment: "right",
      }
    },
    {// row 1
      text: {
        text: formatFloat(props.no3_con_mg_l),
        fontSize: 8,
        alignment: "right",
      }
    },
    {// row 1
      text: {
        text: formatFloat(props.p_con_mg_l),
        fontSize: 8,
        alignment: "right",
      }
    },
    {// row 1
      text: {
        text: formatFloat(props.k_con_mg_l),
        fontSize: 8,
        alignment: "right",
      }
    },
    {// row 1
      text: {
        text: formatFloat(props.ec_umhos_cm),
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
  let exportSolidRows = props.dry.sort((a, b) => naturalSortBy(a, b, 'last_date_hauled')).map(row => {
    return availableNutrientsGSolidTableRow(row)
  })
  let exportLiquidRows = props.process.sort((a, b) => naturalSortBy(a, b, 'last_date_hauled')).map(row => {
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


  const solidTable = exportSolidRows.length > 0 ? _solidTable : { margin: [10, 5], border: [false, false], colSpan: 11, text: { text: 'No solid exports entered.', fontSize: 8, italics: true } }
  const liquidTable = exportLiquidRows.length > 0 ? _liquidTable : { margin: [10, 5], border: [false, false], colSpan: 11, text: { text: 'No liquid exports entered.', fontSize: 8, italics: true } }

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
                  text: 'Material Type', fontSize: 8,
                }
              },
              {// row 1
                fillColor: gray,
                text: {
                  text: 'Total N (lbs)', fontSize: 8,
                  alignment: 'right',
                }
              },
              {// row 1
                fillColor: gray,
                text: {
                  text: 'Total P (lbs)', fontSize: 8,
                  alignment: 'right',
                }
              },
              {// row 1
                fillColor: gray,
                text: {
                  text: 'Total K (lbs)', fontSize: 8,
                  alignment: 'right',
                }
              },
              {// row 1
                fillColor: gray,
                text: {
                  text: 'Total salt (lbs)', fontSize: 8,
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
      text: formatInt(props.acres), fontSize: 8,
      alignment: 'right',
    },
    { // row 1
      text: formatInt(props.cropable), fontSize: 8,
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
            text: 'Totals for areas that were used for applications', fontSize: 8
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
            text: 'Totals for areas that were not used for applications', fontSize: 8
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
            text: 'Land application area totals', fontSize: 8
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

  const table = rows.length > 0 ? _table : { margin: [10, 5], text: { text: 'No land application areas entered.', italics: true, fontSize: 8 } }
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
        text: formatDate(harvest_date),
        fontSize: 8,
      }
    },
    {
      text: {
        text: `${formatFloat(props.actual_yield)} tons`,
        fontSize: 8,
        alignment: 'right',
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
        alignment: 'right',
      }
    },
    {
      text: {
        text: percentageAsMGKG(props.actual_n),
        fontSize: 8,
        alignment: 'right',
      }
    },
    {
      text: {
        text: percentageAsMGKG(props.actual_p),
        fontSize: 8,
        alignment: 'right',
      }
    },
    {
      text: {
        text: percentageAsMGKG(props.actual_k),
        fontSize: 8,
        alignment: 'right',
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
        alignment: 'right',
      }
    },
  ]
}
// For each field, this shows each crops plant date, and corresponding harvests
const applicationAreaBFieldHarvestTableSubTable = (props) => {
  let cropHeader = props.harvests && props.harvests.length > 0 ? props.harvests[0] : {}
  let plant_date = cropHeader.plant_date ? cropHeader.plant_date.split("T")[0] : 'No date entered'

  let rows = []
  props.harvests.forEach(harvestEvent => {
    if (harvestEvent.harvest_date) {
      rows.push(applicationAreaBFieldHarvestTableSubTableRow(harvestEvent))
    }
  })

  const subTable = [
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
  ]


  const displayTable = rows.length > 0 ? subTable : [{ colSpan: 1, text: { text: 'No harvests entered for this crop.', fontSize: 10 }, border: [true, false, true, false] }]
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
              text: `${(formatDate(plant_date))} ${cropHeader.croptitle}`,
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
                      text: formatInt(cropHeader.acres_planted),
                      fontSize: 8,
                      alignment: 'right',
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
                      text: formatDate(plant_date),
                      fontSize: 8,
                    }
                  }

                ]
              ]
            }
          }
        ],
        displayTable,
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
                      text: formatFloat(props.antiTotals[0]),
                      fontSize: 8,
                      alignment: 'right',
                    },
                  },
                  {
                    text: {
                      text: formatFloat(props.antiTotals[1]),
                      fontSize: 8,
                      alignment: 'right',
                    },
                  },
                  {
                    text: {
                      text: formatFloat(props.antiTotals[2]),
                      fontSize: 8,
                      alignment: 'right',
                    },
                  },
                  {
                    text: {
                      text: formatFloat(props.antiTotals[3]),
                      fontSize: 8,
                      alignment: 'right',
                    },
                  },
                  {
                    text: {
                      text: formatFloat(props.antiTotals[4]),
                      fontSize: 8,
                      alignment: 'right',
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
                      text: formatFloat(props.totals[0]),
                      fontSize: 8,
                      alignment: 'right',
                    },
                  },
                  {
                    border: [true, true, true, true],
                    text: {
                      text: formatFloat(props.totals[1]),
                      fontSize: 8,
                      alignment: 'right',
                    },
                  },
                  {
                    border: [true, true, true, true],
                    text: {
                      text: formatFloat(props.totals[2]),
                      fontSize: 8,
                      alignment: 'right',
                    },
                  },
                  {
                    border: [true, true, true, true],
                    text: {
                      text: formatFloat(props.totals[3]),
                      fontSize: 8,
                      alignment: 'right',
                    },
                  },
                  {
                    border: [true, true, true, true],
                    text: {
                      text: formatFloat(props.totals[4]),
                      fontSize: 8,
                      alignment: 'right',
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
  const harvestKeys = Object.keys(props.groupedHarvests).sort(naturalSort)
  let harvestTable = harvestKeys.map(key => {
    return applicationAreaBFieldHarvestTable(props.groupedHarvests[key]) // returns a table for a field with multiple field harvest events
  })

  harvestTable = harvestTable.length > 0 ? harvestTable : [{ margin: [10, 5], border: [false, false], text: { text: 'No harvests entered.', fontSize: 8, italics: true } }]
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
                text: `${props.headerInfo.fieldtitle} - ${formatDate(plant_date)}: ${props.headerInfo.croptitle}`,
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
                        text: formatDate(plant_date), fontSize: 8,
                      }
                    },
                  ]
                ]
              }
            }],
            [{
              border: [true, false, true, false],
              columns: [
                image(img, 450, 175),
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
                              text: props.soils[0], fontSize: 8, alignment: 'right'
                            }
                          },

                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.soils[1], fontSize: 8, alignment: 'right'
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.soils[2], fontSize: 8, alignment: 'right'
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.soils[3], fontSize: 8, alignment: 'right'
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
                              text: props.plows[0], fontSize: 8, alignment: 'right'
                            }
                          },

                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.plows[1], fontSize: 8, alignment: 'right'
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.plows[2], fontSize: 8, alignment: 'right'
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.plows[3], fontSize: 8, alignment: 'right'
                            }
                          },
                        ],
                        [
                          {
                            border: [true, false, true, false],
                            text: {
                              text: 'Commerical fertilizer / Other', fontSize: 8,
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.fertilizers[0], fontSize: 8, alignment: 'right'
                            }
                          },

                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.fertilizers[1], fontSize: 8, alignment: 'right'
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.fertilizers[2], fontSize: 8, alignment: 'right'
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.fertilizers[3], fontSize: 8, alignment: 'right'
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
                              text: props.manures[0], fontSize: 8, alignment: 'right'
                            }
                          },

                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.manures[1], fontSize: 8, alignment: 'right'
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.manures[2], fontSize: 8, alignment: 'right'
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.manures[3], fontSize: 8, alignment: 'right'
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
                              text: props.wastewaters[0], fontSize: 8, alignment: 'right'
                            }
                          },

                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.wastewaters[1], fontSize: 8, alignment: 'right'
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.wastewaters[2], fontSize: 8, alignment: 'right'
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.wastewaters[3], fontSize: 8, alignment: 'right'
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
                              text: props.freshwaters[0], fontSize: 8, alignment: 'right'
                            }
                          },

                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.freshwaters[1], fontSize: 8, alignment: 'right'
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.freshwaters[2], fontSize: 8, alignment: 'right'
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.freshwaters[3], fontSize: 8, alignment: 'right'
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
                              text: props.atmospheric_depo, fontSize: 8, alignment: 'right'
                            }
                          },

                          {
                            border: [true, false, true, true],
                            text: {
                              text: '0.00', fontSize: 8, alignment: 'right'
                            }
                          },
                          {
                            border: [true, false, true, true],
                            text: {
                              text: '0.00', fontSize: 8, alignment: 'right'
                            }
                          },
                          {
                            border: [true, false, true, true],
                            text: {
                              text: '0.00', fontSize: 8, alignment: 'right'
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
                              text: props.total_app[0], fontSize: 8, alignment: 'right'
                            }
                          },

                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.total_app[1], fontSize: 8, alignment: 'right'
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.total_app[2], fontSize: 8, alignment: 'right'
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.total_app[3], fontSize: 8, alignment: 'right'
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
                              text: props.anti_harvests[0], fontSize: 8, alignment: 'right'
                            }
                          },

                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.anti_harvests[1], fontSize: 8, alignment: 'right'
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.anti_harvests[2], fontSize: 8, alignment: 'right'
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.anti_harvests[3], fontSize: 8, alignment: 'right'
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
                              text: props.actual_harvests[0], fontSize: 8, alignment: 'right'
                            }
                          },

                          {
                            border: [true, false, true, true],
                            text: {
                              text: props.actual_harvests[1], fontSize: 8, alignment: 'right'
                            }
                          },
                          {
                            border: [true, false, true, true],
                            text: {
                              text: props.actual_harvests[2], fontSize: 8, alignment: 'right'
                            }
                          },
                          {
                            border: [true, false, true, true],
                            text: {
                              text: props.actual_harvests[3], fontSize: 8, alignment: 'right'
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
                              text: props.nutrient_bal[0], fontSize: 8, alignment: 'right'
                            }
                          },

                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.nutrient_bal[1], fontSize: 8, alignment: 'right'
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.nutrient_bal[2], fontSize: 8, alignment: 'right'
                            }
                          },
                          {
                            border: [true, false, true, false],
                            text: {
                              text: props.nutrient_bal[3], fontSize: 8, alignment: 'right'
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
                              text: props.nutrient_bal_ratio[0], fontSize: 8, alignment: 'right'
                            }
                          },

                          {
                            border: [true, false, true, true],
                            text: {
                              text: props.nutrient_bal_ratio[1], fontSize: 8, alignment: 'right'
                            }
                          },
                          {
                            border: [true, false, true, true],
                            text: {
                              text: props.nutrient_bal_ratio[2], fontSize: 8, alignment: 'right'
                            }
                          },
                          {
                            border: [true, false, true, true],
                            text: {
                              text: props.nutrient_bal_ratio[3], fontSize: 8, alignment: 'right'
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

      Object.keys(fieldAppsByPlantDate[plantDatekey]).map(appKey => {
        let app = fieldAppsByPlantDate[plantDatekey][appKey]
        let appEventHeader = app && app.appDatesObjList && app.appDatesObjList.length > 0 ? app.appDatesObjList[0] : {}
        headerInfo = appEventHeader
        let totals = app.totals
        const innerRows = app.appDatesObjList.map(ev => {

          let unit = ev.tds ? 'gals' : 'tons'
          if (!ev.tds && !ev.tfs && ev.material_type) {
            //Check if it container the word liquid
            unit = ev.material_type.toLowerCase().includes('solid') || ev.material_type.toLowerCase().includes('dry') ? 'tons' : 'gals'
          }

          if (!ev.material_type) {
            ev.material_type = ev.entry_type === 'soil' ? 'Existing soil nutrient content' :
              ev.entry_type === 'plowdown' ? 'Plowdown credit' :
                ev.entry_type === 'freshwater' ? 'Freshwater' : ''
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
                text: formatFloat(round(parseFloat(ev.n_lbs_acre), 2)), fontSize: 8, alignment: 'right'
              }
            },
            {
              text: {
                text: formatFloat(round(parseFloat(ev.p_lbs_acre), 2)), fontSize: 8, alignment: 'right'
              }
            },
            {
              text: {
                text: formatFloat(round(parseFloat(ev.k_lbs_acre), 2)), fontSize: 8, alignment: 'right'
              }
            },
            {
              text: {
                text: formatFloat(round(parseFloat(ev.salt_lbs_acre), 2)), fontSize: 8, alignment: 'right'
              }
            },
            {
              text: {
                text: ev.amount_applied === undefined || ev.entry_type === 'fertilizer' ? '' : `${formatFloat(ev.amount_applied)} ${unit}`, fontSize: 8, alignment: 'center'
              }
            },
          ]
        })

        rows.push([// MainSubTable App_date/ method/ precip before during after... 
          {
            text: {
              text: appEventHeader.app_date ? formatDate(appEventHeader.app_date.split('T')[0]) : '', fontSize: 8,
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
                      text: 'N  (lbs/acre)', fontSize: 8, alignment: 'right'
                    }
                  },
                  {
                    fillColor: gray,
                    text: {
                      text: 'P (lbs/acre)', fontSize: 8, alignment: 'right'
                    }
                  },
                  {
                    fillColor: gray,
                    text: {
                      text: 'K (lbs/acre)', fontSize: 8, alignment: 'right'
                    }
                  },
                  {
                    fillColor: gray,
                    text: {
                      text: 'Salt (lbs/acre)', fontSize: 8, alignment: 'right'
                    }
                  },
                  {
                    fillColor: gray,
                    text: {
                      text: 'Amount', fontSize: 8, alignment: 'center'
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
                      text: formatFloat(round(parseFloat(totals[0]), 2)), fontSize: 8, alignment: 'right'
                    }
                  },
                  {
                    fillColor: gray,
                    text: {
                      text: formatFloat(round(parseFloat(totals[1]), 2)), fontSize: 8, alignment: 'right'
                    }
                  },
                  {
                    fillColor: gray,
                    text: {
                      text: formatFloat(round(parseFloat(totals[2]), 2)), fontSize: 8, alignment: 'right'
                    }
                  },
                  {
                    fillColor: gray,
                    text: {
                      text: formatFloat(round(parseFloat(totals[3]), 2)), fontSize: 8, alignment: 'right'
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
                    text: `${headerInfo.fieldtitle} - ${headerInfo.plant_date ? formatDate(headerInfo.plant_date.split('T')[0]) : ''}: ${headerInfo.croptitle}`,
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
                                      text: headerInfo.plant_date ? formatDate(headerInfo.plant_date.split('T')[0]) : '', fontSize: 8,
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
  } : { margin: [10, 5], text: { text: 'No land application areas entered.', fontSize: 8, italics: true } }

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

  tables = tables.length > 0 ? tables : [{ margin: [10, 5], text: { text: 'No applications entered.' }, italics: true, fontSize: 8 }]

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
                        text: analysis.sample_date ? formatDate(analysis.sample_date.split('T')[0]) : '', fontSize: 8,
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
                        text: "Total N (mg/kg)", fontSize: 8, alignment: 'right'
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "Total P (mg/kg)", fontSize: 8, alignment: 'right'
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "Total K (mg/kg)", fontSize: 8, alignment: 'right'
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "Calcium (mg/kg)", fontSize: 8, alignment: 'right'
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "Magnesium (mg/kg)", fontSize: 8, alignment: 'right'
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "Sodium (mg/kg)", fontSize: 8, alignment: 'right'
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "Sulfur (mg/kg)", fontSize: 8, alignment: 'right'
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "Chloride (mg/kg)", fontSize: 8, alignment: 'right'
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "Total Salt (mg/kg)", fontSize: 8, alignment: 'right'
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "TFS(%)", fontSize: 8, alignment: 'right'
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
                        text: formatFloat(percentageAsMGKG(parseFloat(analysis.n_con), 2)), fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: formatFloat(percentageAsMGKG(parseFloat(analysis.p_con), 2)), fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: formatFloat(percentageAsMGKG(parseFloat(analysis.k_con), 2)), fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: formatFloat(percentageAsMGKG(parseFloat(analysis.ca_con), 2)), fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: formatFloat(percentageAsMGKG(parseFloat(analysis.mg_con), 2)), fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: formatFloat(percentageAsMGKG(parseFloat(analysis.na_con), 2)), fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: formatFloat(percentageAsMGKG(parseFloat(analysis.s_con), 2)), fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: formatFloat(percentageAsMGKG(parseFloat(analysis.cl_con), 2)), fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: '', fontSize: 8,
                      }
                    },
                    {
                      text: {
                        text: formatFloat(round(parseFloat(analysis.tfs), 2)), fontSize: 8,
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
                        text: formatFloat(round(formatFloat(analysis.n_dl), 2)), fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: formatFloat(round(formatFloat(analysis.p_dl), 2)), fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: formatFloat(round(formatFloat(analysis.k_dl), 2)), fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: formatFloat(round(formatFloat(analysis.ca_dl), 2)), fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: formatFloat(round(formatFloat(analysis.mg_dl), 2)), fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: formatFloat(round(formatFloat(analysis.na_dl), 2)), fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: formatFloat(round(formatFloat(analysis.s_dl), 2)), fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: formatFloat(round(formatFloat(analysis.cl_dl), 2)), fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: " ", fontSize: 8,
                      }
                    },
                    {
                      text: {
                        text: formatFloat(round(formatFloat(analysis.tfs_dl), 2)), fontSize: 8,
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

  tables = tables.length > 0 ? tables : [{ margin: [10, 5], text: { text: 'No manure analyses entered.', fontSize: 8, italics: true } }]
  return {
    pageBreak: 'before', // super useful soltion just dont need on the first on
    stack: [
      {

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
                widths: ['8%', '10%', '8%', '20%', '13%', '15%', '8%', '8%'],
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
                        text: analysis.sample_date ? formatDate(analysis.sample_date.split('T')[0]) : '', fontSize: 8,
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
                        text: "Kjeldahl-N (mg/L)", fontSize: 8, alignment: 'right',
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "NH4-N (mg/L)", fontSize: 8, alignment: 'right',
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "NH3-N (mg/L)", fontSize: 8, alignment: 'right',
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "Nitrate-N (mg/L)", fontSize: 8, alignment: 'right',
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "Total P (mg/L)", fontSize: 8, alignment: 'right',
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "Total K (mg/L)", fontSize: 8, alignment: 'right',
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "Calcium (mg/L)", fontSize: 8, alignment: 'right',
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "Magnes. (mg/L)", fontSize: 8, alignment: 'right',
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "Sodium (mg/L)", fontSize: 8, alignment: 'right',
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "Bicarb. (mg/L)", fontSize: 8, alignment: 'right',
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "Carb, (mg/L)", fontSize: 8, alignment: 'right',
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "Sulfate (mg/L)", fontSize: 8, alignment: 'right',
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "Chloride (mg/L)", fontSize: 8, alignment: 'right',
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "EC (µmhos/cm)", fontSize: 8, alignment: 'right',
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "TDS (mg/L)", fontSize: 8, alignment: 'right',
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
                        text: formatFloat(analysis.kn_con), fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: formatFloat(analysis.nh4_con), fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: formatFloat(analysis.nh3_con), fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: formatFloat(analysis.no3_con), fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: formatFloat(analysis.p_con), fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: formatFloat(analysis.k_con), fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: formatFloat(analysis.ca_con), fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: formatFloat(analysis.mg_con), fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: formatFloat(analysis.na_con), fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: formatFloat(analysis.hco3_con), fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: formatFloat(analysis.co3_con), fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: formatFloat(analysis.so4_con), fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: formatFloat(analysis.cl_con), fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: formatFloat(analysis.ec), fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: formatFloat(analysis.tds), fontSize: 8,
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
                        text: formatFloat(analysis.kn_dl), fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: formatFloat(analysis.nh4_dl), fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: formatFloat(analysis.nh3_dl), fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: formatFloat(analysis.no3_dl), fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: formatFloat(analysis.p_dl), fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: formatFloat(analysis.k_dl), fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: formatFloat(analysis.ca_dl), fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: formatFloat(analysis.mg_dl), fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: formatFloat(analysis.na_dl), fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: formatFloat(analysis.hco3_dl), fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: formatFloat(analysis.co3_dl), fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: formatFloat(analysis.so4_dl), fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: formatFloat(analysis.cl_dl), fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      text: {
                        text: formatFloat(analysis.ec_dl), fontSize: 8,
                        alignment: 'right',
                      }
                    },
                    {
                      headlineLevel: `processWastewaterAnalyses${i}`,
                      text: {
                        text: analysis.tds_dl, fontSize: 8,
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
  tables = tables.length > 0 ? tables : [{ margin: [10, 5], text: { text: 'No process wastewater analyses entered.', fontSize: 8, italics: true } }]
  return {
    // pageBreak: 'before', // super useful soltion just dont need on the first on
    stack: [
      {

        table: {
          widths: ['100%'],
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
          headlineLevel: `freshWaterAnalyses${i}`,
          widths: ['20%', '80%'],
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
                          text: props.sample_date ? formatDate(props.sample_date.split('T')[0]) : '', fontSize: 8,
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
                  widths: ['4%', '10%', '10%', '11%', '6%', '6%', '6%', '6%', '6%', '6%', '6%', '8%', '8%'],
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
                          text: "Total N (mg/L)", fontSize: 8,
                        }
                      },
                      {
                        fillColor: gray,
                        text: {
                          text: "NH4-N (mg/L)", fontSize: 8,
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
                          text: "Calcium (mg/L)", fontSize: 8,
                        }
                      },
                      {
                        fillColor: gray,
                        text: {
                          text: "Magnes. (mg/L)", fontSize: 8,
                        }
                      },
                      {
                        fillColor: gray,
                        text: {
                          text: "Sodium (mg/L)", fontSize: 8,
                        }
                      },
                      {
                        fillColor: gray,
                        text: {
                          text: "Bicarb. (mg/L)", fontSize: 8,
                        }
                      },
                      {
                        fillColor: gray,
                        text: {
                          text: "Carb, (mg/L)", fontSize: 8,
                        }
                      },
                      {
                        fillColor: gray,
                        text: {
                          text: "Sulfate (mg/L)", fontSize: 8,
                        }
                      },
                      {
                        fillColor: gray,
                        text: {
                          text: "Chloride (mg/L)", fontSize: 8,
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
                    [
                      {
                        text: {
                          text: "Value", fontSize: 8, bold: true,
                        }
                      },
                      {
                        text: {
                          text: formatFloat(props.n_con), fontSize: 8, alignment: 'right'
                        }
                      },
                      {
                        text: {
                          text: formatFloat(props.nh4_con), fontSize: 8, alignment: 'right'
                        }
                      },
                      {
                        text: {
                          text: formatFloat(props.no2_con), fontSize: 8, alignment: 'right'
                        }
                      },
                      {
                        text: {
                          text: formatFloat(props.ca_con), fontSize: 8, alignment: 'right'
                        }
                      },
                      {
                        text: {
                          text: formatFloat(props.mg_con), fontSize: 8, alignment: 'right'
                        }
                      },
                      {
                        text: {
                          text: formatFloat(props.na_con), fontSize: 8, alignment: 'right'
                        }
                      },
                      {
                        text: {
                          text: formatFloat(props.hco3_con), fontSize: 8, alignment: 'right'
                        }
                      },
                      {
                        text: {
                          text: formatFloat(props.co3_con), fontSize: 8, alignment: 'right'
                        }
                      },
                      {
                        text: {
                          text: formatFloat(props.so4_con), fontSize: 8, alignment: 'right'
                        }
                      },
                      {
                        text: {
                          text: formatFloat(props.cl_con), fontSize: 8, alignment: 'right'
                        }
                      },
                      {
                        text: {
                          text: formatFloat(props.ec), fontSize: 8, alignment: 'right'
                        }
                      },
                      {
                        text: {
                          text: formatFloat(props.tds), fontSize: 8, alignment: 'right'
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
                          text: formatFloat(props.n_dl), fontSize: 8, alignment: 'right'
                        }
                      },
                      {
                        text: {
                          text: formatFloat(props.nh4_dl), fontSize: 8, alignment: 'right'
                        }
                      },
                      {
                        text: {
                          text: formatFloat(props.no2_dl), fontSize: 8, alignment: 'right'
                        }
                      },
                      {
                        text: {
                          text: formatFloat(props.ca_dl), fontSize: 8, alignment: 'right'
                        }
                      },
                      {
                        text: {
                          text: formatFloat(props.mg_dl), fontSize: 8, alignment: 'right'
                        }
                      },
                      {
                        text: {
                          text: formatFloat(props.na_dl), fontSize: 8, alignment: 'right'
                        }
                      },
                      {
                        text: {
                          text: formatFloat(props.hco3_dl), fontSize: 8, alignment: 'right'
                        }
                      },
                      {
                        text: {
                          text: formatFloat(props.co3_dl), fontSize: 8, alignment: 'right'
                        }
                      },
                      {
                        text: {
                          text: formatFloat(props.so4_dl), fontSize: 8, alignment: 'right'
                        }
                      },
                      {
                        text: {
                          text: formatFloat(props.cl_dl), fontSize: 8, alignment: 'right'
                        }
                      },
                      {
                        text: {
                          text: formatFloat(props.ec_dl), fontSize: 8, alignment: 'right'
                        }
                      },
                      {

                        text: {
                          text: formatFloat(props.tds_dl), fontSize: 8, alignment: 'right'
                        }
                      },
                    ],
                  ]
                }
              }, { headlineLevel: `freshWaterAnalyses${i}`, text: ' ' }
            ]
          ]
        }
      }
    ]
  }

  let tables = Object.keys(props).sort(naturalSort).map((key, i) => {
    let analyses = props[key]
    let headerInfo = analyses && analyses[0] ? analyses[0] : {}
    const subTables = analyses.sort((a, b) => naturalSortBy(a, b, 'sample_date')).map((analysis) => {
      return subTable(analysis, i)
    })

    return {
      width: "100%",
      margin: [10, 0, 0, 5],
      table: {
        widths: ['99%'],
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



  tables = tables.length > 0 ? tables : [{ margin: [10, 5], text: { text: 'No fresh water analyses entered.', fontSize: 8, italics: true } }]
  return {
    // pageBreak: 'before', // super useful soltion just dont need on the first on
    stack: [
      {
        table: {
          widths: ['100%'],
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
                          text: props.sample_date ? formatDate(props.sample_date.split('T')[0]) : '', fontSize: 8,
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
                  widths: ['8%', '14%', '12%', '12%', '12%', '12%', '12%', '12%'],
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
                          text: "Nitrate-N (mg/kg)", fontSize: 8, alignment: 'right'
                        }
                      },
                      {
                        fillColor: gray,
                        text: {
                          text: "Total P (mg/kg)", fontSize: 8,
                        }
                      },
                      {
                        fillColor: gray,
                        text: {
                          text: "Soluable P (mg/kg)", fontSize: 8,
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
                          text: "EC (μmhos/cm)", fontSize: 8,
                        }
                      },
                      {
                        fillColor: gray,
                        text: {
                          text: "Organic matter (%)", fontSize: 8,
                        }
                      },
                      {
                        fillColor: gray,
                        text: {
                          text: "Total salt (mg/kg)", fontSize: 8,
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
                          text: formatFloat(props.n_con), fontSize: 8, alignment: 'right'
                        }
                      },
                      {
                        text: {
                          text: formatFloat(props.total_p_con), fontSize: 8, alignment: 'right'
                        }
                      },
                      {
                        text: {
                          text: formatFloat(props.p_con), fontSize: 8, alignment: 'right'
                        }
                      },
                      {
                        text: {
                          text: formatFloat(props.k_con), fontSize: 8, alignment: 'right'
                        }
                      },
                      {
                        text: {
                          text: formatFloat(props.ec), fontSize: 8, alignment: 'right'
                        }
                      },
                      {
                        text: {
                          text: formatFloat(props.org_matter), fontSize: 8, alignment: 'right'
                        }
                      },
                      {
                        text: {
                          text: '', fontSize: 8,
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
                          text: formatFloat(props.n_dl), fontSize: 8, alignment: 'right'
                        }
                      },
                      {
                        text: {
                          text: formatFloat(props.total_p_dl), fontSize: 8, alignment: 'right'
                        }
                      },
                      {
                        text: {
                          text: formatFloat(props.p_dl), fontSize: 8, alignment: 'right'
                        }
                      },
                      {
                        text: {
                          text: formatFloat(props.k_dl), fontSize: 8, alignment: 'right'
                        }
                      },
                      {
                        text: {
                          text: formatFloat(props.ec_dl), fontSize: 8, alignment: 'right'
                        }
                      },
                      {
                        text: {
                          text: formatFloat(props.org_matter_dl), fontSize: 8, alignment: 'right'
                        }
                      },

                      {
                        headlineLevel: `soilAnalyses${i}`,
                        text: {
                          text: '', fontSize: 8,
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

  const tables = Object.keys(props).sort(naturalSort).map((key, i) => {
    let analyses = props[key]
    let headerInfo = analyses && analyses[0] ? analyses[0] : {}

    const subTables = analyses.sort((a, b) => naturalSortBy(a, b, 'sample_date')).map((analysis) => {
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


  const content = tables && tables.length > 0 ? tables : [{ margin: [10, 5], text: { text: 'No Soil analyses entered.', italics: true, fontSize: 8 } }]
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
  const tables = Object.keys(props).sort(naturalSort).map((key, i) => {
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
                            text: props.sample_date ? formatDate(props.sample_date.split('T')[0]) : '', fontSize: 8,
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
                            text: "Total N (mg/kg)", fontSize: 8,
                          }
                        },
                        {
                          fillColor: gray,
                          text: {
                            text: "Total P (mg/kg)", fontSize: 8,
                          }
                        },
                        {
                          fillColor: gray,
                          text: {
                            text: "Total K (mg/kg)", fontSize: 8,
                          }
                        },
                        {
                          fillColor: gray,
                          text: {
                            text: "Total salt (mg/kg)", fontSize: 8,
                          }
                        },
                        {
                          fillColor: gray,
                          text: {
                            text: "TFS (%)", fontSize: 8, alignment: 'right'
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
                            text: formatFloat(percentageAsMGKG(props.actual_n)), fontSize: 8, alignment: 'right'
                          }
                        },
                        {
                          text: {
                            text: formatFloat(percentageAsMGKG(props.actual_p)), fontSize: 8, alignment: 'right'
                          }
                        },
                        {
                          text: {
                            text: formatFloat(percentageAsMGKG(props.actual_k)), fontSize: 8, alignment: 'right'
                          }
                        },
                        {
                          text: {
                            text: '', fontSize: 8,
                          }
                        },
                        {
                          text: {
                            text: formatFloat(props.tfs), fontSize: 8, alignment: 'right'
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
                            text: formatFloat(props.n_dl), fontSize: 8, alignment: 'right'
                          }
                        },
                        {
                          text: {
                            text: formatFloat(props.p_dl), fontSize: 8, alignment: 'right'
                          }
                        },
                        {
                          text: {
                            text: formatFloat(props.k_dl), fontSize: 8, alignment: 'right'
                          }
                        },
                        {
                          text: {
                            text: '', fontSize: 8,
                          }
                        },
                        {
                          headlineLevel: `ptAnalyses${i}`,
                          text: {
                            text: formatFloat(props.tfs_dl), fontSize: 8, alignment: 'right'
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

    const subTables = harvests.sort((a, b) => naturalSortBy(a, b, 'sample_date')).map(harvest => subTable(harvest))

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
  const content = tables && tables.length > 0 ? tables : [{ margin: [10, 5], text: { text: 'No plant tissue analyses entered.', italics: true, fontSize: 8 } }]
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


  let tables = Object.keys(props).sort(naturalSort).map((key, i) => {
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
                            text: props.sample_date ? formatDate(props.sample_date.split('T')[0]) : '', fontSize: 8,
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
                            text: "NH4-N (mg/L)", fontSize: 8,
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
                            text: "Total P (mg/L)", fontSize: 8,
                          }
                        },
                        {
                          fillColor: gray,
                          text: {
                            text: "EC (μmhos/cm)", fontSize: 8,
                          }
                        },
                        {
                          fillColor: gray,
                          text: {
                            text: "TDS (mg/L)", fontSize: 8, alignment: 'right'
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
                            text: formatFloat(props.nh4_con), fontSize: 8, alignment: 'right'
                          }
                        },
                        {
                          text: {
                            text: formatFloat(props.no2_con), fontSize: 8, alignment: 'right'
                          }
                        },
                        {
                          text: {
                            text: formatFloat(props.p_con), fontSize: 8, alignment: 'right'
                          }
                        },
                        {
                          text: {
                            text: formatFloat(props.ec), fontSize: 8, alignment: 'right'
                          }
                        },
                        {
                          text: {
                            text: formatInt(props.tds), fontSize: 8, alignment: 'right'
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
                            text: formatFloat(props.nh4_dl), fontSize: 8, alignment: 'right'
                          }
                        },
                        {
                          text: {
                            text: formatFloat(props.no2_dl), fontSize: 8, alignment: 'right'
                          }
                        },
                        {
                          text: {
                            text: formatFloat(props.p_dl), fontSize: 8, alignment: 'right'
                          }
                        },
                        {
                          text: {
                            text: formatFloat(props.ec_dl), fontSize: 8, alignment: 'right'
                          }
                        },
                        {
                          headlineLevel: `drainAnalyses${i}`,
                          text: {
                            text: formatInt(props.tds_dl), fontSize: 8, alignment: 'right'
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

    const subTables = analyses.sort((a, b) => naturalSortBy(a, b, 'sample_date')).map(analysis => subTable(analysis))

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


  tables = tables.length > 0 ? tables : [{ margin: [10, 5], text: { text: 'No subsurface (tile) drainage analyses entered.', fontSize: 8, italics: true } }]
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
    const _disDate = row.discharge_datetime.split('T')
    const disDate = _disDate[0]
    const disTime = _disDate[1].slice(0, -1)
    return [
      {
        text: {
          text: `${disDate} ${disTime}`, fontSize: 8,
        }
      },
      {
        text: {
          text: row.discharge_loc, fontSize: 8,
        }
      },
      {
        text: {
          text: row.ref_number, fontSize: 8,
        }
      },
      {
        text: {
          text: row.method_of_measuring, fontSize: 8,
        }
      },
      {
        text: {
          text: row.sample_location_reason, fontSize: 8,
        }
      },
      {
        text: {
          text: `${row.vol} ${row.vol_unit}`, fontSize: 8, alignment: 'right',
        }
      },
    ]
  })

  let body = [
    [
      {
        fillColor: gray,
        text: {
          text: 'Discharge date', fontSize: 8,
        }
      },
      {
        fillColor: gray,
        text: {
          text: 'Location', fontSize: 8,
        }
      },
      {
        fillColor: gray,
        text: {
          text: 'Map reference #', fontSize: 8,
        }
      },
      {
        fillColor: gray,
        text: {
          text: 'Method of measuring discharge', fontSize: 8,
        }
      },
      {
        fillColor: gray,
        text: {
          text: 'Rationale for sample locations', fontSize: 8,
        }
      },
      {
        fillColor: gray,
        text: {
          text: 'Volume', fontSize: 8, alignment: 'right'
        }
      },
    ],
    ...rows
  ]

  let table = {
    margin: [10, 5, 0, 5],
    table: {
      widths: ['14%', '20%', '12%', '20%', '20%', '12%'],
      body: body
    }
  }
  let noTable = {
    margin: [10, 10, 0, 10],
    text: {
      text: 'No manure or process wastewater discharges occurred during the reporting period.', italics: true, fontSize: 8
    }
  }

  return props && props.length > 0 ? table : noTable
}
const exceptionReportingBTable = (props) => {
  props = props && typeof props === typeof [] ? props : []
  let rows = props.map((row, i) => {
    const _disDate = row.discharge_datetime.split('T')
    const disDate = _disDate[0]
    const disTime = _disDate[1].slice(0, -1)
    return [
      {
        text: {
          text: `${disDate} ${disTime}`, fontSize: 8,
        }
      },
      {
        text: {
          text: row.discharge_loc, fontSize: 8,
        }
      },
      {
        text: {
          text: row.ref_number, fontSize: 8,
        }
      },
      {
        text: {
          text: row.method_of_measuring, fontSize: 8,
        }
      },
      {
        text: {
          text: row.sample_location_reason, fontSize: 8,
        }
      },
      {
        text: {
          text: row.duration_of_discharge, fontSize: 8, alignment: 'right'
        }
      },
      {
        text: {
          text: `${row.vol} ${row.vol_unit}`, fontSize: 8, alignment: 'right'
        }
      },
    ]
  })

  let body = [
    [
      {
        fillColor: gray,
        text: {
          text: 'Discharge date', fontSize: 8,
        }
      },
      {
        fillColor: gray,
        text: {
          text: 'Location', fontSize: 8,
        }
      },
      {
        fillColor: gray,
        text: {
          text: 'Map reference #', fontSize: 8,
        }
      },
      {
        fillColor: gray,
        text: {
          text: 'Method of measuring discharge', fontSize: 8,
        }
      },
      {
        fillColor: gray,
        text: {
          text: 'Rationale for sample locations', fontSize: 8,
        }
      },
      {
        fillColor: gray,
        text: {
          text: 'Duration (min)', fontSize: 8, alignment: 'right'
        }
      },
      {
        fillColor: gray,
        text: {
          text: 'Volume', fontSize: 8, alignment: 'right'
        }
      },
    ],
    ...rows
  ]

  let table = {
    margin: [10, 5, 0, 5],
    table: {
      widths: ['14%', '14%', '10%', '18%', '18%', '12%', '12%'],
      body: body
    }
  }
  let noTable = {
    margin: [10, 10, 0, 10],
    text: {
      text: 'No stormwater discharges occurred during the reporting period.', italics: true, fontSize: 8
    }
  }

  return props && props.length > 0 ? table : noTable
}
const exceptionReportingCTable = (props) => {
  props = props && typeof props === typeof [] ? props : []
  // Generate rows for Report, simple table :)
  let rows = props.map((row, i) => {
    const _disDate = row.discharge_datetime.split('T')
    const disDate = _disDate[0]
    const disTime = _disDate[1].slice(0, -1)
    return [
      {
        text: {
          text: row.discharge_datetime ? `${formatDate(disDate)} ${disTime}` : '',
          fontSize: 8,
        }
      },
      {
        text: {
          text: row.discharge_loc, fontSize: 8,
        }
      },
      {
        text: {
          text: row.ref_number, fontSize: 8,
        }
      },
      {
        text: {
          text: row.method_of_measuring, fontSize: 8,
        }
      },
      {
        text: {
          text: row.sample_location_reason, fontSize: 8,
        }
      },
      {
        text: {
          text: row.discharge_src, fontSize: 8,
        }
      },
      {
        text: {
          text: `${row.vol} ${row.vol_unit}`, fontSize: 8, alignment: 'right'
        }
      },
    ]
  })

  let body = [
    [
      {
        fillColor: gray,
        text: {
          text: 'Discharge date', fontSize: 8,
        }
      },
      {
        fillColor: gray,
        text: {
          text: 'Location', fontSize: 8,
        }
      },
      {
        fillColor: gray,
        text: {
          text: 'Map reference #', fontSize: 8,
        }
      },
      {
        fillColor: gray,
        text: {
          text: 'Method of measuring discharge', fontSize: 8,
        }
      },
      {
        fillColor: gray,
        text: {
          text: 'Rationale for sample locations', fontSize: 8,
        }
      },
      {
        fillColor: gray,
        text: {
          text: 'Source of discharge', fontSize: 8,
        }
      },
      {
        fillColor: gray,
        text: {
          text: 'Volume', fontSize: 8, alignment: 'right'
        }
      },
    ],
    ...rows
  ]

  let table = {
    margin: [10, 10, 0, 10],
    table: {
      widths: ['14%', '14%', '10%', '18%', '18%', '12%', '12%'],
      body: body
    }
  }

  let noTable = {
    margin: [10, 5, 0, 5],
    text: {
      text: 'No manure or process wastewater discharges occurred during the reporting period.', italics: true, fontSize: 8
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
                text: 'SIGNATURE OF OWNER OF FACILITY ', fontSize: 8,
              }
            },
            {
              width: "50%",
              text: {
                text: 'SIGNATURE OF OPERATOR OF FACILITY', fontSize: 8,
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
                text: 'PRINT OR TYPE NAME ', fontSize: 8,
              }
            },
            {
              width: "50%",
              text: {
                text: 'PRINT OR TYPE NAME', fontSize: 8,
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
                text: 'DATE ', fontSize: 8,
              }
            },
            {
              width: "50%",
              text: {
                text: 'DATE', fontSize: 8,
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

export default function dd(props, images, logo) {
  const curDateTime = getDateTime()
  const dairyInfo = props && props.dairyInformationA ? props.dairyInformationA : {}
  const footerTitle = `${dairyInfo.title} | ${dairyInfo.street} | ${dairyInfo.city}, ${dairyInfo.city_state} ${dairyInfo.city_zip} | ${dairyInfo.county} | ${dairyInfo.basin_plan}`
  const periodStart = dairyInfo.period_start ? formatDate(dairyInfo.period_start.split("T")[0]) : ''
  const periodEnd = dairyInfo.period_end ? formatDate(dairyInfo.period_end.split("T")[0]) : ''
  const reportingPeriod = `Reporting peroid ${periodStart} to ${periodEnd}.`

  const footerImg = image(logo, 100, 30)

  const body = [
    dairyInformationA(props.dairyInformationA),
    dairyInformationB(props.dairyInformationB),
    dairyInformationC(props.dairyInformationC),
    availableNutrientsA(props.availableNutrientsAB),   // bind last two rows and last row of table together...
    availableNutrientsB(props.availableNutrientsAB),  // bind this section together
    availableNutrientsC(props.availableNutrientsC),   // bind this section together
    availableNutrientsD(props.availableNutrientsD),
    availableNutrientsE(props.availableNutrientsE),   // subsurface tile drainage
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