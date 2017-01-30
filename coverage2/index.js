import React from 'react';
import ReactDOM from 'react-dom';
import Controlled from './controlled';
import CoverageTree from './uncontrolled';

// In order to avoid any dependency
function loadJSON(path, success, error)
{
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                if (success)
                    success(JSON.parse(xhr.responseText));
            } else {
                if (error)
                    error(xhr);
            }
        }
    };
    xhr.open("GET", path, true);
    xhr.send();
}

function transform (data, samples) {
    // convert api name to object with name and samples array property
    for (var apiIdx = 0; apiIdx < data.apis.length; apiIdx++)
      data.apis[apiIdx] = { name: data.apis[apiIdx], samples: [] };
    data.coverage.forEach((sample, sIdx) => sample.forEach((apiIdx) => data.apis[apiIdx].samples.push(samples[sIdx])));

    var dataSource = {
      namespaces: data.ns,
      types: data.types,
      apis: data.apis,

      getTypeStartFromNsIndex: function (nsIndex) {
        var arr = this.namespaces;
        var len = arr.length;
        return (nsIndex >= len) ? len : arr[nsIndex].Value;
      },
      getApiStartFromTypeIndex: function (typeIdx) {
        var arr = this.types;
        var len = arr.length;
        return (typeIdx >= len) ? len : arr[typeIdx].Value;
      },
      getApiStartFromNsIndex: function (nsIndex) {
        var typeIdx = this.getTypeStartFromNsIndex(nsIndex);
        return this.getApiStartFromTypeIndex(typeIdx);
      },
    };

    dataSource.types.forEach((type, typeIdx) => {
        var start = dataSource.getApiStartFromTypeIndex(typeIdx);
        var end = dataSource.getApiStartFromTypeIndex(typeIdx + 1);
        var apis = dataSource.apis;
        var covered = 0;
        for(var i=start; i<end; i++) {
            var api = apis[i];
            if (api.samples.length > 0)
                covered++;          
        }
        type.covered = covered;
        type.total = end - start;
    });

    dataSource.namespaces.forEach((ns, nsIdx) => {
        var start = dataSource.getTypeStartFromNsIndex(nsIdx);
        var end = dataSource.getTypeStartFromNsIndex(nsIdx + 1);
        var types = dataSource.types;
        var covered = 0;
        var total = 0;
        for(var i=start; i<end; i++) {
            var type = types[i];
            covered += type.covered;
            total += type.total;
        }
        ns.covered = covered;
        ns.total = total;
    });

    return dataSource;  
}

function render (dataSource) {
  ReactDOM.render(<CoverageTree dataSource={dataSource} />, document.getElementById('container'));
};

loadJSON('./sdk.json', function (data) {
  loadJSON('./samples.json', function(samples) {
    var dataSource = transform(data, samples);
    render(dataSource);
  }, null);
}, null);

// ReactDOM.render(<Controlled />, document.getElementById('controlled'));
// ReactDOM.render(<Uncontrolled />, document.getElementById('uncontrolled'));
