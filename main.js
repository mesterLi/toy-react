import { createElement, Component, render } from './toy-react';

class MyComponent extends Component {
	render() {
		console.log(this)
		return (
			<div>
				<h1>my component nice {this.props.customerProps}</h1>
				{this.children}
			</div>
		)
	}
}

render(<MyComponent customerProps="toy React">
	<div>abc</div>
	<div>123</div>
	<div>321</div>
</MyComponent>, document.body)
