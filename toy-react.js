const RENDER_TO_DOM = Symbol("render to dom");

export class Component {
	constructor() {
		this.props = Object.create(null);
		this.children = [];
		this._root = null;
		this._range = null;
	}
	get vdom() {
		return this.render().vdom
	}
	setAttribute(name, value) {
		this.props[name] = value;
	}

	appendChild(component) {
		this.children.push(component);
	}
	[RENDER_TO_DOM](range) {
		this._range = range;
		this._vdom = this.vdom;
		this._vdom[RENDER_TO_DOM](range);
	}
	/*
	rerender() {
		let oldRange = this._range;

		let range = document.createRange();
		range.setStart(oldRange.startContainer, oldRange.startOffset);
		range.setEnd(oldRange.startContainer, oldRange.startOffset);
		this[RENDER_TO_DOM](range);

		oldRange.setStart(range.endContainer, range.endOffset);
		oldRange.deleteContents();
	}
	 */
	update() {
		let isSameNode = (oldNode, newNode) => {
			// 1、对比type，不同直接替换
			// 2、对比props，不同直接替换
			// 3、#text节点的content，不同直接替换
			if (oldNode.type !== newNode.type) return false;
			for (let name in oldNode.props) {
				if (oldNode.props[name] !== newNode.props[name]) return false;
			}
			if (Object.keys(oldNode.props).length !== Object.keys(newNode.props).length) return false;
			if (oldNode.type === "#text") {
				if (oldNode.content !== newNode.content) {
					return false;
				}
			}
			return true
		}
		let update = function (oldNode, newNode) {
			if (!isSameNode(oldNode, newNode)) {
				// 如果不是相同的节点，直接用新节点替换旧的range
				newNode[RENDER_TO_DOM](oldNode._range)
				return
			}
			// 拿到就节点的range
			newNode._range = oldNode._range;
			if (!oldNode.vchildren || !oldNode.vchildren.length) return;
			let tailRange = oldNode.vchildren[oldNode.vchildren.length - 1]._range;
			console.log(oldNode)
			for (let i = 0; i < newNode.vchildren.length; i++) {
				const oldChildren = oldNode.vchildren[i];
				const newChildren = newNode.vchildren[i];
				if (i < oldNode.vchildren.length) {
					update(oldChildren, newChildren);
				} else {
					let range = document.createRange();
					range.setStart(tailRange.endContainer, tailRange.endOffset);
					range.setEnd(tailRange.endContainer, tailRange.endOffset);
					newChildren[RENDER_TO_DOM](range);
					tailRange = range;
				}
			}
		}
		// 保存变量
		let vdom = this.vdom;
		update(this._vdom, vdom);
		this._vdom = vdom;
	}
	setState(newState = {}) {
		let merge = (oldState = {}, newState) => {
			for (let i in newState) {
				if (typeof oldState[i] !== "object" || oldState[i] === null) {
					oldState[i] = newState[i]
				} else {
					merge(oldState[i], newState[i])
				}
			}
		}
		merge(this.state, newState);
		this.update();
	}
}
function replaceNode(range, node) {
	range.insertNode(node);
	range.setStartAfter(node);
	range.deleteContents();

	range.setStartBefore(node);
	range.setEndAfter(node);
}
class ElementWrapper extends Component {
	constructor(type) {
		super(type);
		this.type = type;
	}
	get vdom() {
		this.vchildren = this.children.map(child => child.vdom);
		return this;
	}/*
	setAttribute(name, value) {
		if (name.match(/^on([\s\S]+)$/)) {
			const eventName = RegExp.$1.replace(/^[\s\S]/g, e => e.toLowerCase());
			// 给当前dom添加事件
			this.root.addEventListener(eventName, value);
			return;
		}
		if (name === 'className') {
			this.root.setAttribute('class', value);
			return
		}
		this.root.setAttribute(name, value);
	}

	appendChild(component) {
		const range = document.createRange();
		range.setStart(this.root, this.root.childNodes.length);
		range.setEnd(this.root, this.root.childNodes.length);
		component[RENDER_TO_DOM](range);
	}
	*/
	[RENDER_TO_DOM](range) {
		this._range = range;
		let root = document.createElement(this.type);
		for (let name in this.props) {
			const value = this.props[name];
			if (name.match(/^on([\s\S]+)$/)) {
				const eventName = RegExp.$1.replace(/^[\s\S]/g, e => e.toLowerCase());
				// 给当前dom添加事件
				root.addEventListener(eventName, value);
				continue
			}
			if (name === 'className') {
				root.setAttribute('class', value);
				continue
			}
			root.setAttribute(name, value);
		}
		for (let child of this.vchildren) {
			const childRange = document.createRange();
			childRange.setStart(root, root.childNodes.length);
			childRange.setEnd(root, root.childNodes.length);
			child[RENDER_TO_DOM](childRange);
		}
		replaceNode(range, root)
	}
}

class TextWrapper extends Component {
	constructor(content) {
		super(content);
		this.content = content;
		this.type = '#text';
	}
	get vdom() {
		return this;
	}
	[RENDER_TO_DOM](range) {
		let root = document.createTextNode(this.content);
		this._range = range;
		replaceNode(range, root);
	}
}

export function createElement(type, attributes, ...children) {
	let e;
	if (typeof type === 'string') {
		e = new ElementWrapper(type);
	} else {
		e = new type;
	}

	for (const p in attributes) {
		e.setAttribute(p, attributes[p])
	}

	let insertChildren = (children) => {
		for (let child of children) {
			if (child === null) {
				continue;
			}
			if (typeof child === 'string' || typeof child === 'number') {
				child = new TextWrapper(child);
			}
			// 如果是child是数组对象，insertChildren
			if ((typeof child === 'object') && (child instanceof Array)) {
				insertChildren(child);
			} else {
				// 直接push children数组
				e.appendChild(child);
			}
		}
	}
	insertChildren(children);

	return e;
}

export function render(component, parentElement) {
	const range = document.createRange();
	range.setStart(parentElement, 0);
	range.setEnd(parentElement, parentElement.childNodes.length);
	range.deleteContents();
	component[RENDER_TO_DOM](range);
}
