import React from 'react';
import Page from '../AppModules/Page';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { incrementAction } from '../Redux/actions/increments.js'
import thunk from 'redux-thunk';

import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

const mockStore = configureMockStore();
const store = mockStore({
    increments: { value: 0 }
});

//Enzyme.configure({ adapter: new Adapter() });


//const mockCallBack = jest.fn();

const create = () => {
    const store = {
        getState: jest.fn(() => ({})),
        dispatch: jest.fn(() => ({})),
    }
    const next = jest.fn()

    const invoke = action => thunk(store)(next)(action)

    return { store, next, invoke }
}

configure({ adapter: new Adapter() });

const slotContainerElement = mount((<Provider store={store}><Page /></Provider>));

describe('Slot container snapshot testing', () => {
    it('renders app module correctly', () => {
        const textvalue = slotContainerElement.find('h1').text();
        expect(textvalue).toEqual('0');
    });
    it('page increment the count when button is clicked', () => {

        const { next, invoke } = create();
        const incButton = slotContainerElement.find('button.incButton');
        incButton.simulate('click');
        const action = incrementAction();
        invoke(action);
        expect(next).toHaveBeenCalledWith(action);

        return store.dispatch(action).then(() => {
            const text = slotContainerElement.find('h1').text();
            expect(text).toEqual('1');
        })

        // const text = slotContainerElement.find('h1').text();
        // expect(text).toEqual('1');

    })

});
