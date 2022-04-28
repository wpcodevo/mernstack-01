import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import ReactDom from 'react-dom';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import { CookiesProvider } from 'react-cookie';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './redux/store';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FullScreenProgress from './components/FullScreenProgress';
import UserMiddleware from './Helpers/userMiddleware';
import { getTotals } from './redux/features/cartSlice';
import { CssBaseline } from '@mui/material';
import React from 'react';

store.dispatch(getTotals());

ReactDom.render(
  <React.StrictMode>
    <Router>
      <Provider store={store}>
        <PersistGate loading={<FullScreenProgress />} persistor={persistor}>
          <CookiesProvider>
            <UserMiddleware>
              <App />
            </UserMiddleware>
            <CssBaseline />
            <ToastContainer />
          </CookiesProvider>
        </PersistGate>
      </Provider>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
