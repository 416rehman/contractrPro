import React, {useEffect} from 'react';
import {FaCheck, FaInfo} from "react-icons/fa";
import {AiOutlineWarning} from "react-icons/ai";
import {VscError} from "react-icons/vsc";
import styles from "./NoticeBar.module.css";
import Button from "../Buttons/Button";
import {IoIosClose} from "react-icons/io";
import {useDispatch, useSelector} from "react-redux";
import {pingAPI} from "../../services/general_service";
import {addNotice, removeNotice, RootState} from "../../store";
import {ALink} from "../Navlink/ALink";
import {AnyAction, Dispatch} from "@reduxjs/toolkit";

export enum ENoticeIntent {
    INFO,
    SUCCESS,
    WARNING,
    ERROR,
}

export interface INoticeProps {
    id?: string;
    title: string;
    description: string;
    intent: ENoticeIntent;
    linkText?: string;
    link?: string;
    style?: React.CSSProperties;
}

// The NoticeType dictates the color and the icon of the notice bar.
function CreateNoticeBar(notice: INoticeProps, dispatch: Dispatch<AnyAction>) {

    const icon = () => {
        switch (notice.intent) {
            case ENoticeIntent.INFO:
                return <FaInfo/>;
            case ENoticeIntent.SUCCESS:
                return <FaCheck/>;
            case ENoticeIntent.WARNING:
                return <AiOutlineWarning/>;
            case ENoticeIntent.ERROR:
                return <VscError/>;
        }
    }

    const classStyle = () => {
        switch (notice.intent) {
            case ENoticeIntent.INFO:
                return styles.info;
            case ENoticeIntent.SUCCESS:
                return styles.success;
            case ENoticeIntent.WARNING:
                return styles.warning;
            case ENoticeIntent.ERROR:
                return styles.error;
        }
    }

    return (
        <div className={classStyle()} key={notice.id} style={{
            display: 'flex',
            flexDirection: 'row',
            gap: "1em",
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: "0.2em 1em",
            border: "1px solid",
            ...notice.style
        }}>
            <div className="notice-bar-icon">
                {icon()}
            </div>
            <div className={styles.noticeBarDetails}>
                <h1>{notice.title}</h1>
                <p>{notice.description}</p>
            </div>
            {
                notice.link &&
                <ALink to={notice.link}>
                    <Button>{notice.linkText}</Button>
                </ALink>
            }

            <Button onClick={() => notice.id && dispatch(removeNotice(notice.id))} Icon={IoIosClose} height={32}/>
        </div>
    );
}

function NoticeBar() {
    const dispatch = useDispatch();
    const notices = useSelector((state: RootState) => state.notices);

    useEffect(() => {
        pingAPI().then((up) => {
                const notice: INoticeProps = {
                    title: "API is up and running",
                    description: "You are now connected to the server.",
                    intent: ENoticeIntent.SUCCESS,
                    link: "/test",
                    linkText: "More"
                }
                if (!up) {
                    notice.title = "API is down";
                    notice.description = "The server is down. Please try again later.";
                    notice.intent = ENoticeIntent.ERROR;
                }

                dispatch(addNotice(notice));
            }
        )
    }, []);

    return (
        <div>
            {notices.map((notice: INoticeProps) => {
                    return CreateNoticeBar(notice, dispatch);
                }
            )}
        </div>
    );
}

export default NoticeBar;
