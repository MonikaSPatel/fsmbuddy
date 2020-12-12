import React from "react";
import { Switch, Route, BrowserRouter } from "react-router-dom";
import AppLayout from './AppLayout';

class App extends React.Component {

  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route path="/" component={AppLayout} />          
        </Switch>
      </BrowserRouter>
    )
  }
}

export default App;
