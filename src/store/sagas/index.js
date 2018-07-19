/**
 * La idea de sagas es tener un codigo más limpio 
 * donde los action creator solo revuelvan acciones 
 * y toda la logica y llamadas al API, etc sucedan 
 * en las sagas
 */

import { takeEvery, all, takeLatest } from 'redux-saga/effects';

import * as actionTypes from '../actions/actionTypes';
import { logoutSaga, checkAuthTimeoutSaga, authUserSaga, authCheckStateSaga } from './auth';
import { initIngredientsSaga } from './burgerBuilder';
import { purchaseBurgerSaga, fetchOrdersSaga } from './order';

export function* watchAuth() {
     /**
     * utilizar yield all sirve solo que se escriben en un array,
     * se ejecutan simultaneamente
     */
    yield all([
        takeEvery(actionTypes.AUTH_CHECK_TIMEOUT, checkAuthTimeoutSaga),
        takeEvery(actionTypes.AUTH_INITIATE_LOGOUT, logoutSaga),
        /*
            Se agrega el generator creado en la saga auth, 
            después de haberlo importado
        */
        takeEvery(actionTypes.AUTH_USER, authUserSaga),
        takeEvery(actionTypes.AUTH_CHECK_STATE, authCheckStateSaga)
    ]);  
}

export function* watchBurgerBuilder() {
    yield takeEvery(actionTypes.INIT_INGREDIENTS, initIngredientsSaga);
}

export function* watchOrder() {
    /**
     * takeLastest cancela todo y ejecuta solo lo ultimo, 
     * buscar documentacion para una mejor explicacion
     */
    yield takeLatest(actionTypes.PURCHASE_BURGER, purchaseBurgerSaga);
    yield takeEvery(actionTypes.FETCH_ORDERS, fetchOrdersSaga);   
}