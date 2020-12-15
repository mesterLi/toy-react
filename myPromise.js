const PENDING = 0;
const RESOLVED = 1;
const REJECTED = 2;
let _resolve;
let _reject;
export default function MyPromise(exec) {
	const _this = this;
	this.value = null;
	this.resan = null;
	this.callBackStack = [];
	this.status = PENDING;
	const resolve = function (value) {
		_this.value = value;
		_this.status = RESOLVED;
		_this.callBackStack.forEach(fn => {
			fn(value)
		})
	}
	const reject = function (err) {
		_this.resan = err;
		_this.status = REJECTED;
	}
	exec(resolve, reject)
}

_resolve = MyPromise.prototype.resolve = function(val) {
	return new MyPromise((resolve) => resolve(val))
}

MyPromise.prototype.then = function (resolve, reject) {
	const _this = this;
	return new MyPromise((r1, r2) => {
		const suc = function (data) {
			const res = resolve(data);
			if (res && res.then) {
				res.then(res => r1(res))
			} else {
				r1(res)
			}
		}
		if (_this.status === PENDING) {
			_this.callBackStack.push(suc)
			return
		}
		if (_this.status === RESOLVED) {
			suc(this.value)
		}
	})
}

const p = new MyPromise((resolve, reject) => {
	setTimeout(() => {
		resolve(1)
	}, 3000)
}).then(res => {
	return new MyPromise((resolve) => {
		console.log("res1", res)
		setTimeout(() => {
			resolve(10)
		}, 5000)
	})
}).then(res => {
	console.log("res2", res)
	return 'ddd'
}).then(res => {
	console.log("res3", res)
})

function add(num1) {
	let tmp = 0;
	let _add = function (num2) {
		if (num2 !== undefined) {
			tmp = num1 + num2
			return _add
		} else {
			return tmp
		}
	}
	return _add
}

console.log(add(1)(2)(4)())
