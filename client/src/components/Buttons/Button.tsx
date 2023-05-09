import "./buttons.css";
import React from "react";
import {IconType} from "react-icons";

export enum EIntent {
    NORMAL = 'normal',
    SUCCESS = 'success',
    DANGER = 'danger',
}

export interface IButtonProps extends React.HTMLProps<HTMLButtonElement> {
    Icon?: IconType;
    intent?: EIntent;
    height?: number;
    iconAfter?: boolean;
    forceMiniIcon?: boolean;
}

export default function Button(props: IButtonProps) {
    let button = createButton(props);
    return button
}

function createButton({Icon, intent, iconAfter, ...rest}: IButtonProps) {
    let Style = rest.style || {};
    Style.height = rest.height || 32;

    if (Style.height < 32) {
        Style.fontSize = 12
    } else if (Style.height < 48) {
        Style.fontSize = 14
    } else Style.fontSize = 16;

    //If no text is passed, create a button with an icon
    if ((typeof rest.children != "string" && !rest.value)) {
        Style.height = rest.height || 50;
        Style.width = rest.height || 50;

        return (
            <button
                className={`icon-button ${rest.className || ""} ${intent || ''}`}
                onClick={rest.onClick}
                disabled={rest.disabled}
                style={{padding: 0, color: "inherit", ...Style, ...rest.style}}
            >
                {Icon && <Icon style={{verticalAlign: "middle"}} className={rest.forceMiniIcon ? "mini-icon" : ''}/>}
            </button>
        )
    }

    //Text Button
    return (
        <button
            className={`text-button ${rest.className || ""} ${iconAfter} ${intent}`}
            onClick={rest.onClick}
            disabled={rest.disabled}
            style={{...Style, ...rest.style}}
        >
            <div className={'icon-container'}>
                {Icon ? <Icon/> : null}
            </div>

            <span>{rest.value || rest.children}</span>
        </button>
    )
}
