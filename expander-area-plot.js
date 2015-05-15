(function(){

    module.exports = function(d3){

        var selection, shownPoints

        var parse = function(i){ return i }

        var settings = {
            'x':{
                'margin':60,
                'gutter':60,
                'axis-width':600,
            },
            'y':{
                'margin':20,
                'gutter':30,
                'axis-width':600,
            },
            'brush': {
                'color': '#903b20',
                'width': undefined,
                'startDate': undefined
            },
            'time': true
        }

        var plot = {
            'group':undefined
        }

        var axis = {
            'x': {
                'scale': undefined,
                'group': undefined, 
                'svg': d3.svg.axis()
            },
            'y': {
                'scale': d3.scale.linear(),
                'group': undefined,
                'svg': d3.svg.axis()
            }
        }

        var brush = {
            'instance': d3.behavior.drag(),
            'group': undefined,
            'rect': undefined,
        }

        var path = {
            'update': d3.svg.area()
                .x(function(d) {
                    return axis.x.scale(parse(d.x));
                })
                .y1(function(d) {
                    return axis.y.scale(d.y1); 
                })
                .y0(function(d) {
                    return axis.y.scale(d.y0); 
                }),
            'initial': d3.svg.area()
                .x(function(d) {
                    return axis.x.scale(parse(d.x));
                })
        }

        var lines = {
            'update': d3.svg.line()
                .x(function(d) {
                    return axis.x.scale(parse(d.x));
                })
                .y(function(d) {
                    return axis.y.scale(d.y); 
                })
        }

        var dispatch = d3.dispatch('brushend', 'update', 'draw')

        var svg

        var exports = function(){

            if (settings.time){
                axis.x.scale = d3.time.scale()
            } else {
                axis.x.scale = d3.scale.linear()
                axis.x.Oscale = d3.scale.ordinal()
            }

            svg = selection.append('g')
                .classed('expander-area', true)

            axis.x.scale
                .range([settings.x.margin +
                    settings.x['gutter'],
                        settings.x.margin + settings.x['axis-width'] + 
                    settings.x.gutter])

            axis.y.scale
                .range([settings.y.margin + 
                    settings.y['axis-width'], settings.y.margin ])

            axis.x.group = svg.append('g')
                .classed('expandplot-x-axis', true)

            axis.y.group = svg.append('g')
                .classed('expandplot-y-axis', true)

            plot.group = svg.append('g')
                .classed('expandplot-plot', true)

            brush.group = svg.append('g')
                .classed('expandplot-brush', true)

            brush.rect = brush.group
                .append('rect')
                    .attr('fill', settings.brush.color)
                    .style('fill-opacity', .4)
                    .style('stroke', 'black')
                    .call(brush.instance)


            dispatch.on('draw', function(data){

                plot.group.selectAll('path')
                    .attr('d', path.initial) 
                    .transition().duration(200)
                    .remove()

                updateScales(data)
                updateBrush()

                axis.x.svg.scale(axis.x.scale).orient('bottom')
                axis.y.svg.scale(axis.y.scale).orient('left')

                axis.x.group
                    .attr("transform", "translate(0," 
                        + (settings.y.margin 
                            + settings.y['axis-width'] ) + ")")
                    .call(axis.x.svg)

                axis.y.group.call(axis.y.svg)
                    .attr("transform", "translate(" 
                        + (settings.x.margin 
                            + settings.x['gutter'] ) + ",0)")

                data.areas.map(function(area, index){


                    plot.group
                        .append("path")
                        .datum(area.areaPoints)
                        .classed("expandplot-area", true)
                        .attr("id", function(d){
                            return d.id || index
                        })
                        .attr("d", path.initial)
                        .style("stroke", area.style.color)
                        .style("fill", area.style.color)
                        .transition().duration(2000)
                            .attr('d', path.update)
                })

                data.lines.map(function(line, index){

                    plot.group
                        .append("path")
                        .datum(line.linePoints)
                        .classed("expandplot-line", true)
                        .attr("id", function(d){
                            return d.id || index
                        })
                        .attr("d", lines.update)
                        .style("stroke", line.style.color)
                        .style("fill", "none")
                        .style("stroke-width", "1.5px")

                })

                brush.rect
                    .attr('height', settings.y['axis-width']) 
                    .attr('y', settings.y['margin']) 
                    .attr('x', function(){
                        return axis.x.scale.range()[0]
                    })
                    .transition().duration(2000)
                        .attr('x', function(){
                            if (!settings.brush.startDate){
                                return axis.x.scale.range()[0]
                            }
                            return axis.x.scale(settings.brush.startDate)
                        })

            })

            dispatch.on('update', function(data){

                plot.group.selectAll('path')
                    .attr('d', path.initial) 
                    .transition().duration(200)
                    .remove()

                updateScales(data)
                updateBrush()

                axis.x.svg.scale(axis.x.scale).orient('bottom')
                axis.y.svg.scale(axis.y.scale).orient('left')

                axis.x.group
                    .attr("transform", "translate(0," 
                        + (settings.y.margin 
                            + settings.y['axis-width'] ) + ")")
                    .call(axis.x.svg)

                axis.y.group.call(axis.y.svg)
                    .attr("transform", "translate(" 
                        + (settings.x.margin 
                            + settings.x['gutter'] ) + ",0)")
                

                data.areas.map(function(area, index){

                    var instance = d3.svg.area()
                        .x(function(d) {
                            return axis.x.scale(parse(d.date));
                        })
                        .y1(function(d) {
                            return axis.y.scale(d.y1); 
                        })
                        .y0(function(d) {
                            return axis.y.scale(d.y0); 
                        })

                    plot.group
                        .append("path")
                        .datum(area.areaPoints)
                        .classed("expandplot-area", true)
                        .attr("id", function(d){
                            return d.id || index
                        })
                        .attr("d", path.update)
                        .style("stroke", area.style.color)
                        .style("fill", area.style.color)
                })

                data.lines.map(function(line, index){

                    plot.group
                        .append("path")
                        .datum(line.linePoints)
                        .classed("expandplot-line", true)
                        .attr("id", function(d){
                            return d.id || index
                        })
                        .attr("d", lines.update)
                        .style("stroke", line.style.color)

                })

            })

        }

        d3.rebind(exports, dispatch, 'on', 'draw', 'update', 'brushend')

        exports.settings = function(){
        /*Sets or gets entire settings object
        */

            if (arguments.length > 0){
                settings = arguments[0]
                return exports
            }
            return settings

        }

        exports.settings.x = function(){
        /*Sets or gets entire settings.x object
        */

            if (arguments.length > 0){
                settings.x = arguments[0]
                return exports
            }
            return settings.x

        }

        exports.settings.y = function(){
        /*Sets or gets entire settings.y object
        */

            if (arguments.length > 0){
                settings.y = arguments[0]
                return exports
            }
            return settings.y

        }

        exports.settings.time = function(){
        /*Sets or gets time transformation 
        */

            if (arguments.length > 0){
                settings.time = arguments[0]
                return exports
            }
            return settings.time

        }
        

        exports.axis = function(){
        /*Sets or gets entire axis object
        */

            if (arguments.length > 0){
                axis = arguments[0]
                return exports
            }
            return axis

        }

        exports.axis.x = function(){
        /*Sets or gets entire axis.x object
        */

            if (arguments.length > 0){
                axis.x = arguments[0]
                return exports
            }
            return axis.x

        }

        exports.axis.y = function(){
        /*Sets or gets entire axis.y object
        */

            if (arguments.length > 0){
                axis.y = arguments[0]
                return exports
            }
            return axis.y

        }

        exports.axis.x.scale = function(){
        /*Sets or gets entire axis.x.scale object
        */

            if (arguments.length > 0){
                axis.x.scale = arguments[0]
                return exports
            }
            return axis.x.scale

        }

        exports.axis.y.scale = function(){
        /*Sets or gets entire axis.y.scale object
        */

            if (arguments.length > 0){
                axis.y.scale = arguments[0]
                return exports
            }
            return axis.y.scale

        }

        exports.selection = function(){
        /*Sets or gets an svg d3.selection to place visualization on.
        */ 

            if (arguments.length > 0){
                selection = arguments[0]
                return exports
            }
            return selection
        }

        exports.dispatch = function(){
        /*Gets or overwrites d3.dispatch instance for registering
          events
        */

            if (arguments.length > 0){
                dispatch = arguments[0]
                return exports
            }
            return dispatch 

        }

        exports.dateParse = function(){
        /*Sets dateParsing function. It is expected that the argument
          is a d3.time.format instance
        */

            if (arguments.length > 0){
                parse = arguments[0]
                return exports
            }
            return parse 

        }

        exports.brushStart = function(){
        /*Sets brush rectangle x position. Use a date parseable by
          specified by .dateParse method
        */

            if (arguments.length > 0){
                settings.brush.startDate = parse(arguments[0])
                return exports
            }
            return settings.brush.startDate 

        }


        function updateScales(data){
        /*Function to update the scales using the given input data
        */
            axis.x.scale
            .domain([
                parse(data.x.min), 
                parse(data.x.max), 
            ]);
           
            if (!settings.time){
                axis.x.Oscale
                    .domain(data.areas[0]
                        .areaPoints.map(function(d){return d.x}))
                    .range(data.areas[0]
                        .areaPoints.map(function(d){return axis.x.scale(parse(d.x))}))
            }

            axis.y.scale.domain([data.y.min, data.y.max]) 
            axis.x.svg.scale(axis.x.scale)
            axis.y.svg.scale(axis.y.scale)

            if (settings.time){
                var next = d3.time.day.offset(parse(data.x.min), 1)
                settings.brush.width = axis.x.scale(next) 
                    - axis.x.scale(parse(data.x.min))
            } else {
                var next = axis.x.Oscale.domain()[1]
                var prev = axis.x.Oscale.domain()[0]
                settings.brush.width = axis.x.scale(next)
                    - axis.x.scale(prev)
            }

            brush.rect.attr('width', settings.brush.width)

            path.initial
            .y1(function(d) {
                return axis.y.scale((data.y.max-data.y.min) / 2); 
            })
            .y0(function(d) {
                return axis.y.scale((data.y.max-data.y.min) / 2); 
            })

        }

        function updateBrush(){
        /*Function to update the brush rectangle using 
          previously updated scale parameters
        */
            brush.instance.on('drag', function() {
                if (inPlotWindow(d3.event)){
                    brush.rect 
                    .attr("x", Math.max(settings.brush.width, 
                        Math.min(axis.x.scale.range()[1] - settings.brush.width, 
                            d3.event.x)
                        ) 
                    ) 
                }

            })

            brush.instance.on('dragend', function() {
                var self = {
                    'x': brush.rect.attr('x'),
                }
                var exact_start = axis.x.scale.invert(parseFloat(self.x))
                if(settings.time){
                    var rounded_date = d3.time.day
                        .floor(exact_start)
                    if (inPlotWindow(self)){
                        brush.rect.transition().duration(2000)
                            .attr('x', axis.x.scale(rounded_date))
                        var date_extent = [rounded_date, 
                            d3.time.day.offset(rounded_date, 1)]
                        dispatch.brushend(date_extent)
                    }
                } else {
                var exact_end = axis.x.scale
                    .invert(parseFloat(self.x) + 
                        parseFloat(brush.rect.attr('width')))

                    var embedded_point = axis.x.Oscale.domain()
                        .filter(function(point){
                            return point < exact_end &&
                                point > exact_start
                        })

                    if (embedded_point.length > 0){
                        brush.rect.transition().duration(2000)
                            .attr('x', axis.x.scale(embedded_point[0]))
                    }

                    dispatch.brushend(embedded_point)                   

                }

            })

            svg.call(brush.instance) 
        }

        function inPlotWindow(point){
        /*Function to test whether a given point is in the plotting window
          using range defined by axis x and y
        */
            var inXBound = point.x < axis.x.scale.range()[1] &&
                point.x > axis.x.scale.range()[0]
            var inYBound = !point.y ? true :
                point.y > axis.y.scale.range()[1] &&
                    point.y < axis.y.scale.range()[0]

            return inXBound && inYBound
        }

        return exports

    }


})()
