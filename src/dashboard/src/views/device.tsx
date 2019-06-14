import * as React from 'react';
import ChartistGraph from 'react-chartist';
import { api } from '../api/api';
import { match } from 'react-router';

interface Props {
  match: match<{ id: string }>
}

export class Device extends React.Component<Props, { data: any }> {

  state = { data: null };

  async componentDidMount() {
    const devices = await api.getDevices();
    const device = devices.find(d => d.id == this.props.match.params.id);
    const data = {
      series: [],
      labels: []
    };
    let labels = [];

    for (var i = 0; i < device.lastTelemetryModel.length; i++) {
      const t = await api.getTelemetry(device.id, device.lastTelemetryModel[i]);
      data.series.push(t.values.map(v => v.value));
      labels = [...labels, t.values.map(v => v.at)];
    }

    data.labels = labels.map(l => new Date(l)).sort((a, b) => a > b ? 1 : a < b ? -1 : 0);
    this.setState({ data });
  }

  render() {




    var type = 'Line'

    return (
      <div>
        {this.state.data && <ChartistGraph style={({ height: "100%" })} data={this.state.data} type={type} />}
      </div>);
  }
}