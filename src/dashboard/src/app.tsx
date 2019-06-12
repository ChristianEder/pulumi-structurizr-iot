import * as React from 'react';
import { Route, Switch, Redirect, RouteComponentProps, withRouter, Link } from 'react-router-dom';
import { Layout, Menu, Breadcrumb } from "antd";
const { Header, Content, Footer } = Layout;
import "./app.scss";
import { Dashboard } from './views/dashboard';
import { ClickParam } from 'antd/lib/menu';
import { Devices } from './views/devices';

class App extends React.Component<RouteComponentProps> {

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
            <Menu.Item key="1"><Link to="/dashboard">Dashboard</Link></Menu.Item>
            <Menu.Item key="2"><Link to="/devices">Devices</Link></Menu.Item>
          </Menu>
        </Header>
        <Content style={{ padding: '0 50px' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            {this.props.location.pathname.split("/").filter(p => !!p).map((l,i) => <Breadcrumb.Item key={i}>{l}</Breadcrumb.Item>)}
          </Breadcrumb>
          <div style={{ background: '#fff', padding: 24 }}>
            <Switch>
              <Route path="/dashboard" exact component={Dashboard} />
              <Route path="/devices" exact component={Devices} />
              <Redirect to="/dashboard" />
            </Switch>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>IoT example dashboard app</Footer>
      </Layout>
    );
  }
}

export const AppWithRouter = withRouter(App);