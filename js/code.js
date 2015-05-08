//d3.json("tweets.json", function(data) {console.log(data); tweetViz(data); });
//d3.csv("cities.csv", function (data) {
//    dataViz(data);
//});

//d3.json("coverage.json", function(data) {console.log(data); tweetViz(data); });
//
//
//function dataViz(incomingData)
//{
//    var maxPopulation = d3.max(incomingData, function (el) {
//        return parseInt(el.population);
//    });
//
//    var numbers = [14, 68, 24500, 430, 19, 1000, 5555];
//    var yRange = d3.scale.linear().domain([0, maxPopulation]).range([0, 460]).clamp(true);
//
//    d3.select("svg").attr("style", "height: 480px; width: 600px");
//    d3.select("svg").selectAll("rect")
//            .data(incomingData)
//            .enter()
//            .append("rect")
//            .attr("width", 50)
//            .attr("x", function (d, i) {
//                return i * 60;
//            })
//            .attr("y", function (d, i) {
//                return 480 - yRange(parseInt(d.population));
//            })
//            .attr("height", function (d, i) {
//                return yRange(parseInt(d.population));
//            })
//            .style("fill", "blue")
//            .style("stroke", "red")
//            .style("stroke-width", "1px")
//            .style("opacity", .25);
//}
//
//function tweetViz(tweetData)
//{
//    var tweets = tweetData.tweets;
//    tweets.forEach(function(el) {
//        el.impact = el.favorites.length + el.retweets.length;
//        el.tweetTime = new Date(el.timestamp);
//    });
//    
//    var maxInpact = d3.max(tweets, function(el) {
//        return el.impact;
//    });
//    
//    var startEnd = d3.extent(tweets, function(el) {
//        return el.tweetTime;
//    });
//    
//    var timeRamp = d3.time.scale().domain(startEnd).range([20, 480]);
//    var yScale = d3.scale.linear().domain([0, maxInpact]).range([0, 460]);
//    var radScale = d3.scale.linear().domain([0, maxInpact]).range([1, 20]);
//    var colorScale = d3.scale.linear().domain([0, maxInpact]).range(["white", "#990000"]);
//    d3.select("svg").selectAll("circle")
//            .data(tweets)
//            .enter()
//            .append("circle")
//            .attr("r", function (d, i) { return radScale(d.impact); })
//            .attr("cx", function (d, i) { return timeRamp(d.tweetTime); })
//            .attr("cy", function (d, i) { return 480 - yScale(d.impact)})
//            .style("stroke", "black")
//            .style("stroke-width", "1px")
//            .style("fill", function (d, i) { return colorScale(d.impact)});
//}

var margin = {top: 30, right: 20, bottom: 30, left: 20},
    width = 960 - margin.left - margin.right,
    barHeight = 20,
    barWidth = width * .8;

var i = 0,
    duration = 400,
    root;

var tree = d3.layout.tree()
    .nodeSize([0, 20]);

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
var colorRamp = d3.scale.linear().domain([0, 1]).range(["white", "green"]);

d3.json("coverage.json", function(error, data) {
    flare = {};
    flare.x0 = 0;
    flare.y0 = 0;
    flare.children = data;
    
    function collapse(d) {
        if (d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
        }
    }
    flare.children.forEach(collapse);
    update(root = flare);
});

function update(source) {

  // Compute the flattened node list. TODO use d3.layout.hierarchy.
  var nodes = tree.nodes(root);

  var height = Math.max(500, nodes.length * barHeight + margin.top + margin.bottom);

  d3.select("svg").transition()
      .duration(duration)
      .attr("height", height);

  d3.select(self.frameElement).transition()
      .duration(duration)
      .style("height", height + "px");

  // Compute the "layout".
  nodes.forEach(function(n, i) {
    n.x = i * barHeight;
  });

  // Update the nodes…
  var node = svg.selectAll("g.node")
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

  var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
      .style("opacity", 1e-6);

  // Enter any new nodes at the parent's previous position.
  nodeEnter.append("rect")
      .attr("y", -barHeight / 2)
      .attr("height", barHeight)
      .attr("width", barWidth)
      .style("fill", color)
      .on("click", click);
      
    var nodeName = function(d) {
        if(d.size === 0 || d.size === undefined)
            return d.name;
        else
            return (d.Covered / d.size).toFixed(3) + " " +  d.name; 
    };
    var leafName = function(d) {
        return d.name;         
    };
  nodeEnter.append("text")
      .attr("dy", 3.5)
      .attr("dx", 5.5)
      .text(function(d) { return (d.children || d._children) ? nodeName(d) : leafName(d); });

  // Transition nodes to their new position.
  nodeEnter.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
      .style("opacity", 1);

  node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
      .style("opacity", 1)
    .select("rect")
      .style("fill", color);

  // Transition exiting nodes to the parent's new position.
  node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
      .style("opacity", 1e-6)
      .remove();

  // Update the links…
  var link = svg.selectAll("path.link")
      .data(tree.links(nodes), function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      })
    .transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition links to their new position.
  link.transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {x: source.x, y: source.y};
        return diagonal({source: o, target: o});
      })
      .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

// Toggle children on click.
function click(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  update(d);
}

function color(d) {
//  return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
    return colorRamp(d.Covered / d.size);
}
