    
import * as React from "react";
import * as ReactDOM from "react-dom";
import {App} from "./app";
import {AppContainer} from "react-hot-loader";

document.addEventListener("DOMContentLoaded", function() {
  ReactDOM.render(
    <AppContainer>
      <App />
    </AppContainer>,
    document.getElementById("mount")
  );
});

// Hot Module Replacement API
declare let module: { hot: any };

if (module.hot) {
    module.hot.accept("./app", () => {
        const NewApp = require("./app").App;

        ReactDOM.render(
            <AppContainer>
                <NewApp/>
            </AppContainer>,
            document.getElementById("mount")
        );
    });
}