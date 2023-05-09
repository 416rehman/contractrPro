import React from 'react';
import {NavLink} from "react-router-dom";
import Button, {EIntent} from "../components/Buttons/Button";
import {BsArrowRightSquare} from "react-icons/bs";
import Form from "../components/Form/Form";

function Signup(props:React.HTMLProps<HTMLFormElement>) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...props.style
        }}>
            <Form id={'test'} title={'Sign Up'} description={'Create a new account'} {...props}>
                <label htmlFor="email">Email<br/>
                    <input type="email" id="email" placeholder={'Email'}/></label>

                <label htmlFor="username">Username <br/>
                    <input type="text" id={'username'} name={'username'} required={true} placeholder={'Username'} autoComplete={'username'}/>
                </label>

                <label htmlFor="password">Password<br/>
                    <input type="password" id={'password'} name={'password'} required={true} placeholder={'Password'} autoComplete={'new-password'} />
                </label>

                <NavLink to={"/forgot"}>Forgot Password?</NavLink>

                <span className={'form-buttons-container'} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    flexWrap: 'wrap-reverse',
                    gap: '15px',
                }}>
                        <NavLink to={'/login'}>Already got an account? Log in</NavLink>
                        <Button Icon={BsArrowRightSquare} intent={EIntent.SUCCESS}>Sign Up</Button>
                </span>
            </Form>
        </div>
    );
}

export default Signup;
