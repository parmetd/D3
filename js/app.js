// Loading the data
// const news = d3.csv("../data/data.csv");
// console.log(news);

// svg container
var svgWidth = 960;
var svgHeight = 500;

// margins
var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

// chart area minus margins
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;
var padding = 25; // Padding around canvas, i.e. replaces the 0 of scale

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

// function used for updating x-scale var upon click on axis label
function xScale(newsData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(newsData, d => d[chosenXAxis]) * 0.8,
      d3.max(newsData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

var toolTips = d3.tip()
  .attr("class", "tooltip")
  .offset([80, -60])
  .html(function(d) {
    return (`${d.state}<br> ${d[chosenXAxis]}`);
});


// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  if (chosenXAxis === "poverty") {
    var label = "Poverty: ";
  }
  else if (chosenXAxis === "income") {
    var label = "Income: ";
  }
  else {
    var label = "Age: ";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${label} ${d[chosenXAxis]}`);
    });
    // .style("left", d3.event.pageX + "px") // this is how to BRING the tooltip to that spot.
    // .style("top", d3.event.pageY + "px");

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
var newsData = d3.csv("../data/data.csv")
newsData.then(function(newsData) {
  console.log(newsData);
  // parse data
  newsData.forEach(function(data) {
    data.id = +data.id;
    data.state = data.state;
    data.abbr = data.abbr;
    data.poverty = +data.poverty;
    data.povertyMoe = +data.povertyMoe;
    data.age = +data.age;
    data.ageMoe = +data.ageMoe;
    data.income = +data.income;
    data.incomeMoe = +data.incomeMoe;
    data.healthcare = +data.healthcare;
    data.healthcareLow = +data.healthcareLow;
    data.healthcareHigh = +data.healthcareHigh;
    data.obesity = +data.obesity;
    data.obesityLow = +data.obesityLow;
    data.obesityHigh = +data.obesityHigh;
    data.smokes	= +data.smokes;
    data.smokesLow = +data.smokesLow;
    data.smokesHigh = +data.smokesHigh;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(newsData, chosenXAxis);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(newsData, d => d.obesity)])
    .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(newsData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.obesity))
    .attr("r", 20)
    .attr("fill", "steelblue")
    .attr("opacity", ".5");


   //Create text labels with state abbreviation for each circle
   var items = chartGroup.selectAll("item")
      .data(newsData)
      .enter()
      .append("g");
   
   // With the circles on our graph, we need matching labels.
   // Let's grab the state abbreviations from our data
   // and place them in the center of our dots.
   items.append("text")
      .classed("stateText", true)
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d.obesity))
      .attr("stroke", "white")
      .attr("font-size", "12px")
      .text(d => d.abbr)
    // Hover Rules
      .on("mouseover", function(d) {
    // Show the tooltip
    toolTips.show(d);
    // Highlight the state circle's border
    d3.select("." + d.abbr).style("stroke", "#323232");
    })
    .on("mouseout", function(d) {
    // Remove tooltip
    toolTips.hide(d);
    // Remove highlight
    d3.select("." + d.abbr).style("stroke", "#e3e3e3");
    });
 

  // Create group for  3 x-axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");
  
  var incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 50)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

  // append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Obese (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(newsData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "age") {
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "income") {
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
        else {
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
      }
    });
});
