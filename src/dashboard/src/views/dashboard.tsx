import * as React from 'react';
import ChartistGraph from 'react-chartist';
import { api } from '../api/api';
import { Card } from 'antd';

export class Dashboard extends React.Component<{}, { data: any[] }> {

  state = { data: null };

  private className = (v: number) => {
    if(v < 20 || v > 80){
      return "red";
    }
    if(v < 40 || v > 60){
      return "yellow";
    }
    return "green";
  }

  async componentDidMount() {
    const devices = await api.getDevices();
    const data = [];

    for (var dI = 0; dI < devices.length; dI++) {
      const d = devices[dI];
      for (var tI = 0; tI < d.lastTelemetryModel.length; tI++) {
        const tm = d.lastTelemetryModel[tI];
        const t = await api.getTelemetry(d.id, tm);
        data.push({
          title: d.id + " - " + tm,
          data: [{
            value: t.values[0].value,
            className: this.className(t.values[0].value)
          }]
        });
      }
    }

    this.setState({data});
  }

  render() {

    return (
      <div>
        {this.state.data && this.state.data.map(s => (
        <Card style={({ width: 300, height: 300, margin:50, float:"left"  })}>
          <ChartistGraph style={({ height: "70%"})} data={({ series: s.data })} type="Pie" options={{donut: true, donutWidth: 20, startAngle: 270,total: 100}} />
          <div style={{textAlign:"center"}}>{s.title}</div>
        </Card>))}
      </div>);
  }
}