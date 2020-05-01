// Data preparation
function prepareScatterData(data){
	return data.sort((a, b)=> b.bloodsugar - a.bloodsugar).filter((d, i) => i < 100);
}

// Main function
function ready(bgData) {
	// Data prep
	const bgDataClean = filterData(bgData);
	const scatterData = prepareScatterData(bgDataClean);

	//console.log(scatterData);

	// Dimensions
	const margin = {top: 80, right: 40, bottom: 40, left: 80};
	const width = 600 - margin.right - margin.left;
	const height = 500 - margin.top - margin.bottom;

	// Scales
	scatterData.forEach(function(d) {
    	//d.date_taken = parseDate(d.date_taken);
    	console.log(d.date_taken);
	});

    var xScale = d3.scaleTime().domain(d3.extent(scatterData, function(d) { return d.date_taken; })).range([0, width-margin.right]);

	const yExtent = d3
		.extent(scatterData, d => d.bloodsugar)
		.map((d, i) => (i === 0 ? d * 0.1 : d * 1.1));

	const yScale = d3
		.scaleLinear()
		.domain(yExtent)
		.range([height-5, 0]);

	// Draw base
	const svg = d3
		.select('.scatter-plot-container')
		.append('svg')
		.attr('width', width + margin.right + margin.left)
		.attr('height', height + margin.top + margin.bottom)
		.append('g')
		.attr('transform', `translate(${margin.left}, ${margin.top})`);

	// Draw header
	const header = svg
		.append('g')
		.attr('class', 'bar-header')
		.attr('transform', `translate(0, ${-margin.top / 2})`)
		.append('text');

	header.append('tspan').text('Personal Blood Glucose Chart')

	header
	  .append('tspan')
	  .text('')
	  .attr('x', 0)
	  .attr('dy', '1.5em')
	  .style('font-size', '0.8em')
	  .style('fill', '#555');

	// Draw x axis
	//const xFormat = "%d-%b";
	const xFormat = "%m/%d/%Y";
	const xAxis = d3
		.axisBottom(xScale)
		.ticks(1)
		//.tickFormat(formatTicks)
		.tickSizeInner(-height)		
		.tickSizeOuter(0)
		//.tickFormat(d3.timeFormat(xFormat)).ticks(d3.timeMonth);
		//.tickFormat(d3.timeFormat(xFormat)).ticks(12);
		.tickFormat(d3.timeFormat("%Y-%m-%d")).tickValues(scatterData.map(d=>d.date_taken));

	function addLabel(axis, label, x, y){
		axis
		  .selectAll('.tick:last-of-type text')
		  .clone()
		  .text(label)
		  .attr('x', x)
		  .attr('y', y)
		  .style('text-anchor', 'start')
		  .style('font-weight', 'bold')
		  .style('fill', '#555');
	}

	const xAxisDraw = svg
		.append('g')
		.attr('class', 'x axis')
		.attr('transform', `translate(0, ${height})`)
		.call(xAxis)
		.call(addLabel, 'Date', width-margin.right+40, 0);

	//xAxisDraw.selectAll('text').attr('dy', 'lem');

	/* Redraw yAxis with toggled label START */
	var bloodSugarUnit = "mg/dL";
	d3.select(".selected-container button").on("click", function(){
		if (bloodSugarUnit== "mg/dL"){
			bloodSugarUnit = "mmol/L";

		}
        else {
        	bloodSugarUnit = "mg/dL";
        }
        console.log(bloodSugarUnit);
        var yAxisClass = ".y.axis ";
        svg.selectAll(yAxisClass+"text").remove()
		yAxisDraw = svg
		.append('g')
		.attr('class', 'y axis')
		.call(yAxis)
		.call(addLabel, 'Blood Glucose Level ' + bloodSugarUnit, -45, -70);
	});
	/* Redraw yAxis with toggled label END */

	// Draw y axis
	const yAxis = d3
		.axisLeft(yScale)
		.ticks(5)
		.tickFormat(formatTicks)
		.tickSizeInner(-(width-margin.right))		
		.tickSizeOuter(0);

	//const yAxisDraw = svg
	var yAxisDraw = svg
		.append('g')
		//.append("stop").attr("offset", "0%").attr("stop-color", "yellow")
		//.append("stop").attr("offset", "10%").attr("stop-color", "yellow")
		//.append("stop").attr("offset", "10%").attr("stop-color", "red")
		//.append("stop").attr("offset", "20%").attr("stop-color", "red")
		.attr('class', 'y axis')
		//.attr("y", height) 
		//.attr('transform', `translate(0, ${width})`)
		.call(yAxis)
		//.attr('dy', '-0.3em')
		.call(addLabel, 'Blood Glucose Level ' + bloodSugarUnit, -45, -70);

	// Color background according to Y tick value range
	/*var data = svg.selectAll(".y .tick").data();   
 	svg.selectAll("rect")   
    	.data(data)
		.enter()
		.append("rect")
   		.attr("class", "shading")
   		.attr("x", 0)
   		//.attr("y", 62.5)
   		.attr("y", 0)
   		.attr("width", width-margin.right)
   		.attr("height", 227)
	 	.attr("opacity", 0.2)
   		//.attr("fill", function(d,i){return c10(1)});
   		.attr("fill", "red");*/

   	// Color background according to Y tick value range
   	// Reference: https://stackoverflow.com/questions/38068006/how-to-add-background-shading-to-d3-line-chart
   	var data = d3.pairs(svg.selectAll(".y .tick").data());   
 	var c10 = d3.scaleOrdinal(d3.schemeCategory10);
 	console.log(data);
 	svg.selectAll("rect")   
    	.data(data)
		.enter()
		.append("rect")
   		.attr("class", "shading")
   		.attr("x", 0)
   		.attr("y", function(d){return yScale(d[0])})
   		.attr("width", width-margin.right)
   		.attr("height", function(d){return (yScale(d[0]) - yScale(d[1]));})
	 	.attr("opacity", 0.2)
   		.attr("fill", function(d,i){return c10(i)});

	// Draw scatter
	svg
		.append('g')
		.attr('class', 'scatter-points')
		.selectAll('.scatter')
		.data(scatterData)
		.enter()
		.append('circle')
		.attr('class', 'scatter')
		.attr('cx', d => xScale(d.date_taken))
		.attr('cy', d => yScale(d.bloodsugar))
		.attr('r', 3)
		.style('fill', function(d){ if(d.bloodsugar <= 180){
			return 'green';
		} 
		if (d.bloodsugar > 140 && d.bloodsugar <= 240){
			return 'yellow';
		}
		if (d.bloodsugar > 220){
			return 'red';
		}
		})
		.style('fill-opacity', 0.7);

	// Event handlers for selected elements.
	let selectedID;
	function mouseover() {
		selectedID = d3.select(this).data()[0].id;
		d3.selectAll(`.scatter`)
		  .filter(d => d.id === selectedID)
		  .transition()
		  .attr('r', 6)
	}

	function mouseout() {
		selectedID = d3.select(this).data()[0].id;
		d3.selectAll('.scatter')
		  .filter(d => d.id === selectedID)
		  .transition()
		  .attr('r', 3);
	}

	//var dateFormat = d3.timeFormat("%m/%d/%Y");
	//var parseTime = d3.timeParse("%y-%b-%d");
	//var parseDate2 = d3.timeParse("%Y-%m-%d");
	let parseDate3 = d3.timeFormat("%Y-%m-%d");

	// Update selected elements.
	function updateSelected(data) {
		d3.select('.selected-body')
		  .selectAll('.selected-element')
		  .data(data, d => d.id)
		  .join(
		  	enter => enter
		  		.append('p')
		  		.attr('class', 'selected-element')
		  		.html(
		  			d => `<span class="selected-title">${d.title}</span>, ${d.id
		  			} <br>date: ${parseDate3(d.date_taken)} | blood sugar: ${formatTicks(d.bloodsugar)}`
		  		),

		  	update => update,

		  	exit => exit.remove() // remove the d.title already showing 


		  )
		  .on('mouseover', mouseover)
		  .on('mouseout', mouseout);
	}



	// Highlight selected circles.
	function highlightSelected(data) {


		const selectedIDs = data.map(d => d.id);
		d3.selectAll('.scatter')
		  .filter(d => selectedIDs.includes(d.id))
		  .attr('r', 10) // enlarge radius
		  //.style('fill', 'coral');

		d3.selectAll('.scatter')
		  .filter(d => !selectedIDs.includes(d.id))
		  .attr('r', 3) // return to normal radius
		  .style('fill', function(d){ if(d.bloodsugar <= 180){
			return 'green';
		} 
		if (d.bloodsugar > 140 && d.bloodsugar <= 240){
			return 'yellow';
		}
		if (d.bloodsugar > 220){
			return 'red';
		}
		});
		

		//console.log (bloodsugar);

	}

	// Brush handler.
	function brushed() {
		if (d3.event.selection) {
			const [[x0, y0], [x1, y1]] = d3.event.selection;
			const selected = scatterData.filter(
				d =>
					x0 <= xScale(d.date_taken) && 
					xScale(d.date_taken) < x1 &&
					y0 <= yScale(d.bloodsugar) && 
					yScale(d.bloodsugar) < y1
			);
			updateSelected(selected);
			highlightSelected(selected)
		} else {
			updateSelected([]);
			highlightSelected([])
			//console.log(selected);
		}
		
	}

	// Prep selected elements' container.
	d3.select('.selected-container')
		.style('width', `${width+ margin.left + margin.right}px`)
		.style('height', `${height + margin.top + margin.bottom}px`);


	// Add brush
	const brush = d3.brush()
		.extent([[0, 0], [width, height]])
		.on('brush', brushed);
	svg
		.append('g')
		.attr('class', 'brush')
		.call(brush);
}


