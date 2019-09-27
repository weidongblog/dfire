import React from 'react';
import ReactDOM from 'react-dom';
import './styles/test.less';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div className="container">
                <p className="test">这是内容</p>
            </div>
        )
    }
}

ReactDOM.render(
    <App />,
    document.getElementById("root")
)