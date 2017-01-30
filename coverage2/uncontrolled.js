import React from 'react';
import ReactDOM from 'react-dom';
import TreeView from '../src/react-treeview';
import * as d3 from 'd3-scale-chromatic';

const CoverageTree = React.createClass({
  getInitialState: function() {
    return {
      dataSource: this.props.dataSource,
      nsCollapsedBookkeeping: this.props.dataSource.namespaces.map(() => true), // all collapsed by default
      typeCollapsedBookkeeping: this.props.dataSource.types.map(() => true), // all collapsed by default
    };
  },
  _handleNamespaceClick: function (i) {
    let [...nsCollapsedBookkeeping] = this.state.nsCollapsedBookkeeping;
    nsCollapsedBookkeeping[i] = !nsCollapsedBookkeeping[i];
    this.setState({nsCollapsedBookkeeping: nsCollapsedBookkeeping});
  },
  _handleTypeClick: function (i) {
    let [...typeCollapsedBookkeeping] = this.state.typeCollapsedBookkeeping;
    typeCollapsedBookkeeping[i] = !typeCollapsedBookkeeping[i];
    this.setState({typeCollapsedBookkeeping: typeCollapsedBookkeeping});
  },
  render: function () {
    var namespaces = this.state.dataSource.namespaces;
    var types = this.state.dataSource.types;
    var apis = this.state.dataSource.apis;

    var nsCollapsedBookkeeping = this.state.nsCollapsedBookkeeping;
    var typeCollapsedBookkeeping = this.state.typeCollapsedBookkeeping;

    var createColorIcon = (ratio) => {
      var color = d3.interpolateGreens(ratio);
      var iconStyle = {
        backgroundColor: color,
        display: 'inline-block',
        width: 10,
        height: 10
      };
      return <div key='key' style={iconStyle} />;
    };

    var createApiItems = (typeIdx) => {
      var start = this.state.dataSource.getApiStartFromTypeIndex(typeIdx);
      var end = this.state.dataSource.getApiStartFromTypeIndex(typeIdx + 1);

      var nodes = [];
      for(var i=start; i<end; i++) {
        var api = apis[i];
        var node = null;

        if (api.samples.length === 0) {
          node = <div key={i}>{api.name}</div>;
        } else {
          var items = api.samples.map((sample)=> {
            var aStyle = { display: 'block' };
            return (sample.Value.startsWith('http')
              ? <a key={sample.Key} href={sample.Value} style={aStyle} target='blank'>{sample.Key}</a>
              : <div key={sample.Key}>{sample.Key}</div>);
          });
          node = <TreeView key={i} nodeLabel={api.name} defaultCollapsed={true}>{items}</TreeView>;
        }

        nodes.push(node);
      }
      return nodes;
    }

    var createTypeNodes = (nsIndex) => {
      var start = this.state.dataSource.getTypeStartFromNsIndex(nsIndex);
      var end = this.state.dataSource.getTypeStartFromNsIndex(nsIndex + 1);

      var nodes = [];
      for(var i = start; i < end; i++) {
        var type = types[i];
        var ratio = type.covered / type.total;
        const label = [createColorIcon(ratio), <span key={i} className="node" onClick={this._handleTypeClick.bind(this, i)}>[{type.covered}/{type.total}] {type.Key}</span>];
        nodes.push(
        <TreeView key={i} nodeLabel={label} collapsed={typeCollapsedBookkeeping[i]}>
          { typeCollapsedBookkeeping[i] ? null : createApiItems(i) }
        </TreeView>);
      }
      return nodes;
    }

    return (
      <div>
        {
          namespaces.map((ns, i) => { 
            var ratio = ns.covered / ns.total;
            const label = [createColorIcon (ratio), <span key={i} className="node" onClick={this._handleNamespaceClick.bind(this, i)}>[{ns.covered}/{ns.total}] {ns.Key}</span>];
            return (
              <TreeView key={i} nodeLabel={label} collapsed={nsCollapsedBookkeeping[i]}>
                { nsCollapsedBookkeeping[i] ? null : createTypeNodes(i) }
              </TreeView>
            );
        })}
      </div>
    );
  },
});
export default CoverageTree;