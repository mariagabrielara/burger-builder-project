import { put, call } from 'redux-saga/effects';// sirve para reemplazar dispatch
import { delay } from 'redux-saga'; //sirve para reemplazar timeout

import * as actions from '../actions/index';
import axios from 'axios';

//yield significa que la siguiente linea no se 
//ejecuta hasta que la anterior se haya terminado 
//de ejecutar
export function* logoutSaga(action) {
    /**
     * call() se puede utilizar en lugar de solo utilizar yield,
     * la unica ventaja que tiene es que se puede testear debido 
     * a que se puede engañar facilmente la información interior
     * sin necesidad de utilizar información verdadera
     */
    yield call([localStorage, 'removeItem'], 'token');
    yield call([localStorage, 'removeItem'], 'expirationDate');
    yield call([localStorage, 'removeItem'], 'userId');
    /*yield localStorage.removeItem('token');
    yield localStorage.removeItem('expirationDate');
    yield localStorage.removeItem('userId');*/
    yield put(actions.logoutSucceed());
}

export function* checkAuthTimeoutSaga(action) {
    yield delay(action.expirationTime * 1000);
    yield put(actions.logout());
}

/*
    Cuando se termina de desarrollar la saga se debe agregar al
    watch de index.js en la carpeta sagas
*/
export function* authUserSaga(action) {
    /*
        En sagas no se ejecuta dispatch sino se utiliza put,
        por ejemplo: 
        dispatch(authStart()); pasa a ser yield put(actions.authStart());
        siempre y cuando el metodo 'authStart' sea importado al archivo index 
        la carpeta actions
    */
    yield put(actions.authStart());
    const authData = {
        email: action.email, //el email y password tienen que venir del action
        password: action.password,
        returnSecureToken: true
    };
    let url = 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=AIzaSyDhbI-r0VzuVFIwxRScJcq7Guj4YLa74w0';
    if (!action.isSignup) {
        url = 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=AIzaSyDhbI-r0VzuVFIwxRScJcq7Guj4YLa74w0';
    }
    try {
        const response = yield axios.post(url, authData); 
        /*
            Al utilizar yield frente a axios permite esperar hasta que el 
            resultado se guarde en la variable response y en este caso ya 
            no estaría devolviendo un promise por lo que no se utiliza .then(...)
            y/o .catch(...)
        */
        const expirationDate = yield new Date(new Date().getTime() + response.data.expiresIn * 1000);
        yield localStorage.setItem('token', response.data.idToken);
        yield localStorage.setItem('expirationDate', expirationDate);
        yield localStorage.setItem('userId', response.data.localId);
        yield put(actions.authSuccess(response.data.idToken, response.data.localId));
        yield put(actions.checkAuthTimeout(response.data.expiresIn));
    } catch (error) {
        yield put(actions.authFail(error.response.data.error));
    }
}

export function* authCheckStateSaga(action) {
    const token = yield localStorage.getItem('token');
    if (!token) {
        yield put(actions.logout());
    } else {
        const expirationDate = yield new Date(localStorage.getItem('expirationDate'));
        if (expirationDate <= new Date()) {
            yield put(actions.logout());
        } else {
            const userId = yield localStorage.getItem('userId');
            yield put(actions.authSuccess(token, userId));
            yield put(actions.checkAuthTimeout((expirationDate.getTime() - new Date().getTime())/1000));
        }
    }
}