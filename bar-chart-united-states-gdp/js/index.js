// coded by Florin; tribute to Christian-Paul for original code
// given this was my first complex project, I used the example project as starting point
// improvements:
// commented most of the code in html, css and js for clarity
// used scales to make the chart responsive and fit any container size

var projectName = 'bar-chart';
localStorage.setItem('vis_project_no1', 'D3: Bar Chart');

// define variables to use below
var yMargin = 40,
    width = 800,
    height = 400,
    barWidth = width / 275;

// add the tooltip (setup up in css code)
var tooltip = d3.select(".visHolder").append("div").attr("id", "tooltip") // tooltip was defined as id
.style("opacity", 0);

// add the overlay (setup up in css code)
var overlay = d3.select('.visHolder').append('div').attr('class', 'overlay') // overlay was defined as class
.style('opacity', 0);

// creates a SVG container in the visHolder class
// sets its dimensions using the variables created
var svgContainer = d3.select('.visHolder').append('svg').attr('width', width + 100).attr('height', height + 60);

// reads the data from fcc github repository
d3.json('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json', function (err, data) {

  // adds a vertical axis title, not really needed
  //svgContainer.append('text')
  //.attr('transform', 'rotate(-90)')
  //.attr('x', -250)
  //.attr('y', 80)
  //.text('US Gross Domestic Product');

  // adds a note at the bottom of chart
  svgContainer.append('text').attr('x', width / 2).attr('y', height + 50).text('More Information: http://www.bea.gov/national/pdf/nipaguid.pdf').attr('class', 'info');

  // creates a variable named years that will store year + quarter
  var years = data.data.map(function (item) {
    var quarter;
    var temp = item[0].substring(5, 7); // reads the month
    if (temp === '01') {
      quarter = 'Q1';
    } else if (temp === '04') {
      quarter = 'Q2';
    } else if (temp === '07') {
      quarter = 'Q3';
    } else if (temp === '10') {
      quarter = 'Q4';
    }
    return item[0].substring(0, 4) + ' ' + quarter; // returns year+quarter
  });

  // creates a variable that stores years only
  var yearsDigits = years.map(function (item) {
    return item.substring(0, 4);
  });

  // creating a scale for x axis
  // the years are distributed linearly from the max to min on the width
  var xScale = d3.scaleLinear().domain([d3.min(yearsDigits), d3.max(yearsDigits)]).range([0, width]);

  // creates the x axis
  var xAxis = d3.axisBottom().scale(xScale).tickFormat(d3.format("d"));

  // calls the x axis -> adds the axis on the SVG
  var xAxisGroup = svgContainer.append('g').call(xAxis).attr('id', 'x-axis').attr('transform', 'translate(60, 400)');

  // extracts gdp values in a new variable, from data, second item in list
  var GDP = data.data.map(function (item) {
    return item[1];
  });

  var scaledGDP = [];
  var gdpMin = d3.min(GDP);
  var gdpMax = d3.max(GDP);

  // creates a linear scale for gdp values
  // to ensure the scale starts with a positive value, the scale starts from
  // min/max*h and goes up to max/max*h => manualy creating teh scale
  var linearScale = d3.scaleLinear().domain([gdpMin, gdpMax]).range([gdpMin / gdpMax * height, height]);

  // mapping the gdp values in a new variable using the linear scale
  scaledGDP = GDP.map(function (item) {
    return linearScale(item);
  });

  // creating a scale for y axis; this must be inverted as the origin in SVG is top left corner
  var yAxisScale = d3.scaleLinear().domain([gdpMin, gdpMax]).range([height, gdpMin / gdpMax * height]);

  // creating the axis with this scale
  var yAxis = d3.axisLeft(yAxisScale);

  // calls the y axis -> adds the axis on the SVG
  var yAxisGroup = svgContainer.append('g').call(yAxis).attr('id', 'y-axis').attr('transform', 'translate(60, 0)');

  // up to this point we have created the canvas for the chart: the title, the axes, the scales for each axis, but nothing is yet plotted
  // the following lines define the graph and some other events when the mouse is hovering inside it

  //
  d3.select('svg').selectAll('rect').data(scaledGDP).enter().append('rect').attr('data-date', function (d, i) {
    return data.data[i][0];
  }).attr('data-gdp', function (d, i) {
    return data.data[i][1];
  }).attr('class', 'bar').attr('x', function (d, i) {
    return i * barWidth;
  }).attr('y', function (d, i) {
    return height - d;
  }).attr('width', barWidth).attr('height', function (d) {
    return d;
  }).style('fill', '#CF7977').attr('transform', 'translate(60, 0)').on('mouseover', function (d, i) {
    overlay.transition().duration(0).style('height', d + 'px').style('width', barWidth + 'px').style('opacity', .9).style('left', i * barWidth + 0 + 'px').style('top', height - d + 'px').style('transform', 'translateX(60px)');
    tooltip.transition().duration(200).style('opacity', .9);
    tooltip.html(years[i] + '<br>' + '$' + GDP[i].toFixed(1).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') + ' Billion').attr('data-date', data.data[i][0]).style('left', i * barWidth + 30 + 'px').style('top', height - 100 + 'px').style('transform', 'translateX(60px)');
  }).on('mouseout', function (d) {
    tooltip.transition().duration(200).style('opacity', 0);
    overlay.transition().duration(200).style('opacity', 0);
  });
});