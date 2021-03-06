import React from 'react';
import { AppearanceProvider } from 'react-native-appearance';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Navigation } from 'react-native-navigation';
import Crashes from 'appcenter-crashes';
import database from '@react-native-firebase/database';
import 'reflect-metadata';

import DatabaseProvider from './src/data/DatabaseProvider';
import { registerScreens } from './src/app/screens';
import configureStore from './src/app/store';
import StyleProvider from './src/styles/StyleProvider';
import LanguageProvider from './src/lib/i18n/LanguageProvider';
import ArkhamCardsAuthProvider from './src/lib/ArkhamCardsAuthProvider';
import App from './src/app/App';
import { ENABLE_ARKHAM_CARDS_ACCOUNT } from '@app_constants';

function MyProvider({ store: { redux, persistor }, children}) {
  return (
    <ArkhamCardsAuthProvider>
      <AppearanceProvider>
        <Provider store={redux}>
          <PersistGate loading={null} persistor={persistor}>
            <LanguageProvider>
              <DatabaseProvider>
                <StyleProvider>
                  { children }
                </StyleProvider>
              </DatabaseProvider>
            </LanguageProvider>
          </PersistGate>
        </Provider>
      </AppearanceProvider>
    </ArkhamCardsAuthProvider>
  );
}

if (ENABLE_ARKHAM_CARDS_ACCOUNT) {
  database().setPersistenceEnabled(true);
}

const { store, persistor } = configureStore({});

function shouldProcess() {
  return !__DEV__;
}
Crashes.setListener({
  shouldProcess,
});

/* eslint-disable @typescript-eslint/no-unused-vars */
let app = null;
Navigation.events().registerAppLaunchedListener(() => {
  registerScreens(MyProvider, { redux: store, persistor: persistor });
  app = new App(store);
});

