import React from 'react';
import {Link, LinkProps, NavLink, NavLinkProps} from "react-router-dom";
import styles from './ALink.module.css'

interface IProps {
    children: any
}

export function ALink(props: LinkProps & React.RefAttributes<HTMLAnchorElement> & IProps) {
    const children = props.children
    return (
        <Link className={styles.alink + " " + props.className} {...props}>
            {children}
        </Link>
    );
}
