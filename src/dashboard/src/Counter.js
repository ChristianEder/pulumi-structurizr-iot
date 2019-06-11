import React from 'react';

/**
 * A counter button: tap the button to increase the count.
 */
export class Counter extends React.Component {
  constructor() {
    super();
    this.state = {
      count: 0,
    };
  }

  render() {
    return (
      <button
        onClick={() => {
          this.setState({ count: this.state.count + 2 });
        }}
      >
        Count: {this.state.count}
      </button>
    );
  }
}
