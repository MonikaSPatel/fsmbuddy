import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import {
  incrementAction,
  decreaseAction,
} from '../Redux/actions/index';

export class Page extends PureComponent {
  render() {
    const { increments, incrementAction, decreaseAction } = this.props;
    return (
      <div>
        <h1 >{increments.value}</h1>
        <button className="incButton" onClick={incrementAction}>increment</button>
        <button onClick={decreaseAction}>decrease</button>
      </div>
    );
  }
}


// const mapStateToProps = (state) => ({
//   value: state.value,
// });

const mapStateToProps = function (props) {
  return props;
}

const mapDispatchToProps = (dispatch) => ({
  incrementAction: () => dispatch(incrementAction()),
  decreaseAction: () => dispatch(decreaseAction()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Page);
