import * as React from 'react';
import { api, Device } from '../api/api';
import { Table } from 'antd';
import { RouteComponentProps } from 'react-router-dom';

interface State {
  devices: Device[]
};

export class Devices extends React.Component<RouteComponentProps, State> {

  state = {
    devices: []
  }

  async componentDidMount() {
    var devices = await api.getDevices();
    this.setState({ devices });
  }

  openDeviceDetails = (d: Device) =>{
    this.props.history.push("/devices/" + d.id);
  }

  render() {

    return (<>
      <div>Devices</div>
      <Table dataSource={this.state.devices} rowKey="id" onRowClick={this.openDeviceDetails} >
        <Table.Column dataIndex="id" title="ID"></Table.Column>
        <Table.Column dataIndex="lastTelemetrySentAt" title="Last Sent" ></Table.Column>
        <Table.Column dataIndex="lastTelemetryModel" title="Last Model"></Table.Column>
      </Table>
    </>);
  }
}