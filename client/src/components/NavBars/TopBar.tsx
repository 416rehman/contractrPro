import {Link} from "react-router-dom";

export default function TopBar() {
    return (
        <div className="top-bar" style={{
            display: "flex",
            height: "75px",
            flexDirection: "row",
            alignContent: "center",
            justifyContent: "flex-start",
            alignItems: "center"
        }}>
            <Link to={"/"} style={{
                display: "flex",
                textDecoration: "none",
                alignContent: "center",
                alignItems: "center",
            }}>
                {/*Logo - Div Width should be equal to the width of the sidebar*/}
                <div style={{
                    width: "75px",
                    display: "flex",
                    alignContent: "center",
                    justifyContent: "center",
                }}>
                    <img src="/logo.svg" alt="Contractor Pro's Logo" style={{height: "40px", width: "40px"}}/>
                </div>
                <span style={{
                    userSelect: "none",
                    fontWeight: "500",
                    fontSize: "24px",
                }}>Contractor Pro</span>
            </Link>
        </div>
    )
}