import React from 'react';
import "./Form.css"

interface IFormProps extends React.HTMLAttributes<HTMLFormElement> {
    title?: string;
    description?: string;
}

function Form({title, description, ...rest}: IFormProps) {
    return (
        <form action="" {...rest}>
            {title && description
                ? <div className={'form-title'}>
                    <h1>{title}</h1>
                    <p>{description}</p>
                </div>
                : null
            }

            <div className={'form-group'}>
                {rest.children}
            </div>
        </form>
    );
}

export default Form;