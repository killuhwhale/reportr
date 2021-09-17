import { formatFloat } from "../../utils/format"

const PARCELS = ["0045-0200-0012-0000", "0045-0200-0020-0000", "0045-0200-0023-0000", "0045-0200-0029-0000", "0045-0200-0033-0000",
  "0045-0200-0034-0000", "0045-0200-0035-0000", "0045-0200-0037-0000", "0045-0200-0060-0000", "0045-0200-0061-0000", "0045-0200-0074-0000", "0045-0230-0025-0000",
  "0045-0230-0066-0000", "0045-0240-0037-0000"]

const OwnOperators = [
  {
    is_owner: false,
    title: "John da Farmer",
    is_repsponsible: false
  },
  // {
  //   is_owner: true,
  //   title: "Bently the owner",
  //   is_repsponsible: false
  // },
  // {
  //   is_owner: true,
  //   title: "Bently the owner",
  //   is_repsponsible: false
  // },
  // {
  //   is_owner: true,
  //   title: "Bently the owner",
  //   is_repsponsible: false
  // },
  // {
  //   is_owner: true,
  //   title: "Bently the owner",
  //   is_repsponsible: false
  // },
  // {
  //   is_owner: true,
  //   title: "Bently the owner",
  //   is_repsponsible: false
  // },
  // {
  //   is_owner: true,
  //   title: "Bently the owner",
  //   is_repsponsible: false
  // },
  // {
  //   is_owner: true,
  //   title: "Bently the owner",
  //   is_repsponsible: false
  // },

]
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
    // layout: 'headerLineOnly'
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
        layout: 'formLayout'
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
        layout: 'formLayout'
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
      widths: ["*"],

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
  if (props.parcels.length > 6) {
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
  } else {
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

  return {
    // pageBreak: 'before', // super useful soltion just dont need on the first one
    stack: [{
      margin: 0,
      stack: [ // Header and first row - unindented
        {
          margin: 0,
          table: {
            widths: ['*'],
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
            widths: ['auto', '*'],
            heights: [1],
            body: [
              [{// row 1

                border: [false, false, false, false],
                text: {
                  text: 'A. NAME OF DAIRY OR BUSINESS OPERATING THE DAIRY:', bold: true, fontSize: 9,

                }
              },
              {
                border: [false, false, false, true],
                text: {
                  text: props.title, fontSize: 9, lineHeight: 0.1
                }
              }]
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
            widths: ["*"],
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
            widths: ['auto', 'auto', '*'],
            heights: [1],
            body: [
              [{// row 1

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
            widths: ['auto'],
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
    {
      margin: [20, 0, 0, 0], // Parcels
      stack: [
        {
          table: {
            widths: ['*', '*', '*', '*', '*', '*',],
            body: parcelTableBody
          }
        }
      ]
    }
    ]
  }
}
const dairyInformationB = (props) => {
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
        stack: props.operators.map((operator, i) => {
          return {
            table: {
              body: [
                [ownOperatorTable(`owneropTableB${i}`, operator, false)]
              ],
              widths: [705],
            },
            layout: 'noBorders'
          }
        })
      }
    ]
  }
}
const dairyInformationC = (props) => {
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
        stack: props.owners.map((owner, i) => {
          return {
            table: {
              body: [
                [ownOperatorTable(`ownerTableA${i}`, owner, true)]
              ],
              widths: [705],
            },
            layout: 'noBorders'
          }
        })
      }
    ]
  }
}

const availableNutrientsA = (props) => {
  return {
    pageBreak: 'before', // super useful soltion just dont need on the first one
    headlineLevel: "availableNutrients1",

    stack: [{
      stack: [ // Header and first row - unindented
        {
          table: {
            widths: ['98%'],
            body: [
              [{
                // border: [false, false, false, false],
                text: {
                  text: 'AVAILABLE NUTRIENTS', alignment: 'center', fontSize: 10
                }
              }]
            ]
          }
        },
        {
          table: {
            margin: [0, 0],
            widths: ['auto'],
            heights: [1],
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
        }
      ]
    },
    {
      margin: [10, 0, 0, 0], // content - indented
      stack: [
        {

          table: {
            widths: ["25%", "10%", "10%", "15%", "20%", "10%", "10%"],
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
                  headlineLevel: "availableNutrients1",

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
          headlineLevel: "availableNutrients0",
          margin: [0, 5, 0, 5],
          table: {
            widths: ['15%', '85%'],
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
          headlineLevel: "availableNutrients0",
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
            widths: ['auto'],
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
    // pageBreak: 'before', // super useful soltion just dont need on the first one
    stack: [
      {
        table: {
          widths: ['98%'],
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
          widths: ['75%', '25%'],
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
      }
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
          text: 'No subsurface (tile) drainage entered.', fontSize: 9,
        }
      },
    ]
  ]
  // const body = props.sources.length > 0 ? fullBody : emptyBody
  const body = fullBody


  return {
    // pageBreak: 'before', // super useful soltion just dont need on the first one
    stack: [
      {
        table: {
          margin: [0, 0],
          widths: ['98%'],
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
          widths: ['98%'],
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
      },
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
      widths: ['15%', '15%', '15%', '15%', '7%', '7%', '7%', '7%', '6%', "6%"],
      body: body
    }
  }
  return rows && rows.length > 0 ? table : { text: { text: 'No dry manure nutrient imports entered.', fontSize: 7, italics: true } }
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
      },
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
      widths: ['15%', '15%', '15%', '15%', '10%', '10%', '10%', "10%"],
      body: body
    }
  }
  return rows && rows.length > 0 ? table : { text: { text: 'No process wastewater nutrient imports entered.', fontSize: 7, italics: true } }
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
      },
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
      widths: ['15%', '15%', '15%', '15%', '8%', '8%', '8%', '8%', '8%'],
      body: body
    }
  }

  return rows && rows.length > 0 ? table : { text: { text: 'No commercial fertilizer nutrient imports entered.', fontSize: 7, italics: true } }
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
    }
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
    }
  ]
}
const availableNutrientsG = (props) => {
  let exportSolidRows = props.dry.map(row => {
    return availableNutrientsGSolidTableRow(row)
  })
  let exportLiquidRows = props.process.map(row => {
    return availableNutrientsGLiquidTableRow(row)
  })

  return {
    // pageBreak: 'before', // super useful soltion just dont need on the first one
    stack: [
      {
        table: {
          widths: ['auto'],
          heights: [1],
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
      {
        margin: [10, 5, 18, 0],
        table: {
          widths: ['7%', '13%', '9%', '10%', '8%', '12%', '6%', '6%', '6%', '8%', '5%'],
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
      },
      {
        margin: [10, 5, 18, 0],
        table: {
          widths: ['7%', '13%', '9%', '10%', '8%', '12%', '6%', '6%', '6%', '8%', '5%'],
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
      },
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
    },
  ]
}
const applicationAreaA = (props) => {

  let rows = props.fields.map(row => {
    return applicationAreaATableRow(row)
  })

  return {
    pageBreak: 'before', // super useful soltion just dont need on the first one

    stack: [
      {
        columns: [ // Header and first row - unindented
          {
            width: "98%",
            table: {
              widths: ['98%'],
              body: [
                [{
                  // border: [false, false, false, false],
                  text: 'APPLICATION AREA', alignment: 'center', fontSize: 10
                }],
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
          }
        ]
      },
      {
        margin: [10, 0, 0, 10],
        columns: [
          {
            width: "98%",
            table: {
              widths: ["25%", "10%", "10%", "10%", "20%", "23%"],
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
            layout: 'formLayout',
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
    // pageBreak: 'before',
    columns: [
      {
        width: "98%",
        margin: [10, 0, 0, 10],
        table: {
          widths: ['8%', '90%'],
          body: body
        }
      },
    ]
  }
}
const applicationAreaB = (props) => {

  // stack of table for each field
  let harvestTable = Object.keys(props.groupedHarvests).map(key => {
    return applicationAreaBFieldHarvestTable(props.groupedHarvests[key]) // returns a table for a field with multiple field harvest events
  })

  return {
    // pageBreak: 'before', // super useful soltion just dont need on the first one
    stack: [
      {
        columns: [
          {
            width: "98%",
            table: {
              widths: ['98%'],
              body: [
                [{// row 1
                  border: [false, false, false, false],
                  text: {
                    text: 'B. CROPS AND HARVETS:', bold: true, fontSize: 9,
                  }
                },
                ],

              ]
            }
          }
        ]
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
        pageBreak: i === 0? '': 'before',
        table: {
          widths: ['98%'],
          body: [
            [{// 1st row header
              fillColor: gray,
              text: {
                // text: "Field 1 - 11/01/2019: Oats, silage-soft dough",
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
                image(img, 475, 175),
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


      // let apps = Object.keys(fieldAppsByPlantDate[plantDatekey]).map(k => fieldAppsByPlantDate[plantDatekey][k])

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
                    text: 'A.LAND APPLICATIONS:', bold: true, fontSize: 9,
                  }
                },
                ]
              ]
            }
          }
        ]
      },
      {
        margin: [0, 5, 0, 5],
        stack: [
          ...tables
        ]
      },
    ]
  }
}
const nutrientBudgetB = (props, images) => {
  // const tables = [nutrientBudgetBTable(props, images)]
  let allEvents = props && props.allEvents ? props.allEvents : {}

  const tables = Object.keys(allEvents).map((key, i) => {
    return nutrientBudgetBTable(allEvents[key], images[key], i)
  })


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

  const tables = props.map(analysis => {
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

  const tables = props.map((analysis, i) => {
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

  const tables = Object.keys(props).map((key, i) => {
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


  const content = tables && tables.length > 0 ? tables : [{ margin: [10, 0], text: { text: 'No Soil analyses entered.', italics: true, fontSize: 8 } }]
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
  const content = tables && tables.length > 0 ? tables : [{ margin: [10, 0], text: { text: 'No plant tissue analyses entered.', italics: true, fontSize: 8 } }]
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


  const tables = Object.keys(props).map((key, i) => {
    let analyses = props[key]
    console.log(key, analyses)
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
// Ex:
// longAddressLine((792-72), {
//   street: "20723 Geer RD",
//   city: "Hilmar",
//   county: "Merced",
//   zipCode: "95324",
// })

/**
 *      ###############################
 *      #### DOCUMENT           ##############
 *  
 */

const getDateTime = () => {
  const curDate = new Date()
  return `${curDate.getUTCMonth() + 1}/${curDate.getUTCDate()}/${curDate.getUTCFullYear()} ${curDate.getUTCHours()}:${curDate.getUTCMinutes()}:${curDate.getUTCSeconds() }`
}

export default function dd(props, images) {
  const curDateTime = getDateTime()
  const dairyInfo = props && props.dairyInformationA ? props.dairyInformationA: {}
  const footerTitle = `${dairyInfo.title} | ${dairyInfo.street} | ${dairyInfo.city}, ${dairyInfo.city_state} ${dairyInfo.city_zip} | ${dairyInfo.county} | ${dairyInfo.basin_plan}`
  const periodStart = dairyInfo.period_start ? dairyInfo.period_start.split("T")[0]: ''
  const periodEnd = dairyInfo.period_end ? dairyInfo.period_end.split("T")[0]: ''
  const reportingPeriod = `Reporting peroid ${periodStart} to ${periodEnd}.`
  


  const pngLogo = `data:image/png;base64,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`
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
                width: parseInt((720/2) - 50),
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