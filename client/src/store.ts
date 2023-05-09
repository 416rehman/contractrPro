import {createSlice, configureStore, PayloadAction} from "@reduxjs/toolkit";
import {INoticeProps} from "./components/NoticeBar/NoticeBar";

interface INoticeState {
    notices: INoticeProps[];
}

const initialState: INoticeState = {
    notices: [],
}

const noticeSlice = createSlice({
    name: "notice",
    initialState: initialState,
    reducers: {
        addNotice: (state, action: PayloadAction<INoticeProps>) => {
            //generate random id
            const id = Math.random().toString(36).substring(2, 15);
            state.notices.push({...action.payload, id: id});
        },
        // remove notice by id
        removeNotice: (state, action: PayloadAction<string>) => {
               state.notices = state.notices.filter(notice => notice.id !== action.payload);
        },
        clearNotices: (state) => {
            state.notices = [];
        }
    }
});

export const store = configureStore({
    reducer: noticeSlice.reducer,
})

// Action creators are generated for each case reducer function
export const { addNotice, removeNotice, clearNotices } = noticeSlice.actions
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
