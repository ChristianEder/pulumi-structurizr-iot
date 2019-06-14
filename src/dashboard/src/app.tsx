import * as React from 'react';
import { Route, Switch, Redirect, RouteComponentProps, withRouter, Link } from 'react-router-dom';
import { Layout, Menu, Breadcrumb } from "antd";
const { Header, Content, Footer } = Layout;
import "./app.scss";
import { Dashboard } from './views/dashboard';
import { Devices } from './views/devices';
import { Device } from './views/device';

class App extends React.Component<RouteComponentProps> {

  state = {
    count: 0,
  };

  render() {

    var path = this.props.location.pathname;
    var crumbs = path.split("/").filter(p => !!p);
    var crumbLinks = crumbs.map((l, i) =>{
      var p = "";
      for(var x = 0; x <= i; x++){
        p += "/" + crumbs[x];
      }
      return p;
    });

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
        <Content style={{ padding: '0 50px', display: "flex", flexDirection: "column" }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            {crumbs.map((l, i) => <Breadcrumb.Item key={i}><Link to={crumbLinks[i]}>{l}</Link></Breadcrumb.Item>)}
          </Breadcrumb>
          <div style={{ background: '#fff', padding: 24, height: "100%" }}>
            <Switch>
              <Route path="/dashboard" exact component={Dashboard} />
              <Route path="/devices" exact component={Devices} />
              <Route path="/devices/:id" exact component={Device} />
              <Redirect to="/" />
            </Switch>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>IoT example dashboard app</Footer>
      </Layout>
    );
  }
}

export const AppWithRouter = withRouter(App);