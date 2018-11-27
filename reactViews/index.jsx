var React = require("react");

class HelloMessage extends React.Component {
  render() {
    return <div className="image-list" dangerouslySetInnerHTML={{__html: this.props.content}}></div>;
  }
}

module.exports = HelloMessage;
