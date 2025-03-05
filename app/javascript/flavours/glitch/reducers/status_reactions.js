import { Map as ImmutableMap, OrderedSet as ImmutableOrderedSet } from 'immutable';

import {
  REACTIONS_FETCH_SUCCESS,
  REACTIONS_EXPAND_SUCCESS,
  REACTIONS_FETCH_REQUEST,
  REACTIONS_EXPAND_REQUEST,
  REACTIONS_FETCH_FAIL,
  REACTIONS_EXPAND_FAIL,
} from '../actions/interactions';

const initialState = ImmutableMap({
  reactions: ImmutableMap({
    next: null,
    isLoading: false,
    items: ImmutableOrderedSet(),
  }),
});

const normalizeList = (state, path, reactions, next) => {
  const filteredReactions = reactions.map(v => {
    v.account = v.account.id;
    return v;
  });
  return state.setIn(path, ImmutableMap({
    next,
    items: ImmutableOrderedSet(filteredReactions),
    isLoading: false,
  }));
};

const appendToList = (state, path, reactions, next) => {
  const filteredReactions = reactions.map(v => {
    v.account = v.account.id;
    return v;
  });
  return state.updateIn(path, map => {
    return map.set('next', next).set('isLoading', false).update('items', list => list.concat(filteredReactions));
  });
};

export default function statusReactions(state = initialState, action) {
  switch(action.type) {
  case REACTIONS_FETCH_SUCCESS:
    return normalizeList(state, ['reactions', action.id], action.reactions, action.next);
  case REACTIONS_EXPAND_SUCCESS:
    return appendToList(state, ['reactions', action.id], action.reactions, action.next);
  case REACTIONS_FETCH_REQUEST:
  case REACTIONS_EXPAND_REQUEST:
    return state.setIn(['reactions', action.id, 'isLoading'], true);
  case REACTIONS_FETCH_FAIL:
  case REACTIONS_EXPAND_FAIL:
    return state.setIn(['reactions', action.id, 'isLoading'], false);
  default:
    return state;
  }
}
