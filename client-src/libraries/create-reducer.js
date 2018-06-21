// Creates a reducer given a map of action types to sub-reducer functions
// if the action type doesn't match one of the object property names, then the reducer
// will return the current state.

import { identity, propOr } from 'ramda';





export default function createReducer(initialState, handlers) {
  return (state = initialState, action) => (
    propOr(identity, action.type, handlers)(state, action)
  );
}
