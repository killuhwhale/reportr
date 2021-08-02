/*
    args: props:
      contains all information for report w/ following structure
*/
// const dum__ = {
//   dairyInfo: {
//     A: {
//       address: "",
//       // ....
//       parcels: [],
//     },
//     B: {
//       operators: [],
//       owners: []
//     }
//   },
//   availableNutrients: {
//     A: {
//       milk_cows: [0, 0, 0, 0, 0],
//       //  ...
//       calves: [0, 0, 0, 0],
//       predominant_milk_cow_breed: "",
//       averageMilkProd: 75,
//     },
//     B: {
//       totalManure: 0,
//       // ...
//       totalSalt: 0,
//     },
//     C: {
//       processWasteWaterGen: 0,
//       //  ...
//       totalSaltGen: 0,
//     },
//     D: {
//       freshWaterSrcs: [{}]
//     },
//     E: {
//       // Tile Drainage
//     },
//     F: {
//       // Nutrient Imports
//     },
//     G: {
//       // Nutrient Exports
//     },
//   },
//   applicationArea: {
//     A: {
//       appAreas: [],
//     },
//     B: {
//       fieldCropHarvests: []
//     }
//   },
//   nutrientBudget: {
//     A: {
//       // land_apps: []
//     },
//     B: {
//       // nutrient_budget
//     }
//   },
//   nutirentAnalysis: {
//     A: {
//       // manure_analysis: []
//     },
//     B: {
//       // process_wastewater_analysis: []
//     },
//     C: {
//       // fresh_water_analysis: []
//     },
//     D: {
//       // soil_analysis: []
//     },
//     E: {
//       // Plant_tissue_analysis: []
//     },
//     F: {
//       // tile drainage analysis
//     }
//   },
//   nutrient_app_removal,bal: {
//     A:{
//       // summary pf nutrient apps, potential removal and balance
//     },
//     B: {
//       // Pounds of nutrient applied vs crop removal
//     },
//     C:{
//       // lbs of nutrient apploed by maerial type
//     }
//   },
//   exceptionReporting: {
//     A: {
//       // manureProcessWasteDischarges: []
//     },
//     B: {
//       // storm water discharges:[]
//     },
//     C: {
//       // landApp area to surface water disharges: []
//     }
//   },
//   nutrientManagementPlanExportAgreement: {
//     A: {
//       nmpStatements: ["","",""]
//     },
//     B: {
//       // exportAgreement true/ false
//     }
//   },
//   notes: {
//     A: {
//       // notes: []
//     }
//   },
//   certification: {
//     A: {
//       // info: []
//     }
//   },
//   attachments: {
//     A: {
//       // required: []
//     }
//   }

// }



// Dummy data

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
            text: 'Nylun, Rodney V', fontSize: 9
          },
          {
            border: [false, false, false, false],
            text: 'Telephone no.:', fontSize: 9
          },
          {
            border: [false, false, false, true],
            text: '(209)634-7520', fontSize: 9
          },
        ]
      ]
    }
  }
}
const image = (img) => {
  return {
    // you'll most often use dataURI images on the browser side
    // if no width/height/fit is provided, the original size will be used
    image: img,
    // fit: [150, 150], // fit inside a rect
    width: 425,
    height: 175,
    margin: [0, 5]
  }
}

