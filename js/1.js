//设置边距
var m = [40, 30, 50, 40],
        w = 1400 - m[1] - m[2],
        h = 720 - m[0] - m[2],
        wTrip = w/2 - m[1],
        hTrip = h/2 - m[0];

//设置x,y轴，svg
var x = d3.scaleLinear()
          .range([0,wTrip])
          .domain([0,79999]),
    y = d3.scaleLinear()
          .range([hTrip,0])
          .domain([0,60000]),
color = d3.scaleOrdinal(d3.schemeDark2);

var svg = d3.select("#area1").append("svg")
            .attr("width", w + m[1] + m[2])
            .attr("height", h + m[0] + m[2])
            .append("g")
            .attr("transform", "translate(" + m[2] + "," + m[0] + ")");

//导入数据
    d3.csv('data/1.csv')
        .then(data => render(data))

        function render(data) {
            
            data.forEach(d => {
                d.confirmed = +d.confirmed;
                d.cured = +d.cured;                
            });

            console.log(data)
    //设置点半径
    var scatterRadius = 4,
        colorScheme = d3.schemeDark2,
        type = 'month';
        
    var scatConfirmedCured = d3.scatter()
            .width(wTrip)
            .height(hTrip)
            .scheme(colorScheme)
            .xVal('confirmed')
            .yVal('cured')
            .colorVal(type)
            .radius(scatterRadius)
            
            
    var confirmedHisto = d3.histoChart()
            .width(wTrip)
            .height(hTrip)
            .colorScheme(colorScheme)
            .binVal(d => d.confirmed)
            .colorVal(type);
    var curedHisto = d3.histoChart()
            .width(wTrip)
            .height(hTrip)
            .colorScheme(colorScheme)
            .binVal(d => d.cured)
            .colorVal(type);

    scatConfirmedCured.update([
            {chart: confirmedHisto, type: 'data'},
            {chart: curedHisto, type: 'data'},                
            ]);

    var nest = d3.nest()
            .key(d => d[type])
            .entries(data);
    var colors = d3.scaleOrdinal(colorScheme)
            .domain(nest.map(d => d.key));
    var legend = svg.append('g')
            .selectAll('g.legendItem')
            .data(nest)
            .enter().append('g')
            .attr('class', d => d.key.replace(/\s|\//, ''))
            .on('click', function(a,b,c) {
                console.log('a', a)
                console.log('b', b)
                console.log('c', c)
                var g = d3.select(c[b])
                if (g.select('rect').attr('fill') === '#bbb') {
                    g.select('rect')
                        .attr('fill', d => colors(d.key))
                    scatConfirmedCured.updateData(data)                        
                    confirmedHisto.updateData(data)
                    curedHisto.updateData(data)
                       
                } else {
                        g.select('rect')
                            .attr('fill', '#bbb')
                        scatConfirmedCured.updateData(a.values)                                           
                        confirmedHisto.updateData(a.values)
                        curedHisto.updateData(a.values)
                       
                    }
                })
            
            //图例    
            legend.append('rect')
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', 10)
                .attr('height', 10)
                .attr('stroke', function (d) { return colors(d.key); })
                .attr('stroke-width', 2)
                .attr('fill', function (d) { return colors(d.key); });
            legend.append('text')
                .text(function (d) { return d.key.replace(/^\w/, c => c.toUpperCase()); })
                .attr('x', 15)
                .attr('y', 10);

            var moveLegend = 0;
            legend.each(function (g) {
                var gDiv = svg.select('g.' + g.key.replace(/\s|\//, ''));
                var gWidth = gDiv.node().getBoundingClientRect().width + 10;
                moveLegend += gWidth;
                gDiv.attr('transform', 'translate(' + [(moveLegend - gWidth) + 40, 0] + ')');
            });

            svg.append("g")
                .attr('transform', 'translate('  + m[0]*9 + ',' + m[0] + ')' )
                .datum(data)
                .call(scatConfirmedCured)
           
            svg.append("g")
                .attr('transform', 'translate(' + 0 + ',' + (hTrip + m[0]*2) + ')' )
                .datum(data)
                .call(confirmedHisto)
            svg.append("g")
                .attr('transform', 'translate(' + (wTrip + m[1]) + ',' + (hTrip + m[0]*2) + ')' )
                .datum(data)
                .call(curedHisto)
           
            function renderWithType(str) {
            }
        }