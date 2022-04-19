d3.scatter = function() {
    var width, height, scheme,
        x = d3.scaleLinear(),
        y = d3.scaleLinear(),
        color = d3.scaleOrdinal(d3.schemeCategory10),
        xVal, yVal, colorVal,
        brush = d3.brush(),
        updates,
        el,
        radius,
        circles;

    function chart (selection) {
        selection.each(function(data) {
            el = d3.select(this)
            x.range([0,width]).domain([0, d3.max(data, d => d[xVal])])
            y.range([height,0]).domain([0, d3.max(data, d => d[yVal])])
            
            if (scheme) color = d3.scaleOrdinal(scheme);
            color.domain(data.map(d => d[colorVal]))
            
            el.append('style')
                .text('.brush rect.selection { fill-opacity: 0.1; }')
            el.append('text')
                .text(xVal.replace(/^\w/, c => c.toUpperCase()) + ' vs ' + yVal.replace(/^\w/, c => c.toUpperCase()))
                .attr('x', width/2)
                .attr('y', -10)
                .attr('text-anchor', 'middle')
    
            var xAxis = el.append('g')
                .call(d3.axisBottom(x).tickSize(height))
                .call(g => {
                    g.select('.domain').remove()
                    g.selectAll('line').attr('stroke', '#aaa')
                    g.select('.tick:last-of-type text').clone()
                        .attr('y', height - 8)
                        .attr('text-anchor', 'end')
                        .attr('font-weight', 'bold')
                        .text(xVal.replace(/^\w/, c => c.toUpperCase()))
                    g.select('.tick:last-of-type line').remove()
                    g.select('.tick:first-of-type line').remove()
                    g.select('.tick:first-of-type text').attr('x', -4)
                })
            var yAxis = el.append('g')
                .attr('transform', 'translate(' + width + ',0)')
                .call(d3.axisLeft(y).tickSize(width))
                .call(g => {
                    g.select('.domain').remove()
                    //g.selectAll('text').remove()
                    g.selectAll('line').attr('stroke', '#aaa')
                    g.select('.tick:last-of-type text').clone()
                        .attr('x', -width + 4)
                        .attr('text-anchor', 'start')
                        .attr('font-weight', 'bold')
                        .text(yVal.replace(/^\w/, c => c.toUpperCase()))
                    g.select('.tick:last-of-type line').remove()
                    g.select('.tick:first-of-type line').remove()
                    g.select('.tick:first-of-type text').remove()
                })
            circles = el.selectAll('circle')
                .data(data)
                .enter().append('circle')
                .attr('class', 'active')
                .attr('cx', d => x(d[xVal]))
                .attr('cy', d => y(d[yVal]))
                .attr('fill', d => color(d[colorVal]))
                .attr('r', radius ? radius : 3)

            
            brush.extent([[0, 0], [width, height]])
                .on("start brush", brushed)
                .on("end", brushend);
            
            el.append("g")
                .attr("class", "brush")
                .call(brush)

            function brushed() {
                var s = d3.event.selection;
                if (s) {
                    var brushSelected = circles.filter(function() {
                        return isBrushed(s, d3.select(this).attr('cx'), d3.select(this).attr('cy'));
                    });
                    brushSelected.transition()
                    .attr('fill', d => color(d[colorVal]))
                    circles.filter(function() {
                        return !isBrushed(s, d3.select(this).attr('cx'), d3.select(this).attr('cy'));
                    }).transition()
                    .attr('fill', '#bbb')
    
                    if (updates && (d3.event.sourceEvent.type === "mousemove" || d3.event.sourceEvent.type === "mousedown")) {
                        updates.forEach(update => {
                            if (update.type === 'brush') update.chart.updateBrush(s)
                            else if (update.type === 'data') update.chart.updateData(brushSelected.data())
                        })
                    }
                }
            }

            function brushend() {
                if (!d3.event.selection) {
                    circles.transition()
                        .attr('fill', d => color(d[colorVal]))
                    if (updates) {
                        updates.forEach(update => {
                            if (update.type === 'data') update.chart.updateData(circles.data())
                        })
                    }
                }  
            }
        })
    }

      
    function isBrushed(brush_coords, cx, cy) {
        return brush_coords[0][0] <= cx && cx <= brush_coords[1][0] && brush_coords[0][1] <= cy && cy <= brush_coords[1][1];
    } 
    chart.width = function(_) {
        return arguments.length ? (width = _, chart) : width;
    }
    chart.height = function(_) {
        return arguments.length ? (height = _, chart) : height;
    }
    chart.scheme = function(_) {
        return arguments.length ? (scheme = _, chart) : scheme;
    }
    chart.xVal = function(_) {
        return arguments.length ? (xVal = _, chart) : xVal;
    }
    chart.yVal = function(_) {
        return arguments.length ? (yVal = _, chart) : yVal;
    }
    chart.colorVal = function(_) {
        return arguments.length ? (colorVal = _, chart) : colorVal;
    }
    chart.update = function(_) {
        return arguments.length ? (updates = _, chart) : updates;
    }
    chart.updateData = function(newData) {
        circles.filter(function(d) {
            return newData.indexOf(d) > -1;
        }).transition()
        .attr('fill', d => color(d[colorVal]));

        circles.filter(function(d) {
            return newData.indexOf(d) === -1;
        }).transition()
        .attr('fill', '#bbb');

        return chart;
    }
    chart.resetData = function() {
        circles.transition()
        .attr('fill', d => color(d[colorVal]));

        return chart;
    }
    chart.updateBrush = function(extent) {
        el.select(".brush").call(brush.move, extent);
        return chart;
    }
    chart.radius = function(_) {
        return arguments.length ? (radius = _, chart) : radius;
    }
    chart.colorScale = function() {
        return color;
    }

    return chart;
}