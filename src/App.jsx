import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import { fetchWishlist } from './store/slices/wishlistSlice';
import { fetchCart } from './store/slices/cartSlice';

import AppRoutes from './routes';

import { logoutUser, logOutLocal } from './store/slices/authSlice';
import { logoutAdmin } from './store/slices/adminAuthSlice';

const DataSynchronizer = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchWishlist());
      dispatch(fetchCart());
    }
  }, [user, dispatch]);

  return null;
};

const SessionSynchronizer = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const channel = new BroadcastChannel('auth_sync_channel');

    channel.onmessage = (event) => {
      if (event.data.type === 'LOGIN_USER') {
        // Another tab logged in as User, so logout Admin here if active
        dispatch(logoutAdmin());
      } else if (event.data.type === 'LOGIN_ADMIN') {
        // Another tab logged in as Admin, so logout User here if active locally
        dispatch(logOutLocal());
      }
    };

    return () => {
      channel.close();
    };
  }, [dispatch]);

  return null;
};

import ScrollToTop from './components/common/ScrollToTop';

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <Provider store={store}>
      <DataSynchronizer />
      <SessionSynchronizer />
      <PersistGate loading={null} persistor={persistor}>
        <Router>
          <ScrollToTop />
          <div className="min-h-screen font-body selection:bg-primary selection:text-dark">
            <AppRoutes
              mobileMenuOpen={mobileMenuOpen}
              setMobileMenuOpen={setMobileMenuOpen}
            />
          </div>
        </Router>
      </PersistGate>
    </Provider>
  );
}

export default App;
