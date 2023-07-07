import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import TopBar from "./components/NavBars/TopBar";
import Signup from "./views/Signup";
import Login from "./views/Login";
import {Provider} from "react-redux";
import {store} from "./store";
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <BrowserRouter>
                <Routes>
                    <Route path={'/'} element={<App/>}>
                        <Route index element={<h1>This is the homepage</h1>}/>
                        <Route path={'/about'} element={<TopBar/>}/>
                        <Route path={'/signup'} element={<Signup/>}/>
                        <Route path={'/login'} element={<Login/>}/>
                        <Route path={"*"} element={<h1>The page you are looking for couldn't be found.</h1>}/>
                    </Route>
                </Routes>
            </BrowserRouter>
        </Provider>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
serviceWorkerRegistration.register();
