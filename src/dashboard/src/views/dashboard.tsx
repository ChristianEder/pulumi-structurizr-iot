import * as React from 'react';
import ChartistGraph from 'react-chartist';
import { relative } from 'path';

export class Dashboard extends React.Component {
    render() {

        var data = {
            labels: ['W1', 'W2', 'W3'],
            series: [
              [1, 4, 3]
            ]
          };
      
          var options = {
            high: 5,
            low: 0,
            axisX: {
              labelInterpolationFnc: function(value, index) {
                return index % 2 === 0 ? value : null;
              }
            }
          };
      
          var type = 'Line'

        return (
        <div>
            <ChartistGraph style={({height:"100%"})} data={data} options={options} type={type} />
        </div>);
    }
}