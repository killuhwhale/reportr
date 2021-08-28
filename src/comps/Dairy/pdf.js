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

const ownOperatorTable = (key, props) => {
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
          text: `This operator is ${props.is_responsible? '': 'not'} responsible`,
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
  if(props.parcels.length > 6){
    props.parcels.forEach((parcel, i) => {
      let c = i % 6
      let r = parseInt(i / 6)
      console.log(r, c, parcel.pnumber)
      
      if(i != 0 && c === 0){
        parcelTableBody.push(tmpRow)
        console.log("Pushing 1", tmpRow)
        tmpRow = []
      }
      let border = null
      if(r===0 && c===0){
        border = [true, true, false, false] // top left corner 
      }else if(r===0 && c > 0 && c < 6 - 1){
        border = [false, true, false, false] // top middle
      }else if(r===0 && c === 6-1){
        border = [false, true, true, false] // top right corner 
      }else if(c===0){
        border = [true, false, false, false] // left middle  
      }else if(c === 6-1){
        border = [false, false, true, false] // right middle 
      }else{
        border = [false, false, false, false] //  middle 
      }
      
      tmpRow.push({
        border: border,
        text: parcel.pnumber, fontSize: 8
      })

      if(i === props.parcels.length - 1){
        console.log("Pushing last el row", tmpRow)
        parcelTableBody.push(tmpRow)
      }
    })
    let lastRow = parcelTableBody[parcelTableBody.length - 1]
    let numEmptyCells = 6 - lastRow.length
    for(let i =0; i < numEmptyCells; i ++){
      lastRow.push({
        border: [],
        text: '', fontSize: 8
      })
    }
  
    lastRow = lastRow.map((el, i) => {
      let border = [false, false, false, false]
      if(i==0){
        border = [true, false, false, true] // bottom left
      }else if(i == 5){
        border = [false, false, true, true] // bottom right
      }else{
        border = [false, false, false, true] // bottom middle
      }
      el.border = border
      return el
    })
    // replace last row with updated row
    parcelTableBody[parcelTableBody.length - 1] = lastRow
  }else{
    parcelTableBody = [props.parcels.map((parcel, i) => {
     
      let border = null
      if(i === 0){
        border = [true, true, false, true] // left 
      }else if(i > 0 && i < 6-1){
        border = [false, true, false, true] // middle
      }else if(i === 6-1){
        border = [false, true, true, true] // right 
      }
      return {
        border: border,
        text: parcel.pnumber, fontSize: 8
      }
    })]
    // Fill potentail empty cells in row
    let numEmpty = 6 - props.parcels.length
    for(let i=0; i < numEmpty; i ++){
      parcelTableBody[0].push({
        border: [false, true, false, true],
        text: '', fontSize: 8
      })
    }
    parcelTableBody[0][0].border = [true, true, false, true]
    parcelTableBody[0][6-1].border = [false, true, true, true] 
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
                  text: props.began? props.began.split("T")[0] : '', fontSize: 9, lineHeight: 0.1
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
        stack: OwnOperators.map((owner, i) => {
          return {
            table: {
              body: [
                [ownOperatorTable(`owneropTable${i}`, {})]
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
                [ownOperatorTable(`ownerTable${i}`, owner)]
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
                  text: '1'
                },
                { // row 2
                  text: '1'
                },
                { // row 2
                  text: '1'
                },
                { // row 2
                  text: '1'
                },
                { // row 2
                  text: '1'
                },
                { // row 2
                  text: '1'
                },

              ],
              [
                { // row 3
                  text: 'Number under roof'
                },
                { // row 3
                  text: '1'
                },
                { // row 3
                  text: '1'
                },
                { // row 3
                  text: '1'
                },
                { // row 3
                  text: '1'
                },
                { // row 3
                  text: '1'
                },
                { // row 3
                  text: '1'
                },

              ],
              [
                { // row 4
                  text: 'Maximum number'
                },
                { // row 4
                  text: '1'
                },
                { // row 4
                  text: '1'
                },
                { // row 4
                  text: '1'
                },
                { // row 4
                  text: '1'
                },
                { // row 4
                  text: '1'
                },
                { // row 4
                  text: '1'
                },

              ],
              [
                { // row 5
                  text: 'Average number'
                },
                { // row 5
                  text: '1'
                },
                { // row 5
                  text: '1'
                },
                { // row 5
                  text: '1'
                },
                { // row 5
                  text: '1'
                },
                { // row 5
                  text: '1'
                },
                { // row 5
                  text: '1'
                },

              ],
              [
                { // row 6
                  headlineLevel: "availableNutrients1",

                  text: 'Avg live weight (lbs)'
                },
                { // row 6
                  text: '1'
                },
                { // row 6
                  text: '1'
                },
                { // row 6
                  text: '1'
                },
                { // row 6
                  text: '1'
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
                  text: 'Holstein', fontSize: 9
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
                    text: '75', alignment: 'right', fontSize: 9
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
                    text: '70,026.15',
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
                    text: '881,742.55',
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
                    text: '617,219.79',
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
                    text: '145,025.47',
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
                    text: '400,422.21',
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
                    text: '1,037,061.00',
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
              widths: ["45%", "30%", "*"],
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
                      text: '70,026.15',
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
                      text: '70,026.15',
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
                      text: '70,026.15',
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
                      text: '70,026.15',
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
                      text: '70,026.15',
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
        width: 300,

        stack: [
          {
            table: {
              widths: ['10%', "30%", '*'],

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
                      text: `${4 * 1337 * 9}`,
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
                      text: `${3 * 10 ** 7}`,
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
                      text: `${0}`,
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
                      text: `${4 * 1337 * 9}`,
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
  return {
    // pageBreak: 'before', // super useful soltion just dont need on the first one
    stack: [
      {
        table: {
          margin: [0, 0],
          widths: ['auto'],
          heights: [1],
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
        margin: [10, 0, 80, 0],
        table: {
          widths: ['75%', '25%'],
          body: [
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
            [
              {
                text: {
                  text: 'I5', fontSize: 9,
                }
              },
              {
                text: {
                  text: 'Ground Water', fontSize: 9,
                }
              },
            ],
            [
              {
                text: {
                  text: 'I6', fontSize: 9,
                }
              },
              {
                text: {
                  text: 'Ground Water', fontSize: 9,
                }
              },
            ],
            // [
            //   {
            //     text: {
            //       text: 'I7', fontSize: 9,
            //     }
            //   },
            //   {
            //     text: {
            //       text: 'Ground Water', fontSize: 9,
            //     }
            //   },
            // ],
          ]
        }
      },
    ]
  }
}
const availableNutrientsE = (props) => {
  return {
    // pageBreak: 'before', // super useful soltion just dont need on the first one
    stack: [
      {
        table: {
          margin: [0, 0],
          widths: ['auto'],
          heights: [1],
          body: [
            [{// row 1
              border: [false, false, false, false],
              text: {
                text: 'E. SUBSURFACE (TILE) DRAINAGE SOURCES:', bold: true, fontSize: 9,
              }
            },
            ]
          ]
        },

      },
      {
        margin: [10, 0, 80, 0],
        table: {
          widths: ['*'],
          body: [
            [
              {// row 1
                border: [false],
                text: {
                  text: 'No subsurface (tile) drainage sources entered.', fontSize: 9,
                }
              }
            ]
          ]
        }
      },
    ]
  }
}
const availableNutrientsFTableRow = (props) => {
  return [
    {// row 1
      text: {
        text: '05/20/2020', fontSize: 8,
      }
    },
    {// row 
      text: {
        text: 'UN32', fontSize: 8,
      }
    },
    {// row 1
      text: {
        text: '41.61 ton', fontSize: 8,
      }
    },
    {// row 1
      text: {
        text: 'Dry-weight', fontSize: 8,
      }
    },
    {// row 1
      text: {
        text: '32.0000', fontSize: 8,
      }
    },
    {// row 1
      text: {
        text: '0.000000', fontSize: 8,
      }
    },
    {// row 1
      text: {
        text: '0.000000', fontSize: 8,
      }
    },
    {// row 1
      text: {
        text: '0.000000', fontSize: 8,
      }
    },
    {// row 1
      text: {
        text: 'Salt (%)', fontSize: 8,
      }
    },
  ]
}
const availableNutrientsF = (props) => {
  let importRowData = [{}, {}, {}, {}]
  let importRows = importRowData.map(row => {
    return availableNutrientsFTableRow(row)
  })
  let importRowsBody = [
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
    ...importRows
  ]
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
      {
        table: {
          widths: ['100%'],
          body: [
            [
              {// row 1
                border: [false, false, false, false],
                text: {
                  text: 'No dry manure nutrient imports entered.', fontSize: 9,
                }
              }
            ],
            [
              {// row 1
                border: [false],
                text: {
                  text: 'No process wastewater nutrient imports entered.', fontSize: 9,
                }
              }
            ]
          ]
        }
      },
      {
        margin: [10, 0, 0, 0],
        table: {
          widths: ['10%', '15%', '10%', '10%', '10%', '5%', '5%', '5%', '5%', "10%"],
          body: importRowsBody
        }
      },
      {
        margin: [10, 5, 0, 0],
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
                  text: 'Commercial fertilizer / Other', fontSize: 9,
                }
              },
              {// row 1
                text: {
                  text: '26,603.77', fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                text: {
                  text: '0.00', fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                text: {
                  text: '0.00', fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                text: {
                  text: '0.00', fontSize: 9,
                  alignment: 'right',
                }
              },
            ],
            [
              {// row 
                text: {
                  text: 'Dru Manure', fontSize: 9,
                }
              },
              {// row 1
                text: {
                  text: '26,603.77', fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                text: {
                  text: '0.00', fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                text: {
                  text: '0.00', fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                text: {
                  text: '0.00', fontSize: 9,
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
                  text: '26,603.77', fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                text: {
                  text: '0.00', fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                text: {
                  text: '0.00', fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                text: {
                  text: '0.00', fontSize: 9,
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
                  text: '26,603.77', fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                fillColor: gray,
                text: {
                  text: '0.00', fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                fillColor: gray,
                text: {
                  text: '0.00', fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                fillColor: gray,
                text: {
                  text: '0.00', fontSize: 9,
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
        text: '05/20/2020', fontSize: 8,
        alignment: 'center',
      }
    },
    {// row 
      text: {
        text: 'Corral Solids', fontSize: 8,
      }
    },
    {// row 1
      text: {
        text: '1,898.00 ton', fontSize: 8,
        alignment: "right",
      }
    },
    {// row 1
      text: {
        text: 'Dry-weight', fontSize: 8,
        alignment: "right",
      }
    },
    {// row 1
      text: {
        text: '56.00', fontSize: 8,
        alignment: "right",
      }
    },
    {// row 1
      text: {
        text: '0.0000', fontSize: 8,
        alignment: "right",
      }
    },
    {// row 1
      text: {
        text: '19,400.00', fontSize: 8,
        alignment: "right",
      }
    },
    {// row 1
      text: {
        text: '5,280.00', fontSize: 8,
        alignment: "right",
      }
    },
    {// row 1
      text: {
        text: '21,800.00', fontSize: 8,
        alignment: "right",
      }
    },
    {// row 1
      text: {
        text: '0.00', fontSize: 8,
        alignment: "right",
      }
    },
    {// row 1
      text: {
        text: '0.00', fontSize: 8,
        alignment: "right",
      }
    }
  ]
}
const availableNutrientsGLiquidTableRow = (props) => {
  return [
    {// row 1

      text: {
        text: '05/20/2020', fontSize: 8,
        alignment: 'center',
      }
    },
    {// row 
      text: {
        text: 'Corral Solids', fontSize: 8,
      }
    },
    {// row 1
      text: {
        text: '1,898.00 gal', fontSize: 8,
        alignment: "right",
      }
    },
    {// row 1
      text: {
        text: '484.00', fontSize: 8,
        alignment: "right",
      }
    },
    {// row 1
      text: {
        text: '336.00', fontSize: 8,
        alignment: "right",
      }
    },
    {// row 1
      text: {
        text: '0.00', fontSize: 8,
        alignment: "right",
      }
    },
    {// row 1
      text: {
        text: '0.00', fontSize: 8,
        alignment: "right",
      }
    },
    {// row 1
      text: {
        text: '71.90', fontSize: 8,
        alignment: "right",
      }
    },
    {// row 1
      text: {
        text: '997.00', fontSize: 8,
        alignment: "right",
      }
    },
    {// row 1
      text: {
        text: '0.00', fontSize: 8,
        alignment: "right",
      }
    },
    {// row 1
      headlineLevel: "rowAvailableNutrientsGLiquidTableRow",
      text: {
        headlineLevel: "rowAvailableNutrientsGLiquidTableRow",
        text: '8,800.00', fontSize: 8,
        alignment: "right",
      }
    }
  ]
}
const availableNutrientsG = (props) => {
  let exportRowData = [{}, {}, {}, {}]
  let exportSolidRows = exportRowData.map(row => {
    return availableNutrientsGSolidTableRow(row)
  })
  let exportLiquidRows = exportRowData.map(row => {
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
                  text: "N (mg/L)", fontSize: 8,
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
                  text: '26,603.77', fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                text: {
                  text: '0.00', fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                text: {
                  text: '0.00', fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                text: {
                  text: '0.00', fontSize: 9,
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
                  text: '26,603.77', fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                text: {
                  text: '0.00', fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                text: {
                  text: '0.00', fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                text: {
                  text: '0.00', fontSize: 9,
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
                  text: '26,603.77', fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                fillColor: gray,
                text: {
                  text: '0.00', fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                fillColor: gray,
                text: {
                  text: '0.00', fontSize: 9,
                  alignment: 'right',
                }
              },
              {// row 1
                fillColor: gray,
                text: {
                  text: '0.00', fontSize: 9,
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
  return [
    { // row 1
      text: 'Field 1337', fontSize: 8
    },
    { // row 1
      text: '37', fontSize: 8,
      alignment: 'right',
    },
    { // row 1
      text: '22', fontSize: 8,
      alignment: 'right',
    },
    { // row 1
      text: '2', fontSize: 8,
      alignment: 'right',
    },
    { // row 1
      text: 'Process Wastewater', fontSize: 8
    },
    { // row 1
      text: '1234-4321-2314-1423', fontSize: 8
    },
  ]
}
const applicationAreaA = (props) => {
  const areas = [{}, {}, {}, {}]
  let rows = areas.map(row => {
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
                    text: '583', fontSize: 8,
                    alignment: 'right'
                  },
                  { // row 1
                    fillColor: gray,
                    text: '485', fontSize: 8,
                    alignment: 'right'
                  },
                  { // row 1
                    fillColor: gray,
                    text: '20', fontSize: 8,
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
                    text: '20', fontSize: 8,
                    alignment: 'right'
                  },
                  { // row 1
                    fillColor: gray,
                    text: '18', fontSize: 8,
                    alignment: 'right'
                  },
                  { // row 1
                    fillColor: gray,
                    text: '1', fontSize: 8,
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
                    text: '603', fontSize: 8,
                    alignment: 'right'
                  },
                  { // row 1
                    fillColor: gray,
                    text: '503', fontSize: 8,
                    alignment: 'right'
                  },
                  { // row 1
                    fillColor: gray,
                    text: '21', fontSize: 8,
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
  return [
    {
      text: {
        text: props.harvestDate,
        fontSize: 8,
      }
    },
    {
      text: {
        text: '440.00 ton',
        fontSize: 8,
      }
    },
    {
      text: {
        text: 'As-is',
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
        text: '71.00',
        fontSize: 8,
      }
    },
    {
      text: {
        text: '5,450.00',
        fontSize: 8,
      }
    },
    {
      text: {
        text: '1,040.00',
        fontSize: 8,
      }
    },
    {
      text: {
        text: '12,200.00',
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
        text: '9.52',
        fontSize: 8,
      }
    },
  ]
}
// For each field, this shows each crops plant date, and corresponding harvests
const applicationAreaBFieldHarvestTableSubTable = (props) => {
  let dummyHarvestDates = [{ harvestDate: "08/29/2020" }, { harvestDate: "12/27/2020" }]
  let rows = dummyHarvestDates.map(harvestEvent => {
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
              text: '01/01/2020: Almond, in shell',
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
                      text: 'Almond, in shell:',
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
                      text: '18:',
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
                      text: '01/01/2020',
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
                      text: '28.00',
                      fontSize: 8,
                    },
                  },
                  {
                    text: {
                      text: '224.00',
                      fontSize: 8,
                    },
                  },
                  {
                    text: {
                      text: '42.00',
                      fontSize: 8,
                    },
                  },
                  {
                    text: {
                      text: '184.0',
                      fontSize: 8,
                    },
                  },
                  {
                    text: {
                      text: '0.00',
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
                      text: '28.00',
                      fontSize: 8,
                    },
                  },
                  {
                    border: [true, true, true, true],
                    text: {
                      text: '224.00',
                      fontSize: 8,
                    },
                  },
                  {
                    border: [true, true, true, true],
                    text: {
                      text: '42.00',
                      fontSize: 8,
                    },
                  },
                  {
                    border: [true, true, true, true],
                    text: {
                      text: '184.0',
                      fontSize: 8,
                    },
                  },
                  {
                    border: [true, true, true, true],
                    text: {
                      text: '0.00',
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
  let events = props.map(event => {
    return applicationAreaBFieldHarvestTableSubTable(event) // returns list of table objects
  })
  let body = [
    [
      {
        border: [true, true, false, true],
        fillColor: gray,
        text: {
          text: 'Field 1',
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
          text: 'Field 1',
          fontSize: 9,
        }
      }
    ],
    ...events,
    [{ text: '', border: [true, false, true, true], colSpan: 2 }] // empty row
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

  let fieldHarvests = [ //fields
    [ //events for a field
      {}, {}
    ],
    [
      {}
    ],
    [
      {}
    ],
    [
      {}
    ],
    [
      {}
    ]
  ]
  // stack of table for each field
  let harvestTable = fieldHarvests.map((fieldHarvests) => {
    return applicationAreaBFieldHarvestTable(fieldHarvests) // returns a table for a field with multiple field harvest events
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


const nutrientBudgetBTable = (props, images) => {
  let data = [{}, {}, {}]
  return data.map((tableData, i) => {
    return {
      columns: [
        {// Main Table
          pageBreak: i == 0 ? '' : 'before',
          table: {
            widths: ['98%'],
            body: [
              [{// 1st row header
                fillColor: gray,
                text: {
                  text: "Field 1 - 11/01/2019: Oats, silage-soft dough", fontSize: 9,
                }
              }],
              [{
                border: [true, false, true, false],
                table: {
                  widths: ['15%', '15%', '15%', '15%', '15%', '15%'],
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
                          text: 'Field 1:', fontSize: 8,
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
                          text: 'Oats, silage-soft dough', fontSize: 8,
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
                          text: '11/01/2019:', fontSize: 8,
                        }
                      },
                    ]
                  ]
                }
              }],
              [{
                border: [true, false, true, false],
                columns: [
                  image(images.nutrientHoriBar0, 475, 175),
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
                                text: '0.00', fontSize: 8,
                              }
                            },

                            {
                              border: [true, false, true, false],
                              text: {
                                text: '0.00', fontSize: 8,
                              }
                            },
                            {
                              border: [true, false, true, false],
                              text: {
                                text: '0.00', fontSize: 8,
                              }
                            },
                            {
                              border: [true, false, true, false],
                              text: {
                                text: '0.00', fontSize: 8,
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
                                text: '0.00', fontSize: 8,
                              }
                            },

                            {
                              border: [true, false, true, false],
                              text: {
                                text: '0.00', fontSize: 8,
                              }
                            },
                            {
                              border: [true, false, true, false],
                              text: {
                                text: '0.00', fontSize: 8,
                              }
                            },
                            {
                              border: [true, false, true, false],
                              text: {
                                text: '0.00', fontSize: 8,
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
                                text: '0.00', fontSize: 8,
                              }
                            },

                            {
                              border: [true, false, true, false],
                              text: {
                                text: '0.00', fontSize: 8,
                              }
                            },
                            {
                              border: [true, false, true, false],
                              text: {
                                text: '0.00', fontSize: 8,
                              }
                            },
                            {
                              border: [true, false, true, false],
                              text: {
                                text: '0.00', fontSize: 8,
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
                                text: '0.00', fontSize: 8,
                              }
                            },

                            {
                              border: [true, false, true, false],
                              text: {
                                text: '0.00', fontSize: 8,
                              }
                            },
                            {
                              border: [true, false, true, false],
                              text: {
                                text: '0.00', fontSize: 8,
                              }
                            },
                            {
                              border: [true, false, true, false],
                              text: {
                                text: '0.00', fontSize: 8,
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
                                text: '0.00', fontSize: 8,
                              }
                            },

                            {
                              border: [true, false, true, false],
                              text: {
                                text: '0.00', fontSize: 8,
                              }
                            },
                            {
                              border: [true, false, true, false],
                              text: {
                                text: '0.00', fontSize: 8,
                              }
                            },
                            {
                              border: [true, false, true, false],
                              text: {
                                text: '0.00', fontSize: 8,
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
                                text: '0.00', fontSize: 8,
                              }
                            },

                            {
                              border: [true, false, true, false],
                              text: {
                                text: '0.00', fontSize: 8,
                              }
                            },
                            {
                              border: [true, false, true, false],
                              text: {
                                text: '0.00', fontSize: 8,
                              }
                            },
                            {
                              border: [true, false, true, false],
                              text: {
                                text: '0.00', fontSize: 8,
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
                                text: '0.00', fontSize: 8,
                              }
                            },

                            {
                              border: [true, false, true, false],
                              text: {
                                text: '0.00', fontSize: 8,
                              }
                            },
                            {
                              border: [true, false, true, false],
                              text: {
                                text: '0.00', fontSize: 8,
                              }
                            },
                            {
                              border: [true, false, true, false],
                              text: {
                                text: '0.00', fontSize: 8,
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
                                text: '0.00', fontSize: 8,
                              }
                            },

                            {
                              border: [true, false, true, false],
                              text: {
                                text: '0.00', fontSize: 8,
                              }
                            },
                            {
                              border: [true, false, true, false],
                              text: {
                                text: '0.00', fontSize: 8,
                              }
                            },
                            {
                              border: [true, false, true, false],
                              text: {
                                text: '0.00', fontSize: 8,
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
                                text: 'Nutrient balance', fontSize: 8,
                              }
                            },
                            {
                              border: [true, false, true, false],
                              text: {
                                text: '0.00', fontSize: 8,
                              }
                            },

                            {
                              border: [true, false, true, false],
                              text: {
                                text: '0.00', fontSize: 8,
                              }
                            },
                            {
                              border: [true, false, true, false],
                              text: {
                                text: '0.00', fontSize: 8,
                              }
                            },
                            {
                              border: [true, false, true, false],
                              text: {
                                text: '0.00', fontSize: 8,
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
                            {
                              border: [true, false, true, true],
                              text: {
                                text: '0.00', fontSize: 8,
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
                                    text: '4,824,000.00', fontSize: 8,
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
                                    text: '177.65.00', fontSize: 8,
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
                                    text: '8.08', fontSize: 8,
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
                                    text: '4,824,000.00', fontSize: 8,
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
                                    text: '177.65.00', fontSize: 8,
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
                                    text: '8.08', fontSize: 8,
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
                                    text: '1', fontSize: 8,
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
  })
}
const nutrientBudgetA = (props) => {
  const fieldCropApplications = [
    {
      title: "Field 1",
      plant_date: "11/01/2019",
      croptitle: "Oats, silage-soft dough",
      applications: [
        {
          applicationdate: "10/10/2019",
          sources: [
            {
              sourcetitle: "UN32"
            }
          ]
        },
        {
          applicationdate: "11/11/2019",
          sources: [
            {
              sourcetitle: "UN69"
            }
          ]
        },
      ]
    },
    {
      title: "Field 1",
      plant_date: "11/01/2019",
      croptitle: "Oats, silage-soft dough",
      applications: [
        {
          applicationdate: "10/10/2019",
          sources: [
            {
              sourcetitle: "UN32"
            }
          ]
        },
        {
          applicationdate: "11/11/2019",
          sources: [
            {
              sourcetitle: "UN69"
            }
          ]
        },
      ]
    }
  ]

  let tables = fieldCropApplications.map(fieldCropApp => {
    let rows = []
    fieldCropApp.applications.forEach(app => {


      const innerRows = app.sources.map(source => {
        return [
          {
            text: {
              text: source.sourcetitle, fontSize: 8,
            }
          },
          {
            text: {
              text: 'Solid commerical fertilizer', fontSize: 8,
            }
          },
          {
            text: {
              text: '16.00', fontSize: 8,
            }
          },
          {
            text: {
              text: '0.00', fontSize: 8,
            }
          },
          {
            text: {
              text: '0.00', fontSize: 8,
            }
          },
          {
            text: {
              text: '0.00', fontSize: 8,
            }
          },
          {
            text: {
              text: '2,754,000.00 gal', fontSize: 8,
            }
          },
        ]
      })


      rows.push([// regular row
        {
          text: {
            text: app.applicationdate, fontSize: 8,
          }
        },
        {
          text: {
            text: 'Sidedress', fontSize: 8,
          }
        },
        {
          text: {
            text: 'No precipitation', fontSize: 8,
          }
        },
        {
          text: {
            text: 'No precipitation', fontSize: 8,
          }
        },
        {
          text: {
            text: 'No precipitation', fontSize: 8,
          }
        },
      ])
      rows.push([// table
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
                    text: 'N', fontSize: 8,
                  }
                },
                {
                  fillColor: gray,
                  text: {
                    text: 'P', fontSize: 8,
                  }
                },
                {
                  fillColor: gray,
                  text: {
                    text: 'K', fontSize: 8,
                  }
                },
                {
                  fillColor: gray,
                  text: {
                    text: 'Salt', fontSize: 8,
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
                    text: '0.00', fontSize: 8,
                  }
                },
                {
                  fillColor: gray,
                  text: {
                    text: '0.00', fontSize: 8,
                  }
                },
                {
                  fillColor: gray,
                  text: {
                    text: '0.00', fontSize: 8,
                  }
                },
                {
                  fillColor: gray,
                  text: {
                    text: '2,371.69', fontSize: 8,
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
    console.log(rows)

    return {
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
                  text: 'Field 1 - 11/01/01/2019: Oats, silage-soft dough', fontSize: 8
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
                                    text: 'Field 1', fontSize: 8,
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
                                    text: 'Corn, silage:', fontSize: 8,
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
                                    text: '05/07/202:', fontSize: 8,
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
    }
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
  const tables = nutrientBudgetBTable(props, images)
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
  const manureAnalyses = [{}, {}, {}, {}]
  const tables = manureAnalyses.map(analysis => {
    return {
      margin: [10, 0, 0, 5],
      table: {
        widths: ['100%'],
        body: [
          [
            {// row 1
              fillColor: gray,
              text: {
                text: 'Maciel Manure', bold: true, fontSize: 9,
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
                        text: "Maciel Manure", fontSize: 8,
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
                        text: "11/12/2019", fontSize: 8,
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
                        text: "Corral solids", fontSize: 8,
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
                        text: "Lab analysis", fontSize: 8,
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
                        text: "Dry-weight", fontSize: 8,
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
                        text: "31.6%", fontSize: 8,
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
                      fillColor: gray,
                      text: {
                        text: "11,900.00", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "2,910.00", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "7,130.00", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "0.00", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "0.00", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "0.00", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "0.00", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "0.00", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: " ", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: " 0.01", fontSize: 7,
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
                      fillColor: gray,
                      text: {
                        text: "11,900.00", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "2,910.00", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "7,130.00", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "0.00", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "0.00", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "0.00", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "0.00", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "0.00", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: " ", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: " 0.01", fontSize: 7,
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
  const processWastewaterAnalyses = [{}, {}, {}, {}]
  const tables = processWastewaterAnalyses.map((analysis, i) => {
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
                text: '4th Qtr WW', bold: true, fontSize: 9,
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
                        text: "4th Qtr WW", fontSize: 8,
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
                widths: ['8%', '10%', '8%', '10%', '13%', '15%', '8%', '20%'],
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
                        text: "11/12/2019", fontSize: 8,
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
                        text: "Corral solids", fontSize: 8,
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
                        text: "Lab analysis", fontSize: 8,
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
                        text: "7", fontSize: 8,
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
                      fillColor: gray,
                      text: {
                        text: "11,900.00", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "2,910.00", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "7,130.00", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "0.00", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "0.00", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "0.00", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "0.00", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "0.00", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: " ", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: " 0.01", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "0.00", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "0.00", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "0.00", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "2,000,000.00", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "0.00", fontSize: 7,
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
                      fillColor: gray,
                      text: {
                        text: "11,900.00", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "2,910.00", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "7,130.00", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "0.00", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "0.00", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "0.00", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "0.00", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "0.00", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: " ", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: " 0.01", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "0.00", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "0.00", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "0.00", fontSize: 7,
                      }
                    },
                    {
                      fillColor: gray,
                      text: {
                        text: "0.00", fontSize: 7,
                      }
                    },
                    {
                      headlineLevel: `processWastewaterAnalyses${i}`,
                      fillColor: gray,
                      text: {
                        text: "0.00", fontSize: 7,
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
  const freshWaterAnalyses = [{}, {}, {}, {}]
  const tables = freshWaterAnalyses.map((analysis, i) => {
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
                text: 'I5', bold: true, fontSize: 9,
              }
            },
          ],
          [
            {
              border: [true, false, true, true],
              table: {
                widths: ['20%', '73%'],
                body: [
                  [
                    {
                      border: [true, true, false, true],
                      fillColor: gray,
                      text: {
                        text: 'Irrigation water', alignment: 'left',
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
                        text: "4th Qtr WW", fontSize: 8,
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
                                text: "11/12/2019", fontSize: 8,
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
                                text: "Lab analysis", fontSize: 8,
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
                              fillColor: gray,
                              text: {
                                text: "0.00", fontSize: 7,
                              }
                            },
                            {
                              fillColor: gray,
                              text: {
                                text: "0.00", fontSize: 7,
                              }
                            },
                            {
                              fillColor: gray,
                              text: {
                                text: "0.00", fontSize: 7,
                              }
                            },
                            {
                              fillColor: gray,
                              text: {
                                text: "0.00", fontSize: 7,
                              }
                            },
                            {
                              fillColor: gray,
                              text: {
                                text: "0.00", fontSize: 7,
                              }
                            },
                            {
                              fillColor: gray,
                              text: {
                                text: " ", fontSize: 7,
                              }
                            },
                            {
                              fillColor: gray,
                              text: {
                                text: " 0.01", fontSize: 7,
                              }
                            },
                            {
                              fillColor: gray,
                              text: {
                                text: "0.00", fontSize: 7,
                              }
                            },
                            {
                              fillColor: gray,
                              text: {
                                text: "0.00", fontSize: 7,
                              }
                            },
                            {
                              fillColor: gray,
                              text: {
                                text: "0.00", fontSize: 7,
                              }
                            },
                            {
                              fillColor: gray,
                              text: {
                                text: "2,000,000.00", fontSize: 7,
                              }
                            },
                            {
                              fillColor: gray,
                              text: {
                                text: "0.00", fontSize: 7,
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
                              fillColor: gray,
                              text: {
                                text: "0.00", fontSize: 7,
                              }
                            },
                            {
                              fillColor: gray,
                              text: {
                                text: "0.00", fontSize: 7,
                              }
                            },
                            {
                              fillColor: gray,
                              text: {
                                text: "0.00", fontSize: 7,
                              }
                            },
                            {
                              fillColor: gray,
                              text: {
                                text: "0.00", fontSize: 7,
                              }
                            },
                            {
                              fillColor: gray,
                              text: {
                                text: "0.00", fontSize: 7,
                              }
                            },
                            {
                              fillColor: gray,
                              text: {
                                text: " ", fontSize: 7,
                              }
                            },
                            {
                              fillColor: gray,
                              text: {
                                text: " 0.01", fontSize: 7,
                              }
                            },
                            {
                              fillColor: gray,
                              text: {
                                text: "0.00", fontSize: 7,
                              }
                            },
                            {
                              fillColor: gray,
                              text: {
                                text: "0.00", fontSize: 7,
                              }
                            },
                            {
                              fillColor: gray,
                              text: {
                                text: "0.00", fontSize: 7,
                              }
                            },
                            {
                              fillColor: gray,
                              text: {
                                text: "0.00", fontSize: 7,
                              }
                            },
                            {
                              headlineLevel: `freshWaterAnalyses${i}`,
                              fillColor: gray,
                              text: {
                                text: "0.00", fontSize: 7,
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
            }],
            [
              {
                border: [false, false, false, false],
                text: { text: 'No soil analyses entered.', fontSize: 7, italics: true }
              }
            ]
          ]
        }
      },


    ]
  }
}
const nutrientAnalysisE = (props) => {
  const soilAnalyses = [{}, {}, {}, {}]
  const tables = soilAnalyses.map((analysis, i) => {
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
                text: 'Field 1 - 11/01/2019: Oats, silage-soft dough', bold: true, fontSize: 9,
              }
            },
          ],
          [
            {
              border: [true, false, true, true],
              table: {
                widths: ['20%', '73%'],
                body: [
                  [
                    {
                      border: [true, true, false, true],
                      fillColor: gray,
                      text: {
                        text: 'Oats', alignment: 'left',
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
                        text: "4th Qtr WW", fontSize: 8,
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
                                text: "11/12/2019", fontSize: 8,
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
                                text: "Lab analysis", fontSize: 8,
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
                                text: "As-is", fontSize: 8,
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
                                text: "72.2%", fontSize: 8,
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
                              fillColor: gray,
                              text: {
                                text: "0.00", fontSize: 7,
                              }
                            },
                            {
                              fillColor: gray,
                              text: {
                                text: "0.00", fontSize: 7,
                              }
                            },
                            {
                              fillColor: gray,
                              text: {
                                text: "0.00", fontSize: 7,
                              }
                            },
                            {
                              fillColor: gray,
                              text: {
                                text: "0.00", fontSize: 7,
                              }
                            },
                            {
                              fillColor: gray,
                              text: {
                                text: "0.00", fontSize: 7,
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
                              fillColor: gray,
                              text: {
                                text: "0.00", fontSize: 7,
                              }
                            },
                            {
                              fillColor: gray,
                              text: {
                                text: "0.00", fontSize: 7,
                              }
                            },
                            {
                              fillColor: gray,
                              text: {
                                text: "0.00", fontSize: 7,
                              }
                            },
                            {
                              fillColor: gray,
                              text: {
                                text: "0.00", fontSize: 7,
                              }
                            },
                            {
                              headlineLevel: `soilAnalyses${i}`,
                              fillColor: gray,
                              text: {
                                text: "0.00", fontSize: 7,
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
              text: 'E. PLANT TISSUE ANALYSES', fontSize: 10, bold: true,
            }]
          ]
        }
      },
      ...tables



    ]
  }
}
const nutrientAnalysisF = (props) => {
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
            [
              {
                border: [false, false, false, false],
                text: { text: 'No subsurface (tile) drainage analyses entered.', fontSize: 7, italics: true }
              }
            ]
          ]
        }
      },


    ]
  }
}

//  naprbal NUTRIENT APPLICATIONS, POTENTIAL REMOVAL, AND BALANCE
const naprbalA = (props) => {
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
                  text: '0.00', fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: '0.00', fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: '0.00', fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: '2,552,416.54', fontSize: 8, alignment: 'right',
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
                  text: '0.00', fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: '0.00', fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: '0.00', fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: '0.00', fontSize: 8, alignment: 'right',
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
                  text: '0.00', fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: '0.00', fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: '0.00', fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: '0.00', fontSize: 8, alignment: 'right',
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
                  text: '0.00', fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: '0.00', fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: '0.00', fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: '0.00', fontSize: 8, alignment: 'right',
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
                  text: '0.00', fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: '0.00', fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: '0.00', fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: '0.00', fontSize: 8, alignment: 'right',
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
                  text: '0.00', fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: '0.00', fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: '0.00', fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: '0.00', fontSize: 8, alignment: 'right',
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
                  text: '0.00', fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, true],
                text: {
                  text: '0.00', fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, true],
                text: {
                  text: '0.00', fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, true],
                text: {
                  text: '0.00', fontSize: 8, alignment: 'right',
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
                  text: '0.00', fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: '0.00', fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: '0.00', fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: '0.00', fontSize: 8, alignment: 'right',
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
                  text: '0.00', fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: '0.00', fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: '0.00', fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: '0.00', fontSize: 8, alignment: 'right',
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
                  text: '0.00', fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, true],
                text: {
                  text: '0.00', fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, true],
                text: {
                  text: '0.00', fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, true],
                text: {
                  text: '0.00', fontSize: 8, alignment: 'right',
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
                  text: '0.00', fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: '0.00', fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: '0.00', fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, false],
                text: {
                  text: '0.00', fontSize: 8, alignment: 'right',
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
                  text: '0.00', fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, true],
                text: {
                  text: '0.00', fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, true],
                text: {
                  text: '0.00', fontSize: 8, alignment: 'right',
                }
              },
              {
                border: [true, false, true, true],
                text: {
                  text: '0.00', fontSize: 8, alignment: 'right',
                }
              },
            ],

          ]
        }
      },




    ]
  }
}
const naprbalB = (props, images) => {
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
              image(images.nutrientHoriBar1, 475, 175),
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
                  image(images.materialHoriBar0, 350, 175),
                ]
              },
              {
                width: '50%',
                stack: [
                  image(images.materialHoriBar0, 350, 175),
                ]
              }
            ]
          },
          {
            columns: [
              {
                width: '50%',
                stack: [
                  image(images.materialHoriBar0, 350, 175),
                ]
              },
              {
                width: '50%',
                stack: [
                  image(images.materialHoriBar0, 350, 175),
                ]
              }
            ]
          },
        ]
      }
    ]
  }
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
        table: {
          widths: ['98%'],
          body: [
            [
              {
                border: [false, false, false, false],
                // border: [false, false, false, false],
                text: { text: 'A. MANURE, PROCESS WASTEWATER, AND OTHER DAIRY WASTE DISCHARGES', fontSize: 10, bold: true, }
              },

            ],
            [
              {
                border: [false, false, false, false],
                // border: [false, false, false, false],
                text: {
                  text: "The following is a summary of all manure and process wastewater discharges from the production area to surface water or to land areas (land application areas or otherwise)" +
                    " when not in accordance with the facility's Nutrient Management Plan.", fontSize: 8
                }
              }
            ],
            [
              {
                border: [false, false, false, false],
                // border: [false, false, false, false],
                text: { text: "No manure or process wastewater discharges occurred during the reporting period", fontSize: 7, italics: true, }
              }
            ],
          ]
        }
      },
      {
        table: {
          widths: ['98%'],
          body: [
            [
              {
                border: [false, false, false, false],
                // border: [false, false, false, false],
                text: { text: 'B. STORM WATER DISCHARGES', fontSize: 10 }
              },

            ],
            [
              {
                border: [false, false, false, false],
                // border: [false, false, false, false],
                text: {
                  text: "The following is a summary of all storm water discharges from the production area to surface water during the reporting period when not in accordance with the facility 's Nutrient" +
                    " Management Plan.", fontSize: 8
                }
              }
            ],
            [
              {
                border: [false, false, false, false],
                // border: [false, false, false, false],
                text: { text: "No stormwater discharges occurred during the reporting period.", fontSize: 7, italics: true, }
              }
            ],
          ]
        }
      },
      {
        table: {
          widths: ['98%'],
          body: [
            [
              {
                border: [false, false, false, false],
                // border: [false, false, false, false],
                text: { text: 'C. LAND APPLICATION AREA TO SURFACE WATER DISCHARGES', fontSize: 10 }
              },

            ],
            [
              {
                border: [false, false, false, false],
                // border: [false, false, false, false],
                text: {
                  text: "The following is a summary of all discharges from the land application area to surface water that have occurred during the reporting period when not in accordance with the" +
                    " facility's Nutrient Management Plan.", fontSize: 8
                }
              }
            ],
            [
              {
                border: [false, false, false, false],
                // border: [false, false, false, false],
                text: { text: "No land application area to surface water discharges occurred during the reporting period", fontSize: 7, italics: true, }
              }
            ],
          ]
        }
      },
    ]
  }
}

//  nmpeaStatements NUTRIENT MANAGEMENT PLAN AND EXPORT AGREEMENT STATEMENTS
const nmpeaStatementsAB = (props) => {
  const q1 = `Was the facility's NMP updated in the reporting period?`
  const q2 = `Was the facility's NMP developed by a certified nutrient management planner
  (specialist) as specified in Attachment C of the General Order?`
  const q3 = `Was the facility's NMP approved by a certified nutrient management planner
  (specialist) as specified in Attachment C of the General Order?`
  const q4 = `Are there any written agreements with third parties to receive manure or process
  wastewater that are new or were revised within the reporting period?`

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
          widths: ['30%', '30%', '30%'],
          body: [
            [
              {
                border: [false, false, false, false],
                text: { text: q1, fontSize: 10 }
              },
              {
                border: [false, false, false, true],
                text: { text: 'No', fontSize: 10 }
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
                text: { text: 'Yes', fontSize: 10 }
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
                text: { text: 'Yes', fontSize: 10 }
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
          widths: ['30%', '30%', '30%'],
          body: [
            [
              {
                border: [false, false, false, false],
                text: { text: q4, fontSize: 10 }
              },
              {
                border: [false, false, false, true],
                text: { text: 'No', fontSize: 10 }
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
  const noNotesText = `No notes entered for this annual report.`

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
                  text: noNotesText, fontSize: 6, italics: true
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
                text: 'Rodney V Nylund ', fontSize: 7,
              }
            },
            {
              width: "50%",
              text: {
                text: 'SAME AS OWNER', fontSize: 7,
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
        margin: [10,0,0,0],
        stack: [
          {
            text: {
              text: 'Annual Dairy Facility Assessment', fontSize: 10
            }
          },
          line(650),
          {
            margin: [5,0,0,5],
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
            margin: [5,0,0,5],
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
            margin: [5,0,0,5],
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
            margin: [5,0,0,5],
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
            margin: [5,0,0,5],
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
export default function dd(props, images) {
  console.log(images)
  const body = [
    dairyInformationA(props.dairyInformationA),
    dairyInformationB(props),
    dairyInformationC(props.dairyInformationC),
    // 'text\n\n\n\n\n\n\n\nZ',
    // 'text\n\n\n\nZZ',
    availableNutrientsA(props),   // bind last two rows and last row of table together...
    availableNutrientsB(props),  // bind this section together
    availableNutrientsC(props), // bind this section together
    availableNutrientsD(props),
    availableNutrientsE(props),
    availableNutrientsF(props),
    availableNutrientsG(props),
    applicationAreaA(props),
    applicationAreaB(props),
    nutrientBudgetA(props),
    nutrientBudgetB(props, images),
    nutrientAnalysisA(props),
    nutrientAnalysisB(props),
    nutrientAnalysisC(props),
    nutrientAnalysisD(props),
    nutrientAnalysisE(props),
    nutrientAnalysisF(props),
    naprbalA(props),
    naprbalB(props, images),
    naprbalC(props, images),
    exceptionReportingABC(props),
    nmpeaStatementsAB(props),
    notesA(props),
    certificationA(props),
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
                  { text: 'Reporting period 01/01/2020 to 12/31/2020.', alignment: "center", italics: true, fontSize: 10 }
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
                  text: "Nylund Dairy Farms | 20723 Geer RD | Hilmar, CA 95324 | Merced County | San Joaquin River Basin",
                  alignment: "center",
                  fontSize: 8
                }

              },
            ]
          },
          {
            margin: [0, 2, 0, 0],
            columns: [
              {
                width: '*',
                text: {
                  text: '05/18/2021 17:40:33', alignment: "left", fontSize: 10
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