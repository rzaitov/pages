Date.prototype.addDays = function(days)
{
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
}

var margin = {
    top: 20,
    right: 30,
    bottom: 30,
    left: 40
}
var width = 1500 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("cards.json", function(error, data) {
    agregattor = {
        maxValue : 0,
        minDate : undefined,
        maxDate : undefined,
        histogram : {}
    }

    data.forEach (function (elem, index, arr) {
        var date = new Date(Date.parse(elem.date));
        date.setHours(0, 0, 0, 0);

        if(this.minDate === undefined)
            this.minDate = date;
        if(this.maxDate === undefined)
            this.maxDate = date;

        if (date < this.minDate)
            this.minDate = date;
        if(date > this.maxDate)
            this.maxDate = date;

        var value = this.histogram [date];
        value = ++value || 1;
        this.histogram [date] = value;

        if (value > this.maxValue)
            this.maxValue = value;
    }, agregattor);

    var getHistogramValue = function (dayShift) {
        var actionDate = agregattor.minDate.addDays (dayShift);
        return agregattor.histogram[actionDate] || 0;
    };

    // console.log (agregattor.histogram);
    console.log (agregattor.minDate);
    console.log (agregattor.maxDate);

    var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
    var diffDays = Math.round(Math.abs((agregattor.maxDate.getTime() - agregattor.minDate.getTime())/(oneDay)));
    var domain = Array.apply(null, {length: diffDays}).map(Number.call, Number);

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1, .2);

    // var x = d3.time.scale()
    //     .domain([agregattor.minDate, agregattor.maxDate])    // values between for month of january
    //     .range([padding, width - padding * 2]);   // map these the the chart width = total width minus padding at both sides

    var y = d3.scale.linear()
        .range([height, 0]);



    x.domain(domain);
    y.domain([0, agregattor.maxValue]);

    
    // console.log(diffDays);
    // for (var i = 0; i >= diffDays; i++) {
    //     domain.push(agregattor.minDate.addDays(i));
    // };
    // console.log (domain);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.svg.axis().scale(x).orient("bottom"));

  svg.append("g")
      .attr("class", "y axis")
      .call(d3.svg.axis().scale(y).orient("left"));

  svg.selectAll(".bar")
      .data(domain)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) {
        console.log (d);
        return x(d);
    }).attr("width", x.rangeBand())
      .attr("y", function(d) {
        return y(getHistogramValue(d)); })
      .attr("height", function(d) { return height - y(getHistogramValue(d)); });

    // console.log(data.length);
    // actionItem = data[0];
    // console.log(actionItem);
    // actionDate = new Date(Date.parse(actionItem.date));
    // actionDate.setHours(0, 0, 0, 0);
    // console.log (actionDate);
});
