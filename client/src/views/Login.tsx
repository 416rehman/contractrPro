import React from 'react';
import Form from "../components/Form/Form";
import Button from "../components/Buttons/Button";
import {NavLink} from "react-router-dom";
import {pingAPI} from "../services/general_service";

function Login(props:React.HTMLProps<HTMLDivElement>) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...props.style
        }}>
            <Form description={'Log in to your account'} title={'Log In'} onSubmit={(e)=>{
                // prevent default behavior
                e.preventDefault();
                pingAPI().then(res=>console.log(res))
            }}>
                <label htmlFor="username">
                    Username<br/>
                    <input name={'username'} type="text"/>
                </label>
                <label htmlFor="password">
                    Password<br/>
                    <input name={'password'} type="password"/>
                </label>
                <NavLink to="/signup">Don't have an account? Sign Up</NavLink>
                <Button>Log In</Button>
            </Form>
        </div>
    );
}

export default Login;
