var React = require("react");

class HelloMessage extends React.Component {


  render() {
    const {content} = this.props;
    let postList = [];
    if(content) {
      for(let key in content) {
        postList.push(<div key={key} className="image-list" dangerouslySetInnerHTML={{__html: content[key]}}></div>)
      }
    }
    return <div>
      <link rel="stylesheet" type="text/css" href="stylesheets/style.css" />
      {postList}
    </div>;
      
  }
}

module.exports = HelloMessage;
