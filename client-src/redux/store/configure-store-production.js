import { createStore, applyMiddleware, compose } from 'redux';
import { responsiveStoreEnhancer } from 'redux-responsive';
import resizeListenterMiddleware from 'redux/middleware/resize-listener-middleware';
import rootReducer from 'redux/reducers';

const enhancer = compose(
  responsiveStoreEnhancer,
  applyMiddleware(
    resizeListenterMiddleware,
  )
);


export default function (initialState) {
  return createStore(rootReducer, initialState, enhancer);
}
