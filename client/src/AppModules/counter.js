import React from 'react';
import { useState } from 'react';

export default function AppCounter() {

    const [count, setCount] = useState(0);

    return (<div>
        <h1>{count}</h1>
        <button onClick={() => setCount(count => count + 1)}>
            Click me
      </button>
    </div>);
}

