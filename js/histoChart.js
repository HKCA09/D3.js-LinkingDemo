d3.histoChart = function() {
    var histoX = d3.scaleBand()
            .padding(.30),
        histoY = d3.scaleLinear(),
        histoColor = d3.scaleOrdinal(d3.schemeCategory10),
        yAxisCall = d3.axisRight(),
        width, height, colorscheme,
        binVal,
        colorVal,
        histoRectGs,
        yAxis,
        bins,
        histDomain;
    function chart (selection) {
        selection.each(function(data) {
            var el = d3.select(this)

            el.append('style')
            bins = d3.histogram()
            .value(binVal)
            .domain(x.domain())
            .thresholds(x.ticks(10))
            (data)
            if (colorscheme) histoColor = d3.scaleOrdinal(colorscheme)
            histoColor.domain(data.map(d => d[colorVal]))
            histDomain = histoColor.domain();
            bins.forEach(d => {
                d.nest = d3.nest()
                    .key(d => d[colorVal])
                    .rollup(d => d.length)
                    .entries(d)
                histDomain.forEach(v => {
                    if (!d.nest.find(k => k.key == v)) d.nest.push({key: v, value: 0})
                });
                d.nest.sort((a,b) => a.key.localeCompare(b.key))
            })
            histoX.range([0,width])
                .domain(bins.map(d => d.x0));
            var yMax = d3.max(bins, d => d3.max(d.nest, v => v.value));
            histoY.range([height,0])
                .domain([0,yMax])
                .nice()
            
            el.append('text')
                .text((binVal + '').split('.')[1].replace(/^\w/, c => c.toUpperCase()))
                .attr('x', width/2)
                .attr('y', -5)
                .attr("text-anchor", "start")
                .attr("font-weight", "bold")
                .attr('font-size', "15")

            el.append('g')
                .attr('transform', 'translate(0,' + height + ')')
                .call(d3.axisBottom(histoX))
            yAxis = el.append('g')
                .attr('class', 'yAxis')
                .call(yAxisCall.scale(histoY).ticks(6).tickSize(width))
                .call(g => {
                    //g.select(".domain").remove();
                    g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "#777").attr("stroke-dasharray", "2,2");
                    g.selectAll(".tick text").attr("x", 4).attr("dy", -4)
                })

            histoRectGs = el.selectAll('g.rectG')
                .data(bins)
                .enter().append('g')
                .attr('class', 'rectG')
                .attr('transform', d => 'translate(' + histoX(d.x0) + ',0)');
            histoRectGs.selectAll('rect')
                .data(d => d.nest)
                .enter().append('rect')
                .attr('x', (d,i) => histoX.bandwidth()/histDomain.length * i)
                .attr('y', d => histoY(d.value))
                .attr('width', histoX.bandwidth()/histDomain.length)
                .attr('height', d => height - histoY(d.value))
                .attr('fill', d => histoColor(d.key))
        })
    }
    chart.width = function (_){
        return arguments.length ? (width = _, chart) : width;
    };
    chart.height = function (_){
        return arguments.length ? (height = _, chart) : height;
    };
    chart.colorScheme = function (_){
        return arguments.length ? (colorscheme = _, chart) : colorscheme;
    };
    chart.binVal = function (_){
        return arguments.length ? (binVal = _, chart) : binVal;
    };
    chart.colorVal = function (_){
        return arguments.length ? (colorVal = _, chart) : colorVal;
    };
    chart.updateData = function(newData) {
        
        var bins = d3.histogram()
        .value(binVal)
        .domain(x.domain())
        .thresholds(x.ticks(10))
        (newData)
        bins.forEach(d => {
            d.nest = d3.nest()
                .key(d => d[colorVal])
                .rollup(d => d.length)
                .entries(d)
            histDomain.forEach(v => {
                if (!d.nest.find(k => k.key == v)) d.nest.push({key: v, value: 0})
            });
            d.nest.sort((a,b) => a.key.localeCompare(b.key))
        })
        var yMax = d3.max(bins, d => d3.max(d.nest, v => v.value));
        histoY.domain([0,yMax])

        yAxis.transition()
            .call(yAxisCall.scale(histoY).ticks(6).tickSize(width))
            .call(g => {
                g.select(".domain").remove();
                g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "#777").attr("stroke-dasharray", "2,2");
                g.selectAll(".tick text").attr("x", 4).attr("dy", -4)
            })

        histoRectGs.data(bins)
        histoRectGs.selectAll('rect')
            .data(d => d.nest)
            .transition()
            .attr('y', d => histoY(d.value))
            .attr('height', d => height - histoY(d.value))
        return chart;
    }
    return chart; 
}
