const w = 1000;
const h = 600;
const padding = 60;
const legendRectSize = 15;                                  
const legendSpacing = 6;                   

var color = d3.scaleOrdinal(d3.schemeDark2);

const svg = d3.select('#graph')
              .append('svg')
              .attr('viewBox', '0 0 ' + w + ' ' + h)
              .attr('preserveAspectRatio', 'xMinYMin meet');

/*sample data
[{  "Time": "36:50",
    "Place": 1,
    "Seconds": 2210,
    "Name": "Marco Pantani",
    "Year": 1995,
    "Nationality": "ITA",
    "Doping": "Alleged drug use during 1995 due to high hematocrit levels",
    "URL": "https://en.wikipedia.org/wiki/Marco_Pantani#Alleged_drug_use"
  },..] */
  
d3.json('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json').then(function(Data) {

    // convert the time into Date object
  Data.forEach( d => {
    var parsedTime = d.Time.split(':');
    d.Time = new Date(Date.UTC(1970, 0, 1, 0, parsedTime[0], parsedTime[1]));
  })
  
  //create a time formatter
  var formatTime = d3.timeFormat("%M:%S");

  //X & Y Scales
  const xScale = d3.scaleLinear()
                  .domain([d3.min(Data, d => d.Year - 1), d3.max(Data, d => d.Year + 1)])
                  .range([padding, w-padding])
  
  const yScale = d3.scaleTime()
                  .domain(d3.extent(Data, d => d.Time))
                  .range([h-padding, padding])
  
  //x-Axis  
  const xAxis = d3.axisBottom(xScale)
                  .tickFormat(d3.format("d"))
  svg.append("g")
       .attr("transform", "translate(0," + (h - padding) + ")")
       .attr("id", "x-axis")
       .call(xAxis)

  //Y-Axis
  const yAxis = d3.axisLeft(yScale)
                  .tickFormat(formatTime)
  svg.append("g")
      .attr("transform", "translate(" + padding + ", 0)")
      .attr("id", "y-axis")
      .call(yAxis)
 
  //Label for x-Axis
  svg.append('text')
      .attr('x', w/2)
      .attr('y', h - 20)
      .text('Year')
      .style('font-size', 15)
      .style('font-weight', 'bold')
 
  //Label for y-Axis
  svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -h/2)
      .attr('y', padding - 45)
      .text('Time in Minutes')
      .style('font-size', 15)
      .style('font-weight', 'bold')
  
  //tool tip
  var tip = d3.tip()
              .attr('id', 'tooltip')
              .offset(function(){ return [this.getBBox().height / 2, 0] })
              .html(function(d) {
                  d3.select('#tooltip').attr('data-year', d.Year);
                  return "<span style='color:#ff6600; font-size: 12px'>" + d.Name + ": " + d.Nationality + "<br>Year: " + d.Year + " Time: " + formatTime(d.Time) + "<br>" + d.Doping + "</span>"})

  svg.call(tip);

  //plot the scatter graph
  svg.selectAll("circle")
       .data(Data)
       .enter()
       .append("circle")
       .attr("class", "dot")
       .attr("cx", d => xScale(d.Year))
       .attr("cy", d => yScale(d.Time))
       .attr("r", d => 5)
       .style("fill", d => color(d.Doping != ""))
       .attr("data-xvalue", d => d.Year)
       .attr("data-yvalue", d => d.Time)
       .on('mouseover', tip.show)
       .on('mouseout', tip.hide)
  
  // translate the legend box to the right bottom side of the graph
  var legendBox = svg.append('g')
        .attr('transform', "translate(" + w * 2/3 + "," + h * 3/4 + ")")
        .attr('class','legendBox')
  
  // legend box
  var legend = legendBox.selectAll('.legend')
                  .data(color.domain())
                  .enter()
                  .append('g')
                  .attr('class', 'legend')
                  .attr('id', 'legend')
                  .attr("transform", (d, i) => "translate(0," + i * (legendRectSize + legendSpacing) + ")")

  //legend rectangles
  legend.append('rect')     
    .attr('width', legendRectSize)                         
    .attr('height', legendRectSize)                        
    .style('fill', color)                                  
    .style('stroke', color);                               

  //legend text
  legend.append('text')                                    
    .attr('x', legendRectSize + legendSpacing)             
    .attr('y', legendRectSize - legendSpacing)             
    .attr('dy', '0.25em')
    .text( d => d ? "Riders with doping allegations" : "No doping allegations")
})