const ownOperatorTable = (key, props) => {
  return {
    id: key,
    table: {
      widths: ["*"],

      body: [
        [
          {
            fillColor: '#eeeeee',
            text: `${key}Nylund, Rodney Vz`,
            fontSize: 9
          }
        ],
        [{
          border: [true, false, true, false],
          stack: [
            nameTelephoneLine({})
          ]
        }],
        [
          {
            border: [true, false, true, false],
            stack: [longAddressLine({
              street: "20723 Geer RD",
              city: "Hilmar",
              county: "Merced",
              zipCode: "95324",
            })]
          }
        ],
        [{
          border: [true, false, true, true],
          text: 'This operator is responsible',
          fontSize: 9

        }],
        [
          {
            id: key,
            border: [false], // empty row for margin between list of tables.
            text: ` `, fontSize: 4
          }
        ]
      ]
    }
  }
}
const dairyInformationA = (props) => {
  return {
    // pageBreak: 'before', // super useful soltion just dont need on the first one
    stack: [{
      magin: 0,
      stack: [ // Header and first row - unindented
        {
          magin: 0,
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
                  text: 'Nylund Dairy Farms', fontSize: 9, lineHeight: 0.1
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
                    street: "20723 Geer RD",
                    city: "Hilmar",
                    county: "Merced",
                    zipCode: "95324",
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
                  text: '', fontSize: 9, lineHeight: 0.1
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
                  text: '01/01/1921', fontSize: 9, lineHeight: 0.1
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
                  text: 'San Joaquin River Basin', fontSize: 9, lineHeight: 0.1
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
            body: [
              [{
                border: [true, true, false, false],
                text: '0045-0200-0012-0000 ', fontSize: 8
              },
              {
                border: [false, true, false, false],
                text: '0045-0200-0012-0000 ', fontSize: 8
              },
              {
                border: [false, true, false, false],
                text: '0045-0200-0012-0000 ', fontSize: 8
              },
              {
                border: [false, true, false, false],
                text: '0045-0200-0012-0000 ', fontSize: 8
              },
              {
                border: [false, true, false, false],
                text: '0045-0200-0012-0000 ', fontSize: 8
              },
              {
                border: [false, true, true, false],
                text: '0045-0200-0012-0000 ', fontSize: 8
              },
              ], // nneed to iterate through a list to produce lists of size 6
              [{
                border: [true, false, false, false],
                text: '0045-0200-0012-0000 ', fontSize: 8
              },
              {
                border: [false, false, false, false],
                text: '0045-0200-0012-0000 ', fontSize: 8
              },
              {
                border: [false, false, false, false],
                text: '0045-0200-0012-0000 ', fontSize: 8
              },
              {
                border: [false, false, false, false],
                text: '0045-0200-0012-0000 ', fontSize: 8
              },
              {
                border: [false, false, false, false],
                text: '0045-0200-0012-0000 ', fontSize: 8
              },
              {
                border: [false, false, true, false],
                text: '0045-0200-0012-0000 ', fontSize: 8
              },
              ],
              [{
                border: [true, false, false, true],
                text: '0045-0200-0012-0000 ', fontSize: 8
              },
              {
                border: [false, false, false, true],
                text: '0045-0200-0012-0000 ', fontSize: 8
              },
              {
                border: [false, false, false, true],
                text: '0045-0200-0012-0000 ', fontSize: 8
              },
              {
                border: [false, false, false, true],
                text: '0045-0200-0012-0000 ', fontSize: 8
              },
              {
                border: [false, false, false, true],
                text: '0045-0200-0012-0000 ', fontSize: 8
              },
              {
                border: [false, false, true, true],
                text: '0045-0200-0012-0000 ', fontSize: 8
              },
              ]
            ]
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
            text: 'B. Operators', bold: true, fontSize: 9
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
            text: 'C. Owners', bold: true, fontSize: 9
          }
        ]
      },
      {
        margin: [15, 0, 0, 0],
        stack: OwnOperators.map((owner, i) => {
          return {
            table: {
              body: [
                [ownOperatorTable(`ownerTable${i}`, {})]
              ],
              widths: [705],
            },
            layout: 'noBorders'
          }
          ownOperatorTable(`ownerTable${i}`, {})
        })
      }
    ]
  }
}


const availableNutrientsA = (props) => {
  return {
    // pageBreak: 'before', // super useful soltion just dont need on the first one
    stack: [{
      magin: 0,
      stack: [ // Header and first row - unindented
        {
          magin: 0,
          table: {
            widths: ['*'],
            body: [
              [{
                // border: [false, false, false, false],
                text: 'AVAILABLE NUTRIENTS', alignment: 'center', fontSize: 10
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
            widths: ["20%", "*", "*", "*", "*", "*", "*"],
            body: [
              [
                { // row 1
                  text: '', fontSize: 8
                },
                { // row 1
                  text: 'Milk Cows', fontSize: 8
                },
                { // row 1
                  text: 'Dry Cows', fontSize: 8
                },
                { // row 1
                  text: 'Bred Heifers (15-24 mo.)', fontSize: 8
                },
                { // row 1
                  text: 'Heifers (7-14 mo. to breeding)', fontSize: 8
                },
                { // row 1
                  text: 'Calves (4-6 mo.)', fontSize: 8
                },
                { // row 1
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
                  fillColor: "#cecece",

                  text: ''
                },
                { // row 6
                  text: '',
                  fillColor: "#cecece",

                },

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
                  text: 'Predominant milk cow breed:', fontSize: 8,

                }
              },
              {
                border: [false, false, false, true],
                text: {
                  text: 'Holstein', fontSize: 9, lineHeight: 0.1
                }
              }]
            ]
          }
        },
        {
          table: {
            margin: [0, 0],
            widths: ['15%', 'auto', '*'],
            heights: [1],
            body: [
              [{// row 1

                border: [false, false, false, false],
                text: {
                  text: 'Average milk production:', fontSize: 8,

                }
              },
              {
                border: [false, false, false, true],
                text: {
                  text: '75', alignment: 'right', fontSize: 9, lineHeight: 0.1
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
      magin: 0,
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
            widths: ["20%", "10%", "*"],
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
            widths: ['21%', "10%", '15%', "26%", '10%', '*'],
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
            widths: ['20%', '10%', '*'],
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
    columns: [
      {
        magin: 0,
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
                text: {
                  text: 'Source Description', fontSize: 9,
                }
              },
              {// row 1
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
            [
              {
                text: {
                  text: 'I7', fontSize: 9,
                }
              },
              {
                text: {
                  text: 'Ground Water', fontSize: 9,
                }
              },
            ],
          ]
        }
      },
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
  const body = [
    dairyInformationA(props),
    dairyInformationB(props),
    dairyInformationC(props),
    availableNutrientsA(props),
    availableNutrientsB(props),
    availableNutrientsC(props),
    availableNutrientsD(props),
    image(images.nutrientHoriBar0),
    image(images.materialHoriBar0),

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
      if (currentNode.id) {
        let childNodes = nodesOnNextPage.filter(el => el.id === currentNode.id)
        return childNodes.length > 0
      }
      // Header element and foot elemtn of a table or long entity need to have match keys under the ID.
      return false;
    }
  }
}