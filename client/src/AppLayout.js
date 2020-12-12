import React from "react";
//import { isLogin } from "./util/jwt";
//import AdminLayout from './AdminLayout';
//import PrivateRoute from './util/PrivateRoute';
import Page from './AppModules/Page';
import IssueComponent from './AppModules/IssueComponent';
import UnspashList from './AppModules/UnspashList';
import HeatMap from './AppModules/HeatMap';
import ReduxFormDemo from './AppModules/ReduxFormDemo';
import { Route, Switch } from "react-router-dom";
import { Menu } from 'antd';
import { Link } from 'react-router-dom';

class AppLayout extends React.Component {

  render() {

    //let path = window.location.pathname;

    // if (path === '/') {
    //   if (isLogin()) {
    //     return (<Redirect to='/dashboard' />);
    //   } else {
    //     return (<Redirect to="/signin" />);
    //   }
    // }

    return (
      <div >
        <Menu mode="horizontal">
          <Menu.Item key="issue"> <Link to="/">Issue</Link></Menu.Item>
          <Menu.Item key="counter"> <Link to="/counter">Counter</Link></Menu.Item>
          <Menu.Item key="image-list"> <Link to="/image-list">ImageList</Link></Menu.Item>
          <Menu.Item key="heat-map"> <Link to="/heat-map">HeatMap</Link></Menu.Item>
          <Menu.Item key="redux-form"> <Link to="/redux-form">Redux Form</Link></Menu.Item>
        </Menu>
        <Switch>
          <Route path="/counter" component={Page} />
          <Route path="/image-list" component={UnspashList} />
          <Route path="/heat-map" component={HeatMap} />
          <Route path="/redux-form" component={ReduxFormDemo} />
          <Route path="/" component={IssueComponent} />
          {/* <PrivateRoute  path={path}
            component={AdminLayout} /> */}
        </Switch>
      </div >)
  }
}

export default AppLayout;
