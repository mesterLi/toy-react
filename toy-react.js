const RENDER_TO_DOM = Symbol("render to dom");

class ElementWrapper {
	constructor(type) {
		this.root = document.createElement(type);
	}

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
	[RENDER_TO_DOM](range) {
		range.deleteContents();
		range.insertNode(this.root);
	}
}

class TextWrapper {
	constructor(content) {
		this.root = document.createTextNode(content);
	}
	[RENDER_TO_DOM](range) {
		range.deleteContents();
		range.insertNode(this.root);
	}
}

export class Component {
	constructor() {
		this.props = Object.create(null);
		this.children = [];
		this._root = null;
		this._range = null;
	}

	setAttribute(name, value) {
		this.props[name] = value;
	}

	appendChild(component) {
		this.children.push(component);
	}
	[RENDER_TO_DOM](range) {
		this._range = range;
		this.render()[RENDER_TO_DOM](range);
	}
	rerender() {
		let oldRange = this._range;
		let range = document.createRange();
		range.setStart(oldRange.startContainer, oldRange.startOffset);
		range.setEnd(oldRange.startContainer, oldRange.startOffset);
		this[RENDER_TO_DOM](range);

		oldRange.setStart(range.endContainer, range.endOffset);
		oldRange.deleteContents();
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
		this.rerender();
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
	console.log(children)
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
