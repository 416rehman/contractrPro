import {Outlet} from 'react-router-dom';
import './App.css';
import TopBar from "./components/NavBars/TopBar";
import Sidebar from "./components/NavBars/Sidebar";
import NoticeBar, {ENoticeIntent, INoticeProps} from "./components/NoticeBar/NoticeBar";
import {useEffect} from "react";
import {useDispatch} from "react-redux";
import {addNotice} from "./store";

export default function App() {
    const dispatch = useDispatch();
    useEffect(() => {

        const onlineNotice: INoticeProps = {
            title: 'You are online',
            description: 'You are now connected to the internet',
            intent: ENoticeIntent.SUCCESS,
        }

        const offlineNotice: INoticeProps = {
            title: 'You are offline',
            description: 'You are offline. Please connect to the internet to continue.',
            intent: ENoticeIntent.ERROR,
        }

        window.addEventListener('online', () => dispatch(addNotice(onlineNotice)));
        window.addEventListener('offline', () => dispatch(addNotice(offlineNotice)));

        return () => {
            window.removeEventListener('online', () => dispatch(addNotice(onlineNotice)));
            window.removeEventListener('offline', () => dispatch(addNotice(offlineNotice)));
        }
    }, []);

  return (
      <div style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}>
          <NoticeBar />
        <TopBar/>

        <div id={'app-container'}>
          <Sidebar/>
          <main>
            <Outlet/>
          </main>
        </div>


      </div>
  );
}
