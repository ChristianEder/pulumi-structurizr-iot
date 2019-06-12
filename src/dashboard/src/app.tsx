import * as React from 'react';
import {Layout, Menu, Breadcrumb} from "antd";
const { Header, Content, Footer } = Layout;
import "./app.scss";

/**
 * A counter button: tap the button to increase the count.
 */
export class App extends React.Component {
  
  state = {
    count: 0,
  };

  render() {
    return (
      <Layout className="layout">
      <Header>
        <div className="logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['1']}
          style={{ lineHeight: '64px' }}>
          <Menu.Item key="1">Dashboard</Menu.Item>
          <Menu.Item key="2">Devices</Menu.Item>
        </Menu>
      </Header>
      <Content style={{ padding: '0 50px' }}>
        <Breadcrumb style={{ margin: '16px 0' }}>
          {/* TODO: fill breadcrumb from route */}
        </Breadcrumb>
        <div style={{ background: '#fff', padding: 24 }}>
          
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>IoT example dashboard app</Footer>
    </Layout>
    );
  }
}
