var width = 500,
    height = 300,
    τ = 2 * Math.PI; 

var arc = d3.arc()
    .innerRadius(40)
    .outerRadius(45)
    .startAngle(0);

var svg = d3.select("#area3").append("svg")
    .attr("width", width)
    .attr("height", height);
  
var rings = [{id:"green", percent: 94.37},
             {id:"red", percent: 5.49}];

var d3Rings = []; 
  
var convertPercentToAngle = (percent) => { return ( percent / 100 ) * τ };    
  
var createRings = function(){  
  
  rings.map(function(ring,index){

    	var d3Ring = svg  
                .append("g")
                  .attr("transform", "translate(" + width / 2 + "," + ( ( 100 * index ) + 50 ) + ")")
                  .attr("id",ring.id);
    // background
    d3Ring
    .append("path")
    .datum({endAngle: τ})
    .style("fill", "#ddd")
    .attr("d", arc); 
    
    // foreground
    var foreground = d3Ring
    .append("path")
    .datum({endAngle: 0})
    .style("fill", ring.id)
		.style("stroke", "none")
		.style("stroke-width", "0px")
		.style("opacity", 1)
    .attr("d", arc);
    
    // text
    d3Ring
  	.append("text")
  	.attr("x", -22)
    .attr("y", 6) 
    .text(ring.percent + "%")
		.attr("class", ring.id);
    	
    svg.append("text")
  	   .attr("x", 320)
       .attr("y", 55) 
       .text("治愈率")
		   .style("fill", "green")
		   
		svg.append("text")
  	   .attr("x", 320)
       .attr("y", 155) 
       .text("死亡率")
		   .style("fill", "red")
    
    
    var angle = convertPercentToAngle(ring.percent);
    
    foreground
    .transition()
      .duration(3000)
			.delay(1000 * index)
      .call(arcTween, angle);
    
    d3Rings.push(d3Ring);
  
  });  
}

createRings();

function arcTween(transition, newAngle) {

  transition.attrTween("d", function(d) {  
  var interpolate = d3.interpolate(d.endAngle, newAngle);

    return function(t) {
      d.endAngle = interpolate(t);
      return arc(d);
    };
  });
}
