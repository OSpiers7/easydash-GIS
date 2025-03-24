import { createStore } from 'redux';
import rootReducer from './reducers';

// Convert Map to a serializable object for Redux DevTools
const serializeState = (state: any) => {
  return {
    ...state,
    geoJsonData: Object.fromEntries(state.geoJsonData), // Convert Map to an object
  };
};

// Create the Redux store
const store = createStore(
  rootReducer,
  (window as any).__REDUX_DEVTOOLS_EXTENSION__ &&
    (window as any).__REDUX_DEVTOOLS_EXTENSION__({ stateSanitizer: serializeState }) // Ensure debugging works
);

export default store;
