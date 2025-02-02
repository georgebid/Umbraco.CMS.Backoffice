import type { Observable, Subscription } from '@umbraco-cms/backoffice/external/rxjs';

export type ObserverCallbackStack<T> = {
	next: (_value: T) => void;
	error?: (_value: unknown) => void;
	complete?: () => void;
};

export type ObserverCallback<T> = (_value: T) => void;
// We do not use the ObserverCallbackStack type, and it was making things more complicated than they need to be so I have taken it out..
//export type ObserverCallback<T> = ((_value: T) => void) | ObserverCallbackStack<T>;

export class UmbObserver<T> {
	#source!: Observable<T>;
	#callback!: ObserverCallback<T>;
	#subscription!: Subscription;

	constructor(source: Observable<T>, callback: ObserverCallback<T>) {
		this.#source = source;
		this.#subscription = source.subscribe(callback);
	}

	/**
	 * provides a promise which is resolved ones the observer got a value that is not undefined.
	 * Notice this promise will resolve immediately if the Observable holds an empty array or empty string.
	 *
	 */
	public asPromise() {
		// Notice, we do not want to store and reuse the Promise, cause this promise guarantees that the value is not undefined when resolved. and reusing the promise would not ensure that.
		return new Promise<Exclude<T, undefined>>((resolve) => {
			let initialCallback = true;
			let wantedToClose = false;
			const subscription = this.#source.subscribe((value) => {
				if (value !== undefined) {
					if (initialCallback) {
						wantedToClose = true;
					} else {
						subscription.unsubscribe();
					}
					resolve(value as Exclude<T, undefined>);
				}
			});
			initialCallback = false;
			if (wantedToClose) {
				subscription.unsubscribe();
			}
		});
	}

	hostConnected() {
		// Notice: This will not re-subscribe if this controller was destroyed. Only if the subscription was closed.
		if (this.#subscription?.closed) {
			this.#subscription = this.#source.subscribe(this.#callback);
		}
	}

	hostDisconnected() {
		// No cause then it cant re-connect, if the same element just was moved in DOM. [NL]
		// I do not agree with my self anymore ^^. I think we should unsubscribe here, to help garbage collector and prevent unforeseen side effects of observations continuing while element are out of the DOM. [NL]
		this.#subscription?.unsubscribe();
	}

	destroy(): void {
		if (this.#subscription) {
			this.#subscription.unsubscribe();
			(this.#source as any) = undefined;
			(this.#callback as any) = undefined;
			(this.#subscription as any) = undefined;
		}
	}
}
