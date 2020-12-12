import React from 'react';
import Counter from '../AppModules/counter';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

describe('counter component', () => {
    it('starts with a count 0', () => {
        const wrapper = shallow(<Counter />);
        const text = wrapper.find('h1').text();
        expect(text).toEqual('0');
    })

    it('increment the count when button is clicked', () => {
        const wrapper = shallow(<Counter />);
        const incButton = wrapper.find('button');
        incButton.simulate('click');
        const text = wrapper.find('h1').text();
        expect(text).toEqual('1');
    })

});