import Chart from 'chart.js/auto';
export default function  mTea(){}


export const createElementsChart = () => {
  let labels = ["N", "P", "K", "Salt"]
  let data = [{x:5}, {y:10}, {z:15}, {a:2000}]
  // let canvas = document.getElementById('chart').getContext('2d')
  let canvas = document.createElement('canvas')
  document.getElementsByTagName('body')[0].appendChild(canvas)
  let barChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels, // [x, y, z]
      datasets: [{
        label: "Scores (Standard Deviation)",
        minBarLength: 1,
        backgroundColor: ['#ffffff'],
        data: data
      }]
    },
    options: {
      maintainAspectRatio: false
    }
  });
  
  
  console.log(barChart)

  const img = barChart.toBase64Image()
  console.log(img)
  return img
  

}