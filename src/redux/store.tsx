import { createStore } from 'redux';
import rootReducer from './reducers';

// Create the Redux store
const store = createStore(
  rootReducer, // Root reducer combines all your individual reducers
  // For debugging, you might want to add Redux DevTools support:
  (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__()
);

export default store;