// Data utilities
function filterData(data) {
	return data.filter(d => {
		return (
			d.bloodsugar > 0 &&
			d.title
		);
	});
}

// Drawing Utilities
function formatTicks(d) {
	return d3.format('~s')(d)
	  .replace('M', ' mil')
      .replace('G', ' bil')
      //.replace('T', d3.timeParse("%m/%d/%Y")(d));
      .replace('T', 'tril');
}

// Type conversion
const parseNA = string => (string === 'NA' ? undefined : string);
//const parseDate = string => d3.timeParse('%y-%m-%d')(string);
const parseDate = string => d3.timeParse("%m/%d/%Y")(string);

/* Made the mistake in the CSV file the date format was 30/10/2005 etc. it added two years to every data point, and thought every october was June
, because the timeParse is %m/%d/%Y, it thought 30/10/2005 the 30 was the month. 
When using timeParse, the month, date and year must match the CSV date string format sequence */

//let parseDate = d3.timeFormat('%Y-%m-%d');
function type(d) {
	const date = parseDate(d.date_taken);

	return {
		id: +d.id,
		date_taken: date,
		bloodsugar: +d.bloodsugar,
		title: parseNA(d.title),
	};
}

// Load data.
d3.csv('data/bgData.csv', type).then(res => {
	ready(res);
	//console.log(res);
});