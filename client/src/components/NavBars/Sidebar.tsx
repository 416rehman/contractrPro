import {NavLink} from "react-router-dom";
import "./navbars.css";
import {IoBarcodeOutline, IoCalendarClearOutline, IoStatsChartOutline} from "react-icons/io5";
import Button from '../Buttons/Button';

export default function Sidebar() {
    return (
        <div className="sidebar" style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
        }}>
            <div id={"links"} style={{display: "flex", flexDirection: "column", flexBasis: "50%"}}>
                <NavLink to="/" className={isActive => (isActive ? "active" : "") + " navbarLink"}><IoStatsChartOutline/></NavLink>
                <NavLink to="/signup" className={"navbarLink"}>
                    <IoBarcodeOutline/>
                </NavLink>
                <NavLink to="/contact" className={"navbarLink"}>
                    <IoCalendarClearOutline/>
                </NavLink>
                <NavLink to={"/wtf"} className={"navbarLink"}>
                    <Button Icon={IoBarcodeOutline}/>
                </NavLink>
            </div>
        </div>
    )
}
