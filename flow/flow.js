function Line (id)
{
    this.id = id;
    this.values = [];

    this.push = function (elem) {
        this.values.push (elem);
    };
}    var margin = {
        top: 20,
        right: 30,
        bottom: 60,
        left: 40
    };
    var height, width;

    var svg = d3.select("body").select("svg")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var loadedData;
    var extent;
    var colorScale;
    var linesLookup;

    d3.json ("./flow.json", dataViz);

    function dataViz (data)
    {
        prepareSamples(data.samples);

        loadedData = data;
        extent = getExtent (data.samples);
        linesLookup = prepareLines (data.samples);

        colorScale = createColorScale(data.lists);
        createLegend (data.lists);

        setSizes();

        var selectedLines = getSelectedLines ();
        createLineViz(selectedLines, extent);
    }

    function getLinesArray (lookup)
    {
        var lines = [];
        for(var key in linesLookup) {
            if(lookup.hasOwnProperty(key))
                lines.push (lookup[key]);
        }

        return lines;
    }

    function prepareSamples (samples)
    {
        for(var i = 0, len = samples.length; i < len; i++) {
            var s = samples[i];
            s.date = new Date (s.date);
        }
    }

    function prepareLines (samples)
    {
        var firstDate = samples[0].date, lastDate = samples[samples.length - 1].date;
        var allDays = d3.time.day.utc.range(firstDate, lastDate); // returns [min ... max)
        allDays.push (lastDate);

        var linesLookup = {};

        // allDays.length >= samples.length
        for(var i = 0, j = 0, len = samples.length; i < len; i++, j++) {
            var s = samples[i];
            var sDate = s.date;
            var sData = s.data;

            // no data available for any list
            // so fill will zeros
            var currDate = allDays[j];
            while (sDate.getTime () !== currDate.getTime () && j < allDays.length) {
                for(var key in linesLookup) {
                    if(linesLookup.hasOwnProperty(key)) {
                        var line = linesLookup [key];
                        line.push ([0, 0]);
                    }
                }
                currDate = allDays[++j];
            }

            var toIterateSet = {};
            var knownIds = Object.getOwnPropertyNames (linesLookup);
            knownIds.forEach (function (id) { toIterateSet[id] = undefined });

            for(var key in sData) {
                if(sData.hasOwnProperty(key)) {
                    var inout = sData [key];
                    var line = linesLookup [key];
                    if (line === undefined) {
                        linesLookup[key] = line = new Line (key);
                        for(var k = 0; k < j; k++)
                          line.push ([0, 0]);
                    }
                    line.push (inout);
                }
                delete toIterateSet[key];
            }
            for (var key in toIterateSet) {
                if (toIterateSet.hasOwnProperty (key)) {
                    var line = linesLookup[key];
                    line.push ([0, 0]);
                }
            }
        }

        return linesLookup;
    }

    function createLineViz (lines, dataExtent)
    {
        var dateExtent = extent.dateExtent;

        var xScale = d3.time.scale ()
            .domain(dateExtent)
            .range ([0, width]);
        var yScale = d3.scale.linear()
            .domain ([0, extent.inOutMax])
            .range([height, 0]);

        var dayRange = d3.time.day;
        var allDays = dayRange.utc.range(dateExtent[0], dateExtent[1]); // returns [min ... max)
        allDays.push (dateExtent[1]);
        // console.log (allDays);

        var flowLine = function (line, i) {
            var lineGenerator = d3.svg.line ()
            .x (function (inout, pointIndex) { return xScale(allDays[pointIndex]); })
            .y (function (inout) {
                return yScale (inout[0]); // income flow
            })/*.interpolate("cardinal")*/;

            return lineGenerator (line.values);
        }

        var series = svg.selectAll (".series")
            .data (lines)
        .enter ().append ("g")
            .attr ("class", "series");

        // draw lines
        series.append ("path")
            .attr ("d", flowLine)
            .attr ("fill", "none")
            .attr ("stroke", function (line, i) { return colorScale(line.id); })
            .attr("stroke-width", 2);

        var tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        var showTooltip = function (inout, i) {
            tooltip.transition()
            .duration(200) 
            .style("opacity", .9);

            var formatTime = d3.time.format("%e %b");
            tooltip.html( "+" + inout[0] + " -" + inout[1] + "<br/>" + formatTime(allDays[i]))
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
        };
        var hideTooltip = function (inout, i) {
            tooltip.transition().duration(500).style("opacity", 0);
        };

        // draw cicrles
        var radius = function (inout, i) {
            var r = "3px", empty = "0px";
            return inout[0] > 0 ? r : empty;
        };

        series.selectAll (".point")
        .data (function (line) { return line.values; })
        .enter ().append ("circle")
            .attr("class", "point")
            .attr("cx", function (inout, i) { return xScale(allDays[i]); })
            .attr("cy", function (inout, i) { return yScale(inout[0]); })
            .attr("r", radius)
            .style("fill", function () { return colorScale(d3.select(this.parentNode).datum().id); })
            .on("mouseover", showTooltip)
            .on("mouseout", hideTooltip);

        addYAxis(svg, yScale);
        addXAxis(svg, xScale)
    }

    function addYAxis (parent, scale)
    {
        var yAxis = d3.svg.axis().scale (scale).orient("left");
        parent.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        var yAxisLines = d3.svg.axis()
            .scale(scale)
            .tickSize(width)
            .tickFormat('')
            .orient("right");
        parent.append ("g")
            .attr ("class", "grid")
            .call (yAxisLines);
    }

    function addXAxis (parent, scale)
    {
        var xAxis = d3.svg.axis()
            .scale (scale)
            .orient("bottom");

        parent.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
    }

    function getExtent (samples)
    {
        var inMax = 0, outMax = 0;

        for (var i = 0; i < samples.length; i++) {
            var map = samples[i].data;
            for (var key in map) {
                if(!map.hasOwnProperty(key))
                    continue;

                var inout = map [key];
                inMax = Math.max (inMax, inout[0]);
                outMax = Math.max (outMax, inout[1]);
            }
        }

        return {
            dateExtent : [samples[0].date, samples[samples.length - 1].date],
            inOutMaxValues : [inMax, outMax],
            inOutMax : Math.max (inMax, outMax)
        } 
    }

    function createLegend (lists)
    {
        var item = d3.select("#legend-container")
        .selectAll("div").data (lists)
            .enter ()
        .append ("div")
            .attr ("class", "legend-item");

        item.append("input")
          .attr("checked", function (list, i) { return i == 0 || null; })
          .attr("type", "checkbox")
          .attr("id", function(d,i) { return d.Id; })
          .on("change", change);

        item.append("div")
            .attr ("class", "palette")
            .style ("background-color", function(list) { return colorScale(list.Id); });

        item.append ("label")
            .attr ("class", "legend-label")
            .html (function(d, i) { return d.Name });
    }

    function createColorScale (lists)
    {
        var paletteScale = d3.scale.category20 ();
        var domain = [];
        for (var i = 0; i < paletteScale.range ().length; i++)
            domain.push(i)
        paletteScale.domain (domain);

        var map = {};
        var colorsLen = paletteScale.range().length;
        var mid = colorsLen / 2 - 1;

        // more saturated colors on the even positions
        // pick even color first (saturated colors)
        for (var i = 0; i < lists.length && i <= mid; i++)
            map [lists [i].Id] = paletteScale (2 * i);

        // less saturated colors on the odd positions
        for (var i = mid + 1; i < lists.length && i < colorsLen; i++)
            map [lists [i].Id] = paletteScale (2 * (i - (mid + 1)) + 1);

        return function (id) {
            return map[id];
        };
    }

    function setSizes ()
    {
        var g = document.getElementsByTagName('body')[0],
        W = (window.innerWidth || document.documentElement.clientWidth || g.clientWidth) - 30,
        H = (window.innerHeight|| document.documentElement.clientHeight || g.clientHeight) - d3.select("#legend-container").node().clientHeight - 30;

        width = W - margin.left - margin.right;
        height = H - margin.top - margin.bottom;

        d3.select("body").select("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);
    }

    function change (elem)
    {
      svg.selectAll ("*").remove ();

      var selectedLines = getSelectedLines ();
      createLineViz(selectedLines, extent);
    }

    function getSelectedLinesLookup (allLinesLookup)
    {
        var set = {};

        var itemContainer = d3.select("#legend-container").selectAll("input").each (function(d, i) {
          if(this.checked)
            set[this.id] = undefined;
        });

        for(var key in allLinesLookup) {
            if (allLinesLookup.hasOwnProperty(key)) {
                if(set.hasOwnProperty(key))
                    set[key] = allLinesLookup[key];
            }
        }

        return set;
    }

    function getSelectedLines ()
    {
        var lookup = getSelectedLinesLookup (linesLookup);
        return getLinesArray (lookup);
    }