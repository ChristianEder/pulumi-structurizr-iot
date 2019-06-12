
import * as React from "react";
import * as ReactDOM from "react-dom";
import { AppWithRouter } from "./app";
import { AppContainer } from "react-hot-loader";
import { BrowserRouter } from "react-router-dom";

document.addEventListener("DOMContentLoaded", () => {
  ReactDOM.render(
    <AppContainer>
      <BrowserRouter>
        <AppWithRouter />
      </BrowserRouter>
    </AppContainer>,
    document.getElementById("mount")
  );
});

// Hot Module Replacement API
declare let module: { hot: any };

if (module.hot) {
  module.hot.accept("./app", () => {
    const NewApp = require("./app").AppWithRouter;

    ReactDOM.render(
      <AppContainer>
        <BrowserRouter>
          <NewApp />
        </BrowserRouter>
      </AppContainer>,
      document.getElementById("mount")
    );
  });
}